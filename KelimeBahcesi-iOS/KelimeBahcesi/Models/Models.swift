//
//  Models.swift
//  KelimeBahcesi
//

import Foundation
import SwiftUI

struct Word: Codable, Identifiable, Hashable {
    var id: String { en }
    var en: String
    var tr: String
    var image: String
    var alt: String?

    enum CodingKeys: String, CodingKey {
        case en, tr, image, alt
    }
}

struct Level: Codable, Identifiable, Hashable {
    var id: Int
    var title: String
    var words: [Word]
}

struct LevelsResponse: Codable {
    var levels: [Level]
    var meta: Meta?

    struct Meta: Codable {
        var levelCount: Int?
        var wordCount: Int?
    }
}

struct MediaResponse: Codable {
    var en: String
    var tr: String
    var image: String
    var alt: String?
}

struct ShopCatalog: Codable {
    var coins: CoinRules
    var items: [ShopItem]
    var kinds: [String: String]

    struct CoinRules: Codable {
        var perWord: Int
        var levelBonus: Int
    }
}

struct ShopItem: Codable, Identifiable, Hashable {
    var id: String
    var name: String
    var kind: String
    var price: Int
    var hunger: Int?
    var happy: Int?
    var energy: Int?
    var swatch: String
    var shape: String
    var color: String?
}

struct PetState: Codable {
    var name: String
    var coins: Int
    var hunger: Double
    var happy: Double
    var energy: Double
    var skin: String
    var hat: String?
    var owned: [String: Int]
    var lastTick: Date

    static let demo = PetState(
        name: "Tomo",
        coins: 600,
        hunger: 70,
        happy: 70,
        energy: 70,
        skin: "#5FAD68",
        hat: nil,
        owned: [:],
        lastTick: Date()
    )

    var mood: PetMood {
        let avg = (hunger + happy + energy) / 3
        if avg >= 75 { return .joy }
        if avg >= 45 { return .ok }
        if avg >= 25 { return .meh }
        return .sad
    }

    mutating func applyDecay() {
        let hours = min(24, Date().timeIntervalSince(lastTick) / 3600)
        if hours > 0.08 {
            hunger = clamp(hunger - hours * 6)
            happy = clamp(happy - hours * 4)
            energy = clamp(energy - hours * 3)
        }
        lastTick = Date()
    }

    private func clamp(_ n: Double) -> Double {
        min(100, max(0, n.rounded()))
    }
}

enum PetMood: String {
    case joy, ok, meh, sad

    var speech: String {
        switch self {
        case .joy: return "Harika hissediyorum!"
        case .ok: return "Kelime öğren, bana bak!"
        case .meh: return "Biraz yiyecek isterim…"
        case .sad: return "Açım ve üzgünüm…"
        }
    }
}

enum LevelNodeState {
    case locked, current, done
}

enum AppScreen: Equatable {
    case welcome
    case map
    case play
    case pet
    case levelDone
    case allDone
}
