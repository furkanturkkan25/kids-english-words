//
//  APIClient.swift
//  KelimeBahcesi
//

import Foundation

enum APIError: LocalizedError {
    case badURL
    case badStatus(Int)
    case decoding

    var errorDescription: String? {
        switch self {
        case .badURL: return "Geçersiz adres"
        case .badStatus(let code): return "Sunucu hatası (\(code))"
        case .decoding: return "Veri okunamadı"
        }
    }
}

actor APIClient {
    /// Simülatörde Mac’teki Node gateway: npm start → :5174
    var baseURL: URL

    init(baseURL: URL = URL(string: "http://127.0.0.1:5174")!) {
        self.baseURL = baseURL
    }

    func fetchLevels() async throws -> LevelsResponse {
        try await get("/api/levels")
    }

    func fetchShop() async throws -> ShopCatalog {
        try await get("/api/shop")
    }

    func fetchMedia(word: String) async throws -> MediaResponse {
        var components = URLComponents(url: baseURL.appendingPathComponent("api/media"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "word", value: word)]
        guard let url = components.url else { throw APIError.badURL }
        return try await get(url: url)
    }

    private func get<T: Decodable>(_ path: String) async throws -> T {
        guard let url = URL(string: path, relativeTo: baseURL) else { throw APIError.badURL }
        return try await get(url: url)
    }

    private func get<T: Decodable>(url: URL) async throws -> T {
        var request = URLRequest(url: url)
        request.timeoutInterval = 20
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError.badStatus(-1) }
        guard (200..<300).contains(http.statusCode) else { throw APIError.badStatus(http.statusCode) }
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.decoding
        }
    }
}
