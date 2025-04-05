import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Animated,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const carouselData = [
  {
    image: require('../assets/images/pic1.png'),
    title: 'Welcome to Our Jobs',
    subtitle: 'Find your perfect match in the job market',
  },
  {
    image: require('../assets/images/pic2.png'),
    title: 'Your dream job is just a match away',
    subtitle: '',
  },
  {
    image: require('../assets/images/pic3.png'),
    title: 'Unlock opportunities, build your future',
    subtitle: '',
  },
];

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useState(new Animated.Value(0))[0];
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(translateX, {
        toValue: -width,
        duration: 2500,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start(() => {
        translateX.setValue(0);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselData.length);
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleSeekerPress = () => {
    router.push('/(seeker)/SeekerHomeScreen' as any);
  };

  const handleRecruiterPress = () => {
    router.push('/RecruiterScreen' as any);
  };

  const currentItem = carouselData[currentIndex];
  const nextIndex = (currentIndex + 1) % carouselData.length;
  const nextItem = carouselData[nextIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <View style={styles.carouselContainer}>
          <View style={styles.slidesContainer}>
            <Animated.View 
              style={[
                styles.slideWrapper,
                {
                  transform: [{ translateX }],
                }
              ]}
            >
              <View style={styles.slide}>
                <View style={styles.textOverlay}>
                  <Text style={styles.title}>{currentItem.title}</Text>
                  {currentItem.subtitle && (
                    <Text style={styles.subtitle}>{currentItem.subtitle}</Text>
                  )}
                </View>
                <View style={styles.imageContainer}>
                  <Image 
                    source={currentItem.image}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              </View>
              <View style={[styles.slide, styles.nextSlide]}>
                <View style={styles.textOverlay}>
                  <Text style={styles.title}>{nextItem.title}</Text>
                  {nextItem.subtitle && (
                    <Text style={styles.subtitle}>{nextItem.subtitle}</Text>
                  )}
                </View>
                <View style={styles.imageContainer}>
                  <Image 
                    source={nextItem.image}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </Animated.View>
          </View>

          <View style={styles.pagination}>
            {carouselData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { opacity: currentIndex === index ? 1 : 0.3 }
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.blueButton]} 
            onPress={handleSeekerPress}
          >
            <Text style={styles.buttonText}>Looking to work</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.greenButton]} 
            onPress={handleRecruiterPress}
          >
            <Text style={styles.buttonText}>Looking to hire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  carouselContainer: {
    flex: 1,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  slidesContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  slideWrapper: {
    flex: 1,
    flexDirection: 'row',
    width: width * 2,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#fff',
  },
  nextSlide: {
    position: 'absolute',
    left: width,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: width,
    height: width * 1.1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    resizeMode: 'cover',
  },
  textOverlay: {
    width: width - 40,
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 40,
    width: '100%',
  },
  button: {
    width: '48%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueButton: {
    backgroundColor: '#007AFF',
  },
  greenButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 