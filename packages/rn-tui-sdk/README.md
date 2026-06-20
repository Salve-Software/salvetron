# rn-tui-sdk

React Native SDK for [RN TUI](https://github.com/Salve-Software/rn-tui) - Real-time debugging console for React Native.

[![npm version](https://img.shields.io/npm/v/@salve-software/rn-tui-sdk.svg)](https://www.npmjs.com/package/@salve-software/rn-tui-sdk)
[![npm downloads](https://img.shields.io/npm/dm/@salve-software/rn-tui-sdk.svg)](https://www.npmjs.com/package/@salve-software/rn-tui-sdk)
[![license](https://img.shields.io/npm/l/@salve-software/rn-tui-sdk.svg)](https://github.com/Salve-Software/rn-tui/blob/main/LICENSE)

## Requirements

| Requirement | Version |
|-------------|---------|
| React Native | 0.73+ |
| Node.js | 18+ |

## Installation

```bash
npm install @salve-software/rn-tui-sdk react-native-nitro-modules
```

For iOS, install pods:

```bash
cd ios && pod install && cd ..
```

For Android, the package will auto-link.

## Usage

Add the following code to your app's entry point (e.g., `App.tsx`):

```typescript
import RnTuiSdk from '@salve-software/rn-tui-sdk';

if (__DEV__) {
  RnTuiSdk.connect({
    host: '192.168.1.100', // Your Mac's IP address
    port: 8765,
    enableNetworkCapture: true,
  });
}
```

> **Tip**: Use `localhost` for iOS Simulator, or your Mac's local IP for physical devices.

## API

### `RnTuiSdk.connect(config?)`

```typescript
interface RnTuiSdkConfig {
  host?: string;                    // Default: 'localhost'
  port?: number;                    // Default: 8765
  enableNetworkCapture?: boolean;   // Default: true
  ignoredUrls?: RegExp[];           // URL patterns to ignore
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}
```

### `RnTuiSdk.disconnect()`

Closes the WebSocket connection.

### `RnTuiSdk.isConnected()`

Returns the current connection status.

### Logging

```typescript
RnTuiSdk.log('General message');
RnTuiSdk.debug('Debug info', { userId: 123 });
RnTuiSdk.info('Info message');
RnTuiSdk.warn('Warning message');
RnTuiSdk.error('Error message');
```

## RN TUI CLI

This SDK requires the [RN TUI CLI](https://github.com/Salve-Software/rn-tui) running in your terminal to receive and display logs.

For full documentation, visit the [main repository](https://github.com/Salve-Software/rn-tui).

## License

MIT
