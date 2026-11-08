'use client';

import { ScanResultItem } from '@/lib/engines/market-scanner-engine';
import { Activity, ArrowRight, CheckCircle, Filter, RefreshCw, Search, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface MarketScannerViewProps {
  onSelectStock: (symbol: string) => void;
}

export const MarketScannerView: React.FC<MarketScannerViewProps> = ({ onSelectStock }) => {
  const [filter, setFilter] = useState<string>('all');
  const [results, setResults] = useState<ScanResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScannerData = async (activeFilter: string = filter) => {
    setIsLoading(true);
    try {
      const url = activeFilter === 'all' ? '/api/scanner' : `/api/scanner?filter=${activeFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
      }
    } catch (err) {
      console.error('Failed to load scanner results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScannerData(filter);
  }, [filter]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d131f] border border-[#1e293b] p-5 rounded-xl shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            INDIAN STOCK MARKET REAL-TIME SCANNER
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Scanning top NSE/BSE stocks for momentum breakouts, reversal triggers, and RSI extremes.
          </p>
        </div>

        <button
          onClick={() => fetchScannerData(filter)}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-lg bg-[#161f30] hover:bg-[#202c42] text-xs font-mono text-cyan-300 border border-[#223049] flex items-center gap-2 transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Scanner</span>
        </button>
      </div>

      {/* Filter Quick Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-500 flex items-center gap-1 shrink-0 px-1">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </span>
        {[
          { id: 'all', label: 'All High-Volume Stocks' },
          { id: 'rsi-oversold', label: 'RSI < 30 (Oversold)' },
          { id: 'rsi-overbought', label: 'RSI > 70 (Overbought)' },
          { id: 'ema-bullish', label: 'EMA 9/21 Golden Cross' },
          { id: 'volume-breakout', label: 'Volume Breakouts' },
          { id: 'near-support', label: 'Testing Key Support' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
              filter === btn.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                : 'bg-[#0d131f] text-slate-400 border-[#1e293b] hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Scanner Results Table */}
      <div className="bg-[#0b0f17] border border-[#1a2333] rounded-xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Scanning Indian markets & calculating indicators...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No instruments currently match the selected filter criteria. Try selecting another filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0d131f] border-b border-[#1a2333] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Price (₹)</th>
                  <th className="py-3 px-4">Change</th>
                  <th className="py-3 px-4">RSI (14)</th>
                  <th className="py-3 px-4">Detected Signals</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161f30]">
                {results.map((item) => (
                  <tr key={item.symbol} className="hover:bg-[#101622] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{item.symbol}</span>
                      <span className="text-[10px] text-slate-400">{item.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.sector}</td>
                    <td className="py-3 px-4 font-bold text-white">₹{item.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.changePercent >= 0
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                      }`}>
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${
                        item.rsi <= 32 ? 'text-emerald-400' : item.rsi >= 68 ? 'text-rose-400' : 'text-slate-200'
                      }`}>
                        {item.rsi}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.matchedCriteria.map((c, i) => (
                          <span key={i} className="text-[10px] bg-[#161f30] text-cyan-300 border border-[#24334c] px-1.5 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectStock(item.symbol)}
                        className="px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 font-bold border border-cyan-500/30 transition-all inline-flex items-center gap-1"
                      >
                        <span>Analyze</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

