import React, { useMemo, useState, useRef } from 'react';
import { formatNumber } from '../../utils/formats';

const PremiumAreaChart = ({
    data = [],
    costData = [],
    labels = [],
    height = 250,
    className = ""
}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const svgRef = useRef(null);

    const chartData = useMemo(() => {
        if (!data.length) return [];
        const maxVal = Math.max(...data, ...costData, 100);
        const padding = 20;
        const availableHeight = height - padding * 2;

        return data.map((val, i) => ({
            val,
            cost: costData[i] || 0,
            label: labels[i] || '',
            x: (i / (data.length - 1)) * 100, // percentage coordinate in 0-100 scale
            y: height - padding - (val / maxVal) * availableHeight,
            costY: height - padding - ((costData[i] || 0) / maxVal) * availableHeight,
        }));
    }, [data, costData, labels, height]);

    // Function to create smooth path using Bezier curves
    const getPath = (points, key, isArea = false) => {
        if (points.length < 2) return "";

        const pathData = [];
        pathData.push(`M ${points[0].x} ${points[0][key]}`);

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            // Control points for smooth curve
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            pathData.push(`C ${cp1x} ${p0[key]}, ${cp1x} ${p1[key]}, ${p1.x} ${p1[key]}`);
        }

        if (isArea) {
            pathData.push(`V ${height} H ${points[0].x} Z`);
        }

        return pathData.join(" ");
    };

    const salesPath = getPath(chartData, 'y');
    const salesAreaPath = getPath(chartData, 'y', true);
    const costPath = getPath(chartData, 'costY');
    const costAreaPath = getPath(chartData, 'costY', true);

    return (
        <div className={`relative w-full ${className}`} style={{ height: height + 60 }}>
            <svg
                ref={svgRef}
                className="w-full h-full overflow-visible"
                viewBox={`0 0 100 ${height}`}
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {/* Grid Lines (Simple horizontal) */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                    <line
                        key={i}
                        x1="0" y1={height - (p * (height - 40)) - 20}
                        x2="100" y2={height - (p * (height - 40)) - 20}
                        stroke="rgba(0,0,0,0.05)"
                        strokeWidth="0.1"
                    />
                ))}

                {/* Cost Area and Line */}
                <path d={costAreaPath} fill="url(#costGradient)" className="transition-all duration-1000" />
                <path d={costPath} fill="none" stroke="#ef4444" strokeWidth="0.5" strokeLinecap="round" className="transition-all duration-1000" />

                {/* Sales Area and Line */}
                <path d={salesAreaPath} fill="url(#salesGradient)" className="transition-all duration-1000" />
                <path d={salesPath} fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeLinecap="round" className="transition-all duration-1000" />

                {/* Interaction Points & Markers */}
                {chartData.map((p, i) => (
                    <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                        {/* Hover line */}
                        {hoveredIndex === i && (
                            <line
                                x1={p.x} y1="0"
                                x2={p.x} y2={height}
                                stroke="rgba(0,0,0,0.1)"
                                strokeWidth="0.2"
                                strokeDasharray="1,1"
                            />
                        )}

                        {/* Data points */}
                        <circle cx={p.x} cy={p.y} r={hoveredIndex === i ? 1.2 : 0.6} fill="#60a5fa" className="transition-all duration-200" />
                        <circle cx={p.x} cy={p.costY} r={hoveredIndex === i ? 1.2 : 0.6} fill="#ef4444" className="transition-all duration-200" />

                        {/* Invisible rectangle for easier hover */}
                        <rect
                            x={p.x - 5} y="0"
                            width="10" height={height}
                            fill="transparent"
                            className="cursor-pointer"
                        />
                    </g>
                ))}
            </svg>

            {/* Labels (Months) */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                {chartData.map((p, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <span className={`text-[10px] font-bold mt-4 transition-colors ${hoveredIndex === i ? 'text-primary-400' : 'text-neutral-500'}`}>
                            {p.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Tooltip */}
            {hoveredIndex !== null && chartData[hoveredIndex] && (
                <div
                    className="absolute pointer-events-none z-50 bg-neutral-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200"
                    style={{
                        left: `${chartData[hoveredIndex].x}%`,
                        top: Math.min(chartData[hoveredIndex].y, chartData[hoveredIndex].costY) - 80,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-white/5 pb-1 mb-1">
                            {chartData[hoveredIndex].label}
                        </span>
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-[10px] text-neutral-300 font-medium">Ventas</span>
                            </div>
                            <span className="text-xs font-black text-white">${formatNumber(chartData[hoveredIndex].val)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-[10px] text-neutral-300 font-medium">Costos</span>
                            </div>
                            <span className="text-xs font-black text-white">${formatNumber(chartData[hoveredIndex].cost)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 pt-1 mt-1 border-t border-white/5">
                            <span className="text-[10px] text-neutral-400 font-medium">Utilidad</span>
                            <span className={`text-xs font-black ${chartData[hoveredIndex].val - chartData[hoveredIndex].cost >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ${formatNumber(chartData[hoveredIndex].val - chartData[hoveredIndex].cost)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute top-[-40px] right-0 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-1 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Ventas</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-1 rounded-full bg-red-500"></div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Costos</span>
                </div>
            </div>
        </div>
    );
};

export default PremiumAreaChart;
