
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Point, TSPResult, SASettings, NeighborhoodFunction } from './types';
import { generateRandomCities, calculateTotalDistance, shuffleArray } from './utils/tspUtils';
import { solveNearestNeighbor } from './algorithms/heuristics';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

const App: React.FC = () => {
  const [cities, setCities] = useState<Point[]>([]);
  const [cityCount, setCityCount] = useState(20);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [bestPath, setBestPath] = useState<Point[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [stats, setStats] = useState<{distance: number; iterations: number} | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const stopRequested = useRef(false);

  const [settings, setSettings] = useState<SASettings>({
    initialTemp: 1000,
    coolingRate: 0.995,
    iterationsPerTemp: 50,
    neighborhoodFn: NeighborhoodFunction.TWO_OPT,
    initialSolutionType: 'Random'
  });

  const handleGenerate = useCallback(() => {
    const newCities = generateRandomCities(cityCount, CANVAS_WIDTH, CANVAS_HEIGHT);
    setCities(newCities);
    setCurrentPath([]);
    setBestPath([]);
    setHistory([]);
    setStats(null);
    setAiAnalysis('');
  }, [cityCount]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleAddCity = (x: number, y: number) => {
    const newCity: Point = {
      id: crypto.randomUUID(),
      x,
      y,
      label: `C${cities.length + 1}`
    };
    setCities(prev => [...prev, newCity]);
    setCityCount(prev => prev + 1);
    setCurrentPath([]);
    setBestPath([]);
    setHistory([]);
    setStats(null);
  };

  const handleClear = () => {
    setCities([]);
    setCityCount(0);
    setCurrentPath([]);
    setBestPath([]);
    setHistory([]);
    setStats(null);
  };

  const handleReset = () => {
    setCurrentPath([]);
    setBestPath([]);
    setHistory([]);
    setStats(null);
  };

  /**
   * Asynchronous Simulated Annealing to visualize progress
   */
  const runSA = async () => {
    if (cities.length < 3) return;
    setIsSolving(true);
    stopRequested.current = false;
    
    // Initial Solution
    // Fix line 91: Explicitly type 'current' and help 'shuffleArray' inference to avoid 'unknown[]'
    let current: Point[] = settings.initialSolutionType === 'NearestNeighbor' 
      ? solveNearestNeighbor(cities).path 
      : shuffleArray<Point>(cities);
    
    let currentDist = calculateTotalDistance(current);
    // Fix: Explicitly type 'best' as Point[]
    let best: Point[] = [...current];
    let bestDist = currentDist;
    
    let temp = settings.initialTemp;
    let iterations = 0;
    const localHistory: number[] = [currentDist];

    // Fix: Explicitly type 'move' function signature and its return types to prevent 'unknown[]'
    const move: (p: Point[]) => Point[] = settings.neighborhoodFn === NeighborhoodFunction.SWAP 
      ? (p: Point[]): Point[] => {
          const np = [...p];
          const i = Math.floor(Math.random() * np.length);
          let j = Math.floor(Math.random() * np.length);
          while (i === j) j = Math.floor(Math.random() * np.length);
          [np[i], np[j]] = [np[j], np[i]];
          return np;
        }
      : (p: Point[]): Point[] => {
          const n = p.length;
          let i = Math.floor(Math.random() * (n - 1));
          let j = Math.floor(Math.random() * n);
          if (i > j) [i, j] = [j, i];
          if (i === j) return p;
          return [...p.slice(0, i), ...p.slice(i, j + 1).reverse(), ...p.slice(j + 1)];
        };

    const startTime = Date.now();

    while (temp > 1 && !stopRequested.current) {
      for (let k = 0; k < settings.iterationsPerTemp; k++) {
        iterations++;
        // Fix line 122: 'move' is now explicitly typed, so candidate is Point[] instead of unknown[]
        const candidate = move(current);
        const candidateDist = calculateTotalDistance(candidate);
        const delta = candidateDist - currentDist;

        if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
          current = candidate;
          currentDist = candidateDist;
          if (currentDist < bestDist) {
            best = [...current];
            bestDist = currentDist;
          }
        }
      }

      // Update UI periodically
      if (iterations % 500 === 0) {
        setBestPath([...best]);
        setCurrentPath([...current]);
        setHistory(prev => [...prev, bestDist]);
        setStats({ distance: bestDist, iterations });
        // Tiny pause to allow React to render
        await new Promise(r => setTimeout(r, 1));
      }

      temp *= settings.coolingRate;
    }

    setBestPath(best);
    // Fix line 155: 'best' is now explicitly typed as Point[]
    setCurrentPath(best);
    setStats({ distance: bestDist, iterations });
    setIsSolving(false);
    
    analyzeResults('Simulated Annealing', {
      path: best,
      distance: bestDist,
      iterations,
      history: localHistory
    });
  };

  const runNN = () => {
    if (cities.length < 2) return;
    const result = solveNearestNeighbor(cities);
    setBestPath(result.path);
    setCurrentPath(result.path);
    setHistory([result.distance]);
    setStats({
      distance: result.distance,
      iterations: result.iterations
    });
    analyzeResults('Nearest Neighbor', result);
  };

  const analyzeResults = async (type: string, result: TSPResult) => {
    try {
      // Initialize the GoogleGenAI instance following guidelines: new GoogleGenAI({apiKey: process.env.API_KEY})
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Explain the TSP result for ${type}. 
      Cities: ${cities.length}, Distance: ${result.distance.toFixed(1)}, Iterations: ${result.iterations}. 
      Briefly mention if the parameters seem optimal for this city count.`;
      // Use ai.models.generateContent directly with model and contents parameters
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      // Extract the text content using the .text property as per guidelines
      setAiAnalysis(response.text || '');
    } catch (e) { console.error(e); }
  };

  const chartData = useMemo(() => {
    return history.map((dist, index) => ({ iteration: index, distance: Math.round(dist) }))
      .filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 100)) === 0);
  }, [history]);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              TSP Solver Pro
            </h1>
            <p className="text-slate-400 mt-1">Simulated Annealing with Real-time Path Visualization</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSolving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                <span className="text-slate-300 font-medium">{isSolving ? 'Optimizing...' : 'Ready'}</span>
             </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Visualizer 
              cities={cities}
              path={currentPath}
              bestPath={bestPath}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onAddCity={handleAddCity}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Current Best Dist</p>
                <p className="text-2xl font-mono text-blue-400">{stats ? stats.distance.toFixed(1) : '--'}</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Target Cities</p>
                <p className="text-2xl font-mono text-emerald-400">{cities.length}</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Moves</p>
                <p className="text-2xl font-mono text-amber-400">{stats ? stats.iterations.toLocaleString() : '--'}</p>
              </div>
            </div>

            {aiAnalysis && (
              <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg flex gap-3 items-start">
                <div className="bg-blue-500/20 p-2 rounded text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V12L15 15"/><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Optimizer Feedback</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{aiAnalysis}</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Controls 
              settings={settings}
              cityCount={cityCount}
              onCityCountChange={setCityCount}
              onSettingsChange={setSettings}
              onSolve={(t) => t === 'SA' ? runSA() : runNN()}
              onReset={handleReset}
              onClear={handleClear}
              onGenerate={handleGenerate}
              isSolving={isSolving}
            />

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Distance History</h3>
              <div className="h-40 w-full">
                {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="iteration" hide />
                      <YAxis domain={['auto', 'auto']} fontSize={10} stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '10px' }}
                        itemStyle={{ color: '#38bdf8' }}
                      />
                      <Line type="monotone" dataKey="distance" stroke="#38bdf8" strokeWidth={2} dot={false} animationDuration={300} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                    Start algorithm to see convergence
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
