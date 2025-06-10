import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth';

export default function SeekerResumeOptimization() {
  const router = useRouter();
  const { user, profile, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [editingValue, setEditingValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check authentication status
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);

  // If auth is loading, show loading spinner
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // If no user is logged in, return null (useEffect will handle navigation)
  if (!user) {
    return null;
  }

  const handleBack = () => {
    if (isEditing) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setIsEditing(false);
              setEditingField('');
              setEditingValue('');
              router.back();
            }
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const handlePreview = () => {
    Alert.alert(
      'Preview',
      'Resume preview feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleCheckDetails = () => {
    Alert.alert(
      'Resume Score Details',
      'Your resume score is calculated based on completeness and optimization of your profile. Add more details to improve your score.',
      [{ text: 'OK' }]
    );
  };

  const handleEditPersonalInfo = () => {
    Alert.alert(
      'Edit Personal Info',
      'Would you like to edit your personal information?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Edit',
          onPress: () => {
            try {
              router.push('/(seeker)/seeker-profile');
            } catch (error) {
              Alert.alert('Error', 'Unable to open profile editor. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleJobStatus = () => {
    setIsEditing(true);
    setEditingField('job_status');
    setEditingValue(profile?.job_status || 'Available - Ready to start');
  };

  const handleEditAdvantages = () => {
    setIsEditing(true);
    setEditingField('advantages');
    setEditingValue(profile?.advantages || '');
  };

  const handleAddJobExpectation = () => {
    Alert.alert(
      'Add Job Expectation',
      'Enter job title and expected salary',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            try {
              // Here you would normally add the job expectation
              Alert.alert('Success', 'Job expectation added successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to add job expectation');
            }
          }
        }
      ]
    );
  };

  const handleAddWorkExperience = () => {
    Alert.alert(
      'Add Work Experience',
      'Enter company name and position',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            try {
              // Here you would normally add the work experience
              Alert.alert('Success', 'Work experience added successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to add work experience');
            }
          }
        }
      ]
    );
  };

  const handleAddEducation = () => {
    Alert.alert(
      'Add Education',
      'Enter school name and degree',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            try {
              // Here you would normally add the education
              Alert.alert('Success', 'Education added successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to add education');
            }
          }
        }
      ]
    );
  };

  const handleSaveEdit = async () => {
    if (!editingValue.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }

    try {
      setIsUpdating(true);
      await updateProfile({ [editingField]: editingValue.trim() });
      Alert.alert('Success', 'Updated successfully');
      setIsEditing(false);
      setEditingField('');
      setEditingValue('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateAttachment = () => {
    Alert.alert(
      'Generate Resume',
      'Generate a PDF version of your resume',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate',
          onPress: async () => {
            try {
              Alert.alert(
                'Processing',
                'Your resume is being generated. This may take a moment.',
                [{ text: 'OK' }]
              );
              // Here you would add the actual resume generation logic
              setTimeout(() => {
                Alert.alert(
                  'Success',
                  'Your resume has been generated and is ready for download.',
                  [{ text: 'OK' }]
                );
              }, 2000);
            } catch (error) {
              Alert.alert('Error', 'Failed to generate resume. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderEditingView = () => {
    if (!isEditing) return null;

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.editingOverlay}
      >
        <View style={styles.editingContainer}>
          <Text style={styles.editingTitle}>
            {editingField === 'job_status' ? 'Edit Job Status' : 'Edit Advantages'}
          </Text>
          <TextInput
            style={[
              styles.editingInput,
              editingField === 'advantages' && styles.editingInputMultiline
            ]}
            value={editingValue}
            onChangeText={setEditingValue}
            multiline={editingField === 'advantages'}
            placeholder="Enter your text here"
            placeholderTextColor="#666"
            editable={!isUpdating}
          />
          <View style={styles.editingButtons}>
            <TouchableOpacity 
              style={styles.editingButton}
              onPress={() => {
                if (isUpdating) return;
                Alert.alert(
                  'Discard Changes',
                  'Are you sure you want to discard your changes?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Discard',
                      style: 'destructive',
                      onPress: () => {
                        setIsEditing(false);
                        setEditingField('');
                        setEditingValue('');
                      }
                    }
                  ]
                );
              }}
              disabled={isUpdating}
            >
              <Text style={[styles.editingButtonText, isUpdating && styles.editingButtonTextDisabled]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.editingButton,
                styles.editingButtonSave,
                isUpdating && styles.editingButtonDisabled
              ]}
              onPress={handleSaveEdit}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.editingButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Online Resume</Text>
        <TouchableOpacity onPress={handlePreview} style={styles.previewButton}>
          <Text style={styles.previewText}>Preview</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Resume Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40' }}
              style={styles.botIcon}
            />
            <Text style={styles.scoreText}>Resume Professional Score: 40</Text>
          </View>
          <TouchableOpacity style={styles.checkButton} onPress={handleCheckDetails}>
            <Text style={styles.checkButtonText}>Check Details</Text>
          </TouchableOpacity>
        </View>

        {/* Optimization Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Resume Optimization Pending</Text>
          <View style={styles.noticeItem}>
            <Text style={styles.noticeHighlight}>Optimization</Text>
            <Text style={styles.noticeText}>Beijing Red-Yellow-Blue Kindergarten</Text>
            <Text style={styles.noticeSubtext}>Missing industry information</Text>
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Brian Dany</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditPersonalInfo}>
              <Ionicons name="create-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Image
              source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            <View style={styles.infoText}>
              <Text style={styles.infoLine}>5 years experience • 32 years • Bachelor's</Text>
              <Text style={styles.infoLine}>Phone: {profile?.phone || '159******06'}</Text>
              <Text style={styles.infoLine}>WeChat: {profile?.wechat || 'dan*******92'}</Text>
            </View>
          </View>
        </View>

        {/* Job Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Job Status</Text>
            <TouchableOpacity onPress={handleJobStatus}>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.statusText}>{profile?.job_status || 'Available - Ready to start'}</Text>
        </View>

        {/* Personal Advantages */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Advantages</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditAdvantages}>
              <Ionicons name="create-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.advantagesText}>
            {profile?.advantages || 'I am professional, patient and energetic. I love working with children and enjoy collaborating with colleagues. Rich in experience.'}
          </Text>
        </View>

        {/* Job Expectations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Job Expectations</Text>
            <TouchableOpacity onPress={handleAddJobExpectation}>
              <Ionicons name="add" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.jobItem}>
            <Text style={styles.jobTitle}>English Teacher 10-11K</Text>
            <Text style={styles.jobLocation}>Weifang</Text>
            <Text style={styles.jobIndustry}>Industry not specified</Text>
          </View>
          <View style={styles.jobItem}>
            <Text style={styles.jobTitle}>Early Education 8-13K</Text>
            <Text style={styles.jobLocation}>Weifang</Text>
            <Text style={styles.jobIndustry}>Industry not specified</Text>
          </View>
        </View>

        {/* Work Experience */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            <TouchableOpacity onPress={handleAddWorkExperience}>
              <Ionicons name="add" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.workItem}>
            <View style={styles.workHeader}>
              <Text style={styles.workTitle}>Beijing Red-Yellow-Blue Kindergarten</Text>
              <Text style={styles.workDate}>2019.03-2020.02</Text>
            </View>
            <Text style={styles.workPosition}>Early Education</Text>
            <Text style={styles.workDescription}>
              Play with kids, learn while having fun, indoor and outdoor activities, English corners...
            </Text>
            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Teacher Certification</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Early Education Teacher</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>English Teacher</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Education</Text>
            <TouchableOpacity onPress={handleAddEducation}>
              <Ionicons name="add" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.eduItem}>
            <View style={styles.eduHeader}>
              <Text style={styles.eduSchool}>YMCA, Makerere University, Fujian University</Text>
              <Text style={styles.eduDate}>2014-2018</Text>
            </View>
            <Text style={styles.eduDegree}>Bachelor's • Computer Science, Teacher Certification</Text>
          </View>
        </View>

        {/* Generate Resume Button */}
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateAttachment}
        >
          <Ionicons name="document-outline" size={24} color="#007AFF" />
          <Text style={styles.generateText}>Generate Resume Attachment</Text>
          <Ionicons name="menu" size={24} color="#666" />
        </TouchableOpacity>
      </ScrollView>

      {renderEditingView()}
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  previewButton: {
    padding: 5,
  },
  previewText: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  scoreCard: {
    backgroundColor: '#1a1a1a',
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  botIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  scoreText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  checkButton: {
    alignSelf: 'flex-end',
  },
  checkButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  noticeCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
  },
  noticeTitle: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 10,
  },
  noticeItem: {
    marginTop: 5,
  },
  noticeHighlight: {
    color: '#007AFF',
    fontSize: 14,
    marginBottom: 5,
  },
  noticeText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  noticeSubtext: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    padding: 5,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  infoText: {
    flex: 1,
  },
  infoLine: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  statusText: {
    color: '#666',
    fontSize: 16,
  },
  advantagesText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  jobItem: {
    marginBottom: 15,
  },
  jobTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  jobLocation: {
    color: '#666',
    fontSize: 14,
    marginBottom: 3,
  },
  jobIndustry: {
    color: '#666',
    fontSize: 14,
  },
  workItem: {
    marginBottom: 15,
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  workTitle: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  workDate: {
    color: '#666',
    fontSize: 14,
  },
  workPosition: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  workDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#666',
    fontSize: 12,
  },
  eduItem: {
    marginBottom: 15,
  },
  eduHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  eduSchool: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  eduDate: {
    color: '#666',
    fontSize: 14,
  },
  eduDegree: {
    color: '#666',
    fontSize: 14,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 15,
    marginBottom: 30,
    borderRadius: 12,
    padding: 15,
  },
  generateText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  editingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editingContainer: {
    backgroundColor: '#1a1a1a',
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  editingTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  editingInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editingInputMultiline: {
    minHeight: 150,
  },
  editingButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  editingButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  editingButtonSave: {
    backgroundColor: '#007AFF',
  },
  editingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  editingButtonDisabled: {
    opacity: 0.5,
  },
  editingButtonTextDisabled: {
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#666',
    marginTop: 10,
    fontSize: 16,
  },
}); 