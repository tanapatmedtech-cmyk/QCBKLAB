import React, { useMemo } from 'react';
import { QCResult, QCConfig } from '../types';

interface LJChartProps {
  results: QCResult[];
  config: QCConfig;
  level: 1 | 2 | 3;
}

export default function LJChart({ results, config, level }: LJChartProps) {
  const levelParams = useMemo(() => {
    if (level === 1) return config.level1;
    if (level === 2) return config.level2;
    return config.level3;
  }, [config, level]);

  if (!levelParams) return <div className="h-[300px] flex items-center justify-center text-slate-400">No parameters for this level</div>;
  
  const { mean, sd } = levelParams;
  
  const filteredResults = useMemo(() => 
    results
      .filter(r => r.level === level && r.testId === config.id)
      .slice(-30) // Last 30 points
  , [results, level, config.id]);

  const width = 600;
  const height = 300;
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  // Y-Scale: +/- 4SD
  const safeSD = Math.max(sd, mean * 0.001 || 0.1);
  const yMin = mean - 4 * safeSD;
  const yMax = mean + 4 * safeSD;
  const getY = (val: number) => {
    const range = yMax - yMin;
    if (range === 0) return padding + chartHeight / 2;
    return padding + chartHeight - ((val - yMin) / range) * chartHeight;
  };

  // X-Scale: points
  const points = Math.max(10, filteredResults.length);
  const getX = (index: number) => padding + (index / (points - 1)) * chartWidth;

  const yLines = [
    { val: mean + 3 * sd, label: '+3SD', color: '#ef4444' },
    { val: mean + 2 * sd, label: '+2SD', color: '#f59e0b' },
    { val: mean + 1 * sd, label: '+1SD', color: '#cbd5e1' },
    { val: mean, label: 'Mean', color: '#10b981' },
    { val: mean - 1 * sd, label: '-1SD', color: '#cbd5e1' },
    { val: mean - 2 * sd, label: '-2SD', color: '#f59e0b' },
    { val: mean - 3 * sd, label: '-3SD', color: '#ef4444' },
  ];

  return (
    <div className="w-full h-[350px] relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-sans select-none">
        {/* Background Grid Lines */}
        {yLines.map((line, idx) => (
          <React.Fragment key={idx}>
            <line
              x1={padding}
              y1={getY(line.val)}
              x2={width - padding}
              y2={getY(line.val)}
              stroke={line.color}
              strokeWidth={line.val === mean ? 1.5 : 1}
              strokeDasharray={line.val === mean ? "0" : "4"}
              opacity={line.val === mean ? 0.8 : 0.4}
            />
            <text
              x={padding - 5}
              y={getY(line.val)}
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize="10"
              fill={line.color}
              className="font-bold font-mono"
            >
              {line.label}
            </text>
          </React.Fragment>
        ))}

        {/* Data Line */}
        <polyline
          points={filteredResults.map((r, i) => `${getX(i)},${getY(r.value)}`).join(' ')}
          fill="none"
          stroke="#0F4C81"
          strokeWidth="2"
          strokeJoin="round"
          strokeLinecap="round"
        />

        {/* Data Points */}
        {filteredResults.map((result, i) => (
          <g key={result.id}>
            <circle
              cx={getX(i)}
              cy={getY(result.value)}
              r="4"
              className={result.westgardViolations.length > 0 ? "fill-red-500" : "fill-[#0F4C81]"}
              stroke="white"
              strokeWidth="1.5"
            />
            {/* Tooltip Hover Area (simplified) */}
            <circle
              cx={getX(i)}
              cy={getY(result.value)}
              r="10"
              fill="transparent"
              className="cursor-pointer group"
            >
              <title>{`Value: ${result.value}\nDate: ${new Date(result.date).toLocaleString()}\nRules: ${result.westgardViolations.join(', ') || 'Pass'}`}</title>
            </circle>
          </g>
        ))}
        
        {/* X Axis Labels (Dates) */}
        {filteredResults.length > 0 && [0, Math.floor(filteredResults.length/2), filteredResults.length-1].map((idx) => {
          const r = filteredResults[idx];
          if (!r) return null;
          return (
            <text
              key={idx}
              x={getX(idx)}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
            >
              {new Date(r.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
