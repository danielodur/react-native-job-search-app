import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="seeker-email-login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="seeker-phone-login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="seeker-email-register"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="seeker-phone-register"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 