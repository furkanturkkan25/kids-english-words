//
//  KelimeBahcesiApp.swift
//  KelimeBahcesi
//

import SwiftUI

@main
struct KelimeBahcesiApp: App {
    @StateObject private var appModel = AppModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appModel)
                .preferredColorScheme(.light)
        }
    }
}
