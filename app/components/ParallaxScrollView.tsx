import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  headerImage: React.ReactNode;
  headerBackgroundColor?: {
    light: string;
    dark: string;
  };
  style?: ViewStyle;
}

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor = { light: '#f0f0f0', dark: '#1a1a1a' },
  style,
}: ParallaxScrollViewProps) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: scrollY.value * 0.5,
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      style={[styles.container, style]}
      onScroll={scrollHandler}
      scrollEventThrottle={16}>
      <View style={styles.headerContainer}>
        <Animated.View style={[styles.headerImageContainer, headerStyle]}>
          {headerImage}
        </Animated.View>
      </View>
      <View style={styles.content}>{children}</View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 200,
    overflow: 'hidden',
  },
  headerImageContainer: {
    height: 300,
    width: '100%',
    position: 'absolute',
  },
  content: {
    flex: 1,
    padding: 16,
  },
}); 