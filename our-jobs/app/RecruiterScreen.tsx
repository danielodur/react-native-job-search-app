import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
  SafeAreaView,
  SectionList,
  Keyboard,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface Country {
  name: string;
  code: string;
  dial_code: string;
}

interface CertificateFile {
  id: string;
  uri: string;
  name: string;
  size: number;
  type: string;
  timestamp: number;
}

const countries: Country[] = [
  { name: 'Afghanistan', code: 'AF', dial_code: '+93' },
  { name: 'Albania', code: 'AL', dial_code: '+355' },
  { name: 'Algeria', code: 'DZ', dial_code: '+213' },
  { name: 'Andorra', code: 'AD', dial_code: '+376' },
  { name: 'Angola', code: 'AO', dial_code: '+244' },
  { name: 'Antigua and Barbuda', code: 'AG', dial_code: '+1268' },
  { name: 'Argentina', code: 'AR', dial_code: '+54' },
  { name: 'Armenia', code: 'AM', dial_code: '+374' },
  { name: 'Australia', code: 'AU', dial_code: '+61' },
  { name: 'Austria', code: 'AT', dial_code: '+43' },
  { name: 'Azerbaijan', code: 'AZ', dial_code: '+994' },
  { name: 'Bahamas', code: 'BS', dial_code: '+1242' },
  { name: 'Bahrain', code: 'BH', dial_code: '+973' },
  { name: 'Bangladesh', code: 'BD', dial_code: '+880' },
  { name: 'Barbados', code: 'BB', dial_code: '+1246' },
  { name: 'Belarus', code: 'BY', dial_code: '+375' },
  { name: 'Belgium', code: 'BE', dial_code: '+32' },
  { name: 'Belize', code: 'BZ', dial_code: '+501' },
  { name: 'Benin', code: 'BJ', dial_code: '+229' },
  { name: 'Bhutan', code: 'BT', dial_code: '+975' },
  { name: 'Bolivia', code: 'BO', dial_code: '+591' },
  { name: 'Bosnia and Herzegovina', code: 'BA', dial_code: '+387' },
  { name: 'Botswana', code: 'BW', dial_code: '+267' },
  { name: 'Brazil', code: 'BR', dial_code: '+55' },
  { name: 'Brunei', code: 'BN', dial_code: '+673' },
  { name: 'Bulgaria', code: 'BG', dial_code: '+359' },
  { name: 'Burkina Faso', code: 'BF', dial_code: '+226' },
  { name: 'Burundi', code: 'BI', dial_code: '+257' },
  { name: 'Cambodia', code: 'KH', dial_code: '+855' },
  { name: 'Cameroon', code: 'CM', dial_code: '+237' },
  { name: 'Canada', code: 'CA', dial_code: '+1' },
  { name: 'Cape Verde', code: 'CV', dial_code: '+238' },
  { name: 'Central African Republic', code: 'CF', dial_code: '+236' },
  { name: 'Chad', code: 'TD', dial_code: '+235' },
  { name: 'Chile', code: 'CL', dial_code: '+56' },
  { name: 'China', code: 'CN', dial_code: '+86' },
  { name: 'Colombia', code: 'CO', dial_code: '+57' },
  { name: 'Comoros', code: 'KM', dial_code: '+269' },
  { name: 'Congo', code: 'CG', dial_code: '+242' },
  { name: 'Costa Rica', code: 'CR', dial_code: '+506' },
  { name: 'Croatia', code: 'HR', dial_code: '+385' },
  { name: 'Cuba', code: 'CU', dial_code: '+53' },
  { name: 'Cyprus', code: 'CY', dial_code: '+357' },
  { name: 'Czech Republic', code: 'CZ', dial_code: '+420' },
  { name: 'Denmark', code: 'DK', dial_code: '+45' },
  { name: 'Djibouti', code: 'DJ', dial_code: '+253' },
  { name: 'Dominica', code: 'DM', dial_code: '+1767' },
  { name: 'Dominican Republic', code: 'DO', dial_code: '+1849' },
  { name: 'East Timor', code: 'TL', dial_code: '+670' },
  { name: 'Ecuador', code: 'EC', dial_code: '+593' },
  { name: 'Egypt', code: 'EG', dial_code: '+20' },
  { name: 'El Salvador', code: 'SV', dial_code: '+503' },
  { name: 'Equatorial Guinea', code: 'GQ', dial_code: '+240' },
  { name: 'Eritrea', code: 'ER', dial_code: '+291' },
  { name: 'Estonia', code: 'EE', dial_code: '+372' },
  { name: 'Ethiopia', code: 'ET', dial_code: '+251' },
  { name: 'Fiji', code: 'FJ', dial_code: '+679' },
  { name: 'Finland', code: 'FI', dial_code: '+358' },
  { name: 'France', code: 'FR', dial_code: '+33' },
  { name: 'Gabon', code: 'GA', dial_code: '+241' },
  { name: 'Gambia', code: 'GM', dial_code: '+220' },
  { name: 'Georgia', code: 'GE', dial_code: '+995' },
  { name: 'Germany', code: 'DE', dial_code: '+49' },
  { name: 'Ghana', code: 'GH', dial_code: '+233' },
  { name: 'Greece', code: 'GR', dial_code: '+30' },
  { name: 'Grenada', code: 'GD', dial_code: '+1473' },
  { name: 'Guatemala', code: 'GT', dial_code: '+502' },
  { name: 'Guinea', code: 'GN', dial_code: '+224' },
  { name: 'Guinea-Bissau', code: 'GW', dial_code: '+245' },
  { name: 'Guyana', code: 'GY', dial_code: '+592' },
  { name: 'Haiti', code: 'HT', dial_code: '+509' },
  { name: 'Honduras', code: 'HN', dial_code: '+504' },
  { name: 'Hungary', code: 'HU', dial_code: '+36' },
  { name: 'Iceland', code: 'IS', dial_code: '+354' },
  { name: 'India', code: 'IN', dial_code: '+91' },
  { name: 'Indonesia', code: 'ID', dial_code: '+62' },
  { name: 'Iran', code: 'IR', dial_code: '+98' },
  { name: 'Iraq', code: 'IQ', dial_code: '+964' },
  { name: 'Ireland', code: 'IE', dial_code: '+353' },
  { name: 'Israel', code: 'IL', dial_code: '+972' },
  { name: 'Italy', code: 'IT', dial_code: '+39' },
  { name: 'Jamaica', code: 'JM', dial_code: '+1876' },
  { name: 'Japan', code: 'JP', dial_code: '+81' },
  { name: 'Jordan', code: 'JO', dial_code: '+962' },
  { name: 'Kazakhstan', code: 'KZ', dial_code: '+7' },
  { name: 'Kenya', code: 'KE', dial_code: '+254' },
  { name: 'Kiribati', code: 'KI', dial_code: '+686' },
  { name: 'Kuwait', code: 'KW', dial_code: '+965' },
  { name: 'Kyrgyzstan', code: 'KG', dial_code: '+996' },
  { name: 'Laos', code: 'LA', dial_code: '+856' },
  { name: 'Latvia', code: 'LV', dial_code: '+371' },
  { name: 'Lebanon', code: 'LB', dial_code: '+961' },
  { name: 'Lesotho', code: 'LS', dial_code: '+266' },
  { name: 'Liberia', code: 'LR', dial_code: '+231' },
  { name: 'Libya', code: 'LY', dial_code: '+218' },
  { name: 'Liechtenstein', code: 'LI', dial_code: '+423' },
  { name: 'Lithuania', code: 'LT', dial_code: '+370' },
  { name: 'Luxembourg', code: 'LU', dial_code: '+352' },
  { name: 'Madagascar', code: 'MG', dial_code: '+261' },
  { name: 'Malawi', code: 'MW', dial_code: '+265' },
  { name: 'Malaysia', code: 'MY', dial_code: '+60' },
  { name: 'Maldives', code: 'MV', dial_code: '+960' },
  { name: 'Mali', code: 'ML', dial_code: '+223' },
  { name: 'Malta', code: 'MT', dial_code: '+356' },
  { name: 'Marshall Islands', code: 'MH', dial_code: '+692' },
  { name: 'Mauritania', code: 'MR', dial_code: '+222' },
  { name: 'Mauritius', code: 'MU', dial_code: '+230' },
  { name: 'Mexico', code: 'MX', dial_code: '+52' },
  { name: 'Micronesia', code: 'FM', dial_code: '+691' },
  { name: 'Moldova', code: 'MD', dial_code: '+373' },
  { name: 'Monaco', code: 'MC', dial_code: '+377' },
  { name: 'Mongolia', code: 'MN', dial_code: '+976' },
  { name: 'Montenegro', code: 'ME', dial_code: '+382' },
  { name: 'Morocco', code: 'MA', dial_code: '+212' },
  { name: 'Mozambique', code: 'MZ', dial_code: '+258' },
  { name: 'Myanmar', code: 'MM', dial_code: '+95' },
  { name: 'Namibia', code: 'NA', dial_code: '+264' },
  { name: 'Nauru', code: 'NR', dial_code: '+674' },
  { name: 'Nepal', code: 'NP', dial_code: '+977' },
  { name: 'Netherlands', code: 'NL', dial_code: '+31' },
  { name: 'New Zealand', code: 'NZ', dial_code: '+64' },
  { name: 'Nicaragua', code: 'NI', dial_code: '+505' },
  { name: 'Niger', code: 'NE', dial_code: '+227' },
  { name: 'Nigeria', code: 'NG', dial_code: '+234' },
  { name: 'North Korea', code: 'KP', dial_code: '+850' },
  { name: 'Norway', code: 'NO', dial_code: '+47' },
  { name: 'Oman', code: 'OM', dial_code: '+968' },
  { name: 'Pakistan', code: 'PK', dial_code: '+92' },
  { name: 'Palau', code: 'PW', dial_code: '+680' },
  { name: 'Palestine', code: 'PS', dial_code: '+970' },
  { name: 'Panama', code: 'PA', dial_code: '+507' },
  { name: 'Papua New Guinea', code: 'PG', dial_code: '+675' },
  { name: 'Paraguay', code: 'PY', dial_code: '+595' },
  { name: 'Peru', code: 'PE', dial_code: '+51' },
  { name: 'Philippines', code: 'PH', dial_code: '+63' },
  { name: 'Poland', code: 'PL', dial_code: '+48' },
  { name: 'Portugal', code: 'PT', dial_code: '+351' },
  { name: 'Qatar', code: 'QA', dial_code: '+974' },
  { name: 'Romania', code: 'RO', dial_code: '+40' },
  { name: 'Russia', code: 'RU', dial_code: '+7' },
  { name: 'Rwanda', code: 'RW', dial_code: '+250' },
  { name: 'Saint Kitts and Nevis', code: 'KN', dial_code: '+1869' },
  { name: 'Saint Lucia', code: 'LC', dial_code: '+1758' },
  { name: 'Saint Vincent', code: 'VC', dial_code: '+1784' },
  { name: 'Samoa', code: 'WS', dial_code: '+685' },
  { name: 'San Marino', code: 'SM', dial_code: '+378' },
  { name: 'Sao Tome and Principe', code: 'ST', dial_code: '+239' },
  { name: 'Saudi Arabia', code: 'SA', dial_code: '+966' },
  { name: 'Senegal', code: 'SN', dial_code: '+221' },
  { name: 'Serbia', code: 'RS', dial_code: '+381' },
  { name: 'Seychelles', code: 'SC', dial_code: '+248' },
  { name: 'Sierra Leone', code: 'SL', dial_code: '+232' },
  { name: 'Singapore', code: 'SG', dial_code: '+65' },
  { name: 'Slovakia', code: 'SK', dial_code: '+421' },
  { name: 'Slovenia', code: 'SI', dial_code: '+386' },
  { name: 'Solomon Islands', code: 'SB', dial_code: '+677' },
  { name: 'Somalia', code: 'SO', dial_code: '+252' },
  { name: 'South Africa', code: 'ZA', dial_code: '+27' },
  { name: 'South Korea', code: 'KR', dial_code: '+82' },
  { name: 'South Sudan', code: 'SS', dial_code: '+211' },
  { name: 'Spain', code: 'ES', dial_code: '+34' },
  { name: 'Sri Lanka', code: 'LK', dial_code: '+94' },
  { name: 'Sudan', code: 'SD', dial_code: '+249' },
  { name: 'Suriname', code: 'SR', dial_code: '+597' },
  { name: 'Swaziland', code: 'SZ', dial_code: '+268' },
  { name: 'Sweden', code: 'SE', dial_code: '+46' },
  { name: 'Switzerland', code: 'CH', dial_code: '+41' },
  { name: 'Syria', code: 'SY', dial_code: '+963' },
  { name: 'Taiwan', code: 'TW', dial_code: '+886' },
  { name: 'Tajikistan', code: 'TJ', dial_code: '+992' },
  { name: 'Tanzania', code: 'TZ', dial_code: '+255' },
  { name: 'Thailand', code: 'TH', dial_code: '+66' },
  { name: 'Togo', code: 'TG', dial_code: '+228' },
  { name: 'Tonga', code: 'TO', dial_code: '+676' },
  { name: 'Trinidad and Tobago', code: 'TT', dial_code: '+1868' },
  { name: 'Tunisia', code: 'TN', dial_code: '+216' },
  { name: 'Turkey', code: 'TR', dial_code: '+90' },
  { name: 'Turkmenistan', code: 'TM', dial_code: '+993' },
  { name: 'Tuvalu', code: 'TV', dial_code: '+688' },
  { name: 'Uganda', code: 'UG', dial_code: '+256' },
  { name: 'Ukraine', code: 'UA', dial_code: '+380' },
  { name: 'United Arab Emirates', code: 'AE', dial_code: '+971' },
  { name: 'United Kingdom', code: 'GB', dial_code: '+44' },
  { name: 'United States', code: 'US', dial_code: '+1' },
  { name: 'Uruguay', code: 'UY', dial_code: '+598' },
  { name: 'Uzbekistan', code: 'UZ', dial_code: '+998' },
  { name: 'Vanuatu', code: 'VU', dial_code: '+678' },
  { name: 'Vatican City', code: 'VA', dial_code: '+379' },
  { name: 'Venezuela', code: 'VE', dial_code: '+58' },
  { name: 'Vietnam', code: 'VN', dial_code: '+84' },
  { name: 'Yemen', code: 'YE', dial_code: '+967' },
  { name: 'Zambia', code: 'ZM', dial_code: '+260' },
  { name: 'Zimbabwe', code: 'ZW', dial_code: '+263' }
];

const TEST_NUMBERS = {
  RECRUITER: {
    number: '+88018053650421',
    code: '123456',
    countryCode: '+880'
  },
  JOB_SEEKER: {
    number: '+8615933376707',
    code: '123456',
    countryCode: '+86'
  }
};

interface RecruiterScreenProps {
  onBack: () => void;
}

export default function RecruiterScreen({ onBack }: RecruiterScreenProps) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find(country => country.code === 'UG')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const phoneInputRef = React.useRef<TextInput>(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showCantReceiveModal, setShowCantReceiveModal] = useState(false);
  const verificationInputRef = React.useRef<TextInput>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [certificateFiles, setCertificateFiles] = useState<CertificateFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<CertificateFile | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const sectionData = React.useMemo(() => {
    const filteredCountries = countries.filter(country => {
      const searchLower = searchQuery.toLowerCase().trim();
      const countryNameLower = country.name.toLowerCase();
      const dialCodeLower = country.dial_code.toLowerCase();
      const countryCodeLower = country.code.toLowerCase();
      
      if (searchLower === '') return true;
      return (
        countryNameLower.includes(searchLower) || 
        dialCodeLower.includes(searchLower) ||
        countryCodeLower.includes(searchLower)
      );
    });

    const groups: { [key: string]: Country[] } = {};
    filteredCountries.forEach(country => {
      const firstLetter = country.name[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(country);
    });
    
    return Object.entries(groups)
      .map(([letter, countries]) => ({
        title: letter,
        data: countries.sort((a, b) => a.name.localeCompare(b.name))
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [searchQuery]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setSearchQuery('');
  };

  const handleNavigateToEmail = () => {
    if (certificateFiles.length === 0) {
      Alert.alert(
        'Certificate Required',
        'Please upload your company Certificate/License to continue.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }
    
    if (!isAgreementChecked) {
      setShowAgreementModal(true);
    } else {
      router.push('/(recruiter)/recruiter-email');
    }
  };

  const validatePhoneNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    const fullNumber = `${selectedCountry?.dial_code}${cleanNumber}`;
    
    if (!cleanNumber) {
      return 'Please enter your phone number';
    }
    
    if (cleanNumber.length < 9) {
      return 'Please enter a valid phone number with at least 9 digits';
    }
    
    if (cleanNumber.length > 15) {
      return 'Please enter a valid phone number';
    }

    // For RecruiterScreen, only allow the recruiter test number
    const isRecruiterNumber = fullNumber.replace(/\D/g, '') === TEST_NUMBERS.RECRUITER.number.replace(/\D/g, '');
    
    if (!isRecruiterNumber) {
      return 'Please enter a valid phone number';
    }
    
    return null;
  };

  const handleNextPress = async () => {
    if (certificateFiles.length === 0) {
      Alert.alert(
        'Certificate Required',
        'Please upload your company Certificate/License to continue.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      Alert.alert(
        'Please enter a valid phone number',
        '',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    if (!isAgreementChecked) {
      Alert.alert(
        'Please accept the terms and conditions to continue',
        '',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowVerificationScreen(true);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert(
        'Invalid Code',
        'Please enter a valid 6-digit verification code',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    const fullNumber = `${selectedCountry?.dial_code}${phoneNumber}`;
    const cleanFullNumber = fullNumber.replace(/\D/g, '');
    
    // Check if it matches the recruiter test number
    if (cleanFullNumber === TEST_NUMBERS.RECRUITER.number.replace(/\D/g, '') && 
        verificationCode === TEST_NUMBERS.RECRUITER.code) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        Alert.alert(
          'Success',
          'Phone number verified successfully!',
          [{ text: 'OK', style: 'default' }],
          { userInterfaceStyle: 'dark' }
        );
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert(
        'Invalid Code',
        'The verification code you entered is incorrect. Please try again.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
    }
  };

  const handleCertificateUpload = async () => {
    if (certificateFiles.length >= 2) {
      Alert.alert(
        'Maximum Files Reached',
        'You can only upload up to 2 files.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    setIsUploading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        try {
          const fileInfo = await FileSystem.getInfoAsync(file.uri, { size: true });
          const maxSize = 5 * 1024 * 1024; // 5MB in bytes

          if (!fileInfo.exists) {
            throw new Error('File does not exist');
          }

          const fileSize = (fileInfo as FileSystem.FileInfo & { size: number }).size;
          
          if (fileSize > maxSize) {
            Alert.alert(
              'File too large',
              `${file.name} is larger than 5MB`,
              [{ text: 'OK', style: 'default' }],
              { userInterfaceStyle: 'dark' }
            );
            return;
          }

          setCertificateFiles(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            uri: file.uri,
            name: file.name,
            size: fileSize,
            type: file.mimeType || '',
            timestamp: Date.now()
          }]);
        } catch (error) {
          console.error('Error processing file:', file.name, error);
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to upload certificate. Please try again.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (certificateFiles.length === 1) {
      Alert.alert(
        'Delete Certificate',
        'Please note that at least one licensed file is required in order to use JOBS as a recruiter.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setCertificateFiles(prev => prev.filter(file => file.id !== fileId));
              if (selectedFile?.id === fileId) {
                setSelectedFile(null);
                setShowFilePreview(false);
              }
            },
          },
        ],
        { userInterfaceStyle: 'dark' }
      );
    } else {
      setCertificateFiles(prev => prev.filter(file => file.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
        setShowFilePreview(false);
      }
    }
  };

  const handleFilePress = (file: CertificateFile) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleBackPress = () => {
    router.replace('/WelcomeScreen');
  };

  if (showVerificationScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.verificationContainer}>
          <TouchableOpacity 
            style={styles.verificationBackButton}
            onPress={() => setShowVerificationScreen(false)}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.verificationContent}>
            <Text style={styles.verificationTitle}>Enter Verification{'\n'}Code</Text>
            <Text style={styles.verificationSubtitle}>
              We've sent a verification code to {selectedCountry?.dial_code}{phoneNumber}
            </Text>

            <View style={styles.verificationInputContainer}>
              <View style={styles.codeInputContainer}>
                <TextInput
                  ref={verificationInputRef}
                  style={styles.verificationInput}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
                  onFocus={() => {
                    setIsKeyboardVisible(true);
                  }}
                  onBlur={() => {
                    setIsKeyboardVisible(false);
                    Keyboard.dismiss();
                  }}
                />
                <TouchableOpacity 
                  style={styles.codeUnderlineContainer}
                  onPress={() => {
                    if (isKeyboardVisible) {
                      verificationInputRef.current?.blur();
                      Keyboard.dismiss();
                    } else {
                      verificationInputRef.current?.focus();
                    }
                  }}
                  activeOpacity={1}
                >
                  {[...Array(6)].map((_, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.codeUnderline,
                        verificationCode[index] ? styles.codeUnderlineFilled : null
                      ]}
                    >
                      <Text style={styles.codeDigit}>
                        {verificationCode[index] || ''}
                      </Text>
                    </View>
                  ))}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.verifyActionsContainer}>
              <View style={styles.verifyButtonContainer}>
                <TouchableOpacity 
                  style={[
                    styles.verifyButton,
                    verificationCode.length === 6 && styles.nextButtonActive,
                    isLoading && styles.nextButtonDisabled
                  ]}
                  onPress={() => {
                    verificationInputRef.current?.blur();
                    handleVerifyCode();
                  }}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[
                      styles.verifyButtonText,
                      verificationCode.length === 6 && styles.nextButtonTextActive
                    ]}>
                      Verify
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cantReceiveCodeButton}
                  onPress={() => setShowCantReceiveModal(true)}
                >
                  <Text style={styles.cantReceiveCodeButtonText}>Can't receive code?</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.resendContainer}>
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleNextPress}
                disabled={isLoading}
              >
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Can't Receive Code Modal */}
        <Modal
          visible={showCantReceiveModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCantReceiveModal(false)}
        >
          <TouchableOpacity 
            style={styles.cantReceiveModalContainer}
            activeOpacity={1}
            onPress={() => setShowCantReceiveModal(false)}
          >
            <View style={styles.cantReceiveModalWrapper}>
              <View style={styles.cantReceiveModalContent}>
                <Text style={styles.cantReceiveModalHeader}>
                  Can't receive code, you can:
                </Text>
                <View style={styles.modalDivider} />
                <TouchableOpacity 
                  style={styles.changePhoneButton}
                  onPress={() => {
                    setShowCantReceiveModal(false);
                    setShowVerificationScreen(false);
                  }}
                >
                  <Text style={styles.changePhoneButtonText}>Change phone number</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCantReceiveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Login / Sign Up</Text>
            <Text style={styles.subtitle}>
              Please register if you are a new user.
            </Text>
          </View>

          <View style={styles.phoneContainer}>
            <TouchableOpacity 
              style={styles.countryCodeContainer}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={styles.countryCode}>{selectedCountry?.dial_code}</Text>
              <Ionicons name="chevron-down" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.phoneInputWrapper}>
              <TextInput
                ref={phoneInputRef}
                style={styles.phoneInput}
                placeholder="Official company phone number"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                onFocus={() => setIsKeyboardFocused(true)}
                onBlur={() => {
                  setIsKeyboardFocused(false);
                  Keyboard.dismiss();
                }}
              />
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setPhoneNumber('');
                  if (isKeyboardFocused) {
                    phoneInputRef.current?.blur();
                    Keyboard.dismiss();
                  }
                }}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.horizontalSection}>
            <View style={styles.emailSection}>
              <View style={styles.rowContainer}>
                <View style={styles.titleWithIcon}>
                  <Text style={styles.sectionTitle}>Company Email:</Text>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => {
                      if (!isAgreementChecked) {
                        setShowAgreementModal(true);
                      } else {
                        handleNavigateToEmail();
                      }
                    }}
                  >
                    <Ionicons name="mail" size={32} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.uploadSection}>
              <View style={styles.uploadSectionHeader}>
                <Text style={styles.sectionTitle}>Certificate and License:</Text>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={handleCertificateUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={20} color="#007AFF" />
                      <View style={styles.uploadContent}>
                        <Text style={styles.uploadButtonText}>Upload</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              
              {certificateFiles.length > 0 && (
                <View style={styles.filesContainer}>
                  <View style={styles.filesRow}>
                    {certificateFiles.map((file) => (
                      <TouchableOpacity
                        key={file.id}
                        style={styles.fileCard}
                        onPress={() => handleFilePress(file)}
                      >
                        <View style={styles.fileContent}>
                          <Ionicons 
                            name={file.type.includes('pdf') ? 'document-text' : 'image'}
                            size={24} 
                            color="#007AFF" 
                          />
                          <View style={styles.fileInfo}>
                            <Text style={styles.fileName} numberOfLines={1}>
                              {file.name}
                            </Text>
                            <Text style={styles.fileSize}>
                              {formatFileSize(file.size)}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          style={styles.removeButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                        >
                          <Ionicons name="close-circle" size={24} color="#666" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                    {certificateFiles.length === 1 && (
                      <TouchableOpacity 
                        style={styles.addFileCard}
                        onPress={handleCertificateUpload}
                      >
                        <View style={styles.addFileContent}>
                          <Ionicons name="add-circle-outline" size={24} color="#666" />
                          <Text style={styles.addFileText}>Add File</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.agreementSection}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                isAgreementChecked && styles.nextButtonActive,
                isLoading && styles.nextButtonDisabled
              ]}
              disabled={!isAgreementChecked || isLoading}
              onPress={handleNextPress}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[
                  styles.nextButtonText,
                  isAgreementChecked && styles.nextButtonTextActive
                ]}>Next</Text>
              )}
            </TouchableOpacity>

            <View style={styles.agreementContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setIsAgreementChecked(!isAgreementChecked)}
              >
                <Ionicons
                  name={isAgreementChecked ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={isAgreementChecked ? '#007AFF' : '#666'}
                />
              </TouchableOpacity>
              <View style={styles.agreementTextContainer}>
                <Text style={styles.agreementText}>
                  I have read and agreed the{' '}
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.agreementLink, { color: '#007AFF' }]}>JOB user's agreement</Text>
                </TouchableOpacity>
                <Text style={styles.agreementText}> and the </Text>
                <TouchableOpacity>
                  <Text style={[styles.agreementLink, { color: '#007AFF' }]}>privacy policy</Text>
                </TouchableOpacity>
                <Text style={styles.agreementText}>, and I allow JOB manage my account information</Text>
              </View>
            </View>
          </View>

          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>Hotline Service</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>File a Complaint</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={false}
        statusBarTranslucent={false}
      >
        <SafeAreaView style={styles.countryPickerMainContainer}>
          <View style={styles.countryPickerHeader}>
            <TouchableOpacity 
              style={styles.countryPickerBackButton}
              onPress={() => {
                setShowCountryPicker(false);
                setSearchQuery('');
              }}
            >
              <Text style={styles.countryPickerBackArrow}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.countryPickerTitle}>Select Country</Text>
          </View>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries"
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <SectionList
            sections={sectionData}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  selectedCountry?.code === item.code && styles.selectedCountryItem
                ]}
                onPress={() => handleCountrySelect(item)}
              >
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryDialCode}>{item.dial_code}</Text>
              </TouchableOpacity>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            )}
            stickySectionHeadersEnabled={true}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>

      {/* Agreement Modal */}
      <Modal
        visible={showAgreementModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAgreementModal(false)}
      >
        <TouchableOpacity 
          style={styles.cantReceiveModalContainer}
          activeOpacity={1}
          onPress={() => setShowAgreementModal(false)}
        >
          <View style={styles.cantReceiveModalWrapper}>
            <View style={styles.cantReceiveModalContent}>
              <View style={styles.modalTextContainer}>
                <Text style={styles.modalRegularText}>
                  I have read and agreed to the{' '}
                </Text>
                <Text style={styles.modalLink}>JOB user's agreement</Text>
                <Text style={styles.modalRegularText}> and the </Text>
                <Text style={styles.modalLink}>privacy policy</Text>
                <Text style={styles.modalRegularText}>, and I allow JOB to manage my account information</Text>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowAgreementModal(false)}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                <View style={styles.modalButtonDivider} />
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => {
                    setIsAgreementChecked(true);
                    setShowAgreementModal(false);
                    handleNavigateToEmail();
                  }}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Certificate Preview Modal */}
      <Modal
        visible={showFilePreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilePreview(false)}
      >
        <View style={styles.previewModalContainer}>
          <SafeAreaView style={styles.previewModalContent}>
            <View style={styles.previewHeader}>
              <TouchableOpacity
                style={styles.previewCloseButton}
                onPress={() => setShowFilePreview(false)}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {selectedFile?.name}
              </Text>
            </View>
            <View style={styles.previewContent}>
              {selectedFile?.type.includes('pdf') ? (
                <View style={styles.pdfPreviewPlaceholder}>
                  <Ionicons name="document-text" size={84} color="#666" />
                  <Text style={styles.pdfPreviewText}>PDF Document</Text>
                  <Text style={styles.pdfFileName} numberOfLines={2}>
                    {selectedFile.name}
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: selectedFile?.uri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 999,
    padding: 10,
  },
  backArrow: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
  },
  mainContent: {
    flex: 1,
    maxHeight: '70%', // Ensure main content takes up to 70% of screen
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  countryCode: {
    color: '#fff',
    fontSize: 16,
    marginRight: 5,
  },
  phoneInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: 24,
  },
  clearButton: {
    padding: 5,
    opacity: 0.8,
  },
  certificateSection: {
    marginBottom: 20,
    paddingLeft: 10,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 16,
  },
  uploadSection: {
    marginBottom: 16,
  },
  uploadSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingRight: 20,
  },
  uploadButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  uploadContent: {
    marginLeft: 6,
  },
  uploadButtonText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
  },
  filesContainer: {
    marginTop: 8,
    paddingVertical: 8,
    marginBottom: 16,
  },
  filesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  fileCard: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  addFileCard: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  fileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  addFileText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewModalContent: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: '#1a1a1a',
  },
  previewCloseButton: {
    padding: 8,
    marginRight: 16,
  },
  previewTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '90%',
  },
  pdfPreviewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pdfPreviewText: {
    color: '#666',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  pdfFileName: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  agreementSection: {
    marginBottom: 16,
  },
  nextButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  nextButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  nextButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextActive: {
    color: '#fff',
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  agreementTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  agreementText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  agreementLink: {
    color: '#34C759',
    fontSize: 14,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  countryPickerMainContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  countryPickerHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  countryPickerBackButton: {
    padding: 10,
    marginLeft: 0,
    height: 56,
    justifyContent: 'center',
    width: 50,
  },
  countryPickerBackArrow: {
    color: '#999',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -4,
  },
  countryPickerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 50,
  },
  searchContainer: {
    padding: 8,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 0,
    height: 24,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  countryName: {
    color: '#fff',
    fontSize: 16,
  },
  countryDialCode: {
    color: '#666',
    fontSize: 16,
  },
  sectionHeader: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  sectionHeaderText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  cantReceiveModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cantReceiveModalWrapper: {
    width: '90%',
    maxWidth: 340,
  },
  cantReceiveModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cantReceiveModalHeader: {
    fontSize: 16,
    padding: 20,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
    color: '#444',
  },
  modalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
    width: '100%',
  },
  changePhoneButton: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3a3a3a',
  },
  changePhoneButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    padding: 20,
  },
  horizontalSection: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emailSection: {
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedCountryItem: {
    backgroundColor: '#1a1a1a',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
  },
  rejectButtonText: {
    color: '#444',
    fontSize: 17,
    fontWeight: '400',
  },
  acceptButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  modalLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  verificationContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  verificationContent: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
  },
  verificationBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 45 : 25,
    left: 16,
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  verificationTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 40,
  },
  verificationSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginTop: 10,
  },
  verificationInputContainer: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  codeInputContainer: {
    width: '100%',
    position: 'relative',
  },
  verificationInput: {
    position: 'absolute',
    width: '100%',
    height: 60,
    opacity: 0,
    zIndex: 1,
  },
  codeUnderlineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  codeUnderline: {
    width: 40,
    height: 60,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeUnderlineFilled: {
    borderBottomColor: '#007AFF',
  },
  codeDigit: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '400',
  },
  verifyActionsContainer: {
    marginBottom: 20,
  },
  verifyButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  verifyButtonText: {
    color: '#666',
    fontSize: 17,
    fontWeight: '600',
  },
  cantReceiveCodeButton: {
    marginTop: 12,
    padding: 8,
  },
  cantReceiveCodeButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '400',
  },
  resendContainer: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
  },
  resendButton: {
    padding: 16,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '500',
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  modalTextContainer: {
    padding: 20,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 20,
    right: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    gap: 30,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  footerLinkText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalRegularText: {
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
  },
}); 