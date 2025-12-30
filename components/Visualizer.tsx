
import React from 'react';
import { Point } from '../types';

interface VisualizerProps {
  cities: Point[];
  path: Point[];
  bestPath: Point[];
  width: number;
  height: number;
  onAddCity: (x: number, y: number) => void;
}

const Visualizer: React.FC<VisualizerProps> = ({ cities, path, bestPath, width, height, onAddCity }) => {
  const padding = 40;
  
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Allow adding cities only if they are within the "plot" area
    if (x >= padding && x <= width - padding && y >= padding && y <= height - padding) {
      onAddCity(x, y);
    }
  };

  // Generate grid lines
  const gridLines = [];
  for (let i = padding; i <= width - padding; i += (width - 2 * padding) / 10) {
    gridLines.push(<line key={`v-${i}`} x1={i} y1={padding} x2={i} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />);
  }
  for (let i = padding; i <= height - padding; i += (height - 2 * padding) / 10) {
    gridLines.push(<line key={`h-${i}`} x1={padding} y1={i} x2={width - padding} y2={i} stroke="#e2e8f0" strokeWidth="1" />);
  }

  return (
    <div className="relative w-full aspect-video bg-white rounded-sm overflow-hidden shadow-inner border-2 border-slate-300">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-slate-800 font-bold text-sm z-10">
        Traveling Salesman Problem - Path Visualization (Matplotlib Style)
      </div>
      
      <svg 
        className="w-full h-full cursor-crosshair bg-slate-50"
        viewBox={`0 0 ${width} ${height}`}
        onClick={handleClick}
      >
        {/* Plotting Area Background */}
        <rect x={padding} y={padding} width={width - 2 * padding} height={height - 2 * padding} fill="white" stroke="#334155" strokeWidth="1.5" />
        
        {/* Grid */}
        {gridLines}

        {/* Axes Labels (Simplified) */}
        <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="12" fill="#475569">X Coordinate</text>
        <text x={10} y={height / 2} textAnchor="middle" fontSize="12" fill="#475569" transform={`rotate(-90, 10, ${height / 2})`}>Y Coordinate</text>

        {/* Candidate Path (Current Search) */}
        {path.length > 1 && path !== bestPath && (
          <g>
            {path.map((city, idx) => {
              const nextCity = path[(idx + 1) % path.length];
              return (
                <line
                  key={`candidate-${idx}`}
                  x1={city.x}
                  y1={city.y}
                  x2={nextCity.x}
                  y2={nextCity.y}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
              );
            })}
          </g>
        )}

        {/* Best Path Found So Far */}
        {bestPath.length > 1 && (
          <g>
            {bestPath.map((city, idx) => {
              const nextCity = bestPath[(idx + 1) % bestPath.length];
              return (
                <line
                  key={`best-${idx}`}
                  x1={city.x}
                  y1={city.y}
                  x2={nextCity.x}
                  y2={nextCity.y}
                  stroke="#1d4ed8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        )}

        {/* Cities (Scatter Plot markers) */}
        {cities.map((city) => (
          <circle
            key={city.id}
            cx={city.x}
            cy={city.y}
            r="4"
            fill="#ef4444"
            stroke="white"
            strokeWidth="1"
          />
        ))}

        {cities.length === 0 && (
          <text x="50%" y="50%" textAnchor="middle" fill="#94a3b8" fontSize="14">
            Click inside the box to add cities
          </text>
        )}
      </svg>
      
      <div className="absolute top-4 right-4 flex flex-col gap-1">
         <div className="flex items-center gap-2 bg-white/90 p-1 px-2 border border-slate-200 rounded text-[10px] text-slate-700 font-mono shadow-sm">
            <div className="w-3 h-0.5 bg-blue-700"></div> Best Tour
         </div>
         <div className="flex items-center gap-2 bg-white/90 p-1 px-2 border border-slate-200 rounded text-[10px] text-slate-700 font-mono shadow-sm">
            <div className="w-2 h-2 rounded-full bg-red-500"></div> Cities
         </div>
      </div>
    </div>
  );
};

export default Visualizer;
