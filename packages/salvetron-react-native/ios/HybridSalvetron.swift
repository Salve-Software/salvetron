//
//  HybridSalvetron.swift
//  NitroSalvetron
//
//  Native log capture implementation for iOS
//

import Foundation
import UIKit
import OSLog

class HybridSalvetron: HybridNitroSalvetronSpec {

    // MARK: - Properties

    private var logCallback: ((_ log: NativeLogEntry) -> Void)?
    private var isCapturingLogs = false
    private var stderrPipe: Pipe?
    private var originalStderr: Int32 = -1
    private var readSource: DispatchSourceRead?
    private var hasRecoveredHistory = false

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

        // Recover pre-existing history from the unified logging system once per
        // process lifetime — this is what surfaces logs emitted before startLogCapture
        // was ever called (e.g. AppDelegate.didFinishLaunchingWithOptions), since NSLog
        // already writes there in addition to stderr.
        if !hasRecoveredHistory {
            hasRecoveredHistory = true
            recoverHistoricalLogs()
        }

        // Create pipe for stderr redirection
        stderrPipe = Pipe()
        guard let pipe = stderrPipe else {
            isCapturingLogs = false
            logCallback = nil
            return false
        }

        // Save original stderr
        originalStderr = dup(STDERR_FILENO)

        // Disable buffering on stderr
        setvbuf(stderr, nil, _IONBF, 0)

        // Redirect stderr to our pipe
        dup2(pipe.fileHandleForWriting.fileDescriptor, STDERR_FILENO)

        // Set up dispatch source to read from pipe
        let fileDescriptor = pipe.fileHandleForReading.fileDescriptor
        readSource = DispatchSource.makeReadSource(fileDescriptor: fileDescriptor, queue: DispatchQueue.global(qos: .utility))

        readSource?.setEventHandler { [weak self] in
            guard let self = self else { return }

            let data = pipe.fileHandleForReading.availableData
            guard !data.isEmpty else { return }

            // Write to original stderr so logs still appear in Xcode console
            if self.originalStderr >= 0 {
                _ = data.withUnsafeBytes { bytes in
                    write(self.originalStderr, bytes.baseAddress, data.count)
                }
            }

            // Process the log
            if let output = String(data: data, encoding: .utf8) {
                self.processLogOutput(output)
            }
        }

        readSource?.setCancelHandler { [weak self] in
            self?.stderrPipe?.fileHandleForReading.closeFile()
        }

        readSource?.resume()

        return true
    }

    func stopLogCapture() throws {
        guard isCapturingLogs else { return }

        isCapturingLogs = false
        logCallback = nil

        // Cancel read source
        readSource?.cancel()
        readSource = nil

        // Restore original stderr
        if originalStderr >= 0 {
            dup2(originalStderr, STDERR_FILENO)
            close(originalStderr)
            originalStderr = -1
        }

        // Close pipe
        stderrPipe?.fileHandleForWriting.closeFile()
        stderrPipe = nil
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

    // MARK: - Private Helpers

    private func processLogOutput(_ output: String) {
        // Split by newlines and process each line
        let lines = output.components(separatedBy: .newlines)

        for line in lines where !line.isEmpty {
            let level = detectLogLevel(from: line)
            let tag = extractTag(from: line)

            let entry = NativeLogEntry(
                level: level,
                message: line,
                tag: tag,
                timestamp: Date().timeIntervalSince1970 * 1000
            )

            dispatchLogEntry(entry)
        }
    }

    private func dispatchLogEntry(_ entry: NativeLogEntry) {
        // Invoke callback on main thread for React Native
        DispatchQueue.main.async { [weak self] in
            self?.logCallback?(entry)
        }
    }

    /// Reads logs already recorded by the unified logging system (NSLog writes here
    /// in addition to stderr) so history predating this call — e.g. app launch — isn't lost.
    private func recoverHistoricalLogs() {
        do {
            let store = try OSLogStore.local()
            let currentPid = ProcessInfo.processInfo.processIdentifier

            // Bound the scan to the last hour — we only care about this process
            // launch, not the device's full retained log history.
            let position = store.position(date: Date().addingTimeInterval(-3600))
            let entries = try store.getEntries(at: position)

            for entry in entries {
                guard let logEntry = entry as? OSLogEntryLog, logEntry.processIdentifier == currentPid else {
                    continue
                }

                let level = mapOSLogLevel(logEntry.level, message: logEntry.composedMessage)
                let tag = logEntry.category.isEmpty
                    ? extractTag(from: logEntry.composedMessage)
                    : logEntry.category

                let nativeEntry = NativeLogEntry(
                    level: level,
                    message: logEntry.composedMessage,
                    tag: tag,
                    timestamp: logEntry.date.timeIntervalSince1970 * 1000
                )

                dispatchLogEntry(nativeEntry)
            }
        } catch {
            // Ignore history recovery errors — live capture still proceeds
        }
    }

    private func mapOSLogLevel(_ level: OSLogEntryLog.Level, message: String) -> NativeLogLevel {
        switch level {
        case .debug: return .verbose
        case .info, .notice: return .info
        case .error, .fault: return .error
        default: return detectLogLevel(from: message)
        }
    }

    private func detectLogLevel(from line: String) -> NativeLogLevel {
        let lowercased = line.lowercased()

        if lowercased.contains("error") || lowercased.contains("fault") || lowercased.contains("❌") {
            return .error
        } else if lowercased.contains("warning") || lowercased.contains("warn") || lowercased.contains("⚠️") {
            return .warn
        } else if lowercased.contains("debug") || lowercased.contains("🔍") {
            return .verbose
        }
        return .info
    }

    private func extractTag(from line: String) -> String {
        // Try to extract subsystem/category from NSLog format
        // Format: "timestamp process[pid:tid] message" or similar

        // Try to match patterns like "[CategoryName]" at the start
        let bracketPattern = #"^\[([^\]]+)\]"#
        if let regex = try? NSRegularExpression(pattern: bracketPattern),
           let match = regex.firstMatch(in: line, range: NSRange(line.startIndex..., in: line)),
           let range = Range(match.range(at: 1), in: line) {
            return String(line[range])
        }

        // Try to extract from NSLog format: "AppName[pid:tid]"
        let nslogPattern = #"^[\d\-:\.\s]+([A-Za-z0-9_]+)\["#
        if let regex = try? NSRegularExpression(pattern: nslogPattern),
           let match = regex.firstMatch(in: line, range: NSRange(line.startIndex..., in: line)),
           let range = Range(match.range(at: 1), in: line) {
            return String(line[range])
        }

        return "native"
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
