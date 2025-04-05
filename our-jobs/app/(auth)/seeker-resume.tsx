import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { debounce } from 'lodash';

interface PersonalInfo {
  dateOfBirth: Date;
  location: string;
  // Add other personal info fields as needed
}

interface LocationSearchResult {
  id: string;
  name: string;
  type: 'city' | 'district' | 'region';
}

const SeekerResume = () => {
  const [selectedDOBDate, setSelectedDOBDate] = useState(new Date(1992, 0, 1));
  const [showDateModal, setShowDateModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    dateOfBirth: new Date(1992, 0, 1),
    location: ''
  });

  const isValidDate = (date: Date): boolean => {
    const now = new Date();
    const minDate = new Date(1940, 0, 1);
    return date >= minDate && date <= now;
  };

  const getMonthAbbreviation = (monthIndex: number): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
  };

  const handleDateChange = (type: 'day' | 'month' | 'year', value: number) => {
    const newDate = new Date(selectedDOBDate);
    switch (type) {
      case 'day':
        newDate.setDate(value);
        break;
      case 'month':
        newDate.setMonth(value);
        break;
      case 'year':
        newDate.setFullYear(value);
        break;
    }
    if (isValidDate(newDate)) {
      setSelectedDOBDate(newDate);
    }
  };

  const handleDateOfBirthDone = () => {
    setPersonalInfo({...personalInfo, dateOfBirth: selectedDOBDate});
    setShowDateModal(false);
  };

  const handleDateOfBirthChange = (newDate: Date) => {
    setSelectedDOBDate(newDate);
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = getMonthAbbreviation(date.getMonth());
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const searchLocations = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search for locations in Uganda with more specific parameters
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}+Uganda&limit=10&addressdetails=1`
      );
      const data = await response.json();
      
      const results = data
        .filter((item: any) => item.address && (item.address.city || item.address.town || item.address.district))
        .map((item: any) => ({
          id: item.place_id,
          name: item.address.city || item.address.town || item.address.district,
          type: 'district'
        }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const handleLocationSelect = (location: LocationSearchResult) => {
    setPersonalInfo({ ...personalInfo, location: location.name });
    setShowLocationModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLocationPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please enable location services in your settings.');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (geocode) {
        setPersonalInfo({ ...personalInfo, location: geocode.district || geocode.city || '' });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const DatePickerModal = () => (
    <Modal
      visible={showDateModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowDateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
            <TouchableOpacity 
              style={styles.doneDateButton}
              onPress={handleDateOfBirthDone}
            >
              <Text style={styles.doneDateButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.datePickerContent}>
            {/* Day Picker */}
            <ScrollView 
              style={styles.datePickerScroll}
              showsVerticalScrollIndicator={false}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dateOption,
                    selectedDOBDate.getDate() === day && styles.dateOptionSelected
                  ]}
                  onPress={() => {
                    const newDate = new Date(selectedDOBDate);
                    newDate.setDate(day);
                    handleDateOfBirthChange(newDate);
                  }}
                >
                  <Text style={[
                    styles.dateOptionText,
                    selectedDOBDate.getDate() === day && styles.dateOptionSelectedText
                  ]}>
                    {String(day).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Month Picker */}
            <ScrollView 
              style={styles.datePickerScroll}
              showsVerticalScrollIndicator={false}
            >
              {Array.from({ length: 12 }, (_, i) => i).map((monthIndex) => (
                <TouchableOpacity
                  key={monthIndex}
                  style={[
                    styles.dateOption,
                    selectedDOBDate.getMonth() === monthIndex && styles.dateOptionSelected
                  ]}
                  onPress={() => {
                    const newDate = new Date(selectedDOBDate);
                    newDate.setMonth(monthIndex);
                    handleDateOfBirthChange(newDate);
                  }}
                >
                  <Text style={[
                    styles.dateOptionText,
                    selectedDOBDate.getMonth() === monthIndex && styles.dateOptionSelectedText
                  ]}>
                    {getMonthAbbreviation(monthIndex)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Year Picker */}
            <ScrollView 
              style={styles.datePickerScroll}
              showsVerticalScrollIndicator={false}
            >
              {Array.from({ length: new Date().getFullYear() - 1939 }, (_, i) => 1940 + i).map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.dateOption,
                    selectedDOBDate.getFullYear() === year && styles.dateOptionSelected
                  ]}
                  onPress={() => {
                    const newDate = new Date(selectedDOBDate);
                    newDate.setFullYear(year);
                    handleDateOfBirthChange(newDate);
                  }}
                >
                  <Text style={[
                    styles.dateOptionText,
                    selectedDOBDate.getFullYear() === year && styles.dateOptionSelectedText
                  ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  const LocationModal = () => (
    <Modal
      visible={showLocationModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLocationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.locationModalContainer}>
          <View style={styles.locationModalHeader}>
            <Text style={styles.locationModalTitle}>Select Location</Text>
            <TouchableOpacity 
              onPress={() => setShowLocationModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Type city or district name..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchLocations(text);
              }}
            />
          </View>

          <ScrollView style={styles.searchResults}>
            {isSearching ? (
              <Text style={styles.searchingText}>Searching...</Text>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.locationResult}
                  onPress={() => handleLocationSelect(result)}
                >
                  <Ionicons name="location" size={20} color="#007AFF" />
                  <Text style={styles.locationResultText}>{result.name}</Text>
                </TouchableOpacity>
              ))
            ) : searchQuery ? (
              <Text style={styles.noResultsText}>No results found</Text>
            ) : null}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => {
                if (personalInfo.location) {
                  setShowLocationModal(false);
                }
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.input, styles.selectInput]}
        onPress={() => setShowDateModal(true)}
      >
        <Text style={[styles.selectText, { color: '#fff' }]}>
          {formatDate(personalInfo.dateOfBirth)}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#666" />
      </TouchableOpacity>

      {/* Location Selection */}
      <View style={styles.locationContainer}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setShowLocationModal(true)}
        >
          <View style={styles.locationContent}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <Text style={styles.locationText}>
              {personalInfo.location || 'Select Location'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <DatePickerModal />
      <LocationModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  input: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectInput: {
    // Add any specific styles for the selectInput
  },
  selectText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  datePickerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  doneDateButton: {
    padding: 8,
  },
  doneDateButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerContent: {
    flexDirection: 'row',
    height: 300,
  },
  datePickerScroll: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  scrollContent: {
    paddingVertical: 10,
  },
  dateOption: {
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dateOptionSelected: {
    backgroundColor: '#007AFF',
  },
  dateOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  dateOptionSelectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  locationModalContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    width: '100%',
  },
  locationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 10,
    height: '100%',
  },
  searchResults: {
    maxHeight: 300,
  },
  locationResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  locationResultText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  searchingText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  noResultsText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SeekerResume; 