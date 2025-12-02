import { Stack } from "expo-router";

export default function MessageLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="[user_id]" />
    </Stack>
  );
}
