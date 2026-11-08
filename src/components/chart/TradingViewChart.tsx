'use client';

import { Candle, TradingPlan } from '@/types';
import { ColorType, createChart, CrosshairMode, IChartApi, ISeriesApi } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  candles: Candle[];
  symbol: string;
  timeframe: string;
  tradingPlan?: TradingPlan;
  supportLevels?: number[];
  resistanceLevels?: number[];
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  candles,
  symbol,
  timeframe,
  tradingPlan,
  supportLevels = [],
  resistanceLevels = []
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    // Clear previous chart instance if exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    // Create TradingView Lightweight Chart
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 440,
      layout: {
        background: { type: ColorType.Solid, color: '#0b0f17' },
        textColor: '#94a3b8',
        fontSize: 12,
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      grid: {
        vertLines: { color: '#161f30' },
        horzLines: { color: '#161f30' }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0369a1'
        },
        horzLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0369a1'
        }
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: {
          top: 0.12,
          bottom: 0.22
        }
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false
      }
    });

    chartRef.current = chart;

    // Add Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444'
    });

    // Ensure sorted timestamps without duplicates
    const formattedCandles = candles
      .filter((c, idx, arr) => idx === 0 || c.time > arr[idx - 1].time)
      .map(c => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
      }));

    candleSeries.setData(formattedCandles);

    // Add Volume Series
    const volumeSeries = chart.addHistogramSeries({
      color: '#38bdf8',
      priceFormat: {
        type: 'volume'
      },
      priceScaleId: '' // separate scale for volume overlay
    });

    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    });

    const formattedVolumes = candles
      .filter((c, idx, arr) => idx === 0 || c.time > arr[idx - 1].time)
      .map(c => ({
        time: c.time as any,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'
      }));

    volumeSeries.setData(formattedVolumes);

    // Add price overlays from trading plan
    if (tradingPlan) {
      // Entry Line
      candleSeries.createPriceLine({
        price: tradingPlan.entryZone.optimal,
        color: '#38bdf8',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: 'ENTRY'
      });

      // Stop Loss Line
      candleSeries.createPriceLine({
        price: tradingPlan.stopLoss.price,
        color: '#ef4444',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'STOP-LOSS'
      });

      // Target 1 Line
      candleSeries.createPriceLine({
        price: tradingPlan.target1.price,
        color: '#10b981',
        lineWidth: 1,
        lineStyle: 1,
        axisLabelVisible: true,
        title: 'TARGET 1 (1:1.5)'
      });

      // Target 2 Line
      candleSeries.createPriceLine({
        price: tradingPlan.target2.price,
        color: '#10b981',
        lineWidth: 2,
        lineStyle: 1,
        axisLabelVisible: true,
        title: 'TARGET 2 (1:2.5)'
      });
    }

    // Add Key S/R levels
    supportLevels.slice(0, 2).forEach(s => {
      candleSeries.createPriceLine({
        price: s,
        color: '#64748b',
        lineWidth: 1,
        lineStyle: 3,
        axisLabelVisible: false,
        title: 'Support'
      });
    });

    resistanceLevels.slice(0, 2).forEach(r => {
      candleSeries.createPriceLine({
        price: r,
        color: '#94a3b8',
        lineWidth: 1,
        lineStyle: 3,
        axisLabelVisible: false,
        title: 'Resistance'
      });
    });

    chart.timeScale().fitContent();

    // Window resize handler
    const handleResize = () => {
      if (container && chartRef.current) {
        chartRef.current.applyOptions({ width: container.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, tradingPlan, supportLevels, resistanceLevels]);

  return (
    <div className="w-full bg-[#0b0f17] border border-[#1a2333] rounded-xl overflow-hidden shadow-2xl relative">
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d131f] border-b border-[#1a2333]">
        <div className="flex items-center space-x-3">
          <span className="font-mono font-bold text-white tracking-wider">{symbol}</span>
          <span className="text-xs bg-cyan-950/80 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded font-mono">
            {timeframe}
          </span>
          <span className="text-xs text-slate-400">Verified OHLCV Live Feed</span>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Entry</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300">Stop-Loss</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Targets</span>
          </div>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" style={{ height: '440px' }} />
    </div>
  );
};
