//
//  SalvetronLogBuffer.swift
//  NitroSalvetron
//
//  Owns native log capture independent of the Nitro HybridObject's JS-triggered
//  lifecycle, so capture can start as early as the dylib loads (see
//  SalvetronEarlyLog.mm) instead of waiting for JS to call startLogCapture().
//

import Foundation

private struct RingBuffer {
    private var storage: [NativeLogEntry?]
    private var head = 0
    private var count = 0
    private let capacity: Int

    init(capacity: Int) {
        self.capacity = capacity
        self.storage = Array(repeating: nil, count: capacity)
    }

    mutating func append(_ entry: NativeLogEntry) {
        let index = (head + count) % capacity
        if count < capacity {
            storage[index] = entry
            count += 1
        } else {
            storage[head] = entry
            head = (head + 1) % capacity
        }
    }

    mutating func drainAll() -> [NativeLogEntry] {
        var result: [NativeLogEntry] = []
        result.reserveCapacity(count)
        for i in 0..<count {
            if let entry = storage[(head + i) % capacity] {
                result.append(entry)
            }
        }
        head = 0
        count = 0
        storage = Array(repeating: nil, count: capacity)
        return result
    }
}

@objc(SalvetronLogBuffer)
public class SalvetronLogBuffer: NSObject {

    @objc public static let shared = SalvetronLogBuffer()

    private static let bufferCapacity = 500
    private static let replayChunkSize = 50

    private let queue = DispatchQueue(label: "com.salvetron.logbuffer")
    private var ringBuffer = RingBuffer(capacity: SalvetronLogBuffer.bufferCapacity)
    private var callback: ((NativeLogEntry) -> Void)?
    private var isForwarding = false
    private var isInstalled = false

    private var stderrPipe: Pipe?
    private var originalStderr: Int32 = -1
    private var readSource: DispatchSourceRead?

    private override init() {}

    /// Called from SalvetronEarlyLog.mm's `+load`, before `main()` runs.
    @objc public func installIfDebug() {
        queue.async { [weak self] in
            self?.installPipe()
        }
    }

    private func installPipe() {
        guard !isInstalled else { return }
        isInstalled = true

        let pipe = Pipe()
        stderrPipe = pipe

        originalStderr = dup(STDERR_FILENO)
        setvbuf(stderr, nil, _IONBF, 0)
        dup2(pipe.fileHandleForWriting.fileDescriptor, STDERR_FILENO)

        let fileDescriptor = pipe.fileHandleForReading.fileDescriptor
        let source = DispatchSource.makeReadSource(fileDescriptor: fileDescriptor, queue: queue)

        source.setEventHandler { [weak self] in
            guard let self = self else { return }
            let data = pipe.fileHandleForReading.availableData
            guard !data.isEmpty else { return }

            // Write to original stderr so logs still appear in Xcode console
            if self.originalStderr >= 0 {
                _ = data.withUnsafeBytes { bytes in
                    write(self.originalStderr, bytes.baseAddress, data.count)
                }
            }

            if let output = String(data: data, encoding: .utf8) {
                self.handleRawOutput(output)
            }
        }

        source.setCancelHandler { [weak self] in
            self?.stderrPipe?.fileHandleForReading.closeFile()
        }

        source.resume()
        readSource = source
    }

    /// Runs on `queue` already (the dispatch source's event handler queue).
    private func handleRawOutput(_ output: String) {
        let lines = output.components(separatedBy: .newlines)
        for line in lines where !line.isEmpty {
            let entry = NativeLogEntry(
                level: Self.detectLogLevel(from: line),
                message: line,
                tag: Self.extractTag(from: line),
                timestamp: Date().timeIntervalSince1970 * 1000
            )
            emit(entry)
        }
    }

    /// Must be called while already on `queue`.
    private func emit(_ entry: NativeLogEntry) {
        if isForwarding, let callback = callback {
            DispatchQueue.main.async { callback(entry) }
        } else {
            ringBuffer.append(entry)
        }
    }

    /// Attaches the JS-provided callback, replaying any buffered backlog first.
    public func attach(callback: @escaping (NativeLogEntry) -> Void) {
        queue.async { [weak self] in
            guard let self = self else { return }
            let backlog = self.ringBuffer.drainAll()
            self.callback = callback
            self.isForwarding = true
            self.replay(backlog, callback: callback)
        }
    }

    /// Detaches the callback — new entries go back to buffering, not forwarding.
    public func detach() {
        queue.async { [weak self] in
            self?.isForwarding = false
            self?.callback = nil
        }
    }

    private func replay(_ entries: [NativeLogEntry], callback: @escaping (NativeLogEntry) -> Void) {
        guard !entries.isEmpty else { return }

        var index = 0
        func sendNextChunk() {
            guard index < entries.count else { return }
            let end = min(index + Self.replayChunkSize, entries.count)
            let chunk = Array(entries[index..<end])
            DispatchQueue.main.async {
                chunk.forEach(callback)
            }
            index = end
            if index < entries.count {
                queue.asyncAfter(deadline: .now() + 0.01) { sendNextChunk() }
            }
        }
        sendNextChunk()
    }

    private static func detectLogLevel(from line: String) -> NativeLogLevel {
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

    private static func extractTag(from line: String) -> String {
        let bracketPattern = #"^\[([^\]]+)\]"#
        if let regex = try? NSRegularExpression(pattern: bracketPattern),
           let match = regex.firstMatch(in: line, range: NSRange(line.startIndex..., in: line)),
           let range = Range(match.range(at: 1), in: line) {
            return String(line[range])
        }

        let nslogPattern = #"^[\d\-:\.\s]+([A-Za-z0-9_]+)\["#
        if let regex = try? NSRegularExpression(pattern: nslogPattern),
           let match = regex.firstMatch(in: line, range: NSRange(line.startIndex..., in: line)),
           let range = Range(match.range(at: 1), in: line) {
            return String(line[range])
        }

        return "native"
    }
}
