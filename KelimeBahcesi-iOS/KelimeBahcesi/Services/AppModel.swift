//
//  AppModel.swift
//  KelimeBahcesi
//

import Foundation
import SwiftUI

@MainActor
final class AppModel: ObservableObject {
    @Published var screen: AppScreen = .welcome
    @Published var levels: [Level] = []
    @Published var shop: ShopCatalog = FallbackData.shop
    @Published var loadMessage = "Hazırlanıyor…"
    @Published var isReady = false
    @Published var loadFailed = false

    @Published var levelIndex = 0
    @Published var wordIndex = 0
    @Published var completed: Set<Int> = []
    @Published var unlocked = 0
    @Published var pet = PetState.demo
    @Published var shopFilter = "all"
    @Published var petTab = "bag"
    @Published var statusText = "Dinle…"
    @Published var statusKind = ""
    @Published var coinToast: String?
    @Published var levelDoneTitle = ""
    @Published var levelDoneText = ""
    @Published var advancing = false

    let speech = SpeechService()
    private let api = APIClient()
    private let storageKey = "kelime-bahcesi-ios-v1"

    var currentLevel: Level? {
        levels.indices.contains(levelIndex) ? levels[levelIndex] : nil
    }

    var currentWord: Word? {
        guard let level = currentLevel, level.words.indices.contains(wordIndex) else { return nil }
        return level.words[wordIndex]
    }

    var doneCount: Int { completed.count }

    var wordsLearned: Int {
        completed.reduce(0) { $0 + (levels.indices.contains($1) ? levels[$1].words.count : 0) }
    }

    func bootstrap() async {
        loadMessage = "Servisler bağlanıyor…"
        isReady = false
        loadFailed = false

        do {
            async let levelsTask = api.fetchLevels()
            async let shopTask = api.fetchShop()
            let (levelsRes, shopRes) = try await (levelsTask, shopTask)
            levels = levelsRes.levels
            shop = shopRes
            loadProgress()
            let wc = levelsRes.meta?.wordCount ?? levels.reduce(0) { $0 + $1.words.count }
            loadMessage = "\(levels.count) seviye · \(wc) kelime hazır"
            isReady = true
        } catch {
            levels = FallbackData.levels
            shop = FallbackData.shop
            loadProgress()
            loadMessage = "Çevrimdışı mod · \(levels.count) seviye hazır"
            loadFailed = false
            isReady = true
        }
        _ = await speech.requestPermissions()
    }

    func goMap() {
        speech.stopListening()
        speech.stopSpeaking()
        screen = .map
    }

    func goPet() {
        speech.stopListening()
        speech.stopSpeaking()
        pet.applyDecay()
        petTab = "bag"
        screen = .pet
        saveProgress()
    }

    func openLevel(_ index: Int) {
        guard index <= unlocked || completed.contains(index) else { return }
        speech.stopListening()
        speech.stopSpeaking()
        levelIndex = index
        wordIndex = 0
        advancing = false
        statusText = "Dinle…"
        statusKind = ""
        saveProgress()
        screen = .play
        Task { await prepareAndSpeakCurrentWord() }
    }

    func prepareAndSpeakCurrentWord() async {
        guard var word = currentWord else { return }
        statusText = "Fotoğraf yükleniyor…"
        statusKind = ""
        do {
            let media = try await api.fetchMedia(word: word.en)
            word.tr = media.tr
            word.image = media.image
            word.alt = media.alt
            levels[levelIndex].words[wordIndex] = word
        } catch {
            // keep fallback image/tr
        }
        guard !advancing else { return }
        statusText = "Dinle…"
        try? await Task.sleep(nanoseconds: 350_000_000)
        guard !advancing, currentWord?.en == word.en else { return }
        speech.speak(word.en) { [weak self] in
            Task { @MainActor in
                guard let self, !self.advancing else { return }
                self.statusText = "Şimdi sen söyle!"
            }
        }
    }

    func hearAgain() {
        guard !advancing, let word = currentWord else { return }
        speech.stopListening()
        statusText = "Dinle…"
        speech.speak(word.en) { [weak self] in
            Task { @MainActor in self?.statusText = "Şimdi sen söyle!" }
        }
    }

    func toggleListen() {
        guard !advancing else { return }
        if speech.isListening {
            speech.stopListening()
            statusText = "Dinleme durdu. Tekrar basabilirsin."
            statusKind = ""
            return
        }
        statusText = "Seni dinliyorum…"
        statusKind = "listen"
        speech.listen { [weak self] alts in
            Task { @MainActor in
                guard let self, let want = self.currentWord?.en else { return }
                if alts.contains(where: { SpeechService.isMatch($0, target: want) }) {
                    self.handleSuccess()
                } else {
                    self.handleFail(alts.first ?? "")
                }
            }
        } onError: { [weak self] err in
            Task { @MainActor in
                guard let self else { return }
                switch err {
                case "not-allowed", "audio": self.statusText = "Mikrofon izni gerekli."
                case "no-speech": self.statusText = "Seni duyamadım. Tekrar dene!"
                case "unsupported": self.statusText = "Konuşma tanıma kullanılamıyor."
                default: self.statusText = "Bir sorun oldu. Tekrar dene."
                }
                self.statusKind = "bad"
            }
        }
    }

    private func handleSuccess() {
        advancing = true
        speech.stopListening()
        let gain = shop.coins.perWord
        pet.coins += gain
        coinToast = "+\(gain) bahçe parası!"
        statusText = "Aferin! Doğru söyledin."
        statusKind = "ok"
        saveProgress()

        let total = currentLevel?.words.count ?? 1
        let next = wordIndex + 1
        Task {
            try? await Task.sleep(nanoseconds: 1_000_000_000)
            coinToast = nil
            if next >= total {
                completeLevel()
            } else {
                wordIndex = next
                advancing = false
                await prepareAndSpeakCurrentWord()
            }
        }
    }

    private func handleFail(_ heard: String) {
        statusKind = "bad"
        statusText = heard.isEmpty ? "Henüz olmadı. Dinle ve tekrar et!" : "“\(heard)” duydum. Bir daha dene!"
    }

    private func completeLevel() {
        speech.stopSpeaking()
        completed.insert(levelIndex)
        if levelIndex >= unlocked {
            unlocked = min(levelIndex + 1, max(0, levels.count - 1))
            if levelIndex == levels.count - 1 { unlocked = levelIndex }
        }
        let bonus = shop.coins.levelBonus
        pet.coins += bonus
        pet.happy = min(100, pet.happy + 6)
        saveProgress()

        let title = currentLevel?.title ?? "Seviye"
        levelDoneTitle = "\(title) tamam!"
        if completed.count >= levels.count {
            levelDoneText = "Son durak bitti! +\(bonus) para · Tomo çok mutlu."
        } else {
            let next = levels[min(levelIndex + 1, levels.count - 1)]
            levelDoneText = "+\(bonus) para. Sırada: \(next.id). \(next.title)"
        }
        advancing = false
        screen = .levelDone
    }

    func nextLevel() {
        if completed.count >= levels.count && levelIndex >= levels.count - 1 {
            screen = .allDone
            return
        }
        openLevel(min(levelIndex + 1, levels.count - 1))
    }

    func restartMapProgress() {
        completed = []
        unlocked = 0
        levelIndex = 0
        wordIndex = 0
        saveProgress()
        goMap()
    }

    func nodeState(for index: Int) -> LevelNodeState {
        if completed.contains(index) { return .done }
        if index == unlocked { return .current }
        if index < unlocked { return .done }
        return .locked
    }

    func buyItem(_ id: String) {
        guard let item = shop.items.first(where: { $0.id == id }) else { return }
        let cosmetic = item.kind == "skin" || item.kind == "hat"
        if cosmetic, (pet.owned[id] ?? 0) > 0 { return }
        guard pet.coins >= item.price else { return }
        pet.coins -= item.price
        pet.owned[id, default: 0] += 1
        if item.kind == "skin", let color = item.color {
            pet.skin = color
        } else if item.kind == "hat" {
            pet.hat = id
        }
        saveProgress()
    }

    func useItem(_ id: String) {
        guard let item = shop.items.first(where: { $0.id == id }), (pet.owned[id] ?? 0) > 0 else { return }
        if item.kind == "skin", let color = item.color {
            pet.skin = color
            saveProgress()
            return
        }
        if item.kind == "hat" {
            pet.hat = pet.hat == id ? nil : id
            saveProgress()
            return
        }
        pet.owned[id, default: 0] -= 1
        if pet.owned[id] == 0 { pet.owned[id] = nil }
        pet.hunger = min(100, max(0, pet.hunger + Double(item.hunger ?? 0)))
        pet.happy = min(100, max(0, pet.happy + Double(item.happy ?? 0)))
        pet.energy = min(100, max(0, pet.energy + Double(item.energy ?? 0)))
        saveProgress()
    }

    func themeColor(for title: String) -> Color {
        let base = title.replacingOccurrences(of: #"\s+\d+$"#, with: "", options: .regularExpression)
        let map: [String: String] = [
            "Hayvanlar": "3CB371", "Yiyecek": "F08A3A", "Renkler": "5B8DEF", "Vücut": "E86B8A",
            "Kıyafetler": "D47A9A", "Ev": "C48A4A", "Oyuncaklar": "FF6B8A", "Taşıtlar": "4AA8D8",
            "Oyun": "46B8A0", "Doğa": "5FAD4A", "Hava": "7EC8E3", "Okul": "E0A030",
        ]
        let hex = map.first(where: { base.hasPrefix($0.key) })?.value ?? "3CB371"
        return Color(hex: hex)
    }

    // MARK: - Persistence

    private struct Saved: Codable {
        var completed: [Int]
        var unlocked: Int
        var levelIndex: Int
        var pet: PetState
    }

    private func loadProgress() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let saved = try? JSONDecoder().decode(Saved.self, from: data) else {
            pet.coins = max(pet.coins, 600)
            return
        }
        let maxIdx = max(0, levels.count - 1)
        completed = Set(saved.completed.filter { $0 >= 0 && $0 <= maxIdx })
        unlocked = min(max(0, saved.unlocked), maxIdx)
        levelIndex = min(max(0, saved.levelIndex), maxIdx)
        pet = saved.pet
        pet.coins = max(pet.coins, 600)
        pet.applyDecay()
    }

    func saveProgress() {
        let saved = Saved(
            completed: Array(completed),
            unlocked: unlocked,
            levelIndex: levelIndex,
            pet: pet
        )
        if let data = try? JSONEncoder().encode(saved) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }
}

extension Color {
    init(hex: String) {
        let h = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: h).scanHexInt64(&int)
        let r, g, b: Double
        switch h.count {
        case 6:
            r = Double((int >> 16) & 0xFF) / 255
            g = Double((int >> 8) & 0xFF) / 255
            b = Double(int & 0xFF) / 255
        default:
            r = 0.2; g = 0.7; b = 0.4
        }
        self.init(.sRGB, red: r, green: g, blue: b, opacity: 1)
    }
}
