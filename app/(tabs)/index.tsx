import { StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <ThemedText style={styles.headerTitle}>Find Your Dream Job</ThemedText>
      }>
      <ThemedView style={styles.searchContainer}>
        <ThemedText type="subtitle">Featured Jobs</ThemedText>
        {/* Add your job listings components here */}
      </ThemedView>

      <ThemedView style={styles.categoriesContainer}>
        <ThemedText type="subtitle">Popular Categories</ThemedText>
        {/* Add job categories here */}
      </ThemedView>

      <ThemedView style={styles.recentContainer}>
        <ThemedText type="subtitle">Recent Jobs</ThemedText>
        {/* Add recent job listings here */}
      </ThemedView>

      <ThemedView style={styles.trendingContainer}>
        <ThemedText type="subtitle">Trending in Your Area</ThemedText>
        {/* Add trending jobs based on location */}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  searchContainer: {
    padding: 16,
    gap: 16,
  },
  categoriesContainer: {
    padding: 16,
    gap: 12,
  },
  recentContainer: {
    padding: 16,
    gap: 12,
  },
  trendingContainer: {
    padding: 16,
    gap: 12,
  },
});
