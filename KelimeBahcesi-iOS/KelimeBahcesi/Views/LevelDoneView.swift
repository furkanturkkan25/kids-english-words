//
//  LevelDoneView.swift
//  KelimeBahcesi
//

import SwiftUI

struct LevelDoneView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Spacer()
            Text("Kelime Bahçesi")
                .font(.system(.title3, design: .rounded).weight(.bold))
            Text(model.levelDoneTitle)
                .font(.system(size: 32, weight: .bold, design: .rounded))
            Text(model.levelDoneText)
                .font(.system(.body, design: .rounded).weight(.medium))
                .foregroundStyle(Color(hex: "3A5A45"))
            HStack(spacing: 10) {
                SoftButton(title: "Tomo’ya bak") { model.goPet() }
                SoftButton(title: "Harita") { model.goMap() }
            }
            PrimaryButton(title: model.completed.count >= model.levels.count ? "Bitir" : "Sonraki seviye") {
                model.nextLevel()
            }
            Spacer()
        }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct AllDoneView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Spacer()
            Text("Kelime Bahçesi")
                .font(.system(size: 36, weight: .bold, design: .rounded))
            Text("Bahçenin sonuna ulaştın!")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text("Kazandığın parayla Tomo’yu şımartabilirsin.")
                .font(.system(.body, design: .rounded).weight(.medium))
                .foregroundStyle(Color(hex: "3A5A45"))
            HStack(spacing: 10) {
                SoftButton(title: "Tomo") { model.goPet() }
                SoftButton(title: "Harita") { model.goMap() }
            }
            PrimaryButton(title: "Baştan başla") { model.restartMapProgress() }
            Spacer()
        }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
