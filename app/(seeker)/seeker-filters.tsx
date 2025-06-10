import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SeekerFilters() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Filters',
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }} 
      />
      <View style={styles.content}>
        <Ionicons name="filter" size={48} color="#fff" style={styles.icon} />
        <Text style={styles.text}>Filters Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
}); 