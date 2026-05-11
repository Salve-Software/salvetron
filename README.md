<p align="center">
  <img src="assets/banner.png" alt="Mako Logo" width="1280" height="720" style="border-radius: 20px;">
</p>

<h1 align="center">Mako</h1>

<p align="center">
  <strong>Real-time debugging console for React Native</strong>
</p>

<p align="center">
  <a href="https://github.com/Gabriel-Pereira1788/mako/releases">
    <img src="https://img.shields.io/github/v/release/Gabriel-Pereira1788/mako?style=flat-square&label=download" alt="Download">
  </a>
  <img src="https://img.shields.io/badge/platform-macOS-blue?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/React%20Native-0.73+-61dafb?style=flat-square&logo=react" alt="React Native">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
</p>

---

Mako is a powerful debugging tool that helps React Native developers monitor their applications in real-time. It consists of a macOS desktop application that receives logs, network requests, and native platform information from your React Native apps via WebSocket connection.

## Features

- **JS Logs Capture** - Monitor JavaScript console logs with filtering by level (debug, info, warn, error)
- **Native Logs Capture** - View iOS and Android native platform logs in real-time
- **Network Inspector** - Intercept and inspect HTTP requests and responses with full headers and body
- **Multi-Device Support** - Connect and monitor multiple devices/simulators simultaneously
- **Multi-Panel Workspace** - Split your workspace into multiple panels for side-by-side debugging
- **Real-time Updates** - WebSocket-based communication for instant log streaming
- **Search & Filter** - Quickly find logs by message content, log level, or source

## Screenshots

<!-- Add your screenshots here -->

<p align="center">
  <em>Screenshots coming soon...</em>
</p>

<!--
Example:
<p align="center">
  <img src="assets/screenshots/main-view.png" alt="Main View" width="800">
</p>
-->

## Architecture

Mako consists of two main components:

```
┌─────────────────────┐         WebSocket          ┌─────────────────────┐
│   React Native App  │ ──────────────────────────▶│      MakoApp        │
│  (mako-react-native)│        port 8765           │   (macOS Desktop)   │
└─────────────────────┘                            └─────────────────────┘
         │                                                   │
         ├── JS Console Logs                                 ├── Log Viewer
         ├── Native Logs (iOS/Android)                       ├── Network Inspector
         └── Network Requests/Responses                      └── Multi-panel Workspace
```

1. **MakoApp** (macOS Desktop): A SwiftUI application that runs a WebSocket server and displays debugging information in an organized, filterable interface.

2. **mako-react-native** (SDK): A React Native package built with Nitro Modules that captures logs and network activity from your app and sends them to MakoApp.

## Installation

### Requirements

| Component | Requirement |
|-----------|-------------|
| MakoApp | macOS 13.0+ |
| React Native SDK | React Native 0.73+ |
| Node.js | 18+ |
| Xcode | 15+ (for iOS development) |
| Android Studio | Latest (for Android development) |

### Installing MakoApp (macOS)

#### Option 1: Download DMG (Recommended)

1. Go to the [Releases page](https://github.com/Gabriel-Pereira1788/mako/releases)
2. Download the latest `Mako-x.x.x.dmg` file
3. Open the DMG and drag Mako to your Applications folder
4. Launch MakoApp - it will listen for connections on port **8765**

#### Option 2: Build from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/Gabriel-Pereira1788/mako.git
   cd mako
   ```

2. Open the Xcode project:
   ```bash
   open MakoApp/Mako.xcodeproj
   ```

3. Select your Mac as the target and press **Cmd + R** to build and run.

### Installing React Native SDK

1. Install the package in your React Native project:

   ```bash
   # Using npm
   npm install mako-react-native

   # Using yarn
   yarn add mako-react-native
   ```

2. For iOS, install pods:
   ```bash
   cd ios && pod install && cd ..
   ```

3. For Android, the package will auto-link. Run a gradle sync if needed.

## Usage

### Starting MakoApp

1. Launch MakoApp on your Mac
2. The app will automatically start the WebSocket server on port **8765**
3. You'll see connected devices appear in the left sidebar

### Connecting from React Native

Add the following code to your React Native app's entry point (e.g., `App.tsx` or `index.js`):

```typescript
import { Mako } from 'mako-react-native';

// Connect only in development mode
if (__DEV__) {
  Mako.connect({
    host: '192.168.1.100', // Your Mac's IP address
    port: 8765,
    enableNetworkCapture: true,
    onConnect: () => console.log('Connected to Mako!'),
    onDisconnect: () => console.log('Disconnected from Mako'),
    onError: (error) => console.error('Mako error:', error),
  });
}
```

> **Tip**: Use `localhost` when running on iOS Simulator, or your Mac's local IP address for physical devices.

### API Reference

#### `Mako.connect(config?)`

Establishes a WebSocket connection to MakoApp.

```typescript
interface MakoConfig {
  host?: string;              // Default: 'localhost'
  port?: number;              // Default: 8765
  enableNetworkCapture?: boolean;  // Default: true
  ignoredUrls?: RegExp[];     // URL patterns to ignore
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}
```

#### `Mako.disconnect()`

Closes the WebSocket connection.

```typescript
Mako.disconnect();
```

#### `Mako.isConnected()`

Returns the current connection status.

```typescript
const connected = Mako.isConnected(); // boolean
```

#### Logging Methods

```typescript
// Send logs with different levels
Mako.log('General log message');
Mako.debug('Debug information', { userId: 123 });
Mako.info('Informational message');
Mako.warn('Warning message');
Mako.error('Error message', { stack: error.stack });
```

All logging methods accept an optional metadata object as the second parameter.

## Troubleshooting

### Connection Issues

**Problem**: App can't connect to MakoApp

**Solutions**:
1. Ensure MakoApp is running on your Mac
2. Check that both devices are on the same network
3. Verify the IP address is correct (use `ifconfig` on Mac to find your IP)
4. Check if port 8765 is not blocked by firewall
5. For iOS Simulator, use `localhost` instead of IP address

### Network Requests Not Showing

**Problem**: HTTP requests are not appearing in the Network tab

**Solutions**:
1. Ensure `enableNetworkCapture: true` is set in the config
2. Check if the URL isn't in the `ignoredUrls` list
3. Default ignored URLs include Metro bundler (port 8081) and hot reload endpoints

### Logs Not Appearing

**Problem**: Console logs are not showing in MakoApp

**Solutions**:
1. Verify the connection is established (`Mako.isConnected()`)
2. Ensure you're running in development mode (`__DEV__ === true`)
3. Check the device filter in MakoApp's sidebar

### High Memory Usage

**Problem**: MakoApp using too much memory

**Solutions**:
1. Clear logs periodically using the context menu on devices
2. Reduce the number of connected devices
3. Filter out verbose logs at the source

## Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/mako.git
   ```
3. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### Commit Message Format

Follow conventional commits:
```
type(scope): description

Examples:
feat(sdk): add custom log levels support
fix(app): resolve memory leak in log viewer
docs(readme): update installation instructions
```

### Pull Request Process

1. Ensure your code follows the existing style
2. Update documentation if needed
3. Test your changes thoroughly:
   - For MakoApp: Build and run on macOS
   - For SDK: Test with the example app
4. Create a Pull Request with a clear description

### Code Style Guidelines

**MakoApp (Swift)**:
- Follow the MVVM architecture documented in `MakoApp/docs/ARQUITETURA_MVVM.md`
- Use SwiftUI and SwiftData
- Keep ViewModels free of UI code
- Use `@Observable` for state management

**mako-react-native (TypeScript)**:
- Use TypeScript for all source files
- Follow existing patterns in the codebase
- Document public APIs with JSDoc comments

### Running the Example App

```bash
cd mako-react-native/example
yarn install
cd ios && pod install && cd ..
yarn ios  # or yarn android
```

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2024 Mako Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Made by Salve Software
</p>
