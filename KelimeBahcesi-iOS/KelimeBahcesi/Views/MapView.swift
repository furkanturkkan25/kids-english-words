//
//  MapView.swift
//  KelimeBahcesi
//

import SwiftUI

struct MapView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        VStack(spacing: 12) {
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Kelime Bahçesi")
                        .font(.system(.headline, design: .rounded).weight(.bold))
                    Text("Keşif haritası")
                        .font(.system(.title2, design: .rounded).weight(.bold))
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(model.doneCount)/\(model.levels.count)")
                        .font(.system(.title3, design: .rounded).weight(.bold))
                    Text("seviye")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color(hex: "3A5A45"))
                    Text("\(model.wordsLearned)")
                        .font(.system(.title3, design: .rounded).weight(.bold))
                        .padding(.top, 4)
                    Text("kelime")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color(hex: "3A5A45"))
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.white.opacity(0.45))
                    Capsule()
                        .fill(LinearGradient(colors: [Color(hex: "3CB371"), Color(hex: "8FD4A0")], startPoint: .leading, endPoint: .trailing))
                        .frame(width: geo.size.width * progress)
                }
            }
            .frame(height: 10)
            .padding(.horizontal, 20)

            Text(caption)
                .font(.system(.subheadline, design: .rounded).weight(.heavy))
                .foregroundStyle(Color(hex: "3A5A45"))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 20)

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(Array(model.levels.enumerated()), id: \.element.id) { index, level in
                            if showSection(at: index) {
                                Text(sectionTitle(level.title))
                                    .font(.system(.subheadline, design: .rounded).weight(.bold))
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.white.opacity(0.55), in: Capsule())
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.top, 8)
                            }
                            MapNodeRow(
                                level: level,
                                state: model.nodeState(for: index),
                                side: index % 3,
                                color: model.themeColor(for: level.title)
                            ) {
                                model.openLevel(index)
                            }
                            .id(index)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 100)
                }
                .onAppear {
                    proxy.scrollTo(model.unlocked, anchor: .center)
                }
            }

            DockBar(active: .map, onMap: { model.goMap() }, onPet: { model.goPet() })
        }
    }

    private var progress: CGFloat {
        guard !model.levels.isEmpty else { return 0 }
        return CGFloat(model.doneCount) / CGFloat(model.levels.count)
    }

    private var caption: String {
        if model.doneCount >= model.levels.count { return "Tüm bahçeyi dolaştın — tebrikler!" }
        if model.levels.indices.contains(model.unlocked) {
            let next = model.levels[model.unlocked]
            return "Sıradaki: \(next.id). \(next.title)"
        }
        return "Haritadan bir durak seç"
    }

    private func sectionTitle(_ title: String) -> String {
        title.replacingOccurrences(of: #"\s+\d+$"#, with: "", options: .regularExpression)
    }

    private func showSection(at index: Int) -> Bool {
        if index == 0 { return true }
        return sectionTitle(model.levels[index].title) != sectionTitle(model.levels[index - 1].title)
    }
}

struct MapNodeRow: View {
    let level: Level
    let state: LevelNodeState
    let side: Int
    let color: Color
    let action: () -> Void

    var body: some View {
        HStack {
            if side == 2 { Spacer() }
            if side == 0 { Spacer() }
            Button(action: action) {
                VStack(spacing: 6) {
                    ZStack {
                        Circle()
                            .fill(orbGradient)
                            .frame(width: 58, height: 58)
                            .shadow(color: .black.opacity(0.15), radius: 0, y: 5)
                            .overlay {
                                if state == .current {
                                    Circle().stroke(Color(hex: "FFC14D").opacity(0.45), lineWidth: 6)
                                }
                            }
                        Text(mark)
                            .font(.system(.title3, design: .rounded).weight(.bold))
                            .foregroundStyle(state == .current ? Color(hex: "1A3324") : .white)
                    }
                    Text(shortTitle)
                        .font(.caption2.weight(.heavy))
                        .foregroundStyle(Color(hex: "3A5A45"))
                        .multilineTextAlignment(.center)
                        .frame(width: 90)
                }
            }
            .disabled(state == .locked)
            .opacity(state == .locked ? 0.72 : 1)
            if side == 1 { Spacer() }
            if side == 0 { Spacer() }
        }
        .frame(minHeight: 88)
    }

    private var mark: String {
        switch state {
        case .done: return "✓"
        case .locked: return "·"
        case .current: return "\(level.id)"
        }
    }

    private var shortTitle: String {
        level.title.replacingOccurrences(of: #"\s+(\d+)$"#, with: " ·$1", options: .regularExpression)
    }

    private var orbGradient: LinearGradient {
        switch state {
        case .done:
            return LinearGradient(colors: [Color(hex: "5FD08A"), Color(hex: "2A8F56")], startPoint: .topLeading, endPoint: .bottomTrailing)
        case .current:
            return LinearGradient(colors: [Color(hex: "FFC14D"), Color(hex: "EF9B12")], startPoint: .top, endPoint: .bottom)
        case .locked:
            return LinearGradient(colors: [Color(hex: "B7C9BC"), Color(hex: "8AA896")], startPoint: .top, endPoint: .bottom)
        }
    }
}

enum DockTab { case map, pet }

struct DockBar: View {
    let active: DockTab
    let onMap: () -> Void
    let onPet: () -> Void

    var body: some View {
        HStack(spacing: 10) {
            dockButton(title: "Harita", on: active == .map, action: onMap)
            dockButton(title: "Tomo", on: active == .pet, action: onPet)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(
            LinearGradient(colors: [.clear, Color(hex: "E8F7C8").opacity(0.85)], startPoint: .top, endPoint: .bottom)
        )
    }

    private func dockButton(title: String, on: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(.body, design: .rounded).weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.white.opacity(on ? 0.95 : 0.72), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                .foregroundStyle(Color(hex: on ? "1A3324" : "3A5A45"))
                .shadow(color: .black.opacity(0.1), radius: 0, y: on ? 5 : 4)
        }
    }
}
