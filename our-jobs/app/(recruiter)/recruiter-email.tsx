import React from 'react';
import { Stack } from 'expo-router';
import RecruiterEmailScreen from '../components/RecruiterEmailScreen';

export default function RecruiterEmail() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <RecruiterEmailScreen />
    </>
  );
} 