import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function HelloWave() {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withRepeat(
            withSequence(
              withTiming('-15deg', { duration: 300 }),
              withTiming('15deg', { duration: 300 }),
              withTiming('0deg', { duration: 300 })
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  return <Animated.Text style={[styles.wave, animatedStyle]}>👋</Animated.Text>;
}

const styles = StyleSheet.create({
  wave: {
    fontSize: 24,
  },
}); 