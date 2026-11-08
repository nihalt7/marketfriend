'use client';

import { INDIAN_STOCKS } from '@/lib/data/indian-stocks';
import { StockExchange, Timeframe, TradingStyle } from '@/types';
import { ChevronDown, Play, Search, Shield, SlidersHorizontal, Sparkles } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface AnalysisControlsProps {
  symbol: string;
  setSymbol: (s: string) => void;
  exchange: StockExchange;
  setExchange: (e: StockExchange) => void;
  timeframe: Timeframe;
  setTimeframe: (t: Timeframe) => void;
  tradingStyle: TradingStyle;
  setTradingStyle: (s: TradingStyle) => void;
  capital: number;
  setCapital: (c: number) => void;
  riskPercent: number;
  setRiskPercent: (r: number) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  loadingStep: string;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  symbol,
  setSymbol,
  exchange,
  setExchange,
  timeframe,
  setTimeframe,
  tradingStyle,
  setTradingStyle,
  capital,
  setCapital,
  riskPercent,
  setRiskPercent,
  onAnalyze,
  isLoading,
  loadingStep
}) => {
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [showAdvancedRisk, setShowAdvancedRisk] = useState(false);

  const filteredStocks = useMemo(() => {
    if (!symbol) return INDIAN_STOCKS.slice(0, 8);
    const query = symbol.toUpperCase().trim();
    return INDIAN_STOCKS.filter(
      s => s.symbol.toUpperCase().includes(query) || s.name.toUpperCase().includes(query)
    ).slice(0, 8);
  }, [symbol]);

  return (
    <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Stock Symbol Search / Input */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Indian Stock / Index</span>
            <span className="text-[10px] text-cyan-400 font-mono">NSE / BSE</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value.toUpperCase());
                setShowSymbolDropdown(true);
              }}
              onFocus={() => setShowSymbolDropdown(true)}
              placeholder="e.g. RELIANCE, NIFTY 50, TCS"
              className="w-full bg-[#070a0f] border border-[#1e293b] focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono tracking-wide uppercase transition-colors"
            />
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          </div>

          {showSymbolDropdown && filteredStocks.length > 0 && (
            <div
              className="absolute z-30 left-0 right-0 mt-1 bg-[#0b0f17] border border-[#1e293b] rounded-lg shadow-2xl max-h-56 overflow-y-auto"
              onMouseLeave={() => setShowSymbolDropdown(false)}
            >
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    setSymbol(stock.symbol);
                    setExchange(stock.exchange);
                    setShowSymbolDropdown(false);
                  }}
                  className="px-3.5 py-2 hover:bg-cyan-950/40 cursor-pointer border-b border-[#161f30] last:border-0 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-white mr-2">{stock.symbol}</span>
                    <span className="text-slate-400 text-[11px] truncate">{stock.name}</span>
                  </div>
                  <span className="text-[10px] bg-[#161f30] text-slate-300 px-1.5 py-0.5 rounded font-mono">
                    {stock.sector}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Exchange Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Exchange
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-[#070a0f] p-1 rounded-lg border border-[#1e293b]">
            <button
              type="button"
              onClick={() => setExchange('NSE')}
              className={`py-1.5 text-xs font-mono font-medium rounded transition-all ${
                exchange === 'NSE'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              NSE India
            </button>
            <button
              type="button"
              onClick={() => setExchange('BSE')}
              className={`py-1.5 text-xs font-mono font-medium rounded transition-all ${
                exchange === 'BSE'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              BSE India
            </button>
          </div>
        </div>

        {/* 3. Timeframe Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Chart Timeframe
          </label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
            className="w-full bg-[#070a0f] border border-[#1e293b] focus:border-cyan-500 rounded-lg px-3 py-2.5 text-sm text-white font-mono transition-colors"
          >
            <option value="5m">5 Minutes (Scalping)</option>
            <option value="15m">15 Minutes (Intraday Core)</option>
            <option value="30m">30 Minutes (Intraday Momentum)</option>
            <option value="1h">1 Hour (Swing Pivot)</option>
            <option value="4h">4 Hours (Swing Trend)</option>
            <option value="1D">1 Day (Positional / Macro)</option>
            <option value="1W">1 Week (Long-Term Positional)</option>
          </select>
        </div>

        {/* 4. Trading Style Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Trading Style
          </label>
          <select
            value={tradingStyle}
            onChange={(e) => setTradingStyle(e.target.value as TradingStyle)}
            className="w-full bg-[#070a0f] border border-[#1e293b] focus:border-cyan-500 rounded-lg px-3 py-2.5 text-sm text-white font-mono transition-colors"
          >
            <option value="Scalping">Scalping (Quick 1:1.5)</option>
            <option value="Intraday">Intraday (Day Target)</option>
            <option value="Swing">Swing Trading (Multi-Day)</option>
            <option value="Positional">Positional (Multi-Week)</option>
          </select>
        </div>
      </div>

      {/* Advanced Risk Controls Toggle */}
      <div className="pt-2 border-t border-[#161f30]">
        <button
          type="button"
          onClick={() => setShowAdvancedRisk(!showAdvancedRisk)}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center space-x-1.5 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Capital & Risk Parameters (Default: ₹1,00,000 / 1% Risk)</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedRisk ? 'rotate-180' : ''}`} />
        </button>

        {showAdvancedRisk && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#070a0f] p-3 rounded-lg border border-[#1e293b]">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Trading Capital (₹)</label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(Math.max(5000, Number(e.target.value)))}
                className="w-full bg-[#0b0f17] border border-[#1e293b] rounded px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Risk Percentage per Trade (%)</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="3"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full bg-[#0b0f17] border border-[#1e293b] rounded px-3 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3" /> Conservative institutional limit (1% = ₹{((capital * riskPercent) / 100).toLocaleString('en-IN')})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Prominent Analyze Chart Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={onAnalyze}
          className={`w-full py-3.5 px-6 rounded-xl font-mono font-bold text-sm tracking-wide text-slate-950 flex items-center justify-center space-x-2 transition-all duration-300 shadow-xl ${
            isLoading
              ? 'bg-cyan-700 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.008]'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2 text-white">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>{loadingStep || 'Executing Quantitative Engine Pipeline...'}</span>
            </div>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>ANALYZE CHART & VERIFY MARKET DATA</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

