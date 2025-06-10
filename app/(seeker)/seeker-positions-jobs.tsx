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
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function SeekerPositionsJobs() {
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadPositions = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setRefreshing(true);

      // First get the complete jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Group jobs by position/category
      const groupedPositions = jobsData?.reduce((acc: any, job: any) => {
        const category = job.category || 'Other';
        if (!acc[category]) {
          acc[category] = {
            name: category,
            count: 0,
            jobs: [],
          };
        }
        acc[category].count += 1;
        acc[category].jobs.push(job);
        return acc;
      }, {});

      setPositions(Object.values(groupedPositions || {}));
    } catch (error) {
      console.log('Error loading positions:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handlePositionPress = (position: any) => {
    // Navigate to complete jobs with filter
    router.push({
      pathname: '/(seeker)/seeker-complete-jobs',
      params: { category: position.name }
    });
  };

  useEffect(() => {
    loadPositions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Job Positions',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#000' },
        }}
      />
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPositions(false)}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading positions...</Text>
          </View>
        ) : positions.length === 0 ? (
          <View style={styles.noPositionsContainer}>
            <Text style={styles.noPositionsText}>No positions available</Text>
          </View>
        ) : (
          <View style={styles.positionsContainer}>
            {positions.map((position, index) => (
              <TouchableOpacity
                key={index}
                style={styles.positionCard}
                onPress={() => handlePositionPress(position)}
              >
                <View style={styles.positionHeader}>
                  <Text style={styles.positionName}>{position.name}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{position.count}</Text>
                  </View>
                </View>
                <View style={styles.positionDetails}>
                  <Ionicons name="briefcase-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {position.count} {position.count === 1 ? 'job' : 'jobs'} available
                  </Text>
                </View>
              </TouchableOpacity>
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
  noPositionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noPositionsText: {
    color: '#666',
    fontSize: 16,
  },
  positionsContainer: {
    padding: 15,
  },
  positionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  positionName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  positionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
}); 