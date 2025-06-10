import { Stack } from 'expo-router';

export default function SeekerLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-dashboard" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-resume-optimization" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-filters" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-add-positions" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-positions-jobs" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-complete-jobs" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-nearby-jobs" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-new-jobs" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-profile" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-news" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-stories" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="seeker-search" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
} 