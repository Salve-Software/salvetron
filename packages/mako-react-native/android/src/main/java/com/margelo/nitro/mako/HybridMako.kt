package com.margelo.nitro.mako

import android.content.Context
import android.os.Build
import android.provider.Settings
import com.margelo.nitro.NitroModules
import com.margelo.nitro.mako.HybridNitroMakoSpec
import com.margelo.nitro.mako.NativeLogEntry
import com.margelo.nitro.mako.NativeLogLevel
import java.io.BufferedReader
import java.io.InputStreamReader
import kotlin.concurrent.thread

class HybridMako : HybridNitroMakoSpec() {

    // MARK: - Properties

    private var logCallback: ((log: NativeLogEntry) -> Unit)? = null
    private var isCapturingLogs = false
    private var logcatProcess: Process? = null
    private var readerThread: Thread? = null

    // Storage constants
    private val PREFS_NAME = "mako_prefs"
    private val DEVICE_ID_KEY = "mako_device_id"

    // Context accessor
    private val context: Context?
        get() = NitroModules.applicationContext

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

            // Clear logcat buffer first
            try {
                Runtime.getRuntime().exec(arrayOf("logcat", "-c")).waitFor()
            } catch (e: Exception) {
                // Ignore clear errors
            }

            // Start logcat for current process only
            logcatProcess = Runtime.getRuntime().exec(
                arrayOf("logcat", "-v", "threadtime", "--pid=$pid")
            )

            // Read logcat output in background thread
            readerThread = thread(start = true, isDaemon = true, name = "Mako-Logcat") {
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

    protected fun finalize() {
        stopLogCapture()
    }
}
