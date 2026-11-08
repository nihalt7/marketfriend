'use client';

import { BookOpen, CheckCircle, Compass, HelpCircle, Layers, Lightbulb, ShieldCheck, Zap } from 'lucide-react';
import React, { useState } from 'react';

export const StrategyGuideView: React.FC = () => {
  const [guideTab, setGuideTab] = useState<'strategies' | 'smc' | 'candlesticks' | 'workflow'>('workflow');

  return (
    <div className="w-full space-y-6">
      <div className="bg-[#0d131f] border border-[#1e293b] p-5 rounded-xl shadow-xl space-y-2">
        <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          CHARTIQ TECHNICAL STRATEGY & SMC REFERENCE GUIDE
        </h2>
        <p className="text-xs text-slate-400">
          Professional guide covering our 12 systematic strategies, Smart Money Concepts, next-candle confirmation rules, and risk management guidelines for the Indian equity market.
        </p>
      </div>

      {/* Guide Navigation */}
      <div className="flex items-center space-x-2 border-b border-[#1a2333] pb-1 text-xs font-mono">
        <button
          onClick={() => setGuideTab('workflow')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            guideTab === 'workflow' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Core Philosophy
        </button>
        <button
          onClick={() => setGuideTab('strategies')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            guideTab === 'strategies' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          12 Strategies
        </button>
        <button
          onClick={() => setGuideTab('smc')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            guideTab === 'smc' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Smart Money Concepts
        </button>
        <button
          onClick={() => setGuideTab('candlesticks')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            guideTab === 'candlesticks' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Candlestick & Confirmation
        </button>
      </div>

      {/* Pane 1: Core Philosophy */}
      {guideTab === 'workflow' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: 'STEP 1',
              title: 'ANALYZE',
              desc: 'Multimodal AI Vision & OCR inspect the uploaded chart, extracting price levels, indicator lines, and candlestick geometry.'
            },
            {
              step: 'STEP 2',
              title: 'VERIFY',
              desc: 'Market Data Engine pulls authorized Indian market OHLC data (NSE/BSE) to detect outdated screenshots or symbol mismatches.'
            },
            {
              step: 'STEP 3',
              title: 'CONFIRM',
              desc: 'Next Candle Confirmation Engine analyzes completed subsequent candles. Provisional candles are never traded blindly.'
            },
            {
              step: 'STEP 4',
              title: 'EVALUATE',
              desc: '12 systematic strategies & SMC structures are ranked. Confluence engine deducts collinearity to prevent double-counting.'
            },
            {
              step: 'STEP 5',
              title: 'RECOMMEND',
              desc: 'Generates evidence-backed BUY/SELL/WAIT trading plans with strict 1% risk caps, ATR stop-loss, and multi-tier targets.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#0d131f] border border-[#1e293b] p-4 rounded-xl shadow-lg space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block">{item.step}</span>
              <h4 className="text-base font-bold font-mono text-white">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pane 2: 12 Systematic Strategies */}
      {guideTab === 'strategies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: '1. Pure Price Action', desc: 'Focuses on wick rejection, swing highs/lows, and micro-breakouts without indicator lag.' },
            { name: '2. Support & Resistance', desc: 'Multi-touch horizontal floors and ceilings tested for liquidity absorption and breakout continuation.' },
            { name: '3. Range Breakouts', desc: 'Consolidation box compression breaking out with relative volume (RVOL > 1.5x).' },
            { name: '4. Breakout & Retest', desc: 'Patient entry on pullbacks into flipped support/resistance zones, confirming buyer defense.' },
            { name: '5. EMA Crossover & Ribbon', desc: 'Alignment of 9, 21, 50, and 200 EMAs for dynamic trend-following support.' },
            { name: '6. VWAP Institutional Anchor', desc: 'Benchmarking day volume-weighted price. Tests above VWAP favor long momentum.' },
            { name: '7. RSI Reversal & Divergence', desc: 'Momentum exhaustions where price prints lower lows while RSI prints higher lows.' },
            { name: '8. MACD Histogram Expansion', desc: 'Medium-term momentum acceleration and zero-line crossovers.' },
            { name: '9. Fibonacci Golden Pocket', desc: 'Corrective retracements holding the 0.500 - 0.618 golden ratio zone.' },
            { name: '10. Smart Money Concepts', desc: 'Institutional order blocks, fair value gaps (FVG), and liquidity stop-hunts.' },
            { name: '11. Trend Following', desc: 'Higher Highs / Higher Lows structure confirmed by ADX > 25 trend strength.' },
            { name: '12. Systematic Reversal', desc: 'Exhaustion at major macro structural boundaries with multiple independent confirmations.' }
          ].map((strat, idx) => (
            <div key={idx} className="bg-[#0d131f] border border-[#1e293b] p-4 rounded-xl shadow-lg space-y-2">
              <h4 className="text-sm font-bold font-mono text-cyan-400">{strat.name}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{strat.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pane 3: Smart Money Concepts */}
      {guideTab === 'smc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Break of Structure (BOS)', text: 'Occurs when trend continuation decisively closes beyond the previous swing high (uptrend) or swing low (downtrend).' },
            { title: 'Change of Character (CHoCH)', text: 'The earliest structural warning of a reversal. Occurs when price in a downtrend takes out the previous Lower High pivot.' },
            { title: 'Liquidity Sweep (Stop Hunt)', text: 'Price wicks past an obvious support or resistance level to trigger retail stop orders, before immediately closing back inside the range.' },
            { title: 'Order Blocks (OB)', text: 'The last opposing candle prior to an aggressive displacement impulse that created a breakout or Fair Value Gap.' },
            { title: 'Fair Value Gap (FVG)', text: 'A 3-candle price inefficiency where candle 1 and candle 3 wicks do not overlap, leaving an imbalance that acts as a magnetic entry zone.' },
            { title: 'Premium vs Discount Zones', text: '50% midpoint of the macro dealing range. Smart money buys at Discount (below 50%) and distributes at Premium (above 50%).' }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#0d131f] border border-[#1e293b] p-4 rounded-xl shadow-lg space-y-2">
              <h4 className="text-sm font-bold font-mono text-emerald-400">{item.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pane 4: Candlesticks & Confirmation */}
      {guideTab === 'candlesticks' && (
        <div className="space-y-4">
          <div className="bg-[#0d131f] border border-[#1e293b] p-5 rounded-xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              THE NEXT CANDLE CONFIRMATION RULE
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Never execute a trade based on pattern identification alone. A solitary Hammer or Shooting Star candle simply indicates that a price battle took place. You MUST wait for the subsequent candle to close to confirm that buyers or sellers maintain sustained follow-through. A currently forming candle is always provisional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0d131f] border border-emerald-950/60 p-4 rounded-xl space-y-2">
              <h4 className="text-sm font-bold font-mono text-emerald-400">Bullish Formations</h4>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Hammer (at support)</li>
                <li>• Bullish Engulfing</li>
                <li>• Morning Star (3-candle)</li>
                <li>• Piercing Pattern</li>
                <li>• Dragonfly Doji</li>
                <li>• Three White Soldiers</li>
                <li>• Tweezer Bottom</li>
              </ul>
            </div>

            <div className="bg-[#0d131f] border border-rose-950/60 p-4 rounded-xl space-y-2">
              <h4 className="text-sm font-bold font-mono text-rose-400">Bearish Formations</h4>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Shooting Star (at resistance)</li>
                <li>• Bearish Engulfing</li>
                <li>• Evening Star (3-candle)</li>
                <li>• Dark Cloud Cover</li>
                <li>• Gravestone Doji</li>
                <li>• Three Black Crows</li>
                <li>• Tweezer Top</li>
              </ul>
            </div>

            <div className="bg-[#0d131f] border border-[#1e293b] p-4 rounded-xl space-y-2">
              <h4 className="text-sm font-bold font-mono text-amber-300">Neutral & Indecision</h4>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Long-Legged Doji</li>
                <li>• Spinning Top</li>
                <li>• Inside Bar (Compression)</li>
                <li>• High Wave Candle</li>
                <li>• Outside Bar (Volatility)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

