import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { vec } from '@shopify/react-native-skia';
import { useHeaderHeight } from '@react-navigation/elements';

const { width } = Dimensions.get('window');

interface ProgressTextProps {
  spent: number;
  goal: number;
  duration: number; // Animation duration in milliseconds
}

const ProgressText: React.FC<ProgressTextProps> = ({
  spent,
  goal,
  duration,
}) => {
  const [progress, setProgress] = useState(0); // Track animation progress
  const targetProgress = (spent / goal) * 100; // Allow progress to go beyond 100%

  useEffect(() => {
    let animationFrame: number;
    const totalFrames = Math.round((duration / 1000) * 60); // Assuming 60 FPS
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

    return () => cancelAnimationFrame(animationFrame); // Clean up on unmount
  }, [targetProgress, duration]);
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
