
import { Point } from '../types';

export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const calculateTotalDistance = (path: Point[]): number => {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += calculateDistance(path[i], path[i + 1]);
  }
  // Add distance from last back to first to complete the cycle
  if (path.length > 1) {
    total += calculateDistance(path[path.length - 1], path[0]);
  }
  return total;
};

export const generateRandomCities = (count: number, width: number, height: number): Point[] => {
  const cities: Point[] = [];
  for (let i = 0; i < count; i++) {
    cities.push({
      id: crypto.randomUUID(),
      x: Math.random() * (width - 40) + 20,
      y: Math.random() * (height - 40) + 20,
      label: `City ${i + 1}`
    });
  }
  return cities;
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
