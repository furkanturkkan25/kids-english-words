//
//  WelcomeView.swift
//  KelimeBahcesi
//

import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Spacer()
            Text("Kelime Bahçesi")
                .font(.system(size: 42, weight: .bold, design: .rounded))
                .foregroundStyle(Color(hex: "1A3324"))

            Text("Dinle, bak, söyle — Tomo’yu büyüt")
                .font(.system(size: 24, weight: .semibold, design: .rounded))
                .foregroundStyle(Color(hex: "1A3324"))
                .frame(maxWidth: 280, alignment: .leading)

            Text("Doğru kelimelerde bahçe parası kazan. Parayla Tomo’ya yiyecek ve eşya al.")
                .font(.system(.body, design: .rounded).weight(.medium))
                .foregroundStyle(Color(hex: "3A5A45"))
                .frame(maxWidth: 300, alignment: .leading)

            Text(model.loadMessage)
                .font(.system(.subheadline, design: .rounded).weight(.bold))
                .foregroundStyle(model.loadFailed ? Color(hex: "FF6B57") : Color(hex: "2A8F56"))

            PrimaryButton(title: "Haritaya git", enabled: model.isReady) {
                model.goMap()
            }

            Text("Mikrofon iznini kabul etmeyi unutma.")
                .font(.system(.caption, design: .rounded).weight(.semibold))
                .foregroundStyle(Color(hex: "3A5A45").opacity(0.85))

            Spacer()
        }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
