import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SeekerNews() {
  const router = useRouter();

  const handlePositionsPress = () => {
    router.replace('/(seeker)/seeker-dashboard');
  };

  const handleStoriesPress = () => {
    router.replace('/(seeker)/seeker-stories');
  };

  const handleNewsPress = () => {
    router.replace('/(seeker)/seeker-news');
  };

  const handleProfilePress = () => {
    router.replace('/(seeker)/seeker-profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>News</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>Latest Job Market Trends</Text>
          <Text style={styles.newsDate}>March 15, 2024</Text>
          <Text style={styles.newsDescription}>
            Discover the latest trends in Uganda's job market and how they might affect your career opportunities.
          </Text>
        </View>

        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>New Companies Hiring</Text>
          <Text style={styles.newsDate}>March 14, 2024</Text>
          <Text style={styles.newsDescription}>
            Several international companies are expanding their operations in Uganda, creating new job opportunities.
          </Text>
        </View>

        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>Skills in High Demand</Text>
          <Text style={styles.newsDate}>March 13, 2024</Text>
          <Text style={styles.newsDescription}>
            Learn about the most sought-after skills by employers in today's job market.
          </Text>
        </View>

        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>Career Development Tips</Text>
          <Text style={styles.newsDate}>March 12, 2024</Text>
          <Text style={styles.newsDescription}>
            Expert advice on how to advance your career and stand out in job applications.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={handlePositionsPress}
        >
          <Ionicons name="briefcase-outline" size={24} color="#666" />
          <Text style={styles.bottomNavText}>Positions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={handleStoriesPress}
        >
          <Ionicons name="book-outline" size={24} color="#666" />
          <Text style={styles.bottomNavText}>Stories</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.bottomNavItem, styles.activeNavItem]}
          onPress={handleNewsPress}
        >
          <Ionicons name="newspaper-outline" size={24} color="#007AFF" />
          <Text style={[styles.bottomNavText, styles.activeNavText]}>News</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>4</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={handleProfilePress}
        >
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.bottomNavText}>Me</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  newsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  newsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  newsDate: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  newsDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#000',
    shadowColor: '#666',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomNavItem: {
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
  },
  bottomNavText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  activeNavText: {
    color: '#007AFF',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 