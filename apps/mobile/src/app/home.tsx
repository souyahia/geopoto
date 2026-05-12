import { router } from "expo-router";
import { Button } from "heroui-native/button";
import { View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Button onPress={() => router.push("/backrooms")}>Backrooms</Button>
    </View>
  );
}
