
export interface Point {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface TSPResult {
  path: Point[];
  distance: number;
  iterations: number;
  history: number[]; // History of distances
}

export enum AlgorithmType {
  NEAREST_NEIGHBOR = 'Nearest Neighbor',
  SIMULATED_ANNEALING = 'Simulated Annealing'
}

export enum NeighborhoodFunction {
  SWAP = 'Swap',
  TWO_OPT = '2-Opt'
}

export interface SASettings {
  initialTemp: number;
  coolingRate: number;
  iterationsPerTemp: number;
  neighborhoodFn: NeighborhoodFunction;
  initialSolutionType: 'Random' | 'NearestNeighbor';
}
