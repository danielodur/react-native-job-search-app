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
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function SeekerAddPositions() {
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadPositions = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setRefreshing(true);

      const { data: positionsData, error } = await supabase
        .from('positions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPositions(positionsData || []);
    } catch (error) {
      console.error('Error loading positions:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading positions...</Text>
        </View>
      );
    }

    if (positions.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.noPositionsText}>Sorry, no positions available at the moment</Text>
        </View>
      );
    }

    return (
      <View style={styles.positionsContainer}>
        {positions.map((position) => (
          <TouchableOpacity
            key={position.id}
            style={styles.positionCard}
            onPress={() => router.push({
              pathname: '/(seeker)/position-details',
              params: { id: position.id }
            })}
          >
            <View style={styles.positionHeader}>
              <Image
                source={{ uri: position.company_logo || 'https://via.placeholder.com/50' }}
                style={styles.companyLogo}
              />
              <View style={styles.positionHeaderText}>
                <Text style={styles.positionTitle}>{position.title}</Text>
                <Text style={styles.departmentName}>{position.department}</Text>
              </View>
            </View>
            <View style={styles.positionDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{position.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{position.type || 'Full-time'}</Text>
              </View>
              {position.salary_range && (
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{position.salary_range}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Add Positions',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#000' },
        }}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPositions(false)}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      >
        {renderContent()}
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
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
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
    alignItems: 'center',
    marginBottom: 10,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  positionHeaderText: {
    flex: 1,
  },
  positionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  departmentName: {
    color: '#666',
    fontSize: 16,
  },
  positionDetails: {
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
}); 