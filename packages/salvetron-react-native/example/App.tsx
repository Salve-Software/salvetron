import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Playground } from './src';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <Playground />
    </SafeAreaProvider>
  );
}

export default App;
