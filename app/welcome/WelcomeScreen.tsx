import React, { useState, useEffect, useRef } from 'react';
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
    image: require('../../assets/images/pic1.png'),
    title: 'Welcome to JOBS',
    subtitle: 'Find your perfect match in the Job Market',
  },
  {
    image: require('../../assets/images/pic2.png'),
    title: 'Jobs that match your skills',
    subtitle: 'Not just your resume',
  },
  {
    image: require('../../assets/images/pic3.jpg'),
    title: "Don't wait for opportunity",
    subtitle: 'Find it',
  },
  {
    image: require('../../assets/images/pic4.png'),
    title: 'Careers are built on moments',
    subtitle: 'Start yours now',
  },
];

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const CAROUSEL_INTERVAL = 8000; // 8 seconds between slides
  const ANIMATION_DURATION = 1000; // 1 second for the transition

  const animateSlide = () => {
    // First fade out current slide
    Animated.timing(fadeAnim, {
      toValue: 0.7,
      duration: ANIMATION_DURATION / 2,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start(() => {
      // Then slide to next
      Animated.timing(translateX, {
        toValue: -width,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }).start(() => {
        // Reset and update index
        translateX.setValue(0);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselData.length);
        
        // Fade in the new slide
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }).start();
      });
    });
  };

  useEffect(() => {
    const interval = setInterval(animateSlide, CAROUSEL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleSeekerPress = () => {
    router.push('/(seeker)/SeekerHomeScreen');
  };

  const handleRecruiterPress = () => {
    router.push('/RecruiterScreen');
  };

  const currentItem = carouselData[currentIndex];
  const nextIndex = (currentIndex + 1) % carouselData.length;
  const nextItem = carouselData[nextIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{currentItem.title}</Text>
          <Text style={styles.subtitle}>{currentItem.subtitle}</Text>
        </View>

        <View style={styles.carouselContainer}>
          <View style={styles.slidesContainer}>
            <Animated.View 
              style={[
                styles.slideWrapper,
                {
                  transform: [{ translateX }],
                  opacity: fadeAnim,
                }
              ]}
            >
              <View style={styles.slide}>
                <View style={styles.imageContainer}>
                  <Image 
                    source={currentItem.image}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              </View>
              <View style={[styles.slide, styles.nextSlide]}>
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
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    paddingBottom: 20,
    zIndex: 10,
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
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2089dc',
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    marginTop: 20,
    width: '100%',
    gap: 16,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  blueButton: {
    backgroundColor: '#2089dc',
  },
  greenButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 