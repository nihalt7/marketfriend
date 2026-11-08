'use client';

import { BacktestResult } from '@/lib/engines/backtesting-engine';
import { INDIAN_STOCKS } from '@/lib/data/indian-stocks';
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, CheckCircle2, Play, Sparkles, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';

export const BacktestingLabView: React.FC = () => {
  const [strategyId, setStrategyId] = useState('hammer-confirmation');
  const [symbol, setSymbol] = useState('RELIANCE');
  const [capital, setCapital] = useState(100000);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runBacktest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyId, symbol, initialCapital: capital })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Backtest error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-[#0d131f] border border-[#1e293b] p-5 rounded-xl shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            HISTORICAL BACKTESTING LABORATORY
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Validate candlestick confirmation, EMA crossover, and breakout systems against verified historical Indian OHLC data with realistic transaction costs and zero look-ahead bias.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Strategy Rule</label>
            <select
              value={strategyId}
              onChange={(e) => setStrategyId(e.target.value)}
              className="w-full bg-[#070a0f] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white font-mono"
            >
              <option value="hammer-confirmation">Hammer Reversal + Next Candle Confirmation</option>
              <option value="ema-crossover">EMA 9/21 Dynamic Trend Crossover</option>
              <option value="rsi-divergence">RSI Divergence & Oversold Reversal</option>
              <option value="breakout">High-Volume Range Breakout</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Indian Equity / Index</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-[#070a0f] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white font-mono"
            >
              {INDIAN_STOCKS.slice(0, 12).map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} ({s.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Starting Capital (₹)</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="w-full bg-[#070a0f] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
          </div>
        </div>

        <button
          onClick={runBacktest}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Simulating historical trades...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>RUN HISTORICAL VALIDATION</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
            <div className="bg-[#0d131f] border border-[#1e293b] p-4 rounded-xl shadow-lg">
              <span className="text-slate-400 text-[10px] block">Win Rate</span>
              <span className="text-lg font-bold text-emerald-400 mt-1 block">{result.winRate}%</span>
              <span className="text-[10px] text-slate-500">{result.winningTrades}W / {result.losingTrades}L</span>
            </div>

            <div className="bg-[#0d131f] border border-[#1e293b] p-4 rounded-xl shadow-lg">
              <span className="text-slate-400 text-[10px] block">Profit Factor</span>
              <span className="text-lg font-bold text-cyan-400 mt-1 block">{result.profitFactor}</span>
              <span className="text-[10px] text-slate-500">Gross Gain / Loss</span>
            </div>

            <div className="bg-[#0d131f] border border-[#1e293b] p-4 rounded-xl shadow-lg">
              <span className="text-slate-400 text-[10px] block">Net Return</span>
              <span className={`text-lg font-bold mt-1 block ${result.netReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.netReturnPercent >= 0 ? '+' : ''}{result.netReturnPercent}%
              </span>
              <span className="text-[10px] text-slate-500">₹{(result.finalCapital - result.initialCapital).toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-[#0d131f] border border-[#1e293b] p-4 rounded-xl shadow-lg">
              <span className="text-slate-400 text-[10px] block">Max Drawdown</span>
              <span className="text-lg font-bold text-rose-400 mt-1 block">-{result.maxDrawdownPercent}%</span>
              <span className="text-[10px] text-slate-500">Peak to trough</span>
            </div>

            <div className="bg-[#0d131f] border border-[#1e293b] p-4 rounded-xl shadow-lg">
              <span className="text-slate-400 text-[10px] block">Avg Win Trade</span>
              <span className="text-lg font-bold text-emerald-400 mt-1 block">₹{result.averageProfit.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-500">Avg Gain</span>
            </div>

            <div className="bg-[#0d131f] border border-[#1e293b] p-4 rounded-xl shadow-lg">
              <span className="text-slate-400 text-[10px] block">Avg Loss Trade</span>
              <span className="text-lg font-bold text-rose-400 mt-1 block">-₹{result.averageLoss.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-500">1% strict risk</span>
            </div>
          </div>

          {/* Itemized Trade Log */}
          <div className="bg-[#0b0f17] border border-[#1a2333] rounded-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 bg-[#0d131f] border-b border-[#1a2333] flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white tracking-wide">HISTORICAL EXECUTED TRADE LOG</span>
              <span className="text-slate-400">Total Simulated: {result.totalTrades} Trades</span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#070a0f] border-b border-[#161f30] text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Trade ID</th>
                    <th className="py-2.5 px-4">Entry Date</th>
                    <th className="py-2.5 px-4">Exit Date</th>
                    <th className="py-2.5 px-4">Entry (₹)</th>
                    <th className="py-2.5 px-4">Exit (₹)</th>
                    <th className="py-2.5 px-4">Net P&L (₹)</th>
                    <th className="py-2.5 px-4">Return</th>
                    <th className="py-2.5 px-4">Exit Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161f30]">
                  {result.trades.map((t) => (
                    <tr key={t.id} className="hover:bg-[#101622] transition-colors">
                      <td className="py-2.5 px-4 text-cyan-400 font-bold">{t.id}</td>
                      <td className="py-2.5 px-4 text-slate-300">{t.entryTime}</td>
                      <td className="py-2.5 px-4 text-slate-300">{t.exitTime}</td>
                      <td className="py-2.5 px-4 text-white">₹{t.entryPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-white">₹{t.exitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-4">
                        <span className={`font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.pnlPercent >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}>
                          {t.pnlPercent >= 0 ? '+' : ''}{t.pnlPercent}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded ${
                          t.exitReason === 'TARGET' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          t.exitReason === 'STOP_LOSS' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {t.exitReason}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

