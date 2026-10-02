//
//  PlayView.swift
//  KelimeBahcesi
//

import SwiftUI

struct PlayView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        VStack(spacing: 16) {
            HStack(spacing: 12) {
                Button {
                    model.goMap()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(Color(hex: "1A3324"))
                        .frame(width: 44, height: 44)
                        .background(Color.white.opacity(0.85), in: Circle())
                        .shadow(color: .black.opacity(0.1), radius: 0, y: 4)
                }

                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(levelLabel)
                            .font(.system(.subheadline, design: .rounded).weight(.heavy))
                            .lineLimit(1)
                        Spacer()
                        Text(wordCount)
                            .font(.system(.subheadline, design: .rounded).weight(.heavy))
                    }
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(Color.white.opacity(0.55))
                            Capsule()
                                .fill(LinearGradient(colors: [Color(hex: "3CB371"), Color(hex: "7AD7A0")], startPoint: .leading, endPoint: .trailing))
                                .frame(width: geo.size.width * wordProgress)
                        }
                    }
                    .frame(height: 11)
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)

            Spacer(minLength: 8)

            if let word = model.currentWord {
                VStack(spacing: 12) {
                    AsyncImage(url: URL(string: word.image)) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().scaledToFill()
                        case .failure:
                            Color(hex: "C8ECD4")
                        default:
                            ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity)
                        }
                    }
                    .frame(maxWidth: 340)
                    .aspectRatio(1, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
                    .shadow(color: .black.opacity(0.16), radius: 18, y: 10)

                    Text(word.tr)
                        .font(.system(.body, design: .rounded).weight(.bold))
                        .foregroundStyle(Color(hex: "3A5A45"))
                    Text(word.en)
                        .font(.system(size: 40, weight: .bold, design: .rounded))
                        .foregroundStyle(Color(hex: "1A3324"))
                        .textCase(.lowercase)
                }
            }

            Text(model.statusText)
                .font(.system(.title3, design: .rounded).weight(.heavy))
                .foregroundStyle(statusColor)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            if let toast = model.coinToast {
                Text(toast)
                    .font(.system(.headline, design: .rounded).weight(.bold))
                    .foregroundStyle(Color(hex: "EF9B12"))
            }

            Spacer()

            HStack(spacing: 20) {
                SoftButton(title: "▶  Dinle") { model.hearAgain() }
                    .disabled(model.advancing)

                Button {
                    model.toggleListen()
                } label: {
                    ZStack {
                        Circle()
                            .fill(LinearGradient(colors: [Color(hex: "FF7D88"), Color(hex: "FF5A6A")], startPoint: .top, endPoint: .bottom))
                            .frame(width: 120, height: 120)
                            .shadow(color: Color(hex: "D93D4D"), radius: 0, y: 10)
                        if model.speech.isListening {
                            Circle()
                                .stroke(Color(hex: "FF5A6A").opacity(0.35), lineWidth: 3)
                                .frame(width: 136, height: 136)
                        }
                        Text(model.speech.isListening ? "Dinliyor" : "Tekrar et")
                            .font(.system(.headline, design: .rounded).weight(.bold))
                            .foregroundStyle(.white)
                    }
                }
                .disabled(model.advancing)
                .scaleEffect(model.speech.isListening ? 1.04 : 1)
            }
            .padding(.bottom, 28)
        }
    }

    private var levelLabel: String {
        guard let level = model.currentLevel else { return "" }
        return "\(level.id). \(level.title)"
    }

    private var wordCount: String {
        guard let level = model.currentLevel else { return "" }
        return "\(model.wordIndex + 1) / \(level.words.count)"
    }

    private var wordProgress: CGFloat {
        guard let level = model.currentLevel, !level.words.isEmpty else { return 0 }
        return CGFloat(model.wordIndex) / CGFloat(level.words.count)
    }

    private var statusColor: Color {
        switch model.statusKind {
        case "ok": return Color(hex: "2A8F56")
        case "bad": return Color(hex: "FF6B57")
        case "listen": return Color(hex: "FF5A6A")
        default: return Color(hex: "1A3324")
        }
    }
}
