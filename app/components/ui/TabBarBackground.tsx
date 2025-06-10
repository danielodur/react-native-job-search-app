import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '../ThemedView';
import { useColorScheme } from 'react-native';

export function useBottomTabOverflow() {
  const colorScheme = useColorScheme();
  return {
    backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  };
}

interface TabBarBackgroundProps {
  style?: any;
}

export default function TabBarBackground({ style }: TabBarBackgroundProps) {
  const tabBarStyle = useBottomTabOverflow();
  
  return (
    <ThemedView style={[styles.container, tabBarStyle, style]}>
      <View style={styles.background} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
  },
});