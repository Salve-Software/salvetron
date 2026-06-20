import RnTuiSdk from '@salve-software/rn-tui-sdk';
import { Button, Text, View } from "react-native";
import { styles } from "./styles";

RnTuiSdk.connect({
  enablePerformanceMonitoring:true,
});

export const Playground: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}></Text>
      <Button
        title="Test"
        onPress={() => {
          fetch('https://dummyjson.com/users?limit=100')
            .then(response => response.json())
            .then(json => RnTuiSdk.log('RESPONSE-API-API-API-API-API', json))
        }}
      />

    </View>
  )
}
