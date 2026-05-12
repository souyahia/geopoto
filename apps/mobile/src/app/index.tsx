import { useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Button onPress={() => router.push("/backrooms")}>Backrooms</Button>
    </View>
  );
}
