import React, { useState } from 'react';

/**
 * Interactive, responsive SVG time-series chart
 * Displays Page Views and Unique Visitors with smooth curves and hover tooltips
 */
export const AnalyticsChart = ({ data = [], isHourly = false }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No traffic activity recorded for this period
      </div>
    );
  }

  // Find max values for scaling
  const maxViews = Math.max(...data.map((d) => d.pageViews || 0), 5);
  const maxVisitors = Math.max(...data.map((d) => d.visitors || 0), 5);
  const chartMax = Math.max(maxViews, maxVisitors) * 1.15; // 15% headroom

  const width = 800;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const pointsCount = data.length;
  const stepX = pointsCount > 1 ? innerWidth / (pointsCount - 1) : innerWidth / 2;

  // Coordinate calculators
  const getX = (index) => padding.left + (pointsCount === 1 ? innerWidth / 2 : index * stepX);
  const getY = (val) => padding.top + innerHeight - (val / chartMax) * innerHeight;

  // Generate SVG path strings
  const viewsPoints = data.map((d, i) => `${getX(i)},${getY(d.pageViews || 0)}`);
  const visitorsPoints = data.map((d, i) => `${getX(i)},${getY(d.visitors || 0)}`);

  const viewsPath = `M ${viewsPoints.join(' L ')}`;
  const visitorsPath = `M ${visitorsPoints.join(' L ')}`;

  // Area path for views gradient
  const viewsArea = `${viewsPath} L ${getX(pointsCount - 1)},${padding.top + innerHeight} L ${getX(0)},${padding.top + innerHeight} Z`;

  // Grid lines
  const gridLinesCount = 4;
  const gridValues = Array.from({ length: gridLinesCount + 1 }, (_, i) =>
    Math.round((chartMax / gridLinesCount) * i)
  );

  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* Legend & Summary */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
            <span className="font-semibold text-slate-700">Page Views</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="font-semibold text-slate-700">Unique Visitors</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Showing {data.length} {isHourly ? 'hourly' : 'daily'} intervals
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full aspect-[800/260] min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y axis labels */}
          {gridValues.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={viewsArea} fill="url(#viewsGradient)" />

          {/* Line for Page Views */}
          <path
            d={viewsPath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Line for Unique Visitors */}
          <path
            d={visitorsPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Column & Dots */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Invisible hover capture column */}
                <rect
                  x={x - stepX / 2}
                  y={padding.top}
                  width={stepX}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                />

                {/* Vertical indicator line on hover */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + innerHeight}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Point for Page Views */}
                <circle
                  cx={x}
                  cy={getY(d.pageViews || 0)}
                  r={isHovered ? 5 : 3}
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />

                {/* Point for Visitors */}
                <circle
                  cx={x}
                  cy={getY(d.visitors || 0)}
                  r={isHovered ? 5 : 3}
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />

                {/* X Axis Date/Time Label (sampled to prevent clutter) */}
                {(pointsCount <= 12 || i % Math.ceil(pointsCount / 8) === 0 || i === pointsCount - 1) && (
                  <text
                    x={x}
                    y={height - 12}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 font-medium"
                  >
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-xl text-xs border border-slate-700/80 transition-all duration-75"
          style={{
            left: `${(getX(hoveredIndex) / width) * 100}%`,
            top: '25%',
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1 text-[11px]">
            {data[hoveredIndex].timestamp}
          </div>
          <div className="flex items-center justify-between gap-4 py-0.5">
            <span className="text-blue-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Views:
            </span>
            <span className="font-bold">{data[hoveredIndex].pageViews}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-0.5">
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Visitors:
            </span>
            <span className="font-bold">{data[hoveredIndex].visitors}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;

