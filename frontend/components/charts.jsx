"use client";
import { useState, useEffect, useRef } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Label,
  Sector,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  allocationData,
  candles,
  livePriceSeries,
  performanceData,
  stockIntradayMerged,
} from "@/lib/portfolio-data";

const tooltipStyle = {
  background: "rgba(7, 10, 18, 0.92)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: 8,
  color: "#fff",
};

export function Sparkline() {
  return (
    <ResponsiveContainer width="100%" height={82}>
      <AreaChart data={performanceData.slice(0, 5)}>
        <defs>
          <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.48} />
            <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="portfolio"
          stroke="#22C55E"
          strokeWidth={3}
          fill="url(#spark)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PerformanceChart({ data }) {
  const chartData = data || performanceData;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} className="chart-grid">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          stroke="#94A3B8"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#94A3B8"
          tickLine={false}
          axisLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="nifty"
          stroke="#FACC15"
          strokeWidth={2}
          dot={false}
          name="NIFTY50"
        />
        <Line
          type="monotone"
          dataKey="portfolio"
          stroke="#22C55E"
          strokeWidth={3}
          dot={{ r: 3 }}
          name="Portfolio"
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke="#3B82F6"
          strokeDasharray="6 5"
          strokeWidth={3}
          dot={{ r: 3 }}
          name="AI forecast"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const COLORS = ["#3B82F6", "#22C55E", "#EAB308", "#EF4444", "#A855F7", "#F97316", "#06B6D4", "#EC4899", "#8B5CF6", "#14B8A6"];

export function DonutChart({ data, innerData, title = "Allocation", onItemClick, highlightCriteria, highlightKey }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeInnerIndex, setActiveInnerIndex] = useState(-1);
  const [clickedItem, setClickedItem] = useState(null);
  const chartRef = useRef(null);
  
  const chartData = data || [];


  useEffect(() => {
    function handleClickOutside(event) {
      if (chartRef.current && !chartRef.current.contains(event.target)) {
        setClickedItem(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onPieEnter = (_, index) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(-1);
  
  const onInnerPieEnter = (_, index) => setActiveInnerIndex(index);
  const onInnerPieLeave = () => setActiveInnerIndex(-1);

  const activeItem = activeInnerIndex >= 0 && innerData 
    ? innerData[activeInnerIndex] 
    : (activeIndex >= 0 ? chartData[activeIndex] : null);

  const handleInnerClick = (entry) => {
    setClickedItem(clickedItem?.name === entry.name ? null : { ...entry, isInner: true });
    if (onItemClick) onItemClick(entry);
  };

  const handleOuterClick = (entry, index) => {
    setClickedItem(clickedItem?.name === entry.name ? null : { 
      ...entry, 
      isInner: false,
      color: entry.color || COLORS[index % COLORS.length]
    });
    if (onItemClick) onItemClick(entry);
  };

  return (
    <div ref={chartRef} className="relative w-full h-[230px]">
      {/* Click Readout Panel */}
      {clickedItem && (
        <div className="absolute top-0 left-0 z-10 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 mb-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: clickedItem.color || "#06B6D4" }} 
            />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {clickedItem.isInner ? "Cap Group" : "Holding"}
            </span>
          </div>
          <div className="text-white font-semibold text-sm mb-0.5">{clickedItem.name}</div>
          <div className="text-blue-400 font-mono text-base font-bold">{clickedItem.value.toFixed(2)}%</div>
          {clickedItem.category && (
            <div className="text-slate-500 text-xs mt-1">{clickedItem.category}</div>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          {activeItem ? activeItem.name : title}
        </span>
        {activeItem && (
          <span className="mt-0.5 text-lg font-medium text-white transition-opacity">
            {activeItem.value.toFixed(2)}%
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        {chartData.length > 0 ? (
          <PieChart>
            {innerData && (
              <Pie
                data={innerData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={true}
                onMouseEnter={onInnerPieEnter}
                onMouseLeave={onInnerPieLeave}
                onTouchStart={onInnerPieEnter}
                onClick={handleInnerClick}
              >
                {innerData.map((entry, index) => (
                  <Cell 
                    key={entry.name} 
                    fill={entry.color || ['#4F46E5', '#818CF8', '#C7D2FE'][index % 3]} 
                    className="transition-all duration-300 ease-out origin-center hover:opacity-80"
                    style={{
                      transform: activeInnerIndex === index ? 'scale(1.05)' : 'scale(1)'
                    }}
                  />
                ))}
              </Pie>
            )}
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={innerData ? 75 : 65}
              outerRadius={innerData ? 95 : 92}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={true}
              onClick={handleOuterClick}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              onTouchStart={onPieEnter}
            >
              {chartData.map((entry, index) => {
                const isInnerHovered = innerData && activeInnerIndex >= 0;
                const matchesInner = isInnerHovered && entry.category === innerData[activeInnerIndex].name;
                
                // External Highlight Logic
                const isHighlighted = highlightCriteria && entry[highlightKey] === highlightCriteria;
                
                const shouldPopOut = activeIndex === index || matchesInner || isHighlighted;
                
                // If there's an external highlight, dim others unless they are hovered
                const hasHighlightMode = !!highlightCriteria;
                const opacity = (isInnerHovered && !matchesInner) || (hasHighlightMode && !isHighlighted && activeIndex !== index) ? 0.25 : 1;
                
                return (
                  <Cell 
                    key={entry.name} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                    className="transition-all duration-300 ease-out origin-center"
                    style={{
                      transform: shouldPopOut ? 'scale(1.08)' : 'scale(1)',
                      opacity: opacity
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border border-dashed border-white/10 flex items-center justify-center text-[10px] text-slate-600 font-medium uppercase tracking-tighter">
              No Data
            </div>
          </div>
        )}
      </ResponsiveContainer>

    </div>
  );
}

export function ForecastChart({ data }) {
  const chartData = data || performanceData;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} className="chart-grid">

        <defs>
          <linearGradient id="forecast" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          stroke="#94A3B8"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#94A3B8"
          tickLine={false}
          axisLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="portfolio"
          stroke="#22C55E"
          strokeWidth={3}
          fill="url(#forecast)"
          connectNulls
        />
        <Area
          type="monotone"
          dataKey="forecast"
          stroke="#3B82F6"
          strokeDasharray="7 5"
          strokeWidth={3}
          fill="url(#forecast)"
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CandleProxyChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={candles} className="chart-grid">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          stroke="#94A3B8"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#94A3B8"
          tickLine={false}
          axisLine={false}
          domain={[3600, 3710]}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="close" radius={[5, 5, 0, 0]}>
          {candles.map((entry) => (
            <Cell
              key={entry.time}
              fill={entry.close >= entry.open ? "#22C55E" : "#EF4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MobilePriceChart() {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <AreaChart data={livePriceSeries}>
        <defs>
          <linearGradient id="mobilePrice" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide />
        <YAxis hide domain={["dataMin - 4", "dataMax + 4"]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#22C55E"
          strokeWidth={3}
          fill="url(#mobilePrice)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Single intraday view: LTP line + session close bars on the same ₹ scale (stock detail page). */
export function StockComboChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart
        data={stockIntradayMerged}
        margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
      >
        <defs>
          <linearGradient id="stockComboArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(148, 163, 184, 0.15)"
        />
        <XAxis
          dataKey="time"
          stroke="#94A3B8"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          stroke="#94A3B8"
          tickLine={false}
          axisLine={false}
          domain={["dataMin - 4", "dataMax + 4"]}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `₹${v}`}
        />

        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) => {
            const n =
              typeof value === "number" ? value : parseFloat(String(value));
            const label =
              name === "price" ? "LTP" : name === "close" ? "Close" : name;
            return [`₹${Number.isFinite(n) ? n.toFixed(2) : value}`, label];
          }}
          labelFormatter={(label) => `Time ${label}`}
        />

        <Bar
          dataKey="close"
          barSize={14}
          fillOpacity={0.45}
          radius={[3, 3, 0, 0]}
        >
          {stockIntradayMerged.map((entry) => (
            <Cell
              key={entry.time}
              fill={entry.close >= entry.open ? "#22C55E" : "#EF4444"}
            />
          ))}
        </Bar>
        <Area
          type="monotone"
          dataKey="price"
          stroke="#4ADE80"
          strokeWidth={2.5}
          fill="url(#stockComboArea)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
