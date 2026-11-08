'use client';

import { AnalysisReport } from '@/types';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  CheckCircle,
  Clock,
  Compass,
  Crosshair,
  ExternalLink,
  Layers,
  LineChart,
  Percent,
  PieChart,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { TradingViewChart } from '../chart/TradingViewChart';
import { AiExplanationAssistant } from './AiExplanationAssistant';

interface AnalysisResultViewProps {
  report: AnalysisReport;
  onNewAnalysis: () => void;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ report, onNewAnalysis }) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'candlestick' | 'patterns' | 'indicators' | 'strategies' | 'scenarios' | 'priceaction' | 'ai'>('plan');

  const {
    stockInfo,
    marketStructure,
    candlestickAnalysis,
    chartPatternAnalysis,
    smcAnalysis,
    technicalIndicators,
    selectedStrategy,
    alternativeStrategy,
    confluenceReport,
    multiTimeframeContext,
    nextCandleScenarios,
    tradingPlan,
    comparison,
    priceActionAnalysis,
    candles
  } = report;

  const isBuy = tradingPlan.recommendation === 'BUY' || tradingPlan.recommendation === 'STRONG BUY';
  const isSell = tradingPlan.recommendation === 'SELL' || tradingPlan.recommendation === 'STRONG SELL';
  const isWait = tradingPlan.recommendation === 'WAIT';

  const badgeColor = isBuy
    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-emerald-500/20'
    : isSell
    ? 'bg-rose-950/80 border-rose-500 text-rose-400 shadow-rose-500/20'
    : 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-amber-500/20';

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* 1. Outdated Screenshot or Discrepancy Alert */}
      {comparison.warnings.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex items-start space-x-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs space-y-1">
            <h5 className="font-bold text-amber-300 font-mono tracking-wide">VERIFICATION & DATA DISCREPANCY NOTICE</h5>
            {comparison.warnings.map((w, idx) => (
              <p key={idx} className="text-amber-200/90 leading-relaxed">• {w}</p>
            ))}
          </div>
        </div>
      )}

      {/* 2. Recommendation Master Banner */}
      <div className={`border rounded-2xl p-6 shadow-2xl relative overflow-hidden ${
        isBuy ? 'bg-gradient-to-r from-[#071d18] via-[#0b1b1c] to-[#070a0f] border-emerald-500/40' :
        isSell ? 'bg-gradient-to-r from-[#210c0e] via-[#1a0e14] to-[#070a0f] border-rose-500/40' :
        'bg-gradient-to-r from-[#1f1908] via-[#161718] to-[#070a0f] border-amber-500/40'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-1.5 rounded-lg text-lg font-mono font-black border tracking-widest shadow-lg ${badgeColor}`}>
                {tradingPlan.recommendation}
              </span>
              <span className="text-xs font-mono text-slate-300 bg-[#161f30] px-3 py-1 rounded border border-[#223049] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                Confidence: {tradingPlan.confidenceScore}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                {stockInfo.exchange} : {stockInfo.symbol}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {tradingPlan.decisionHeadline}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {report.simpleSummary}
            </p>
          </div>

          <div className="bg-[#070a0f]/80 border border-[#1e293b] rounded-xl p-4 shrink-0 flex items-center space-x-6">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Live Price</span>
              <span className="text-lg font-mono font-bold text-white">₹{stockInfo.currentPrice.toFixed(2)}</span>
              <span className={`text-xs font-mono block mt-0.5 ${stockInfo.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)} ({stockInfo.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="h-10 w-[1px] bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Risk : Reward</span>
              <span className="text-lg font-mono font-bold text-cyan-400">1 : {tradingPlan.riskToReward}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Optimal Ratio</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive TradingView Candlestick Chart */}
      <TradingViewChart
        candles={candles}
        symbol={stockInfo.symbol}
        timeframe={stockInfo.timeframe}
        tradingPlan={tradingPlan}
        supportLevels={marketStructure.supportLevels}
        resistanceLevels={marketStructure.resistanceLevels}
      />

      {/* 4. Tab Navigation for Deep Dive Analytics */}
      <div className="border-b border-[#1a2333] flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono">
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-4 py-2.5 rounded-lg border flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'plan'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Trading Plan & Risk</span>
        </button>

        <button
          onClick={() => setActiveTab('candlestick')}
          className={`px-4 py-2.5 rounded-lg border flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'candlestick'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Candlestick Confirmation</span>
        </button>

        <button
          onClick={() => setActiveTab('patterns')}
          className={`px-4 py-2.5 rounded-lg border flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'patterns'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Chart Patterns & SMC</span>
        </button>

        <button
          onClick={() => setActiveTab('indicators')}
          className={`px-4 py-2.5 rounded-lg border flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'indicators'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Indicators & VWAP</span>
        </button>

        <button
          onClick={() => setActiveTab('strategies')}
          className={`px-4 py-2.5 rounded-lg border flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'strategies'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>12 Strategies & Confluence</span>
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-4 py-2.5 rounded-lg border flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'scenarios'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Next Candle Scenarios</span>
        </button>

        <button
          onClick={() => setActiveTab('priceaction')}
          className={`px-4 py-2.5 rounded-lg border flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'priceaction'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" />
          <span>Candle-by-Candle</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2.5 rounded-lg border flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'ai'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Explanation Assistant</span>
        </button>
      </div>

      {/* 5. Tab Content Panes */}

      {/* TAB 1: TRADING PLAN & RISK MANAGEMENT */}
      {activeTab === 'plan' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                EXECUTION PARAMETERS & TARGET LEVELS
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Entry Zone</span>
                  <span className="text-sm font-bold font-mono text-cyan-400 mt-1 block">
                    ₹{tradingPlan.entryZone.min} - ₹{tradingPlan.entryZone.max}
                  </span>
                  <span className="text-[10px] text-slate-500">Optimal: ₹{tradingPlan.entryZone.optimal}</span>
                </div>

                <div className="bg-[#070a0f] p-3 rounded-lg border border-rose-950/50">
                  <span className="text-[10px] text-rose-400 font-mono uppercase block">Stop-Loss (SL)</span>
                  <span className="text-sm font-bold font-mono text-rose-400 mt-1 block">
                    ₹{tradingPlan.stopLoss.price}
                  </span>
                  <span className="text-[10px] text-slate-400">Risk: {tradingPlan.stopLoss.distancePercent}%</span>
                </div>

                <div className="bg-[#070a0f] p-3 rounded-lg border border-emerald-950/50">
                  <span className="text-[10px] text-emerald-400 font-mono uppercase block">Target 1 (T1)</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">
                    ₹{tradingPlan.target1.price}
                  </span>
                  <span className="text-[10px] text-slate-400">R:R 1:1.5 (40% exit)</span>
                </div>

                <div className="bg-[#070a0f] p-3 rounded-lg border border-emerald-950/50">
                  <span className="text-[10px] text-emerald-400 font-mono uppercase block">Target 2 (T2)</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">
                    ₹{tradingPlan.target2.price}
                  </span>
                  <span className="text-[10px] text-slate-400">R:R 1:2.5 (40% exit)</span>
                </div>
              </div>

              <div className="bg-[#070a0f] p-3.5 rounded-lg border border-[#161f30] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-slate-200">Stop-Loss Technical Rationale:</span>
                  <span className="text-slate-400 font-mono">ATR Buffer Included</span>
                </div>
                <p className="text-slate-400 leading-relaxed">{tradingPlan.stopLoss.reason}</p>
              </div>

              <div className="bg-[#070a0f] p-3.5 rounded-lg border border-[#161f30] text-xs space-y-1.5">
                <span className="font-semibold text-slate-200">Target 3 Runner Target:</span>
                <p className="text-slate-400">
                  ₹{tradingPlan.target3.price} (Risk-to-Reward 1:4.0, 20% remaining position size trailing under rising EMAs).
                </p>
              </div>
            </div>

            {/* Position Sizing & Capital Discipline Card */}
            <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                POSITION SIZING & MAXIMUM RISK CAP
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                  <span className="text-slate-400 text-[10px] font-mono uppercase block">Suggested Quantity</span>
                  <span className="text-base font-bold font-mono text-white mt-1 block">
                    {tradingPlan.positionSizing.suggestedQuantity} Shares
                  </span>
                </div>
                <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                  <span className="text-slate-400 text-[10px] font-mono uppercase block">Max Loss Allowed</span>
                  <span className="text-base font-bold font-mono text-rose-400 mt-1 block">
                    ₹{tradingPlan.positionSizing.maxLoss.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                  <span className="text-slate-400 text-[10px] font-mono uppercase block">Potential Profit (T2)</span>
                  <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                    ₹{tradingPlan.positionSizing.potentialProfit.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                  <span className="text-slate-400 text-[10px] font-mono uppercase block">Risk Allocation</span>
                  <span className="text-base font-bold font-mono text-cyan-400 mt-1 block">
                    1.00% of Capital
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary / Status Sidecard */}
          <div className="space-y-6">
            <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white font-mono tracking-wide">MARKET STRUCTURE</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#161f30]">
                  <span className="text-slate-400">Trend Bias</span>
                  <span className="font-bold text-emerald-400 font-mono">{marketStructure.overallTrend}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#161f30]">
                  <span className="text-slate-400">ADX Strength</span>
                  <span className="font-bold text-white font-mono">{marketStructure.trendStrength}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#161f30]">
                  <span className="text-slate-400">Timeframe</span>
                  <span className="font-bold text-cyan-400 font-mono">{stockInfo.timeframe}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#161f30]">
                  <span className="text-slate-400">Data Freshness</span>
                  <span className="font-bold text-emerald-400 font-mono">{stockInfo.dataFreshness}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Data Timestamp</span>
                  <span className="text-slate-300 font-mono text-[11px]">{new Date(stockInfo.dataTimestamp).toLocaleTimeString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onNewAnalysis}
                className="w-full mt-4 py-2.5 rounded-lg bg-[#161f30] hover:bg-[#202c42] text-slate-200 border border-[#223049] text-xs font-mono font-semibold transition-colors"
              >
                Upload Another Chart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CANDLESTICK ANALYSIS & CONFIRMATION ENGINE */}
      {activeTab === 'candlestick' && (
        <div className="space-y-6">
          <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              LATEST COMPLETED CANDLE GEOMETRY & METRICS
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs font-mono">
              <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                <span className="text-slate-400 text-[10px]">Body Size</span>
                <span className="text-sm font-bold text-white block mt-1">₹{candlestickAnalysis.metrics.bodySize}</span>
              </div>
              <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                <span className="text-slate-400 text-[10px]">Upper Wick</span>
                <span className="text-sm font-bold text-slate-300 block mt-1">₹{candlestickAnalysis.metrics.upperWick}</span>
              </div>
              <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                <span className="text-slate-400 text-[10px]">Lower Wick</span>
                <span className="text-sm font-bold text-slate-300 block mt-1">₹{candlestickAnalysis.metrics.lowerWick}</span>
              </div>
              <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                <span className="text-slate-400 text-[10px]">Total Range</span>
                <span className="text-sm font-bold text-white block mt-1">₹{candlestickAnalysis.metrics.totalRange}</span>
              </div>
              <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                <span className="text-slate-400 text-[10px]">Body/Range Ratio</span>
                <span className="text-sm font-bold text-cyan-400 block mt-1">{candlestickAnalysis.metrics.bodyToRangeRatio}</span>
              </div>
              <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
                <span className="text-slate-400 text-[10px]">Wick/Body Ratio</span>
                <span className="text-sm font-bold text-cyan-400 block mt-1">{candlestickAnalysis.metrics.wickToBodyRatio}</span>
              </div>
            </div>

            <div className="bg-[#070a0f] p-4 rounded-lg border border-[#161f30] text-xs space-y-1.5">
              <h4 className="font-bold text-slate-200">Candle Psychology Narrative:</h4>
              <p className="text-slate-300 leading-relaxed">{candlestickAnalysis.candlePsychology}</p>
            </div>
          </div>

          {/* Next Candle Confirmation Engine Results */}
          <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono tracking-wide flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                NEXT CANDLE CONFIRMATION ENGINE (CORE CRITERIA)
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                COMPLETED CANDLES ONLY
              </span>
            </h3>

            {candlestickAnalysis.nextCandleConfirmation.length === 0 ? (
              <p className="text-xs text-slate-400">No prominent reversal pattern requiring next candle confirmation.</p>
            ) : (
              candlestickAnalysis.nextCandleConfirmation.map((conf, idx) => (
                <div key={idx} className="bg-[#070a0f] p-4 rounded-lg border border-[#161f30] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm">{conf.patternName}</span>
                    <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                      conf.status.includes('Confirmed') ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' :
                      conf.status.includes('Failed') ? 'bg-rose-950/80 border-rose-500 text-rose-400' :
                      'bg-amber-950/80 border-amber-500 text-amber-300'
                    }`}>
                      {conf.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{conf.explanation}</p>

                  <div className="space-y-1.5 pt-2 border-t border-[#161f30]">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">Evaluated Criteria:</span>
                    {conf.criteriaEvaluated.map((crit, cIdx) => (
                      <div key={cIdx} className="flex items-center justify-between text-xs py-1 border-b border-[#121926] last:border-0">
                        <span className="text-slate-300">{crit.criterion}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-[11px]">{crit.details}</span>
                          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                            crit.passed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {crit.passed ? 'PASSED' : 'WAIT'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CHART PATTERNS & SMC */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              CLASSICAL CHART PATTERNS IDENTIFIED
            </h3>

            {chartPatternAnalysis.length === 0 ? (
              <p className="text-xs text-slate-400">No macro classical chart pattern currently breaking out; price respecting local S/R channels.</p>
            ) : (
              chartPatternAnalysis.map((p, idx) => (
                <div key={idx} className="bg-[#070a0f] p-4 rounded-lg border border-[#161f30] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono text-sm">{p.name}</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                      p.status === 'completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-300">{p.description}</p>
                  <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
                    <div className="bg-[#101622] p-2 rounded">
                      <span className="text-slate-500 block">Breakout Level</span>
                      <span className="text-white font-bold">₹{p.breakoutLevel}</span>
                    </div>
                    <div className="bg-[#101622] p-2 rounded">
                      <span className="text-slate-500 block">Confirmation Level</span>
                      <span className="text-cyan-400 font-bold">₹{p.confirmationLevel}</span>
                    </div>
                    <div className="bg-[#101622] p-2 rounded">
                      <span className="text-slate-500 block">Invalidation</span>
                      <span className="text-rose-400 font-bold">₹{p.invalidationLevel}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Smart Money Concepts (SMC) */}
          <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono tracking-wide flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                SMART MONEY CONCEPTS (SMC / ICT STRUCTURE)
              </span>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                Zone: {smcAnalysis.marketZone}
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#070a0f] p-3.5 rounded-lg border border-[#161f30] space-y-1.5">
                <span className="font-bold text-white">BOS / CHoCH Shifts:</span>
                <p className="text-slate-300">{smcAnalysis.chochDetails || smcAnalysis.bosDetails || 'Normal structural progression without major character shift.'}</p>
              </div>

              <div className="bg-[#070a0f] p-3.5 rounded-lg border border-[#161f30] space-y-1.5">
                <span className="font-bold text-white">Liquidity Sweeps:</span>
                {smcAnalysis.liquiditySweeps.length === 0 ? (
                  <p className="text-slate-400">No major swing liquidity sweep in recent candles.</p>
                ) : (
                  smcAnalysis.liquiditySweeps.map((s, idx) => (
                    <p key={idx} className="text-slate-300">• {s.description}</p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TECHNICAL INDICATORS */}
      {activeTab === 'indicators' && (
        <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            COMPREHENSIVE INDICATOR ENGINE OUTPUT
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
              <span className="text-slate-500 text-[10px] block">RSI (14)</span>
              <span className="text-base font-bold text-cyan-400 mt-0.5 block">{technicalIndicators.rsi14.value}</span>
              <span className="text-[10px] text-slate-400">{technicalIndicators.rsi14.signal.toUpperCase()}</span>
            </div>
            <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
              <span className="text-slate-500 text-[10px] block">VWAP</span>
              <span className="text-base font-bold text-white mt-0.5 block">₹{technicalIndicators.vwap.value}</span>
              <span className="text-[10px] text-slate-400">Price is {technicalIndicators.vwap.priceRelation}</span>
            </div>
            <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
              <span className="text-slate-500 text-[10px] block">MACD Histogram</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">{technicalIndicators.macd.histogram}</span>
              <span className="text-[10px] text-slate-400">MACD: {technicalIndicators.macd.macd}</span>
            </div>
            <div className="bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
              <span className="text-slate-500 text-[10px] block">Relative Volume (RVOL)</span>
              <span className="text-base font-bold text-cyan-400 mt-0.5 block">{technicalIndicators.volumeMetrics.relativeVolume}x</span>
              <span className="text-[10px] text-slate-400">{technicalIndicators.volumeMetrics.isBreakoutVolume ? 'Breakout Volume' : 'Normal Volume'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#070a0f] p-3.5 rounded-lg border border-[#161f30] space-y-2">
              <span className="font-bold text-slate-200">Exponential Moving Averages (EMA):</span>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>EMA 9: <span className="text-white">₹{technicalIndicators.ema9}</span></div>
                <div>EMA 20: <span className="text-white">₹{technicalIndicators.ema20}</span></div>
                <div>EMA 21: <span className="text-white">₹{technicalIndicators.ema21}</span></div>
                <div>EMA 50: <span className="text-white">₹{technicalIndicators.ema50}</span></div>
                <div>EMA 100: <span className="text-white">₹{technicalIndicators.ema100}</span></div>
                <div>EMA 200: <span className="text-white">₹{technicalIndicators.ema200}</span></div>
              </div>
            </div>

            <div className="bg-[#070a0f] p-3.5 rounded-lg border border-[#161f30] space-y-2">
              <span className="font-bold text-slate-200">Volatility & Oscillators:</span>
              <div className="space-y-1 text-slate-300">
                <div>Bollinger Upper: ₹{technicalIndicators.bollingerBands.upper}</div>
                <div>Bollinger Lower: ₹{technicalIndicators.bollingerBands.lower}</div>
                <div>ATR (14): ₹{technicalIndicators.atr.value} ({technicalIndicators.atr.percent}%)</div>
                <div>Stochastic RSI: K={technicalIndicators.stochRsi.k}, D={technicalIndicators.stochRsi.d}</div>
                <div>ADX: {technicalIndicators.adx.adx} ({technicalIndicators.adx.trendStrength.toUpperCase()})</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 12 STRATEGIES & CONFLUENCE REPORT */}
      {activeTab === 'strategies' && (
        <div className="space-y-6">
          <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                STRATEGY CONFLUENCE REPORT
              </h3>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Rating: {confluenceReport.rating} ({confluenceReport.confluenceScore}/100)
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#070a0f] p-3 rounded-lg border border-[#161f30]">
              {confluenceReport.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#070a0f] p-3.5 rounded-lg border border-emerald-950/60 space-y-2">
                <span className="font-bold text-emerald-400 font-mono">CONFIRMING FACTORS:</span>
                {confluenceReport.confirmingFactors.map((f, idx) => (
                  <p key={idx} className="text-slate-300">• {f}</p>
                ))}
              </div>

              <div className="bg-[#070a0f] p-3.5 rounded-lg border border-rose-950/60 space-y-2">
                <span className="font-bold text-rose-400 font-mono">CONFLICTING / WARNING FACTORS:</span>
                {confluenceReport.conflictingFactors.length === 0 ? (
                  <p className="text-slate-400">None detected; full technical synchronization.</p>
                ) : (
                  confluenceReport.conflictingFactors.map((f, idx) => (
                    <p key={idx} className="text-slate-300">• {f}</p>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 12 Strategies Ranked */}
          <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono tracking-wide">12 SYSTEMATIC STRATEGIES EVALUATION</h3>
            <div className="space-y-3">
              {report.strategyEvaluations.map((strat) => (
                <div key={strat.id} className="bg-[#070a0f] p-3.5 rounded-lg border border-[#161f30] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-white">{strat.name}</span>
                    <span className="font-mono text-cyan-400 bg-[#161f30] px-2 py-0.5 rounded font-bold">
                      Score: {strat.score}/100
                    </span>
                  </div>
                  <p className="text-slate-400">{strat.marketConditions}</p>
                  <p className="text-slate-300 font-medium">Entry: {strat.entryCondition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: NEXT CANDLE SCENARIOS */}
      {activeTab === 'scenarios' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0d131f] border border-emerald-950/60 rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>BULLISH SCENARIO</span>
            </div>
            <div className="text-xs space-y-2 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] font-mono">Breakout Trigger</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">Above ₹{nextCandleScenarios.bullish.breakoutLevel}</span>
              </div>
              <p>{nextCandleScenarios.bullish.requiredPriceAction}</p>
              <p className="text-slate-400">{nextCandleScenarios.bullish.volumeRequirement}</p>
              <div className="text-[11px] text-rose-400">Invalidation: Close below ₹{nextCandleScenarios.bullish.invalidationLevel}</div>
            </div>
          </div>

          <div className="bg-[#0d131f] border border-rose-950/60 rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-mono font-bold text-sm">
              <ArrowDownRight className="w-4 h-4" />
              <span>BEARISH SCENARIO</span>
            </div>
            <div className="text-xs space-y-2 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] font-mono">Breakdown Trigger</span>
                <span className="font-mono font-bold text-rose-400 text-sm">Below ₹{nextCandleScenarios.bearish.supportBreakdown}</span>
              </div>
              <p>{nextCandleScenarios.bearish.bearishConfirmation}</p>
              <p className="text-slate-400">{nextCandleScenarios.bearish.volumeRequirement}</p>
              <div className="text-[11px] text-emerald-400">Invalidation: Reclaim above ₹{nextCandleScenarios.bearish.invalidationLevel}</div>
            </div>
          </div>

          <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-amber-300 font-mono font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>NEUTRAL / WAIT SCENARIO</span>
            </div>
            <div className="text-xs space-y-2 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] font-mono">Consolidation Range</span>
                <span className="font-mono font-bold text-amber-300 text-sm">₹{nextCandleScenarios.neutral.consolidationRange.min} - ₹{nextCandleScenarios.neutral.consolidationRange.max}</span>
              </div>
              <p>{nextCandleScenarios.neutral.indecisionTriggers}</p>
              <p className="text-slate-400">{nextCandleScenarios.neutral.confirmationWait}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CANDLE-BY-CANDLE PRICE ACTION */}
      {activeTab === 'priceaction' && (
        <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
            <LineChart className="w-4 h-4 text-cyan-400" />
            CANDLE-BY-CANDLE PRICE ACTION ANALYSIS (LATEST 15 CANDLES)
          </h3>

          <div className="space-y-3 overflow-x-auto">
            {priceActionAnalysis.map((c) => (
              <div
                key={c.index}
                className={`p-3.5 rounded-lg border text-xs font-mono space-y-1.5 transition-all ${
                  c.isKeyCandle
                    ? 'bg-[#101b2b] border-cyan-500/40 shadow-md'
                    : 'bg-[#070a0f] border-[#161f30]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-cyan-400">Candle #{c.index}</span>
                    <span className="text-slate-400 text-[11px]">{c.timeFormatted}</span>
                    <span className="text-slate-200">Close: ₹{c.close.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.buyerSellerControl === 'buyers' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      c.buyerSellerControl === 'sellers' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      Control: {c.buyerSellerControl.toUpperCase()}
                    </span>
                    <span className="bg-[#161f30] px-2 py-0.5 rounded text-[10px] text-slate-300">
                      {c.structure}
                    </span>
                  </div>
                </div>
                <p className="text-slate-300 font-sans leading-relaxed">{c.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: AI EXPLANATION ASSISTANT */}
      {activeTab === 'ai' && (
        <AiExplanationAssistant report={report} />
      )}
    </div>
  );
};

