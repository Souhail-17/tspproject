
import React from 'react';
import { NeighborhoodFunction, SASettings } from '../types';

interface ControlsProps {
  settings: SASettings;
  cityCount: number;
  onCityCountChange: (count: number) => void;
  onSettingsChange: (settings: SASettings) => void;
  onSolve: (type: 'SA' | 'NN') => void;
  onReset: () => void;
  onClear: () => void;
  onGenerate: () => void;
  isSolving: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  settings, 
  cityCount, 
  onCityCountChange, 
  onSettingsChange, 
  onSolve, 
  onReset, 
  onClear, 
  onGenerate,
  isSolving 
}) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Problem Setup</h3>
        
        {/* City Count Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
            <span>Number of Cities</span>
            <span className="text-blue-400 font-mono">{cityCount}</span>
          </label>
          <input 
            type="range"
            min="5"
            max="100"
            step="1"
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            value={cityCount}
            onChange={(e) => onCityCountChange(Number(e.target.value))}
            disabled={isSolving}
          />
          <button
            onClick={onGenerate}
            disabled={isSolving}
            className="mt-3 w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold py-1.5 rounded transition-all border border-slate-600"
          >
            Regenerate Random Cities
          </button>
        </div>

        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider pt-4">Algorithm Settings</h3>
        
        {/* Neighborhood Function */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Neighborhood Move</label>
          <select 
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-200"
            value={settings.neighborhoodFn}
            onChange={(e) => onSettingsChange({ ...settings, neighborhoodFn: e.target.value as NeighborhoodFunction })}
            disabled={isSolving}
          >
            <option value={NeighborhoodFunction.TWO_OPT}>2-Opt (Paths Reversal)</option>
            <option value={NeighborhoodFunction.SWAP}>Simple Swap (Two Cities)</option>
          </select>
        </div>

        {/* Temperature Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Start Temp</label>
            <input 
              type="number"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-200"
              value={settings.initialTemp}
              onChange={(e) => onSettingsChange({ ...settings, initialTemp: Number(e.target.value) })}
              disabled={isSolving}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Cooling Rate</label>
            <input 
              type="number"
              step="0.001"
              min="0.8"
              max="0.999"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-200"
              value={settings.coolingRate}
              onChange={(e) => onSettingsChange({ ...settings, coolingRate: Number(e.target.value) })}
              disabled={isSolving}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-700 space-y-3">
        <button
          onClick={() => onSolve('SA')}
          disabled={isSolving}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
        >
          {isSolving ? (
             <>
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               <span>Annealing...</span>
             </>
          ) : 'Run Simulated Annealing'}
        </button>
        
        <button
          onClick={() => onSolve('NN')}
          disabled={isSolving}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2.5 rounded-lg transition-all"
        >
          Quick Nearest Neighbor
        </button>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onReset}
            disabled={isSolving}
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Reset Solution
          </button>
          <button
            onClick={onClear}
            disabled={isSolving}
            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Clear Cities
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
