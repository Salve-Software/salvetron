# mako-react-native

React Native SDK for [Mako](https://github.com/Gabriel-Pereira1788/mako) - Real-time debugging console for React Native.

[![npm version](https://img.shields.io/npm/v/mako-react-native.svg)](https://www.npmjs.com/package/mako-react-native)
[![npm downloads](https://img.shields.io/npm/dm/mako-react-native.svg)](https://www.npmjs.com/package/mako-react-native)
[![license](https://img.shields.io/npm/l/mako-react-native.svg)](https://github.com/Gabriel-Pereira1788/mako/blob/main/LICENSE)

## Requirements

| Requirement | Version |
|-------------|---------|
| React Native | 0.73+ |
| Node.js | 18+ |

## Installation

```bash
npm install mako-react-native react-native-nitro-modules
```

For iOS, install pods:

```bash
cd ios && pod install && cd ..
```

For Android, the package will auto-link.

## Usage

Add the following code to your app's entry point (e.g., `App.tsx`):

```typescript
import { Mako } from 'mako-react-native';

if (__DEV__) {
  Mako.connect({
    host: '192.168.1.100', // Your Mac's IP address
    port: 8765,
    enableNetworkCapture: true,
  });
}
```

> **Tip**: Use `localhost` for iOS Simulator, or your Mac's local IP for physical devices.

## API

### `Mako.connect(config?)`

```typescript
interface MakoConfig {
  host?: string;                    // Default: 'localhost'
  port?: number;                    // Default: 8765
  enableNetworkCapture?: boolean;   // Default: true
  ignoredUrls?: RegExp[];           // URL patterns to ignore
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}
```

### `Mako.disconnect()`

Closes the WebSocket connection.

### `Mako.isConnected()`

Returns the current connection status.

### Logging

```typescript
Mako.log('General message');
Mako.debug('Debug info', { userId: 123 });
Mako.info('Info message');
Mako.warn('Warning message');
Mako.error('Error message');
```

## MakoApp

This SDK requires [MakoApp](https://github.com/Gabriel-Pereira1788/mako/releases) (macOS) to receive and display logs.

For full documentation, visit the [main repository](https://github.com/Gabriel-Pereira1788/mako).

## License

MIT
