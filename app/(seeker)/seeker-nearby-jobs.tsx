import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import * as Location from 'expo-location';

export default function SeekerNearbyJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const router = useRouter();

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location services to view nearby jobs.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      return location;
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your location. Please try again.');
    }
  };

  const loadNearbyJobs = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setRefreshing(true);

      const location = userLocation || await getLocation();
      if (!location) return;

      const { data: jobsData, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter jobs by distance (this is a simplified version)
      // In a real app, you'd want to do this filtering in the database
      const filteredJobs = jobsData?.filter(job => {
        // Add your distance calculation logic here
        return true; // For now, return all jobs
      }) || [];

      setJobs(filteredJobs);
    } catch (error) {
      console.log('Error loading nearby jobs:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNearbyJobs();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Nearby Jobs',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#000' },
        }}
      />
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadNearbyJobs(false)}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Finding jobs near you...</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.noJobsContainer}>
            <Text style={styles.noJobsText}>No jobs found in your area</Text>
          </View>
        ) : (
          <View style={styles.jobsContainer}>
            {jobs.map((job) => (
              <View key={job.id} style={styles.jobCard}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.companyName}>{job.company_name}</Text>
                <Text style={styles.location}>{job.location}</Text>
                <Text style={styles.distance}>2km away</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  noJobsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noJobsText: {
    color: '#666',
    fontSize: 16,
  },
  jobsContainer: {
    padding: 15,
  },
  jobCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  jobTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  companyName: {
    color: '#666',
    fontSize: 16,
    marginBottom: 5,
  },
  location: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  distance: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 