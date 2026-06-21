package com.margelo.nitro.salvetron

import android.content.Context
import android.os.Build
import android.provider.Settings
import com.margelo.nitro.NitroModules
import com.margelo.nitro.salvetron.HybridNitroSalvetronSpec
import com.margelo.nitro.salvetron.NativeLogEntry
import com.margelo.nitro.salvetron.NativeLogLevel
import java.io.BufferedReader
import java.io.InputStreamReader
import kotlin.concurrent.thread

class HybridSalvetron : HybridNitroSalvetronSpec() {

    // MARK: - Properties

    private var logCallback: ((log: NativeLogEntry) -> Unit)? = null
    private var isCapturingLogs = false
    private var logcatProcess: Process? = null
    private var readerThread: Thread? = null
    private var hasRecoveredHistory = false
    private var lastLogTimestamp: String? = null

    // Storage constants
    private val PREFS_NAME = "salvetron_prefs"
    private val DEVICE_ID_KEY = "salvetron_device_id"

    // Context accessor
    private val context: Context?
        get() = NitroModules.applicationContext

    // Performance monitoring
    private val performanceMonitor = PerformanceMonitor()

    // MARK: - Existing Methods

    override fun sum(num1: Double, num2: Double): Double {
        return num1 + num2
    }

    // MARK: - Log Capture Methods

    override fun startLogCapture(onLog: (log: NativeLogEntry) -> Unit): Boolean {
        if (isCapturingLogs) {
            return false // Already capturing
        }

        logCallback = onLog
        isCapturingLogs = true

        try {
            // Get current process PID
            val pid = android.os.Process.myPid()

            // Recover pre-existing history from the OS logcat buffer once per process
            // lifetime — this is what surfaces logs emitted before startLogCapture was
            // ever called (e.g. MainApplication.onCreate), instead of discarding them.
            if (!hasRecoveredHistory) {
                hasRecoveredHistory = true
                try {
                    val dumpProcess = Runtime.getRuntime().exec(
                        arrayOf("logcat", "-d", "-v", "threadtime", "--pid=$pid")
                    )
                    val dumpReader = BufferedReader(InputStreamReader(dumpProcess.inputStream))
                    var dumpLine: String? = null
                    while (true) {
                        dumpLine = dumpReader.readLine() ?: break
                        processLogLine(dumpLine)
                    }
                    dumpProcess.waitFor()
                } catch (e: Exception) {
                    // Ignore history recovery errors — live capture still proceeds
                }
            }

            // Start logcat for current process only, resuming right after the last
            // recovered/streamed line so we don't replay or drop entries on reconnect
            val liveArgs = if (lastLogTimestamp != null) {
                arrayOf("logcat", "-v", "threadtime", "-T", lastLogTimestamp!!, "--pid=$pid")
            } else {
                arrayOf("logcat", "-v", "threadtime", "--pid=$pid")
            }
            logcatProcess = Runtime.getRuntime().exec(liveArgs)

            // Read logcat output in background thread
            readerThread = thread(start = true, isDaemon = true, name = "Salvetron-Logcat") {
                try {
                    val reader = BufferedReader(
                        InputStreamReader(logcatProcess!!.inputStream)
                    )

                    var line: String? = null
                    while (isCapturingLogs) {
                        line = reader.readLine() ?: break
                        processLogLine(line)
                    }
                } catch (e: Exception) {
                    // Thread interrupted or stream closed
                }
            }

            return true
        } catch (e: Exception) {
            isCapturingLogs = false
            logCallback = null
            return false
        }
    }

    override fun stopLogCapture() {
        if (!isCapturingLogs) return

        isCapturingLogs = false
        logCallback = null

        logcatProcess?.destroy()
        logcatProcess = null

        readerThread?.interrupt()
        readerThread = null
    }

    override fun isCapturing(): Boolean {
        return isCapturingLogs
    }

    // MARK: - Device Info Methods

    override fun getDeviceInfo(): DeviceInfoResult {
        val ctx = context
        val deviceId = if (ctx != null) {
            Settings.Secure.getString(ctx.contentResolver, Settings.Secure.ANDROID_ID) ?: generateUUID()
        } else {
            generateUUID()
        }
        val deviceName = Build.MODEL
        val appName = ctx?.applicationInfo?.loadLabel(ctx.packageManager)?.toString() ?: "React Native App"
        val bundleId = ctx?.packageName ?: ""

        return DeviceInfoResult(deviceId, deviceName, appName, bundleId)
    }

    override fun getStoredDeviceId(): String? {
        val ctx = context ?: return null
        val prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(DEVICE_ID_KEY, null)
    }

    override fun storeDeviceId(deviceId: String) {
        val ctx = context ?: return
        val prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(DEVICE_ID_KEY, deviceId).apply()
    }

    private fun generateUUID(): String {
        return java.util.UUID.randomUUID().toString()
    }

    // MARK: - Private Helpers

    private fun processLogLine(line: String) {
        // Logcat threadtime format:
        // "MM-DD HH:MM:SS.mmm PID TID LEVEL TAG: MESSAGE"
        // Example: "01-15 10:23:45.123  1234  5678 I MyApp: User logged in"

        val pattern = Regex(
            """(\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d{3})\s+\d+\s+\d+\s+([VDIWEF])\s+([^:]+):\s*(.*)"""
        )

        val match = pattern.find(line)

        val (level, tag, message) = if (match != null) {
            // logcat -T accepts the same "MM-DD HH:MM:SS.mmm" format it prints,
            // so we can resume the live stream right after the last seen line.
            lastLogTimestamp = "${match.groupValues[1]} ${match.groupValues[2]}"

            val levelChar = match.groupValues[3]
            val extractedTag = match.groupValues[4].trim()
            val extractedMessage = match.groupValues[5]

            val mappedLevel = when (levelChar) {
                "V", "D" -> NativeLogLevel.VERBOSE
                "I" -> NativeLogLevel.INFO
                "W" -> NativeLogLevel.WARN
                "E", "F" -> NativeLogLevel.ERROR
                else -> NativeLogLevel.INFO
            }

            Triple(mappedLevel, extractedTag, extractedMessage)
        } else {
            // Fallback for unparseable lines
            Triple(detectLogLevel(line), "native", line)
        }

        val entry = NativeLogEntry(
            level = level,
            message = if (tag != "native") "[$tag] $message" else message,
            tag = tag,
            timestamp = System.currentTimeMillis().toDouble()
        )

        // Invoke callback (Nitro handles thread scheduling to JS thread)
        logCallback?.invoke(entry)
    }

    private fun detectLogLevel(line: String): NativeLogLevel {
        val lowercased = line.lowercase()
        return when {
            lowercased.contains("error") || lowercased.contains("fault") -> NativeLogLevel.ERROR
            lowercased.contains("warn") -> NativeLogLevel.WARN
            lowercased.contains("debug") -> NativeLogLevel.VERBOSE
            else -> NativeLogLevel.INFO
        }
    }

    // MARK: - Performance Monitoring Methods

    override fun startPerformanceMonitoring(onMetrics: (metrics: PerformanceMetrics) -> Unit, intervalMs: Double?): Boolean {
        val interval = intervalMs?.toInt() ?: 1000

        return performanceMonitor.start({ data ->
            val metrics = PerformanceMetrics(
                uiFps = data.uiFps,
                jsFps = data.jsFps,
                memoryUsageMB = data.memoryUsageMB,
                cpuUsagePercent = data.cpuUsagePercent
            )
            onMetrics(metrics)
        }, interval)
    }

    override fun stopPerformanceMonitoring() {
        performanceMonitor.stop()
    }

    override fun isPerformanceMonitoring(): Boolean {
        return performanceMonitor.isRunning()
    }

    override fun getPerformanceSnapshot(): PerformanceMetrics {
        val data = performanceMonitor.getSnapshot()
        return PerformanceMetrics(
            uiFps = data.uiFps,
            jsFps = data.jsFps,
            memoryUsageMB = data.memoryUsageMB,
            cpuUsagePercent = data.cpuUsagePercent
        )
    }

    override fun recordJsFrame() {
        performanceMonitor.recordJsFrame()
    }

    // MARK: - Test-only Methods

    override fun triggerNativeTestLog(level: NativeLogLevel, message: String, tag: String?) {
        val logTag = tag ?: "Salvetron-Example"
        when (level) {
            NativeLogLevel.VERBOSE -> android.util.Log.v(logTag, message)
            NativeLogLevel.INFO -> android.util.Log.i(logTag, message)
            NativeLogLevel.WARN -> android.util.Log.w(logTag, message)
            NativeLogLevel.ERROR -> android.util.Log.e(logTag, message)
        }
    }

    protected fun finalize() {
        stopLogCapture()
        performanceMonitor.stop()
    }
}
