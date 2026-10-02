//
//  RootView.swift
//  KelimeBahcesi
//

import SwiftUI

struct RootView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        ZStack {
            GardenBackground()
            Group {
                switch model.screen {
                case .welcome: WelcomeView()
                case .map: MapView()
                case .play: PlayView()
                case .pet: PetView()
                case .levelDone: LevelDoneView()
                case .allDone: AllDoneView()
                }
            }
            .animation(.easeOut(duration: 0.35), value: model.screen)

            if model.screen != .welcome {
                VStack {
                    HStack {
                        Spacer()
                        CoinChip(amount: model.pet.coins)
                            .padding(.trailing, 16)
                            .padding(.top, 8)
                    }
                    Spacer()
                }
            }
        }
        .task { await model.bootstrap() }
    }
}

struct GardenBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "6EB8D9"), Color(hex: "A8DAF0"), Color(hex: "D4EF9A")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack {
                Spacer()
                Ellipse()
                    .fill(Color(hex: "5FAD68").opacity(0.55))
                    .frame(height: 220)
                    .offset(y: 80)
            }
            .ignoresSafeArea()
        }
    }
}

struct CoinChip: View {
    let amount: Int
    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color(hex: "FFE08A"), Color(hex: "EF9B12")],
                        center: .topLeading,
                        startRadius: 1,
                        endRadius: 14
                    )
                )
                .frame(width: 18, height: 18)
            Text("\(amount)")
                .font(.system(.title3, design: .rounded).weight(.bold))
                .foregroundStyle(Color(hex: "1A3324"))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(Color(hex: "FFF8DC").opacity(0.92), in: Capsule())
        .shadow(color: .black.opacity(0.12), radius: 8, y: 4)
    }
}

struct PrimaryButton: View {
    let title: String
    var enabled: Bool = true
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(.title3, design: .rounded).weight(.bold))
                .foregroundStyle(Color(hex: "1A3324"))
                .padding(.horizontal, 28)
                .padding(.vertical, 14)
                .background(
                    LinearGradient(colors: [Color(hex: "FFC14D"), Color(hex: "EF9B12")], startPoint: .top, endPoint: .bottom),
                    in: Capsule()
                )
                .shadow(color: Color(hex: "D4880A").opacity(0.5), radius: 0, y: 6)
        }
        .disabled(!enabled)
        .opacity(enabled ? 1 : 0.55)
    }
}

struct SoftButton: View {
    let title: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(.body, design: .rounded).weight(.bold))
                .foregroundStyle(Color(hex: "1A3324"))
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(Color.white.opacity(0.82), in: Capsule())
                .shadow(color: .black.opacity(0.1), radius: 0, y: 4)
        }
    }
}
