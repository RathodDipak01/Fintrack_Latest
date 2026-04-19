"use client";

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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { allocationData, candles, livePriceSeries, performanceData, stockIntradayMerged } from "@/lib/portfolio-data";

const tooltipStyle = {
  background: "rgba(7, 10, 18, 0.92)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: 8,
  color: "#fff"
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
        <Area type="monotone" dataKey="portfolio" stroke="#22C55E" strokeWidth={3} fill="url(#spark)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={performanceData} className="chart-grid">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" stroke="#94A3B8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} domain={[108, 126]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="nifty" stroke="#FACC15" strokeWidth={2} dot={false} name="NIFTY50" />
        <Line type="monotone" dataKey="portfolio" stroke="#22C55E" strokeWidth={3} dot={{ r: 3 }} name="Portfolio" />
        <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeDasharray="6 5" strokeWidth={3} dot={{ r: 3 }} name="AI forecast" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AllocationChart() {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <PieChart>
        <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
          {allocationData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ForecastChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={performanceData} className="chart-grid">
        <defs>
          <linearGradient id="forecast" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" stroke="#94A3B8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} domain={[108, 126]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="portfolio" stroke="#22C55E" strokeWidth={3} fill="url(#forecast)" connectNulls />
        <Area type="monotone" dataKey="forecast" stroke="#3B82F6" strokeDasharray="7 5" strokeWidth={3} fill="url(#forecast)" connectNulls />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CandleProxyChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={candles} className="chart-grid">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" stroke="#94A3B8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} domain={[3600, 3710]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="close" radius={[5, 5, 0, 0]}>
          {candles.map((entry) => (
            <Cell key={entry.time} fill={entry.close >= entry.open ? "#22C55E" : "#EF4444"} />
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
        <Area type="monotone" dataKey="price" stroke="#22C55E" strokeWidth={3} fill="url(#mobilePrice)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Single intraday view: LTP line + session close bars on the same ₹ scale (stock detail page). */
export function StockComboChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={stockIntradayMerged} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="stockComboArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
        <XAxis dataKey="time" stroke="#94A3B8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
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
          formatter={(value: number | string, name: string) => {
            const n = typeof value === "number" ? value : parseFloat(String(value));
            const label = name === "price" ? "LTP" : name === "close" ? "Close" : name;
            return [`₹${Number.isFinite(n) ? n.toFixed(2) : value}`, label];
          }}
          labelFormatter={(label) => `Time ${label}`}
        />
        <Bar dataKey="close" barSize={14} fillOpacity={0.45} radius={[3, 3, 0, 0]}>
          {stockIntradayMerged.map((entry) => (
            <Cell key={entry.time} fill={entry.close >= entry.open ? "#22C55E" : "#EF4444"} />
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
