'use client';

import {
  Activity,
  BarChart3,
  BookOpen,
  Calculator,
  Compass,
  History,
  TrendingUp,
  Zap
} from 'lucide-react';
import React from 'react';

interface NavbarProps {
  activeTab: 'analyze' | 'scanner' | 'backtest' | 'risk' | 'guide' | 'history';
  setActiveTab: (tab: 'analyze' | 'scanner' | 'backtest' | 'risk' | 'guide' | 'history') => void;
  historyCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, historyCount = 0 }) => {
  return (
    <header className="bg-[#0b0f17]/90 backdrop-blur-md border-b border-[#1a2333] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('analyze')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 p-[1px] shadow-lg shadow-cyan-500/10">
            <div className="w-full h-full bg-[#0d131f] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-wider text-white font-mono">CHART<span className="text-cyan-400">IQ</span></span>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold px-1.5 py-0.5 rounded">
                INDIA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight">AI Stock Intelligence (NSE & BSE)</p>
          </div>
        </div>

        {/* Navigation Tabs - No Login, No Registration */}
        <nav className="hidden md:flex items-center space-x-1 font-medium text-sm">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md transition-all ${
              activeTab === 'analyze'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analyze Chart</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md transition-all ${
              activeTab === 'scanner'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Market Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('backtest')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md transition-all ${
              activeTab === 'backtest'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Backtesting Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('risk')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md transition-all ${
              activeTab === 'risk'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Risk Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md transition-all ${
              activeTab === 'guide'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Strategy & SMC</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md transition-all ${
              activeTab === 'history'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.2 rounded-full font-mono">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Live Market Status Pill */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#101622] border border-[#1a2333] px-3 py-1.5 rounded-full text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-mono">NSE/BSE</span>
            <span className="text-emerald-400 font-medium">LIVE CONNECTED</span>
          </div>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 space-x-2 border-t border-[#1a2333] bg-[#070a0f] text-xs">
        <button
          onClick={() => setActiveTab('analyze')}
          className={`px-3 py-1.5 rounded whitespace-nowrap ${activeTab === 'analyze' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
        >
          Analyze
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-3 py-1.5 rounded whitespace-nowrap ${activeTab === 'scanner' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
        >
          Scanner
        </button>
        <button
          onClick={() => setActiveTab('backtest')}
          className={`px-3 py-1.5 rounded whitespace-nowrap ${activeTab === 'backtest' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
        >
          Backtest
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-3 py-1.5 rounded whitespace-nowrap ${activeTab === 'risk' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
        >
          Risk Calc
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-3 py-1.5 rounded whitespace-nowrap ${activeTab === 'guide' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
        >
          SMC Guide
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded whitespace-nowrap ${activeTab === 'history' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
        >
          History ({historyCount})
        </button>
      </div>
    </header>
  );
};

