import React from 'react';
import { Stack } from 'expo-router';
import SeekerEmailScreen from '../components/SeekerEmailScreen';

export default function SeekerEmail() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SeekerEmailScreen />
    </>
  );
} 