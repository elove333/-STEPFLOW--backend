import { IMovementData } from '../types';

interface MetricsInput {
  startTime: Date;
  endTime: Date;
  steps: number;
  distance: number;
  movementData: IMovementData[];
}

interface MetricsOutput {
  duration: number;
  avgPace: number;
  calories: number;
  avgCadence: number;
  avgSpeed: number;
}

export const processMetrics = (input: MetricsInput): MetricsOutput => {
  const { startTime, endTime, steps, distance, movementData } = input;

  // Calculate duration in seconds
  const duration = (endTime.getTime() - startTime.getTime()) / 1000;

  // Calculate average pace (minutes per kilometer)
  // If distance is in meters, convert to kilometers
  const distanceKm = distance / 1000;
  const durationMin = duration / 60;
  const avgPace = distanceKm > 0 ? durationMin / distanceKm : 0;

  // Estimate calories burned (rough calculation)
  // Formula: calories = steps * 0.04 (approximate)
  const calories = Math.round(steps * 0.04);

  // Calculate average cadence and speed from movement data
  let avgCadence = 0;
  let avgSpeed = 0;

  if (movementData && movementData.length > 0) {
    const totalCadence = movementData.reduce((sum, data) => sum + data.cadence, 0);
    const totalSpeed = movementData.reduce((sum, data) => sum + data.speed, 0);
    
    avgCadence = totalCadence / movementData.length;
    avgSpeed = totalSpeed / movementData.length;
  } else {
    // Fallback: calculate from total values
    avgSpeed = distance / duration; // meters per second
    avgCadence = steps / durationMin; // steps per minute
  }

  return {
    duration,
    avgPace,
    calories,
    avgCadence,
    avgSpeed,
  };
};

export const calculateCalories = (steps: number, distance: number, duration: number): number => {
  // More sophisticated calorie calculation
  // Based on steps, distance, and duration
  const baseCalories = steps * 0.04;
  const distanceFactor = (distance / 1000) * 50; // 50 calories per km
  const durationFactor = (duration / 3600) * 100; // 100 calories per hour
  
  return Math.round((baseCalories + distanceFactor + durationFactor) / 3);
};

export const analyzePerformance = (avgPace: number, avgCadence: number): string => {
  let performance = 'Good';

  // Ideal pace: 5-7 minutes per km
  // Ideal cadence: 160-180 steps per minute

  if (avgPace < 5 || avgPace > 8) {
    performance = 'Needs Improvement';
  } else if (avgPace >= 5 && avgPace <= 6) {
    performance = 'Excellent';
  }

  if (avgCadence < 140 || avgCadence > 200) {
    performance = performance === 'Excellent' ? 'Good' : 'Needs Improvement';
  }

  return performance;
};
