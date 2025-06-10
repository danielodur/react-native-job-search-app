import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export function IconSymbol({ name, size = 24, color = '#000', style }: IconSymbolProps) {
  return (
    <Text style={[{ fontSize: size, color }, styles.symbol, style]}>
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  symbol: {
    fontFamily: 'System',
  },
}); 