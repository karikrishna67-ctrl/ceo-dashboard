import React, { useId, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { formatCurrency } from '../../lib/formatters';
import { CurrencyCode } from '../../types';

export interface D3SparklineProps {
  data?: number[];
  width?: number;
  height?: number;
  isPositive?: boolean;
  colorVariant?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'teal' | 'blue' | 'auto';
  showArea?: boolean;
  showEndDot?: boolean;
  currency?: CurrencyCode;
  unit?: string;
  className?: string;
  label?: string;
}

export const D3Sparkline: React.FC<D3SparklineProps> = ({
  data,
  width = 68,
  height = 24,
  isPositive = true,
  colorVariant = 'auto',
  showArea = true,
  showEndDot = true,
  currency = 'INR',
  unit,
  className = '',
  label = '30d Trend',
}) => {
  const gradientId = useId().replace(/:/g, '_');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Ensure 30 data points
  const points = useMemo(() => {
    if (data && data.length >= 2) return data;
    // Fallback default 30-day points
    return [
      10, 11, 10.5, 12, 11.8, 13, 12.5, 14, 13.8, 15,
      14.5, 16, 15.8, 17, 16.5, 18, 17.5, 19, 18.8, 20,
      19.5, 21, 20.8, 22, 21.5, 23, 22.8, 24, 23.5, 25
    ];
  }, [data]);

  // Color palettes
  const colorMap = {
    emerald: {
      stroke: '#059669', // emerald-600
      fillStart: 'rgba(16, 185, 129, 0.35)', // emerald-500
      fillEnd: 'rgba(16, 185, 129, 0.0)',
      dot: '#047857',
    },
    teal: {
      stroke: '#0d9488', // teal-600
      fillStart: 'rgba(20, 184, 166, 0.35)',
      fillEnd: 'rgba(20, 184, 166, 0.0)',
      dot: '#0f766e',
    },
    indigo: {
      stroke: '#4f46e5', // indigo-600
      fillStart: 'rgba(99, 102, 241, 0.35)',
      fillEnd: 'rgba(99, 102, 241, 0.0)',
      dot: '#4338ca',
    },
    purple: {
      stroke: '#9333ea', // purple-600
      fillStart: 'rgba(168, 85, 247, 0.35)',
      fillEnd: 'rgba(168, 85, 247, 0.0)',
      dot: '#7e22ce',
    },
    blue: {
      stroke: '#2563eb', // blue-600
      fillStart: 'rgba(59, 130, 246, 0.35)',
      fillEnd: 'rgba(59, 130, 246, 0.0)',
      dot: '#1d4ed8',
    },
    amber: {
      stroke: '#d97706', // amber-600
      fillStart: 'rgba(245, 158, 11, 0.35)',
      fillEnd: 'rgba(245, 158, 11, 0.0)',
      dot: '#b45309',
    },
    rose: {
      stroke: '#e11d48', // rose-600
      fillStart: 'rgba(244, 63, 94, 0.35)',
      fillEnd: 'rgba(244, 63, 94, 0.0)',
      dot: '#be123c',
    },
  };

  const selectedColor = (() => {
    if (colorVariant !== 'auto' && colorMap[colorVariant]) {
      return colorMap[colorVariant];
    }
    return isPositive ? colorMap.emerald : colorMap.rose;
  })();

  // D3 calculations
  const { linePath, areaPath, lastPoint, coords } = useMemo(() => {
    const margin = { top: 3, right: 4, bottom: 3, left: 3 };
    const innerWidth = Math.max(10, width - margin.left - margin.right);
    const innerHeight = Math.max(6, height - margin.top - margin.bottom);

    const minVal: number = points.length > 0 ? Math.min(...points) : 0;
    const maxVal: number = points.length > 0 ? Math.max(...points) : 100;
    // Add small buffer to avoid clipping flat lines
    const yBuffer: number = maxVal === minVal ? 1 : (maxVal - minVal) * 0.1;

    const xScale = d3
      .scaleLinear()
      .domain([0, points.length - 1])
      .range([margin.left, margin.left + innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([minVal - yBuffer, maxVal + yBuffer])
      .range([margin.top + innerHeight, margin.top]);

    const lineGenerator = d3
      .line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3
      .area<number>()
      .x((_, i) => xScale(i))
      .y0(margin.top + innerHeight)
      .y1((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    const lPath = lineGenerator(points) || '';
    const aPath = areaGenerator(points) || '';

    const allCoords = points.map((val, idx) => ({
      x: xScale(idx),
      y: yScale(val),
      val,
    }));

    const last = allCoords[allCoords.length - 1] || { x: width - 4, y: height / 2, val: 0 };

    return { linePath: lPath, areaPath: aPath, lastPoint: last, coords: allCoords };
  }, [points, width, height]);

  const activePoint = hoveredIdx !== null && coords[hoveredIdx] ? coords[hoveredIdx] : null;

  const formatVal = (v: number) => {
    if (unit) return `${v.toLocaleString()} ${unit}`;
    const currCode: CurrencyCode = (currency as CurrencyCode) || 'INR';
    return formatCurrency(v, currCode);
  };

  return (
    <div
      className={`relative inline-flex items-center group/sparkline cursor-crosshair ${className}`}
      style={{ width, height }}
      onMouseLeave={() => setHoveredIdx(null)}
      title={`${label}: Last 30 Days Trend`}
    >
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          // Find closest point index
          let closestIdx = 0;
          let minDistance = Infinity;
          coords.forEach((pt, idx) => {
            const dist = Math.abs(pt.x - mouseX);
            if (dist < minDistance) {
              minDistance = dist;
              closestIdx = idx;
            }
          });
          setHoveredIdx(closestIdx);
        }}
      >
        <defs>
          <linearGradient id={`spark-grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={selectedColor.fillStart} />
            <stop offset="100%" stopColor={selectedColor.fillEnd} />
          </linearGradient>
        </defs>

        {/* D3 Area Fill */}
        {showArea && areaPath && (
          <path d={areaPath} fill={`url(#spark-grad-${gradientId})`} />
        )}

        {/* D3 Stroke Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={selectedColor.stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* End-point Glowing Dot */}
        {showEndDot && !activePoint && (
          <g>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={3}
              fill={selectedColor.dot}
              className="animate-pulse"
            />
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={1.5}
              fill="#ffffff"
            />
          </g>
        )}

        {/* Active Hover Point & Crosshair line */}
        {activePoint && (
          <g>
            <line
              x1={activePoint.x}
              y1={2}
              x2={activePoint.x}
              y2={height - 2}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r={3.5}
              fill={selectedColor.dot}
              stroke="#ffffff"
              strokeWidth={1.5}
            />
          </g>
        )}
      </svg>

      {/* Micro Hover Tooltip */}
      {activePoint && hoveredIdx !== null && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold font-mono-numeric px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-30 flex items-center gap-1">
          <span className="text-slate-400">D{hoveredIdx + 1}:</span>
          <span>{formatVal(activePoint.val)}</span>
        </div>
      )}
    </div>
  );
};
