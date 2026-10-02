//
//  FallbackData.swift
//  KelimeBahcesi
//

import Foundation

enum FallbackData {
    static let levels: [Level] = [
        Level(id: 1, title: "Hayvanlar 1", words: [
            Word(en: "cat", tr: "kedi", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800", alt: "Kedi"),
            Word(en: "dog", tr: "köpek", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cd?w=800", alt: "Köpek"),
            Word(en: "bird", tr: "kuş", image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800", alt: "Kuş"),
            Word(en: "fish", tr: "balık", image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800", alt: "Balık"),
            Word(en: "frog", tr: "kurbağa", image: "https://images.unsplash.com/photo-1496070290277-cc88c0b8c6e6?w=800", alt: "Kurbağa"),
        ]),
        Level(id: 2, title: "Hayvanlar 2", words: [
            Word(en: "horse", tr: "at", image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800", alt: "At"),
            Word(en: "bear", tr: "ayı", image: "https://images.unsplash.com/photo-1525382455947-f319bc05fb35?w=800", alt: "Ayı"),
            Word(en: "monkey", tr: "maymun", image: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800", alt: "Maymun"),
            Word(en: "elephant", tr: "fil", image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800", alt: "Fil"),
            Word(en: "tiger", tr: "kaplan", image: "https://images.unsplash.com/photo-1561731216-c3a4d2720d9d?w=800", alt: "Kaplan"),
        ]),
        Level(id: 3, title: "Yiyecek & içecek 1", words: [
            Word(en: "apple", tr: "elma", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800", alt: "Elma"),
            Word(en: "banana", tr: "muz", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800", alt: "Muz"),
            Word(en: "milk", tr: "süt", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800", alt: "Süt"),
            Word(en: "bread", tr: "ekmek", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800", alt: "Ekmek"),
            Word(en: "cake", tr: "pasta", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800", alt: "Pasta"),
        ]),
        Level(id: 4, title: "Renkler", words: [
            Word(en: "red", tr: "kırmızı", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800", alt: "Kırmızı"),
            Word(en: "blue", tr: "mavi", image: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800", alt: "Mavi"),
            Word(en: "green", tr: "yeşil", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", alt: "Yeşil"),
            Word(en: "yellow", tr: "sarı", image: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800", alt: "Sarı"),
            Word(en: "pink", tr: "pembe", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800", alt: "Pembe"),
        ]),
        Level(id: 5, title: "Taşıtlar", words: [
            Word(en: "car", tr: "araba", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800", alt: "Araba"),
            Word(en: "bus", tr: "otobüs", image: "https://images.unsplash.com/photo-1544620341-9adc0c675de0?w=800", alt: "Otobüs"),
            Word(en: "train", tr: "tren", image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800", alt: "Tren"),
            Word(en: "bike", tr: "bisiklet", image: "https://images.unsplash.com/photo-1485965120184-e0473bcfe0b0?w=800", alt: "Bisiklet"),
            Word(en: "plane", tr: "uçak", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800", alt: "Uçak"),
        ]),
    ]

    static let shop = ShopCatalog(
        coins: .init(perWord: 8, levelBonus: 25),
        items: [
            ShopItem(id: "apple_snack", name: "Elma dilimi", kind: "food", price: 12, hunger: 18, happy: 4, energy: 2, swatch: "#EF6B4A", shape: "fruit", color: nil),
            ShopItem(id: "cookie", name: "Kurabiye", kind: "food", price: 18, hunger: 22, happy: 10, energy: 4, swatch: "#C48A4A", shape: "cookie", color: nil),
            ShopItem(id: "milk", name: "Süt", kind: "food", price: 15, hunger: 14, happy: 6, energy: 12, swatch: "#F5F0E6", shape: "cup", color: nil),
            ShopItem(id: "cake", name: "Pasta", kind: "food", price: 35, hunger: 30, happy: 20, energy: 8, swatch: "#FF9EB5", shape: "cake", color: nil),
            ShopItem(id: "ball_toy", name: "Top", kind: "toy", price: 28, hunger: -4, happy: 22, energy: -8, swatch: "#4AA8D8", shape: "ball", color: nil),
            ShopItem(id: "kite_toy", name: "Uçurtma", kind: "toy", price: 40, hunger: -2, happy: 28, energy: -6, swatch: "#EF6B6B", shape: "kite", color: nil),
            ShopItem(id: "skin_leaf", name: "Yaprak yeşili", kind: "skin", price: 50, hunger: nil, happy: nil, energy: nil, swatch: "#5FAD68", shape: "blob", color: "#5FAD68"),
            ShopItem(id: "skin_sun", name: "Güneş sarısı", kind: "skin", price: 55, hunger: nil, happy: nil, energy: nil, swatch: "#FFC14D", shape: "blob", color: "#FFC14D"),
            ShopItem(id: "skin_sky", name: "Gökyüzü mavisi", kind: "skin", price: 55, hunger: nil, happy: nil, energy: nil, swatch: "#6EB8D9", shape: "blob", color: "#6EB8D9"),
            ShopItem(id: "hat_cap", name: "Kep", kind: "hat", price: 60, hunger: nil, happy: nil, energy: nil, swatch: "#4AA8D8", shape: "cap", color: nil),
            ShopItem(id: "hat_crown", name: "Altın taç", kind: "hat", price: 120, hunger: nil, happy: nil, energy: nil, swatch: "#FFC14D", shape: "crown", color: nil),
            ShopItem(id: "hat_flower", name: "Çiçek", kind: "hat", price: 42, hunger: nil, happy: nil, energy: nil, swatch: "#FF8AAD", shape: "flower", color: nil),
        ],
        kinds: ["food": "Yiyecek", "toy": "Oyuncak", "skin": "Renk", "hat": "Şapka"]
    )
}
