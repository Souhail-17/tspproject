
import { Point, TSPResult, SASettings, NeighborhoodFunction } from '../types';
import { calculateDistance, calculateTotalDistance, shuffleArray } from '../utils/tspUtils';

/**
 * Nearest Neighbor Heuristic
 */
export const solveNearestNeighbor = (cities: Point[]): TSPResult => {
  if (cities.length <= 1) return { path: cities, distance: 0, iterations: 1, history: [] };

  const unvisited = [...cities];
  const path: Point[] = [];
  
  // Start with the first city
  let current = unvisited.shift()!;
  path.push(current);

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = calculateDistance(current, unvisited[0]);

    for (let i = 1; i < unvisited.length; i++) {
      const d = calculateDistance(current, unvisited[i]);
      if (d < minDistance) {
        minDistance = d;
        nearestIndex = i;
      }
    }

    current = unvisited.splice(nearestIndex, 1)[0];
    path.push(current);
  }

  return {
    path,
    distance: calculateTotalDistance(path),
    iterations: cities.length,
    history: [calculateTotalDistance(path)]
  };
};

/**
 * Neighborhood Functions
 */
const swapCities = (path: Point[]): Point[] => {
  const newPath = [...path];
  const i = Math.floor(Math.random() * newPath.length);
  let j = Math.floor(Math.random() * newPath.length);
  while (i === j) j = Math.floor(Math.random() * newPath.length);
  [newPath[i], newPath[j]] = [newPath[j], newPath[i]];
  return newPath;
};

const twoOptSwap = (path: Point[]): Point[] => {
  const n = path.length;
  let i = Math.floor(Math.random() * (n - 1));
  let j = Math.floor(Math.random() * n);
  
  if (i > j) [i, j] = [j, i];
  if (i === j) return path;

  // Reverse segment from i to j
  const newPath = [...path.slice(0, i), ...path.slice(i, j + 1).reverse(), ...path.slice(j + 1)];
  return newPath;
};

/**
 * Simulated Annealing Solver
 */
export const solveSimulatedAnnealing = (
  cities: Point[], 
  settings: SASettings,
  onUpdate?: (currentPath: Point[], bestPath: Point[], temp: number, progress: number) => void
): TSPResult => {
  if (cities.length <= 1) return { path: cities, distance: 0, iterations: 1, history: [] };

  // Initial Solution
  let currentPath = settings.initialSolutionType === 'NearestNeighbor' 
    ? solveNearestNeighbor(cities).path 
    : shuffleArray(cities);
  
  let currentDistance = calculateTotalDistance(currentPath);
  let bestPath = [...currentPath];
  let bestDistance = currentDistance;
  
  let temp = settings.initialTemp;
  const history: number[] = [currentDistance];
  let iterations = 0;

  // Neighborhood function
  const move = settings.neighborhoodFn === NeighborhoodFunction.SWAP ? swapCities : twoOptSwap;

  while (temp > 1) {
    for (let i = 0; i < settings.iterationsPerTemp; i++) {
      iterations++;
      const candidatePath = move(currentPath);
      const candidateDistance = calculateTotalDistance(candidatePath);
      
      const delta = candidateDistance - currentDistance;
      
      // Acceptance Probability: Metropolis Criterion
      if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
        currentPath = candidatePath;
        currentDistance = candidateDistance;

        if (currentDistance < bestDistance) {
          bestPath = [...currentPath];
          bestDistance = currentDistance;
        }
      }
    }
    
    history.push(bestDistance);
    temp *= settings.coolingRate;
  }

  return {
    path: bestPath,
    distance: bestDistance,
    iterations,
    history
  };
};
