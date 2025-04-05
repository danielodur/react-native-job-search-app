import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SlidingPuzzleCaptchaProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);
const PUZZLE_HEIGHT = 160;
const SLIDER_WIDTH = 50;
const TRACK_WIDTH = MODAL_WIDTH - 40;

export default function SlidingPuzzleCaptcha({
  visible,
  onClose,
  onSuccess,
}: SlidingPuzzleCaptchaProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [sliderPosition] = useState(new Animated.Value(0));
  const [isVerified, setIsVerified] = useState(false);
  const [puzzleOffset] = useState(Math.floor(Math.random() * (TRACK_WIDTH - 140)) + 70);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const loadingTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      setIsVerified(false);
      sliderPosition.setValue(0);
      loadingTimer.current = setTimeout(() => {
        setIsLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 1500);
    }
    return () => {
      if (loadingTimer.current) {
        clearTimeout(loadingTimer.current);
      }
    };
  }, [visible]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isLoading && !isVerified,
    onMoveShouldSetPanResponder: () => !isLoading && !isVerified,
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(gestureState.dx, TRACK_WIDTH - SLIDER_WIDTH));
      sliderPosition.setValue(newPosition);
    },
    onPanResponderRelease: (_, gestureState) => {
      const finalPosition = Math.max(0, Math.min(gestureState.dx, TRACK_WIDTH - SLIDER_WIDTH));
      
      if (Math.abs(finalPosition - puzzleOffset) < 10) {
        setIsVerified(true);
        Animated.spring(sliderPosition, {
          toValue: puzzleOffset,
          useNativeDriver: true,
        }).start();
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        Animated.spring(sliderPosition, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const sliderStyle = {
    transform: [{ translateX: sliderPosition }],
  };

  const puzzlePieceStyle = {
    transform: [{ translateX: sliderPosition }],
  };

  const contentOpacity = {
    opacity: fadeAnim,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Security Verification</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#45B7D1" />
              <Text style={styles.loadingText}>Generating verification...</Text>
            </View>
          ) : (
            <Animated.View style={[styles.captchaContent, contentOpacity]}>
              <View style={styles.puzzleContainer}>
                <Image
                  source={{ uri: 'https://picsum.photos/800/400' }}
                  style={styles.puzzleImage}
                  onLoad={() => setImageLoaded(true)}
                />
                <Animated.View 
                  style={[
                    styles.puzzlePiece, 
                    puzzlePieceStyle,
                    { opacity: imageLoaded ? 1 : 0 }
                  ]} 
                />
                <View 
                  style={[
                    styles.puzzleTarget, 
                    { left: puzzleOffset },
                    { opacity: imageLoaded ? 1 : 0 }
                  ]} 
                />
              </View>

              <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack} />
                <Animated.View
                  style={[styles.slider, sliderStyle]}
                  {...panResponder.panHandlers}
                >
                  <Ionicons 
                    name={isVerified ? "checkmark" : "arrow-forward"} 
                    size={24} 
                    color={isVerified ? "#4CAF50" : "#666"} 
                  />
                </Animated.View>
              </View>

              <Text style={styles.instruction}>
                {isVerified ? "Verification successful" : "Slide to complete the puzzle"}
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: MODAL_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  captchaContent: {
    opacity: 0,
  },
  puzzleContainer: {
    height: PUZZLE_HEIGHT,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  puzzleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  puzzlePiece: {
    position: 'absolute',
    top: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(69, 183, 209, 0.8)',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  puzzleTarget: {
    position: 'absolute',
    top: 20,
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 4,
  },
  sliderContainer: {
    height: 40,
    marginBottom: 16,
    position: 'relative',
  },
  sliderTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  slider: {
    position: 'absolute',
    width: SLIDER_WIDTH,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});