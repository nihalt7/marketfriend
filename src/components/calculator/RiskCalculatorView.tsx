'use client';

import { RiskCalculationResult } from '@/lib/engines/risk-management-engine';
import { Calculator, CheckCircle2, DollarSign, HelpCircle, Info, Percent, Receipt, Shield, ShieldAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const RiskCalculatorView: React.FC = () => {
  const [capital, setCapital] = useState<number>(100000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(2985);
  const [stopLossPrice, setStopLossPrice] = useState<number>(2955);
  const [targetPrice, setTargetPrice] = useState<number>(3060);
  const [isDelivery, setIsDelivery] = useState<boolean>(false);
  const [result, setResult] = useState<RiskCalculationResult | null>(null);

  const calculate = async () => {
    try {
      const res = await fetch('/api/risk-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capital,
          riskPercent,
          entryPrice,
          stopLossPrice,
          targetPrice,
          isDelivery
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Calculation error:', err);
    }
  };

  useEffect(() => {
    calculate();
  }, [capital, riskPercent, entryPrice, stopLossPrice, targetPrice, isDelivery]);

  return (
    <div className="w-full space-y-6">
      <div className="bg-[#0d131f] border border-[#1e293b] p-5 rounded-xl shadow-xl space-y-2">
        <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
          <Calculator className="w-5 h-5 text-cyan-400" />
          INDIAN STOCK MARKET RISK & BROKERAGE CALCULATOR
        </h2>
        <p className="text-xs text-slate-400">
          Compute accurate position sizing, disciplined risk allocation, and statutory Indian taxes (STT, Exchange, SEBI, Stamp Duty, GST, Brokerage).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters Panel */}
        <div className="bg-[#0d131f] border border-[#1e293b] p-5 rounded-xl shadow-xl space-y-4">
          <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
            1. Trade Inputs & Parameters
          </h3>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Trading Capital (₹)</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Math.max(1000, Number(e.target.value)))}
              className="w-full bg-[#070a0f] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Risk % per Trade</span>
              <span className="font-mono text-cyan-400 font-bold">{riskPercent}%</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="5.0"
              step="0.25"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>0.25% (Ultra-Safe)</span>
              <span>1.0% (Institutional Default)</span>
              <span>5.0% (High Risk)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Entry Price (₹)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full bg-[#070a0f] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-rose-400 mb-1">Stop-Loss (₹)</label>
              <input
                type="number"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(Number(e.target.value))}
                className="w-full bg-[#070a0f] border border-rose-950/60 rounded-lg px-3 py-2 text-xs text-rose-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-emerald-400 mb-1">Target Price (₹)</label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full bg-[#070a0f] border border-emerald-950/60 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Product Segment</label>
            <div className="grid grid-cols-2 gap-2 bg-[#070a0f] p-1 rounded-lg border border-[#1e293b] text-xs font-mono">
              <button
                type="button"
                onClick={() => setIsDelivery(false)}
                className={`py-1.5 rounded transition-colors ${!isDelivery ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                MIS (Intraday)
              </button>
              <button
                type="button"
                onClick={() => setIsDelivery(true)}
                className={`py-1.5 rounded transition-colors ${isDelivery ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                CNC (Delivery)
              </button>
            </div>
          </div>
        </div>

        {/* Results & Sizing Panel */}
        {result && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0d131f] border border-[#1e293b] p-5 rounded-xl shadow-xl space-y-4">
              <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" />
                2. Disciplined Sizing & P&L Summary
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                  <span className="text-slate-400 text-[10px] block">Position Quantity</span>
                  <span className="text-base font-bold text-white mt-1 block">{result.quantity} Shares</span>
                </div>
                <div className="bg-[#070a0f] p-3 rounded-lg border border-rose-950/50">
                  <span className="text-rose-400 text-[10px] block">Max Risk (SL)</span>
                  <span className="text-base font-bold text-rose-400 mt-1 block">₹{result.maxRiskAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-[#070a0f] p-3 rounded-lg border border-emerald-950/50">
                  <span className="text-emerald-400 text-[10px] block">Net Target Profit</span>
                  <span className="text-base font-bold text-emerald-400 mt-1 block">₹{result.charges.netProfit.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                  <span className="text-slate-400 text-[10px] block">Risk : Reward</span>
                  <span className="text-base font-bold text-cyan-400 mt-1 block">1 : {result.riskToReward}</span>
                </div>
              </div>

              {/* Note banner */}
              <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
                result.riskPercent > 2.0
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              }`}>
                {result.recommendationNote}
              </div>
            </div>

            {/* Indian Regulatory Charges Breakdown */}
            <div className="bg-[#0b0f17] border border-[#1a2333] rounded-xl overflow-hidden shadow-2xl">
              <div className="px-5 py-3.5 bg-[#0d131f] border-b border-[#1a2333] flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white tracking-wide flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-cyan-400" />
                  ITEMIZED STATUTORY INDIAN CHARGES & TAXES BREAKDOWN
                </span>
                <span className="text-cyan-400 font-bold">
                  Total Taxes: ₹{result.charges.totalCharges}
                </span>
              </div>

              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-[#070a0f] p-2.5 rounded border border-[#161f30]">
                  <span className="text-slate-400 text-[11px] block">Brokerage (Flat / 0.03%)</span>
                  <span className="text-white font-bold mt-0.5 block">₹{result.charges.brokerage}</span>
                </div>
                <div className="bg-[#070a0f] p-2.5 rounded border border-[#161f30]">
                  <span className="text-slate-400 text-[11px] block">STT (Securities Tax)</span>
                  <span className="text-white font-bold mt-0.5 block">₹{result.charges.stt}</span>
                </div>
                <div className="bg-[#070a0f] p-2.5 rounded border border-[#161f30]">
                  <span className="text-slate-400 text-[11px] block">Exchange Turnover Fees</span>
                  <span className="text-white font-bold mt-0.5 block">₹{result.charges.exchangeCharges}</span>
                </div>
                <div className="bg-[#070a0f] p-2.5 rounded border border-[#161f30]">
                  <span className="text-slate-400 text-[11px] block">SEBI Turnover Charges</span>
                  <span className="text-white font-bold mt-0.5 block">₹{result.charges.sebiCharges}</span>
                </div>
                <div className="bg-[#070a0f] p-2.5 rounded border border-[#161f30]">
                  <span className="text-slate-400 text-[11px] block">Stamp Duty (State)</span>
                  <span className="text-white font-bold mt-0.5 block">₹{result.charges.stampDuty}</span>
                </div>
                <div className="bg-[#070a0f] p-2.5 rounded border border-[#161f30]">
                  <span className="text-slate-400 text-[11px] block">GST (18% on Services)</span>
                  <span className="text-white font-bold mt-0.5 block">₹{result.charges.gst}</span>
                </div>
              </div>

              <div className="px-5 py-3 bg-[#070a0f] border-t border-[#161f30] flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Points to Breakeven per share:</span>
                <span className="font-bold text-cyan-400">+₹{result.charges.pointsToBreakeven} / share</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

