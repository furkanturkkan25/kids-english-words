//
//  PetView.swift
//  KelimeBahcesi
//

import SwiftUI

struct PetView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Button { model.goMap() } label: {
                    Image(systemName: "chevron.left")
                        .font(.title3.weight(.bold))
                        .frame(width: 44, height: 44)
                        .background(Color.white.opacity(0.85), in: Circle())
                }
                .foregroundStyle(Color(hex: "1A3324"))

                VStack(alignment: .leading, spacing: 2) {
                    Text("Kelime Bahçesi")
                        .font(.system(.headline, design: .rounded).weight(.bold))
                    Text(model.pet.name)
                        .font(.system(.title2, design: .rounded).weight(.bold))
                }
                Spacer()
                SoftButton(title: "Market") {
                    model.petTab = "shop"
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)

            ZStack {
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(hex: "AEDCFF").opacity(0.55),
                                Color(hex: "FFF8DC").opacity(0.75),
                                Color(hex: "B0D678").opacity(0.65),
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(height: 230)

                VStack {
                    HStack {
                        Spacer()
                        Text(model.pet.mood.speech)
                            .font(.caption.weight(.heavy))
                            .padding(10)
                            .background(Color.white.opacity(0.9), in: RoundedRectangle(cornerRadius: 14))
                            .padding()
                    }
                    Spacer()
                    TomoCharacter(pet: model.pet)
                    Spacer().frame(height: 20)
                }
            }
            .padding(.horizontal, 16)

            VStack(spacing: 8) {
                meter("Açlık", value: model.pet.hunger, colors: [Color(hex: "F08A3A"), Color(hex: "EF6B4A")])
                meter("Mutluluk", value: model.pet.happy, colors: [Color(hex: "FF9EB5"), Color(hex: "EF6B8A")])
                meter("Enerji", value: model.pet.energy, colors: [Color(hex: "7EC8E3"), Color(hex: "4AA8D8")])
            }
            .padding(.horizontal, 16)

            HStack(spacing: 8) {
                tab("Çanta", id: "bag")
                tab("Market", id: "shop")
            }
            .padding(.horizontal, 16)

            ScrollView {
                if model.petTab == "bag" {
                    bagGrid
                } else {
                    VStack(alignment: .leading, spacing: 10) {
                        filterRow
                        shopGrid
                    }
                }
            }
            .padding(.horizontal, 16)

            DockBar(active: .pet, onMap: { model.goMap() }, onPet: { model.goPet() })
        }
    }

    private func meter(_ label: String, value: Double, colors: [Color]) -> some View {
        HStack {
            Text(label)
                .font(.caption.weight(.heavy))
                .foregroundStyle(Color(hex: "3A5A45"))
                .frame(width: 72, alignment: .leading)
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.white.opacity(0.55))
                    Capsule()
                        .fill(LinearGradient(colors: colors, startPoint: .leading, endPoint: .trailing))
                        .frame(width: geo.size.width * CGFloat(value / 100))
                }
            }
            .frame(height: 12)
        }
    }

    private func tab(_ title: String, id: String) -> some View {
        Button {
            model.petTab = id
        } label: {
            Text(title)
                .font(.system(.body, design: .rounded).weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color.white.opacity(model.petTab == id ? 0.92 : 0.45), in: RoundedRectangle(cornerRadius: 14))
                .foregroundStyle(Color(hex: "1A3324"))
        }
    }

    private var filterRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack {
                ForEach(["all", "food", "toy", "skin", "hat"], id: \.self) { kind in
                    let label = kind == "all" ? "Hepsi" : (model.shop.kinds[kind] ?? kind)
                    Button {
                        model.shopFilter = kind
                    } label: {
                        Text(label)
                            .font(.caption.weight(.heavy))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(Color.white.opacity(model.shopFilter == kind ? 0.95 : 0.5), in: Capsule())
                    }
                    .foregroundStyle(Color(hex: "1A3324"))
                }
            }
        }
    }

    private var bagGrid: some View {
        let entries = model.pet.owned.filter { $0.value > 0 }
        return LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
            if entries.isEmpty {
                Text("Marketten yiyecek veya eşya al, burada görünsün.")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Color(hex: "3A5A45"))
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                ForEach(Array(entries.keys.sorted()), id: \.self) { id in
                    if let item = model.shop.items.first(where: { $0.id == id }) {
                        ShopCard(
                            item: item,
                            subtitle: "\(model.shop.kinds[item.kind] ?? item.kind) · x\(entries[id] ?? 0)",
                            disabled: false
                        ) { model.useItem(id) }
                    }
                }
            }
        }
        .padding(.bottom, 20)
    }

    private var shopGrid: some View {
        let items = model.shop.items.filter { model.shopFilter == "all" || $0.kind == model.shopFilter }
        return LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
            ForEach(items) { item in
                let owned = model.pet.owned[item.id] ?? 0
                let cosmetic = item.kind == "skin" || item.kind == "hat"
                let taken = cosmetic && owned > 0
                let canBuy = model.pet.coins >= item.price && !taken
                ShopCard(
                    item: item,
                    subtitle: taken
                        ? "\(model.shop.kinds[item.kind] ?? "") · alındı"
                        : "\(model.shop.kinds[item.kind] ?? "") · \(item.price)",
                    disabled: !canBuy
                ) { model.buyItem(item.id) }
            }
        }
        .padding(.bottom, 20)
    }
}

struct ShopCard: View {
    let item: ShopItem
    let subtitle: String
    let disabled: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color(hex: item.swatch.replacingOccurrences(of: "#", with: "")))
                    .frame(width: 42, height: 42)
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.name)
                        .font(.subheadline.weight(.heavy))
                        .lineLimit(1)
                    Text(subtitle)
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(Color(hex: "3A5A45"))
                        .lineLimit(1)
                }
                Spacer(minLength: 0)
            }
            .padding(10)
            .background(Color.white.opacity(0.82), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: .black.opacity(0.08), radius: 0, y: 4)
        }
        .disabled(disabled)
        .opacity(disabled ? 0.55 : 1)
        .foregroundStyle(Color(hex: "1A3324"))
    }
}

struct TomoCharacter: View {
    let pet: PetState

    var body: some View {
        ZStack {
            if let hat = pet.hat {
                hatView(hat)
                    .offset(y: -62)
            }
            Ellipse()
                .fill(Color(hex: pet.skin.replacingOccurrences(of: "#", with: "")))
                .frame(width: 150, height: 150)
                .shadow(color: .black.opacity(0.15), radius: 12, y: 8)
                .overlay {
                    ZStack {
                        eyes
                        mouth
                    }
                }
        }
        .animation(.easeInOut(duration: 0.3), value: pet.mood)
    }

    private var eyes: some View {
        HStack(spacing: 36) {
            eye
            eye
        }
        .offset(y: pet.mood == .sad ? 4 : -4)
    }

    private var eye: some View {
        Group {
            if pet.mood == .sad {
                Capsule().fill(Color(hex: "1A3324")).frame(width: 22, height: 8)
            } else {
                Ellipse()
                    .fill(Color(hex: "1A3324"))
                    .frame(width: 22, height: pet.mood == .joy ? 24 : 28)
                    .overlay(alignment: .topTrailing) {
                        Circle().fill(.white).frame(width: 7, height: 7).offset(x: -4, y: 4)
                    }
            }
        }
    }

    private var mouth: some View {
        Group {
            switch pet.mood {
            case .joy, .ok:
                Capsule()
                    .stroke(Color(hex: "1A3324"), lineWidth: 3)
                    .frame(width: 28, height: pet.mood == .joy ? 16 : 12)
                    .offset(y: 28)
                    .mask(Rectangle().offset(y: 6))
            case .meh:
                Capsule().fill(Color(hex: "1A3324")).frame(width: 22, height: 3).offset(y: 30)
            case .sad:
                Capsule()
                    .stroke(Color(hex: "1A3324"), lineWidth: 3)
                    .frame(width: 26, height: 12)
                    .rotationEffect(.degrees(180))
                    .offset(y: 32)
                    .mask(Rectangle().offset(y: -6))
            }
        }
    }

    @ViewBuilder
    private func hatView(_ id: String) -> some View {
        switch id {
        case "hat_crown":
            Image(systemName: "crown.fill")
                .font(.system(size: 34))
                .foregroundStyle(Color(hex: "FFC14D"))
        case "hat_flower":
            Image(systemName: "leaf.fill")
                .font(.system(size: 30))
                .foregroundStyle(Color(hex: "FF8AAD"))
                .rotationEffect(.degrees(20))
        default:
            RoundedRectangle(cornerRadius: 8)
                .fill(Color(hex: "4AA8D8"))
                .frame(width: 70, height: 28)
                .overlay(alignment: .trailing) {
                    Capsule().fill(Color(hex: "3A90BC")).frame(width: 28, height: 10).offset(x: 8, y: 8)
                }
        }
    }
}
