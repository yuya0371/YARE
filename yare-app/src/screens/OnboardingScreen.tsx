import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Flame, Clock, Trophy } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../theme/useTheme';

const { width } = Dimensions.get('window');

type Props = {
  onComplete: () => void;
};

const SLIDES = [
  {
    icon: 'flame',
    title: 'YAREへようこそ',
    description: '毎日1分だけ勉強して\nストリークを伸ばそう',
  },
  {
    icon: 'clock',
    title: '1日1タスクだけ',
    description: 'タイマーを回して\nひとことメモを残すだけでOK',
  },
  {
    icon: 'trophy',
    title: '継続は力なり',
    description: 'ストリークを守って\n自信をつけよう',
  },
];

const STORAGE_KEY = 'yare:onboarding_completed';

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
  } catch (e) {
    console.error('Failed to save onboarding state:', e);
  }
}

export default function OnboardingScreen({ onComplete }: Props) {
  const { colors } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const styles = createStyles(colors);

  const handleNext = async () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await markOnboardingCompleted();
      onComplete();
    }
  };

  const handleSkip = async () => {
    await markOnboardingCompleted();
    onComplete();
  };

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  const IconComponent = () => {
    const iconProps = { size: 64, color: colors.primary };
    switch (slide.icon) {
      case 'flame':
        return <Flame {...iconProps} fill={colors.primary} />;
      case 'clock':
        return <Clock {...iconProps} />;
      case 'trophy':
        return <Trophy {...iconProps} />;
      default:
        return <Flame {...iconProps} fill={colors.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Skip Button */}
        {!isLast && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>スキップ</Text>
          </TouchableOpacity>
        )}

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <IconComponent />
          </View>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {isLast ? 'はじめる' : '次へ'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof import('../theme/useTheme').useTheme>['colors']) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 16,
      paddingBottom: 40,
    },

    skipButton: {
      alignSelf: 'flex-end',
      padding: 8,
    },
    skipText: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: Platform.select({ ios: '500', android: '500' }),
    },

    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: Platform.select({ ios: '800', android: '800' }),
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    description: {
      fontSize: 17,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 26,
    },

    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 32,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: colors.primary,
      width: 24,
    },

    button: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
    },
  });
