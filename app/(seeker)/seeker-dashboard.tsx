import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import { Stack } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import * as Location from 'expo-location';

const truncateText = (text: string, length: number = 20) => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

const DISTANCE_OPTIONS = [
  { label: '1km', value: 1 },
  { label: '3km', value: 3 },
  { label: '5km', value: 5 },
  { label: '10km', value: 10 },
  { label: '15km', value: 15 },
  { label: '20km', value: 20 },
];

const INITIAL_FILTER = 'complete';
const REFRESH_COOLDOWN = 500; // Half a second cooldown
const RETRY_DELAY = 500; // Half a second retry delay
const MAX_RETRIES = 2; // Reduced retries for faster response

// Add interface for error modal props
interface ConnectionErrorModalProps {
  visible: boolean;
  onRetry: () => void;
  onClose: () => void;
}

// Add type for Supabase response
interface JobsResponse {
  data: any[] | null;
  error: Error | null;
}

// Add interfaces for job and tag types
interface JobTag {
  id: string;
  name: string;
}

interface Job {
  id: number;
  title: string;
  company_name: string;
  salary_range: string;
  location: string;
  tags: JobTag[];
  recruiter: {
    name: string;
    title: string;
    avatar: string;
    response_rate: string;
  };
}

export default function SeekerDashboard() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Loading...');
  const [activeFilter, setActiveFilter] = useState('complete');
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [isDistanceModalVisible, setIsDistanceModalVisible] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('Select District');
  const [isCareerActive, setIsCareerActive] = useState(false);
  const [isJobActive, setIsJobActive] = useState(false);
  const [isRecommendationsActive, setIsRecommendationsActive] = useState(false);
  const [activeButton, setActiveButton] = useState<'suggested' | 'career' | 'job' | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isDistrictModalVisible, setIsDistrictModalVisible] = useState(false);
  const [activeTextButton, setActiveTextButton] = useState<'suggested' | 'career' | 'job' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [currentView, setCurrentView] = useState('complete');
  const [contentLoading, setContentLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [isSilentLoading, setIsSilentLoading] = useState(true);
  const [hasInitialData, setHasInitialData] = useState(false);

  const ugandanDistricts = [
    'Abim', 'Adjumani', 'Agago', 'Alebtong', 'Amolatar', 'Amudat', 'Amuria', 'Amuru', 'Apac', 'Arua',
    'Budaka', 'Bududa', 'Bugiri', 'Bugweri', 'Buhweju', 'Buikwe', 'Bukedea', 'Bukomansimbi', 'Bukwo',
    'Bulambuli', 'Buliisa', 'Bundibugyo', 'Bunyangabu', 'Bushenyi', 'Busia', 'Butaleja', 'Butambala',
    'Butebo', 'Buvuma', 'Buyende', 'Dokolo', 'Gomba', 'Gulu', 'Hoima', 'Ibanda', 'Iganga', 'Isingiro',
    'Jinja', 'Kaabong', 'Kabale', 'Kabarole', 'Kaberamaido', 'Kagadi', 'Kakumiro', 'Kalangala',
    'Kaliro', 'Kalungu', 'Kampala', 'Kamuli', 'Kamwenge', 'Kanungu', 'Kapchorwa', 'Kapelebyong',
    'Karenga', 'Kasese', 'Katakwi', 'Kayunga', 'Kazo', 'Kibaale', 'Kiboga', 'Kibuku', 'Kikuube',
    'Kiruhura', 'Kiryandongo', 'Kisoro', 'Kitagwenda', 'Kitgum', 'Koboko', 'Kole', 'Kotido', 'Kumi',
    'Kwania', 'Kween', 'Kyankwanzi', 'Kyegegwa', 'Kyenjojo', 'Kyotera', 'Lamwo', 'Lira', 'Luuka',
    'Luwero', 'Lwengo', 'Lyantonde', 'Madi-Okollo', 'Manafwa', 'Maracha', 'Masaka', 'Masindi',
    'Mayuge', 'Mbale', 'Mbarara', 'Mitooma', 'Mityana', 'Moroto', 'Moyo', 'Mpigi', 'Mubende',
    'Mukono', 'Nabilatuk', 'Nakapiripirit', 'Nakaseke', 'Nakasongola', 'Namayingo', 'Namisindwa',
    'Namutumba', 'Napak', 'Nebbi', 'Ngora', 'Ntoroko', 'Ntungamo', 'Nwoya', 'Obongi', 'Omoro',
    'Otuke', 'Oyam', 'Pader', 'Pakwach', 'Pallisa', 'Rakai', 'Rubanda', 'Rubirizi', 'Rukiga',
    'Rukungiri', 'Rwampara', 'Serere', 'Sheema', 'Sironko', 'Soroti', 'Ssembabule', 'Tororo',
    'Wakiso', 'Yumbe', 'Zombo'
  ];

  const loadJobs = async (isRetry = false, forceRefresh = false) => {
    try {
      const startTime = Date.now();
      
      if (!forceRefresh && Date.now() - lastRefreshTime < REFRESH_COOLDOWN) {
        return;
      }
      setLastRefreshTime(Date.now());

      if (!isRetry) {
        setRefreshing(true);
      }
      setIsLoading(true);
      setConnectionError(null);

      // Always set mock data first to ensure we have content
      setJobs(mockJobs);

      // Try to fetch real data in the background
      let query = supabase.from('jobs').select('*');

      switch (activeFilter) {
        case 'new':
          query = query.order('created_at', { ascending: false }).limit(10);
          break;
        case 'nearby':
          if (selectedDistance) {
            // Add distance-based filtering logic here
          }
          break;
        case 'suggested':
          query = query.order('created_at', { ascending: false }).limit(20);
          break;
        case 'complete':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Set a timeout promise for the query
      const queryPromise = query.then((result: JobsResponse) => {
        if (result.error) throw result.error;
        return result.data;
      });

      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      // Try to get real data
      try {
        const realJobs = await Promise.race([queryPromise, timeoutPromise]);
        if (realJobs?.length) {
          setJobs(realJobs);
        }
      } catch (error) {
        console.log('Failed to fetch real jobs, using mock data:', error);
        // We already set mock data, so no need to do anything here
      }

      // Ensure minimum loading time of 500ms
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }

    } catch (error) {
      console.log('Job loading error:', error);
      // We already set mock data, so no need to do anything here
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setContentLoading(false);
    }
  };

  const initializeData = async () => {
    try {
      setIsSilentLoading(true);
      setIsConnecting(true);
      setConnectionError(null);
      
      const startTime = Date.now();

      // Immediately set mock data
      setJobs(mockJobs);
      
      // Load all data in parallel
      await Promise.allSettled([
        loadProfile().catch(console.log),
        getLocation().catch(console.log),
        loadJobs(false, false).catch(console.log)
      ]);

      // Ensure minimum loading time of 500ms
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }

      setActiveFilter(INITIAL_FILTER);
      setHasInitialData(true);
    } catch (error) {
      console.log('Error initializing dashboard:', error);
      setHasInitialData(true);
    } finally {
      setIsConnecting(false);
      setIsSilentLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  const loadProfile = async () => {
    try {
      let profileData = null;
      let error = null;

      // First try to get the current user
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.id) {
        // If we have a user ID, try to get profile by ID first
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        profileData = result.data;
        error = result.error;
      }

      // If no profile found by ID and we have phone params, try phone lookup
      if (!profileData && params.countryCode && params.phoneNumber) {
        const formattedPhone = `${params.countryCode}${params.phoneNumber}`.replace(/\s+/g, '');
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', formattedPhone)
          .single();
        
        profileData = result.data;
        error = result.error;
      }

      if (error && error.code !== 'PGRST116') {
        // If error is not "no rows returned", throw it
        throw error;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert(
        'Error',
        'Failed to load profile. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setCurrentLocation('Location access denied');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Get address from coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (address) {
        const locationString = `${address.city || ''}, ${address.region || ''}`.trim();
        setCurrentLocation(locationString);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setCurrentLocation('Location unavailable');
    }
  };

  const handleAddJob = () => {
    // Navigate to job selection screen
    router.push('/job-selection');
  };

  const handleMyResume = () => {
    router.push('/(auth)/seeker-resume');
  };

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    // Add logic to filter jobs by district
  };

  const loadPositionsJobs = async () => {
    try {
      const { data: positionsJobs, error } = await supabase
        .from('positions_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return positionsJobs || [];
    } catch (error) {
      console.error('Error loading positions jobs:', error);
      return [];
    }
  };

  const handleButtonPress = (buttonType: 'suggested' | 'career' | 'job') => {
    if (buttonType === 'suggested') {
      handleFilterPress('suggested');
    }
  };

  const handleFilterPress = async (filter: string) => {
    try {
      setActiveFilter(filter);
      setContentLoading(true);
      
      const startTime = Date.now();
      await loadJobs(false, true);
      
      // Ensure minimum loading time of 500ms
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }
    } catch (error) {
      console.log('Error in filter press:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const handleStoriesPress = () => {
    router.push('/(seeker)/seeker-stories');
  };

  const handleNewsPress = () => {
    router.push('/(seeker)/seeker-news');
  };

  const handleProfilePress = () => {
    router.push('/(seeker)/seeker-profile');
  };

  const handleAddPositions = () => {
    router.push('/(seeker)/seeker-add-positions');
  };

  const handleFilters = () => {
    router.push('/(seeker)/seeker-filters');
  };

  const handleSearchPress = () => {
    router.push('/(seeker)/seeker-search');
  };

  const handleDistanceSelect = (distance: number) => {
    setSelectedDistance(distance);
    setIsDistanceModalVisible(false);
    // Only update filter if it's not already 'nearby'
    if (activeFilter !== 'nearby') {
      setActiveFilter('nearby');
    } else {
      // Manually trigger fetch if already on nearby filter
      handleFilterPress('nearby');
    }
  };

  const handleTextButtonPress = (button: 'suggested' | 'career' | 'job') => {
    setActiveTextButton(button);
  };

  const NoJobsView = () => (
    <View style={styles.noJobsContainer}>
      <Text style={styles.noJobsText}>
        Sorry, no jobs available at the moment
      </Text>
    </View>
  );

  const handlePositionsPress = async () => {
    setIsLoading(true);
    try {
      // Set both positions and complete filter active
      setActiveFilter('complete');
      await handleFilterPress('complete');
      router.push('/(seeker)/seeker-positions-jobs');
    } catch (error) {
      console.error('Error handling positions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the Complete button press handler
  const handleCompletePress = async () => {
    await handleFilterPress('complete');
    // This ensures the Positions section is also updated
    if (activeFilter === 'positions') {
      await handlePositionsPress();
    }
  };

  // Update the refresh handler
  const handleRefresh = async () => {
    if (refreshing) return;
    
    try {
      setIsSilentLoading(false);
      const startTime = Date.now();
      
      await loadJobs(false, true);
      
      // Ensure minimum loading time of 500ms
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }
    } catch (error) {
      console.log('Error refreshing:', error);
    }
  };

  // Update mock jobs to match the interface
  const mockJobs: Job[] = [
    {
      id: 1,
      title: "Primary School Question Writer (Work from Home)",
      company_name: "Trust Education",
      salary_range: "40-80/hr",
      location: "Weifang District",
      tags: [
        { id: "1", name: "No exp required" },
        { id: "2", name: "Associate" },
        { id: "3", name: "Online Teaching" },
        { id: "4", name: "Primary School" },
        { id: "5", name: "Culture" }
      ],
      recruiter: {
        name: "Ms. Ma",
        title: "HR Staff",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
        response_rate: "High response rate"
      }
    },
    {
      id: 2,
      title: "English Interpreter/Translator",
      company_name: "Weifang LiHua Tech (Pre-IPO)",
      salary_range: "7-12K",
      location: "Kuiwen District • Wanda Plaza",
      tags: [
        { id: "6", name: "No exp required" },
        { id: "7", name: "Any degree" },
        { id: "8", name: "Full-time" },
        { id: "9", name: "Office work" },
        { id: "10", name: "Translation" }
      ],
      recruiter: {
        name: "Ms. Tian",
        title: "HR Manager",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
        response_rate: "10+ responses today"
      }
    },
    {
      id: 3,
      title: "Pen Art Training Instructor (8hr/day, 2 Days Off)",
      company_name: "Weifang Seven Star Blueprint Electronics",
      salary_range: "5-6K",
      location: "Weifang District",
      tags: [
        { id: "11", name: "1-3 years" },
        { id: "12", name: "Associate" },
        { id: "13", name: "Insurance" },
        { id: "14", name: "Offline Teaching" },
        { id: "15", name: "Training" }
      ],
      recruiter: {
        name: "Ms. Zhang",
        title: "Department Manager",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
        response_rate: "Quick response"
      }
    }
  ];

  // Update the error modal component with proper types
  const ConnectionErrorModal: React.FC<ConnectionErrorModalProps> = ({ visible, onRetry, onClose }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Connection Error</Text>
        <Text style={styles.modalText}>
          Unable to fetch jobs. Please check your internet connection and try again.
        </Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={onRetry}
          >
            <Text style={styles.modalButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonSecondary]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

  const handleResumeOptimization = () => {
    router.push('/(seeker)/seeker-resume-optimization');
  };

  const renderContent = () => {
    // Show loading state in center for both initial load and content loading
    if (isSilentLoading || contentLoading) {
      return (
        <View style={styles.centerLoadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {isSilentLoading ? 'Loading jobs...' : 'Updating...'}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.jobsScrollView}
        contentContainerStyle={styles.jobsContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
            colors={["#007AFF"]}
            progressViewOffset={10}
          />
        }
      >
        {/* Resume Optimization Card */}
        <TouchableOpacity 
          style={styles.optimizationCard}
          onPress={handleResumeOptimization}
        >
          <View style={styles.optimizationContent}>
            <View>
              <Text style={styles.optimizationTitle}>Resume Optimization Pending</Text>
              <Text style={styles.optimizationSubtitle}>
                Improve resume quality, get closer to your ideal position!
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Jobs List */}
        <View style={styles.jobsContainer}>
          {jobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => {
                // Handle job selection
              }}
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobHeaderText}>
                  <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                  <Text style={styles.salaryText}>{job.salary_range}</Text>
                </View>
              </View>
              
              <Text style={styles.companyName}>{job.company_name}</Text>
              
              <View style={styles.tagsContainer}>
                {job.tags.map((tag: JobTag, index: number) => (
                  <View key={tag.id} style={styles.tagPill}>
                    <Text style={styles.tagText}>{tag.name}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.recruiterContainer}>
                <View style={styles.recruiterInfo}>
                  <Image
                    source={{ uri: job.recruiter.avatar }}
                    style={styles.recruiterAvatar}
                  />
                  <View style={styles.recruiterTextContainer}>
                    <Text style={styles.recruiterName}>
                      {job.recruiter.name} • {job.recruiter.title}
                    </Text>
                    <Text style={styles.responseRate}>{job.recruiter.response_rate}</Text>
                  </View>
                </View>
                <View style={styles.locationContainer}>
                  <Text style={styles.locationText}>{job.location}</Text>
                  <TouchableOpacity style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Error Modal - Only show for user-initiated actions */}
        {isErrorModalVisible && connectionError && (
          <Modal
            visible={isErrorModalVisible}
            transparent
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Connection Issue</Text>
                <Text style={styles.modalText}>
                  {connectionError}. We're showing you available jobs while we try to get the latest updates.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                    onPress={() => setIsErrorModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar barStyle="light-content" />
      
      {/* Top Navigation */}
      <View style={styles.header}>
        {/* Left side text buttons */}
        <View style={styles.leftNav}>
          <TouchableOpacity 
            onPress={() => handleButtonPress('job')}
            style={styles.textButton}
          >
            <Text style={[
              styles.jobText,
              activeButton === 'job' ? styles.activeText : styles.inactiveText
            ]}>{selectedJob || 'Job'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.districtButton}
            onPress={() => setIsDistrictModalVisible(true)}
          >
            <Ionicons name="location" size={22} color="#999" />
            <Text style={[
              styles.districtText,
              selectedDistrict !== 'Select District' && { color: '#fff' }
            ]} numberOfLines={1}>
              {selectedDistrict}
            </Text>
            <Ionicons name="chevron-down" size={22} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Right side controls */}
        <View style={styles.rightControls}>
          <View style={styles.topButtons}>
            <TouchableOpacity style={styles.circleButton} onPress={handleAddJob}>
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={handleSearchPress}>
              <Ionicons name="search" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterIconButton} onPress={handleFilters}>
              <Ionicons name="options-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filter Navigation */}
      <View style={styles.filterNav}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterButtonsContainer}
        >
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'complete' && styles.filterButtonActive]}
            onPress={() => handleFilterPress('complete')}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'complete' && styles.filterButtonTextActive]}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'suggested' && styles.filterButtonActive]}
            onPress={() => handleFilterPress('suggested')}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'suggested' && styles.filterButtonTextActive]}>Suggested</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'new' && styles.filterButtonActive]}
            onPress={() => handleFilterPress('new')}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'new' && styles.filterButtonTextActive]}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'nearby' && styles.filterButtonActive]}
            onPress={() => handleFilterPress('nearby')}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'nearby' && styles.filterButtonTextActive]}>
              {selectedDistance ? `Nearby (${selectedDistance}km)` : 'Nearby'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content Area */}
      <View style={styles.contentWrapper}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={handlePositionsPress}
        >
          <Ionicons 
            name="briefcase-outline" 
            size={24} 
            color={(activeFilter === 'positions' || activeFilter === 'complete') ? "#007AFF" : "#666"} 
          />
          <Text style={[
            styles.bottomNavText, 
            (activeFilter === 'positions' || activeFilter === 'complete') && styles.activeNavText
          ]}>Positions</Text>
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
        <TouchableOpacity 
          style={styles.bottomNavItem} 
          onPress={handleProfilePress}
        >
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.bottomNavText}>Me</Text>
        </TouchableOpacity>
      </View>

      {/* District Selection Modal */}
      <Modal
        visible={isDistrictModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDistrictModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity 
                onPress={() => setIsDistrictModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ugandanDistricts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.districtItem}
                  onPress={() => {
                    handleDistrictSelect(item);
                    setIsDistrictModalVisible(false);
                  }}
                >
                  <Text style={styles.districtItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </Modal>

      {/* Distance Selection Modal */}
      <Modal
        visible={isDistanceModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDistanceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.distanceModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Distance</Text>
              <TouchableOpacity 
                onPress={() => setIsDistanceModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {DISTANCE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.distanceItem}
                onPress={() => handleDistanceSelect(option.value)}
              >
                <Text style={styles.distanceItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    backgroundColor: '#000',
    zIndex: 2,
    height: Platform.OS === 'ios' ? 140 : 110,
  },
  leftNav: {
    flex: 1,
    marginRight: 120,
  },
  rightControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    right: 15,
    alignItems: 'flex-end',
    zIndex: 3,
  },
  topButtons: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  districtButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 15,
    width: 180,
    height: 44,
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  textButton: {
    marginVertical: 2,
  },
  textButtonText: {
    fontSize: 14,
  },
  careerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  jobText: {
    fontSize: 18,
  },
  activeText: {
    color: '#fff',
  },
  inactiveText: {
    color: '#666',
  },
  filterNav: {
    paddingVertical: 10,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    marginTop: 0,
    paddingTop: Platform.OS === 'ios' ? 15 : 10,
  },
  filterButtonsContainer: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  filterButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  noJobsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  noJobsText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  jobCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: '100%',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobHeaderText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 15,
    lineHeight: 24,
  },
  salaryText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  companyName: {
    color: '#666',
    fontSize: 16,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tagPill: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#999',
    fontSize: 14,
  },
  recruiterContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
    marginTop: 5,
  },
  recruiterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recruiterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  recruiterTextContainer: {
    flex: 1,
  },
  recruiterName: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 2,
  },
  responseRate: {
    color: '#666',
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    color: '#666',
    fontSize: 14,
  },
  closeButton: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 18,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#333',
  },
  modalButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  districtItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  districtItemText: {
    color: '#fff',
    fontSize: 16,
  },
  distanceModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '80%',
    maxHeight: '70%',
  },
  distanceItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  distanceItemText: {
    color: '#fff',
    fontSize: 16,
  },
  jobsScrollView: {
    flex: 1,
  },
  jobsContainer: {
    paddingHorizontal: 15,
  },
  districtText: {
    color: '#999',
    fontSize: 15,
    marginHorizontal: 8,
    flex: 1,
    lineHeight: 20,
    paddingVertical: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  optimizationCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
  },
  optimizationContent: {
    flexDirection: 'row',
  },
  optimizationTitle: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optimizationSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  jobsContentContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
}); 