import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function SeekerProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    viewed: 608,
    submitted: 0,
    interviews: 0,
    saved: 0,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const commonFunctions = [
    {
      id: 'online_resume',
      icon: 'document-text-outline',
      title: 'Online Resume',
      subtitle: '1 item to optimize',
      color: '#00BFA5',
    },
    {
      id: 'attachment_resume',
      icon: 'document-attach-outline',
      title: 'Attachment Resume',
      subtitle: 'Upload/Create Resume',
      color: '#00BFA5',
    },
    {
      id: 'job_preferences',
      icon: 'heart-outline',
      title: 'Job Preferences',
      subtitle: 'Set your preferences',
      color: '#FF4081',
    },
    {
      id: 'tools',
      icon: 'bag-outline',
      title: 'Tools',
      subtitle: 'Resume tools & more',
      color: '#00BFA5',
    },
  ];

  const otherFunctions = [
    { id: 'live_jobs', icon: 'tv-outline', title: 'Live Jobs' },
    { id: 'interview_questions', icon: 'clipboard-outline', title: 'Interview Questions', hasNew: true },
    { id: 'exam_prep', icon: 'star-outline', title: 'Exam Prep', hasNew: true },
    { id: 'salary_search', icon: 'search-outline', title: 'Salary Search' },
    { id: 'career_test', icon: 'checkbox-outline', title: 'Career Test', hasNew: true },
    { id: 'salary_talk', icon: 'cash-outline', title: 'Salary Talk' },
    { id: 'rules', icon: 'shield-outline', title: 'Rules' },
    { id: 'privacy', icon: 'lock-closed-outline', title: 'Privacy' },
    { id: 'selected_companies', icon: 'business-outline', title: 'Selected Companies' },
    { id: 'customer_service', icon: 'headset-outline', title: 'Customer Service' },
    { id: 'anti_fraud', icon: 'shield-checkmark-outline', title: 'Anti-fraud Guide' },
    { id: 'privacy_policy', icon: 'document-lock-outline', title: 'Privacy Policy' },
  ];

  const handleFunctionPress = (id: string) => {
    switch (id) {
      case 'online_resume':
        router.push('/(seeker)/seeker-resume');
        break;
      // Add other cases as needed
    }
  };

  const handlePositionsPress = () => {
    router.replace('/(seeker)/seeker-dashboard');
  };

  const handleStoriesPress = () => {
    router.replace('/(seeker)/seeker-stories');
  };

  const handleNewsPress = () => {
    router.replace('/(seeker)/seeker-news');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={profile?.avatar_url ? { uri: profile.avatar_url } : { uri: 'https://via.placeholder.com/60' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{profile?.full_name || 'User Name'}</Text>
            <TouchableOpacity style={styles.resumeLink} onPress={() => router.push('/(seeker)/seeker-resume')}>
              <Text style={styles.resumeLinkText}>Resume Score: 40 points, Recommended optimization</Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.viewed}</Text>
            <Text style={styles.statLabel}>Viewed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.submitted}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.interviews}</Text>
            <Text style={styles.statLabel}>Interviews</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.saved}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>
      </View>

      {/* VIP Banner */}
      <TouchableOpacity style={styles.vipBanner}>
        <View style={styles.vipContent}>
          <Ionicons name="diamond-outline" size={24} color="#FFD700" />
          <Text style={styles.vipText}>Upgrade to VIP for faster job search</Text>
        </View>
        <Text style={styles.upgradeButton}>Upgrade</Text>
      </TouchableOpacity>

      {/* Common Functions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Functions</Text>
        <View style={styles.functionGrid}>
          {commonFunctions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.functionItem}
              onPress={() => handleFunctionPress(item.id)}
            >
              <View style={[styles.functionIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={24} color="#FFF" />
              </View>
              <Text style={styles.functionTitle}>{item.title}</Text>
              <Text style={styles.functionSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Other Functions */}
      <ScrollView style={styles.otherFunctions}>
        <Text style={styles.sectionTitle}>Other Functions</Text>
        <View style={styles.functionList}>
          {otherFunctions.map((item) => (
            <TouchableOpacity key={item.id} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Ionicons name={item.icon as any} size={24} color="#666" />
                <Text style={styles.listItemText}>{item.title}</Text>
              </View>
              {item.hasNew && <View style={styles.newBadge} />}
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Customer Service: 400-065-5799 (8:00-22:00)</Text>
          <Text style={styles.footerText}>Senior Service: 400-661-6030 (8:00-22:00)</Text>
          <Text style={styles.footerText}>License: ICP 140134441-23A</Text>
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
          style={styles.bottomNavItem}
          onPress={handleNewsPress}
        >
          <Ionicons name="newspaper-outline" size={24} color="#666" />
          <Text style={styles.bottomNavText}>News</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>4</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomNavItem, styles.activeNavItem]}>
          <Ionicons name="person" size={24} color="#007AFF" />
          <Text style={[styles.bottomNavText, styles.activeNavText]}>Me</Text>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resumeLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeLinkText: {
    color: '#666',
    fontSize: 14,
    marginRight: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  vipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  vipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vipText: {
    color: '#FFD700',
    fontSize: 16,
    marginLeft: 8,
  },
  upgradeButton: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  functionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  functionItem: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  functionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  functionTitle: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 4,
  },
  functionSubtitle: {
    color: '#666',
    fontSize: 12,
  },
  otherFunctions: {
    flex: 1,
    paddingHorizontal: 16,
  },
  functionList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
  },
  newBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#000',
  },
  bottomNavItem: {
    alignItems: 'center',
    position: 'relative',
  },
  activeNavItem: {
    opacity: 1,
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
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 