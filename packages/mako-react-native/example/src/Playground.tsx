import mako from 'mako-react-native';
import { Button, Text, View } from "react-native";
import { styles } from "./styles";
import { STREAMING_PLATFORM } from "./constants";

mako.connect({
  
});

export const Playground: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}></Text>
      <Button
        title="Test"
        onPress={() => {
          fetch('https://jsonplaceholder.typicode.com/todos/1')
            .then(response => response.json())
            .then(json => mako.log('RESPONSE-API', STREAMING_PLATFORM))
        }}
      />
    </View>
  )
}
