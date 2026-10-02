//
//  SpeechService.swift
//  KelimeBahcesi
//

import AVFoundation
import Foundation
import ObjectiveC
import Speech

@MainActor
final class SpeechService: NSObject, ObservableObject {
    @Published var isListening = false
    @Published var lastError: String?

    private let synthesizer = AVSpeechSynthesizer()
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    private let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))

    var canRecognize: Bool {
        recognizer?.isAvailable == true
    }

    func requestPermissions() async -> Bool {
        let speech = await withCheckedContinuation { (cont: CheckedContinuation<Bool, Never>) in
            SFSpeechRecognizer.requestAuthorization { status in
                cont.resume(returning: status == .authorized)
            }
        }
        let mic: Bool
        if #available(iOS 17.0, *) {
            mic = await AVAudioApplication.requestRecordPermission()
        } else {
            mic = await withCheckedContinuation { cont in
                AVAudioSession.sharedInstance().requestRecordPermission { cont.resume(returning: $0) }
            }
        }
        return speech && mic
    }

    func speak(_ text: String, onEnd: (() -> Void)? = nil) {
        synthesizer.stopSpeaking(at: .immediate)
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = 0.42
        utterance.pitchMultiplier = 1.05

        let delegate = SpeakDelegate { onEnd?() }
        objc_setAssociatedObject(utterance, &SpeakDelegate.key, delegate, .OBJC_ASSOCIATION_RETAIN)
        synthesizer.delegate = delegate
        synthesizer.speak(utterance)
    }

    func stopSpeaking() {
        synthesizer.stopSpeaking(at: .immediate)
    }

    func stopListening() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionRequest = nil
        recognitionTask = nil
        isListening = false
    }

    func listen(onResult: @escaping ([String]) -> Void, onError: @escaping (String) -> Void) {
        stopListening()
        stopSpeaking()
        lastError = nil

        guard let recognizer, recognizer.isAvailable else {
            onError("unsupported")
            return
        }

        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .duckOthers])
            try session.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            onError("audio")
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest else {
            onError("busy")
            return
        }
        recognitionRequest.shouldReportPartialResults = false
        recognitionRequest.taskHint = .dictation

        let input = audioEngine.inputNode
        let format = input.outputFormat(forBus: 0)
        input.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
            recognitionRequest.append(buffer)
        }

        do {
            audioEngine.prepare()
            try audioEngine.start()
        } catch {
            stopListening()
            onError("audio")
            return
        }

        isListening = true
        recognitionTask = recognizer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            Task { @MainActor in
                guard let self else { return }
                if let result, result.isFinal {
                    let alts = result.transcriptions.prefix(4).map(\.formattedString)
                    self.stopListening()
                    onResult(Array(alts))
                    return
                }
                if let error {
                    self.stopListening()
                    let ns = error as NSError
                    if ns.domain == "kAFAssistantErrorDomain" && ns.code == 1110 {
                        onError("no-speech")
                    } else {
                        onError("error")
                    }
                }
            }
        }
    }

    static func isMatch(_ transcript: String, target: String) -> Bool {
        let said = normalize(transcript)
        let want = normalize(target)
        guard !said.isEmpty, !want.isEmpty else { return false }
        if said == want || said.contains(want) || want.contains(said) { return true }
        let allow = want.count <= 5 ? 1 : 2
        return said.split(separator: " ").contains { token in
            let t = String(token)
            return t == want || levenshtein(t, want) <= allow
        }
    }

    private static func normalize(_ text: String) -> String {
        text
            .lowercased()
            .folding(options: .diacriticInsensitive, locale: .current)
            .replacingOccurrences(of: "[^a-z\\s]", with: " ", options: .regularExpression)
            .replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private static func levenshtein(_ a: String, _ b: String) -> Int {
        let a = Array(a), b = Array(b)
        var dp = [[Int]](repeating: [Int](repeating: 0, count: b.count + 1), count: a.count + 1)
        for i in 0...a.count { dp[i][0] = i }
        for j in 0...b.count { dp[0][j] = j }
        for i in 1...a.count {
            for j in 1...b.count {
                let cost = a[i - 1] == b[j - 1] ? 0 : 1
                dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
            }
        }
        return dp[a.count][b.count]
    }
}

private final class SpeakDelegate: NSObject, AVSpeechSynthesizerDelegate {
    static var key: UInt8 = 0
    let onEnd: () -> Void
    init(onEnd: @escaping () -> Void) { self.onEnd = onEnd }
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        onEnd()
    }
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        onEnd()
    }
}
