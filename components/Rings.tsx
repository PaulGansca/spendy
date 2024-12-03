import { Canvas, Fill, vec } from '@shopify/react-native-skia';
import React from 'react';
import { Dimensions } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ring } from './Ring';

const { width } = Dimensions.get('window');

export const { PI } = Math;
export const TAU = 2 * PI;
export const SIZE = width;
export const strokeWidth = 40;
export const RING_SIZE = SIZE - strokeWidth * 4;

const color = (r: number, g: number, b: number) =>
  `rgb(${r * 255}, ${g * 255}, ${b * 255})`;

export const Rings = ({
  duration,
  spent,
  goal,
  startAnimation, // New prop to control animation start
}: {
  duration: number;
  spent: number;
  goal: number;
  startAnimation: boolean; // Add this prop
}) => {
  const center = vec(width / 2, useHeaderHeight() + 32);

  const totalProgress = spent / goal;

  const rings = [
    {
      totalProgress,
      colors: [color(0.008, 1, 0.659), color(0, 0.847, 1)],
      background: color(0.016, 0.227, 0.212),
      size: SIZE - strokeWidth * 4,
    },
  ];

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#f5f5f5" />
      {rings.map((ring, index) => (
        <Ring
          key={index}
          ring={ring}
          center={center}
          strokeWidth={strokeWidth}
          duration={duration}
          startAnimation={startAnimation} // Pass the startAnimation prop
        />
      ))}
    </Canvas>
  );
};
