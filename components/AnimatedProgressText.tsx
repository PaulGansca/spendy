import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { vec } from '@shopify/react-native-skia';
import { useHeaderHeight } from '@react-navigation/elements';

const { width } = Dimensions.get('window');

interface ProgressTextProps {
  spent: number;
  goal: number;
  duration: number;
}

const ProgressText: React.FC<ProgressTextProps> = ({
  spent,
  goal,
  duration,
}) => {
  const [progress, setProgress] = useState(0);
  const targetProgress = goal > 0 ? (spent / goal) * 100 : 0;

  useEffect(() => {
    if (goal === 0 || targetProgress === 0) {
      setProgress(0);
      return;
    }

    let animationFrame: number;
    const totalFrames = Math.round((duration / 1000) * 60);
    const increment = targetProgress / totalFrames;

    const animate = () => {
      setProgress((prev) => {
        if (prev >= targetProgress) {
          cancelAnimationFrame(animationFrame);
          return targetProgress;
        }
        return prev + increment;
      });
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [targetProgress, duration, goal]);

  const center = vec(width / 2, useHeaderHeight() + 32);

  return (
    <View style={styles.infoContainer}>
      <Text
        style={[
          styles.progressText,
          { position: 'absolute', top: -center.y - 20 },
        ]}
      >
        Spent {Math.round(progress)}%
      </Text>
      <Text
        style={[styles.goalText, { position: 'absolute', top: -center.y + 12 }]}
      >
        ${spent.toFixed(2)} / ${goal.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#388e3c',
  },
  goalText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ProgressText;
