import Salvetron, { NitroSalvetron } from '@salve-software/salvetron-react-native';
import { useEffect, useState } from 'react';
import { Button, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";

export const Playground: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [nativeCaptureOn, setNativeCaptureOn] = useState(false);
  const [perfOn, setPerfOn] = useState(false);

  useEffect(() => {
    Salvetron.connect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnected(Salvetron.isConnected());
      setNativeCaptureOn(Salvetron.isNativeLogCaptureEnabled());
      setPerfOn(Salvetron.isPerformanceMonitoringEnabled());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Image source={require('../assets/logo_transparent.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Salvetron Playground</Text>

        <View style={styles.statusPill}>
          <Text style={[styles.statusText, connected ? null : styles.statusTextOff]}>
            {connected ? 'connected' : 'disconnected'}
          </Text>
          <Text style={[styles.statusText, nativeCaptureOn ? null : styles.statusTextOff]}>
            native capture {nativeCaptureOn ? 'on' : 'off'}
          </Text>
          <Text style={[styles.statusText, perfOn ? null : styles.statusTextOff]}>
            perf {perfOn ? 'on' : 'off'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <View style={styles.buttonRow}>
            <Button title="Connect" onPress={() => Salvetron.connect()} />
            <Button title="Disconnect" onPress={() => Salvetron.disconnect()} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>JS Console Logs (auto-captured)</Text>
          <View style={styles.buttonRow}>
            <Button title="console.log" onPress={() => console.log('JS console.log test')} />
            <Button title="console.warn" onPress={() => console.warn('JS console.warn test')} />
            <Button title="console.error" onPress={() => console.error('JS console.error test')} />
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Salvetron.* Logs (direct send)</Text>
          <View style={styles.buttonRow}>
            <Button title="debug" onPress={() => Salvetron.debug('Salvetron.debug test', { source: 'playground' })} />
            <Button title="info" onPress={() => Salvetron.info('Salvetron.info test', { source: 'playground' })} />
            <Button title="warn" onPress={() => Salvetron.warn('Salvetron.warn test', { source: 'playground' })} />
            <Button title="error" onPress={() => Salvetron.error('Salvetron.error test', { source: 'playground' })} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Native Logs</Text>
          <View style={styles.buttonRow}>
            <Button title="verbose" onPress={() => NitroSalvetron.triggerNativeTestLog('verbose', 'Native verbose test')} />
            <Button title="info" onPress={() => NitroSalvetron.triggerNativeTestLog('info', 'Native info test')} />
            <Button title="warn" onPress={() => NitroSalvetron.triggerNativeTestLog('warn', 'Native warn test')} />
            <Button title="error" onPress={() => NitroSalvetron.triggerNativeTestLog('error', 'Native error test')} />
          </View>
          <View style={styles.divider} />
          <View style={styles.buttonRow}>
            <Button title="Stop native capture" onPress={() => Salvetron.stopNativeLogCapture()} />
            <Button
              title="Trigger while stopped"
              onPress={() => NitroSalvetron.triggerNativeTestLog('info', 'Should NOT be captured')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network</Text>
          <View style={styles.buttonRow}>
            <Button
              title="GET (fetch)"
              onPress={() => {
                fetch('https://dummyjson.com/users?limit=100')
                  .then(response => response.json())
                  .then(json => Salvetron.log('GET fetch response', json))
              }}
            />
            <Button
              title="POST (fetch)"
              onPress={() => {
                fetch('https://dummyjson.com/products/add', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: 'Playground test product' }),
                })
                  .then(response => response.json())
                  .then(json => Salvetron.log('POST fetch response', json))
              }}
            />
            <Button
              title="GET (XHR)"
              onPress={() => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://dummyjson.com/users?limit=10');
                xhr.onload = () => Salvetron.log('XHR response', { status: xhr.status });
                xhr.send();
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Monitoring</Text>
          <View style={styles.buttonRow}>
            <Button title="Start" onPress={() => Salvetron.startPerformanceMonitoring()} />
            <Button title="Stop" onPress={() => Salvetron.stopPerformanceMonitoring()} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
