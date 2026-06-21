//
//  HybridSalvetron.swift
//  NitroSalvetron
//
//  Native log capture implementation for iOS
//

import Foundation
import UIKit

class HybridSalvetron: HybridNitroSalvetronSpec {

    // MARK: - Properties

    private var logCallback: ((_ log: NativeLogEntry) -> Void)?
    private var isCapturingLogs = false

    // Storage key for device ID
    private let deviceIdStorageKey = "salvetron_device_id"

    // Performance monitoring
    private let performanceMonitor = PerformanceMonitor()

    // MARK: - Existing Methods

    func sum(num1: Double, num2: Double) throws -> Double {
        return num1 + num2
    }

    // MARK: - Log Capture Methods

    func startLogCapture(onLog: @escaping (_ log: NativeLogEntry) -> Void) throws -> Bool {
        guard !isCapturingLogs else {
            return false // Already capturing
        }

        logCallback = onLog
        isCapturingLogs = true

        // Capture itself is owned by SalvetronLogBuffer, installed at dylib load
        // time (see SalvetronEarlyLog.mm) so it runs before main(). Attaching here
        // replays any backlog buffered since launch, then forwards live.
        SalvetronLogBuffer.shared.attach { [weak self] entry in
            self?.logCallback?(entry)
        }

        return true
    }

    func stopLogCapture() throws {
        guard isCapturingLogs else { return }

        isCapturingLogs = false
        logCallback = nil

        SalvetronLogBuffer.shared.detach()
    }

    func isCapturing() throws -> Bool {
        return isCapturingLogs
    }

    // MARK: - Device Info Methods

    func getDeviceInfo() throws -> DeviceInfoResult {
        let deviceId = UIDevice.current.identifierForVendor?.uuidString ?? generateUUID()
        let deviceName = UIDevice.current.name
        let appName = Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String
                      ?? Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String
                      ?? "React Native App"
        let bundleId = Bundle.main.bundleIdentifier ?? ""

        return DeviceInfoResult(deviceId: deviceId, deviceName: deviceName, appName: appName, bundleId: bundleId)
    }

    func getStoredDeviceId() throws -> String? {
        return UserDefaults.standard.string(forKey: deviceIdStorageKey)
    }

    func storeDeviceId(deviceId: String) throws {
        UserDefaults.standard.set(deviceId, forKey: deviceIdStorageKey)
    }

    private func generateUUID() -> String {
        return UUID().uuidString
    }

    // MARK: - Performance Monitoring Methods

    func startPerformanceMonitoring(onMetrics: @escaping (_ metrics: PerformanceMetrics) -> Void, intervalMs: Double?) throws -> Bool {
        let interval = intervalMs.map { Int($0) } ?? 1000

        return performanceMonitor.start(callback: { data in
            let metrics = PerformanceMetrics(
                uiFps: data.uiFps,
                jsFps: data.jsFps,
                memoryUsageMB: data.memoryUsageMB,
                cpuUsagePercent: data.cpuUsagePercent
            )
            onMetrics(metrics)
        }, intervalMs: interval)
    }

    func stopPerformanceMonitoring() throws {
        performanceMonitor.stop()
    }

    func isPerformanceMonitoring() throws -> Bool {
        return performanceMonitor.isRunning()
    }

    func getPerformanceSnapshot() throws -> PerformanceMetrics {
        let data = performanceMonitor.getSnapshot()
        return PerformanceMetrics(
            uiFps: data.uiFps,
            jsFps: data.jsFps,
            memoryUsageMB: data.memoryUsageMB,
            cpuUsagePercent: data.cpuUsagePercent
        )
    }

    func recordJsFrame() throws {
        performanceMonitor.recordJsFrame()
    }

    // MARK: - Test-only Methods

    func triggerNativeTestLog(level: NativeLogLevel, message: String, tag: String?) throws {
        let levelLabel: String
        switch level {
        case .verbose: levelLabel = "DEBUG"
        case .info: levelLabel = "INFO"
        case .warn: levelLabel = "WARNING"
        case .error: levelLabel = "ERROR"
        }
        NSLog("[\(tag ?? "Salvetron-Example")] \(levelLabel): \(message)")
    }

    deinit {
        try? stopLogCapture()
        performanceMonitor.stop()
    }
}
