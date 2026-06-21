//
//  PerformanceMonitor.swift
//  NitroRnTuiSdk
//
//  Performance metrics monitoring for iOS
//  Measures UI FPS, JS FPS, memory usage, and CPU usage
//

import Foundation
import QuartzCore
import UIKit

public struct PerformanceMetricsData {
    let uiFps: Double
    let jsFps: Double
    let memoryUsageMB: Double
    let cpuUsagePercent: Double
}

public typealias PerformanceMetricsCallback = (PerformanceMetricsData) -> Void

public class PerformanceMonitor {

    // MARK: - Properties

    private var displayLink: CADisplayLink?
    private var displayLinkProxy: DisplayLinkProxy?
    private var reportTimer: Timer?
    private var callback: PerformanceMetricsCallback?

    // UI FPS tracking
    private var uiFrameCount: Int = 0
    private var lastUiFpsUpdateTime: CFTimeInterval = 0
    private var currentUiFps: Double = 0

    // JS FPS tracking (via callback timing)
    private var lastJsCallbackTime: CFTimeInterval = 0
    private var jsFrameCount: Int = 0
    private var lastJsFpsUpdateTime: CFTimeInterval = 0
    private var currentJsFps: Double = 0

    private var isMonitoring = false
    private var intervalMs: Int = 1000

    // MARK: - DisplayLinkProxy

    // DisplayLinkProxy to avoid retain cycle with CADisplayLink
    private class DisplayLinkProxy {
        weak var target: PerformanceMonitor?

        init(target: PerformanceMonitor) {
            self.target = target
        }

        @objc func handleDisplayLink(_ link: CADisplayLink) {
            target?.handleDisplayLink(link)
        }
    }

    // MARK: - Public Methods

    public func start(callback: @escaping PerformanceMetricsCallback, intervalMs: Int = 1000) -> Bool {
        guard !isMonitoring else {
            return false // Already monitoring
        }

        self.callback = callback
        self.intervalMs = intervalMs
        self.isMonitoring = true

        // Reset counters
        uiFrameCount = 0
        jsFrameCount = 0
        lastUiFpsUpdateTime = CACurrentMediaTime()
        lastJsFpsUpdateTime = CACurrentMediaTime()
        lastJsCallbackTime = CACurrentMediaTime()
        currentUiFps = 0
        currentJsFps = 0

        // Set up CADisplayLink for UI FPS
        displayLinkProxy = DisplayLinkProxy(target: self)
        displayLink = CADisplayLink(target: displayLinkProxy!, selector: #selector(DisplayLinkProxy.handleDisplayLink(_:)))
        displayLink?.add(to: .main, forMode: .common)

        // Set up timer for reporting metrics
        let interval = TimeInterval(intervalMs) / 1000.0
        reportTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            self?.reportMetrics()
        }

        return true
    }

    public func stop() {
        guard isMonitoring else { return }

        isMonitoring = false
        callback = nil

        // Stop display link
        displayLink?.invalidate()
        displayLink = nil
        displayLinkProxy = nil

        // Stop report timer
        reportTimer?.invalidate()
        reportTimer = nil
    }

    public func isRunning() -> Bool {
        return isMonitoring
    }

    public func getSnapshot() -> PerformanceMetricsData {
        return PerformanceMetricsData(
            uiFps: currentUiFps,
            jsFps: currentJsFps,
            memoryUsageMB: getMemoryUsage(),
            cpuUsagePercent: getCpuUsage()
        )
    }

    public func recordJsFrame() {
        guard isMonitoring else { return }

        let now = CACurrentMediaTime()
        lastJsCallbackTime = now
        jsFrameCount += 1

        // Calculate JS FPS every 500ms
        let elapsed = now - lastJsFpsUpdateTime
        if elapsed >= 0.5 {
            currentJsFps = Double(jsFrameCount) / elapsed
            jsFrameCount = 0
            lastJsFpsUpdateTime = now
        }
    }

    // MARK: - Private Methods

    @objc private func handleDisplayLink(_ link: CADisplayLink) {
        uiFrameCount += 1

        let now = link.timestamp
        let elapsed = now - lastUiFpsUpdateTime

        // Calculate UI FPS every 500ms
        if elapsed >= 0.5 {
            currentUiFps = Double(uiFrameCount) / elapsed

            // Cap at device refresh rate
            let maxRefreshRate = Double(UIScreen.main.maximumFramesPerSecond)
            if currentUiFps > maxRefreshRate {
                currentUiFps = maxRefreshRate
            }

            uiFrameCount = 0
            lastUiFpsUpdateTime = now
        }
    }

    private func reportMetrics() {
        let metrics = PerformanceMetricsData(
            uiFps: currentUiFps,
            jsFps: currentJsFps,
            memoryUsageMB: getMemoryUsage(),
            cpuUsagePercent: getCpuUsage()
        )

        callback?(metrics)
    }

    private func getMemoryUsage() -> Double {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4

        let result = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }

        if result == KERN_SUCCESS {
            return Double(info.resident_size) / 1024.0 / 1024.0 // Convert to MB
        }

        return 0
    }

    private func getCpuUsage() -> Double {
        var totalUsage: Double = 0
        var threadList: thread_act_array_t?
        var threadCount: mach_msg_type_number_t = 0

        let result = task_threads(mach_task_self_, &threadList, &threadCount)

        if result == KERN_SUCCESS, let threads = threadList {
            for i in 0..<Int(threadCount) {
                var threadInfo = thread_basic_info()
                var threadInfoCount = mach_msg_type_number_t(THREAD_INFO_MAX)

                let infoResult = withUnsafeMutablePointer(to: &threadInfo) {
                    $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                        thread_info(threads[i], thread_flavor_t(THREAD_BASIC_INFO), $0, &threadInfoCount)
                    }
                }

                if infoResult == KERN_SUCCESS {
                    let cpuUsage = Double(threadInfo.cpu_usage) / Double(TH_USAGE_SCALE)
                    totalUsage += cpuUsage * 100.0
                }
            }

            vm_deallocate(mach_task_self_, vm_address_t(bitPattern: threads), vm_size_t(threadCount * UInt32(MemoryLayout<thread_t>.size)))
        }

        return totalUsage
    }

    deinit {
        stop()
    }
}
