import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SectionList,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Country, CountrySection, getCountriesByLetter, searchCountries } from '../utils/countries';

interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCountry: (country: Country) => void;
}

const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  visible,
  onClose,
  onSelectCountry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sections, setSections] = useState<CountrySection[]>(getCountriesByLetter());

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setSections(getCountriesByLetter());
    } else {
      const filteredCountries = searchCountries(text);
      setSections([{ title: 'Search Results', data: filteredCountries }]);
    }
  };

  const renderSectionHeader = ({ section }: { section: CountrySection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        onSelectCountry(item);
        onClose();
      }}
    >
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryCode}>{item.dialCode}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Select Country</Text>
          </View>

          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries"
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </SafeAreaView>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.code}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          stickySectionHeadersEnabled={true}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    backgroundColor: '#000',
    zIndex: 1,
  },
  header: {
    height: Platform.OS === 'ios' ? 44 : 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    height: 36,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    padding: 0,
  },
  sectionHeader: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionHeaderText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
    backgroundColor: '#000',
  },
  countryName: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '400',
  },
  countryCode: {
    fontSize: 17,
    color: '#666',
    fontWeight: '400',
  },
});

export default CountryPickerModal; 