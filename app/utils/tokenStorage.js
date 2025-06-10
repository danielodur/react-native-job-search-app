// our-jobs/app/utils/tokenStorage.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import emailjs from 'emailjs-com';

export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('refreshToken', token);
    console.log('Token stored successfully');
  } catch (error) {
    console.error('Error storing token', error);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('refreshToken');
    if (token) {
      console.log('Token retrieved:', token);
    } else {
      console.log('No token found');
    }
    return token;
  } catch (error) {
    console.error('Error retrieving token', error);
  }
};