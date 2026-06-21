# salvetron-react-native

React Native SDK for [Salvetron](https://github.com/Salve-Software/salvetron) - Real-time debugging console for React Native.

[![npm version](https://img.shields.io/npm/v/@salve-software/salvetron-react-native.svg)](https://www.npmjs.com/package/@salve-software/salvetron-react-native)
[![npm downloads](https://img.shields.io/npm/dm/@salve-software/salvetron-react-native.svg)](https://www.npmjs.com/package/@salve-software/salvetron-react-native)
[![license](https://img.shields.io/npm/l/@salve-software/salvetron-react-native.svg)](https://github.com/Salve-Software/salvetron/blob/main/LICENSE)

## Requirements

| Requirement | Version |
|-------------|---------|
| React Native | 0.73+ |
| Node.js | 18+ |

## Installation

```bash
npm install @salve-software/salvetron-react-native react-native-nitro-modules
```

For iOS, install pods:

```bash
cd ios && pod install && cd ..
```

For Android, the package will auto-link.

## Usage

Add the following code to your app's entry point (e.g., `App.tsx`):

```typescript
import Salvetron from '@salve-software/salvetron-react-native';

if (__DEV__) {
  Salvetron.connect({
    host: '192.168.1.100', // Your Mac's IP address
    port: 8765,
    enableNetworkCapture: true,
  });
}
```

> **Tip**: Use `localhost` for iOS Simulator, or your Mac's local IP for physical devices.

## API

### `Salvetron.connect(config?)`

```typescript
interface SalvetronConfig {
  host?: string;                    // Default: 'localhost'
  port?: number;                    // Default: 8765
  enableNetworkCapture?: boolean;   // Default: true
  ignoredUrls?: RegExp[];           // URL patterns to ignore
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}
```

### `Salvetron.disconnect()`

Closes the WebSocket connection.

### `Salvetron.isConnected()`

Returns the current connection status.

### Logging

```typescript
Salvetron.log('General message');
Salvetron.debug('Debug info', { userId: 123 });
Salvetron.info('Info message');
Salvetron.warn('Warning message');
Salvetron.error('Error message');
```

## Salvetron CLI

This SDK requires the [Salvetron CLI](https://github.com/Salve-Software/salvetron) running in your terminal to receive and display logs.

For full documentation, visit the [main repository](https://github.com/Salve-Software/salvetron).

## License

MIT
