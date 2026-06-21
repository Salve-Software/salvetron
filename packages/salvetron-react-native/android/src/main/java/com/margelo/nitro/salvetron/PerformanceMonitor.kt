package com.margelo.nitro.salvetron

import android.os.Handler
import android.os.Looper
import android.view.Choreographer
import java.io.RandomAccessFile

data class PerformanceMetricsData(
    val uiFps: Double,
    val jsFps: Double,
    val memoryUsageMB: Double,
    val cpuUsagePercent: Double
)

typealias PerformanceMetricsCallback = (PerformanceMetricsData) -> Unit

class PerformanceMonitor {

    // MARK: - Properties

    private var choreographerCallback: Choreographer.FrameCallback? = null
    private var handler: Handler? = null
    private var reportRunnable: Runnable? = null
    private var callback: PerformanceMetricsCallback? = null

    // UI FPS tracking
    private var uiFrameCount = 0
    private var lastUiFpsUpdateTime = 0L
    private var currentUiFps = 0.0

    // JS FPS tracking
    private var lastJsCallbackTime = 0L
    private var jsFrameCount = 0
    private var lastJsFpsUpdateTime = 0L
    private var currentJsFps = 0.0

    private var isMonitoring = false
    private var intervalMs = 1000

    // CPU tracking
    private var lastCpuTime = 0L
    private var lastAppCpuTime = 0L

    // MARK: - Public Methods

    fun start(callback: PerformanceMetricsCallback, intervalMs: Int = 1000): Boolean {
        if (isMonitoring) {
            return false // Already monitoring
        }

        this.callback = callback
        this.intervalMs = intervalMs
        this.isMonitoring = true

        // Reset counters
        uiFrameCount = 0
        jsFrameCount = 0
        val now = System.nanoTime()
        lastUiFpsUpdateTime = now
        lastJsFpsUpdateTime = now
        lastJsCallbackTime = now
        currentUiFps = 0.0
        currentJsFps = 0.0

        // Initialize CPU tracking
        initCpuTracking()

        // Set up Choreographer for UI FPS
        setupChoreographer()

        // Set up timer for reporting metrics
        handler = Handler(Looper.getMainLooper())
        reportRunnable = object : Runnable {
            override fun run() {
                if (isMonitoring) {
                    reportMetrics()
                    handler?.postDelayed(this, intervalMs.toLong())
                }
            }
        }
        handler?.postDelayed(reportRunnable!!, intervalMs.toLong())

        return true
    }

    fun stop() {
        if (!isMonitoring) return

        isMonitoring = false
        callback = null

        // Stop choreographer
        choreographerCallback?.let {
            Choreographer.getInstance().removeFrameCallback(it)
        }
        choreographerCallback = null

        // Stop report handler
        reportRunnable?.let {
            handler?.removeCallbacks(it)
        }
        reportRunnable = null
        handler = null
    }

    fun isRunning(): Boolean {
        return isMonitoring
    }

    fun getSnapshot(): PerformanceMetricsData {
        return PerformanceMetricsData(
            uiFps = currentUiFps,
            jsFps = currentJsFps,
            memoryUsageMB = getMemoryUsage(),
            cpuUsagePercent = getCpuUsage()
        )
    }

    fun recordJsFrame() {
        if (!isMonitoring) return

        val now = System.nanoTime()
        lastJsCallbackTime = now
        jsFrameCount++

        // Calculate JS FPS every 500ms
        val elapsed = (now - lastJsFpsUpdateTime) / 1_000_000_000.0
        if (elapsed >= 0.5) {
            currentJsFps = jsFrameCount / elapsed
            jsFrameCount = 0
            lastJsFpsUpdateTime = now
        }
    }

    // MARK: - Private Methods

    private fun setupChoreographer() {
        choreographerCallback = object : Choreographer.FrameCallback {
            override fun doFrame(frameTimeNanos: Long) {
                if (!isMonitoring) return

                uiFrameCount++

                val now = frameTimeNanos
                val elapsed = (now - lastUiFpsUpdateTime) / 1_000_000_000.0

                // Calculate UI FPS every 500ms
                if (elapsed >= 0.5) {
                    currentUiFps = uiFrameCount / elapsed

                    // Cap at 120 FPS (reasonable max for Android devices)
                    if (currentUiFps > 120.0) {
                        currentUiFps = 120.0
                    }

                    uiFrameCount = 0
                    lastUiFpsUpdateTime = now
                }

                // Schedule next frame
                Choreographer.getInstance().postFrameCallback(this)
            }
        }

        Choreographer.getInstance().postFrameCallback(choreographerCallback!!)
    }

    private fun reportMetrics() {
        val metrics = PerformanceMetricsData(
            uiFps = currentUiFps,
            jsFps = currentJsFps,
            memoryUsageMB = getMemoryUsage(),
            cpuUsagePercent = getCpuUsage()
        )

        callback?.invoke(metrics)
    }

    private fun getMemoryUsage(): Double {
        val runtime = Runtime.getRuntime()
        val usedMemory = runtime.totalMemory() - runtime.freeMemory()
        return usedMemory / 1024.0 / 1024.0 // Convert to MB
    }

    private fun initCpuTracking() {
        try {
            val stat = RandomAccessFile("/proc/stat", "r")
            val cpuLine = stat.readLine()
            stat.close()

            val appStat = RandomAccessFile("/proc/self/stat", "r")
            val appLine = appStat.readLine()
            appStat.close()

            lastCpuTime = parseCpuTime(cpuLine)
            lastAppCpuTime = parseAppCpuTime(appLine)
        } catch (e: Exception) {
            // If we can't read CPU stats, just initialize to 0
            lastCpuTime = 0
            lastAppCpuTime = 0
        }
    }

    private fun getCpuUsage(): Double {
        try {
            val stat = RandomAccessFile("/proc/stat", "r")
            val cpuLine = stat.readLine()
            stat.close()

            val appStat = RandomAccessFile("/proc/self/stat", "r")
            val appLine = appStat.readLine()
            appStat.close()

            val currentCpuTime = parseCpuTime(cpuLine)
            val currentAppCpuTime = parseAppCpuTime(appLine)

            val cpuDelta = currentCpuTime - lastCpuTime
            val appCpuDelta = currentAppCpuTime - lastAppCpuTime

            lastCpuTime = currentCpuTime
            lastAppCpuTime = currentAppCpuTime

            if (cpuDelta == 0L) {
                return 0.0
            }

            val cpuUsage = (appCpuDelta.toDouble() / cpuDelta.toDouble()) * 100.0

            // Cap at 100%
            return minOf(cpuUsage, 100.0)
        } catch (e: Exception) {
            return 0.0
        }
    }

    private fun parseCpuTime(line: String): Long {
        // /proc/stat format: cpu user nice system idle iowait irq softirq
        val parts = line.split("\\s+".toRegex())
        if (parts.size < 5) return 0

        val user = parts[1].toLongOrNull() ?: 0
        val nice = parts[2].toLongOrNull() ?: 0
        val system = parts[3].toLongOrNull() ?: 0
        val idle = parts[4].toLongOrNull() ?: 0

        return user + nice + system + idle
    }

    private fun parseAppCpuTime(line: String): Long {
        // /proc/self/stat format: pid (name) state ... utime stime ...
        // utime is field 14 (index 13), stime is field 15 (index 14)
        val parts = line.split("\\s+".toRegex())
        if (parts.size < 15) return 0

        val utime = parts[13].toLongOrNull() ?: 0
        val stime = parts[14].toLongOrNull() ?: 0

        return utime + stime
    }
}
