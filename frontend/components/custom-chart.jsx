"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { fintrackApi } from '@/lib/api';

export default function CustomChart({ symbol = "TCS", theme = "dark" }) {
  const chartContainerRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const history = await fintrackApi.getHistory(symbol);
        if (history) {
          setData(history);
        }
      } catch (err) {
        console.error("Failed to fetch custom chart data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [symbol]);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: container.clientWidth,
      height: 400,
    });

    // Use addSeries(CandlestickSeries) for v5+
    try {
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });
      candlestickSeries.setData(data);
      chart.timeScale().fitContent();
    } catch (e) {
      console.error("Failed to add Candlestick series", e);
    }

    const handleResize = () => {
      chart.applyOptions({ width: container.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ai border-t-transparent"></div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
