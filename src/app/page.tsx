'use client';

import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { Navbar } from '@/components/layout/Navbar';
import { TickerTape } from '@/components/layout/TickerTape';
import { ScreenshotUploadArea } from '@/components/analysis/ScreenshotUploadArea';
import { AnalysisControls } from '@/components/analysis/AnalysisControls';
import { AnalysisResultView } from '@/components/analysis/AnalysisResultView';
import { MarketScannerView } from '@/components/scanner/MarketScannerView';
import { BacktestingLabView } from '@/components/backtester/BacktestingLabView';
import { RiskCalculatorView } from '@/components/calculator/RiskCalculatorView';
import { StrategyGuideView } from '@/components/guide/StrategyGuideView';
import { AnalysisHistoryView } from '@/components/history/AnalysisHistoryView';
import { AnalysisReport, StockExchange, Timeframe, TradingStyle } from '@/types';
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'scanner' | 'backtest' | 'risk' | 'guide' | 'history'>('analyze');

  // Upload & Input state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [imageQuality, setImageQuality] = useState<'good' | 'acceptable' | 'poor' | null>(null);

  const [symbol, setSymbol] = useState<string>('RELIANCE');
  const [exchange, setExchange] = useState<StockExchange>('NSE');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [tradingStyle, setTradingStyle] = useState<TradingStyle>('Intraday');
  const [capital, setCapital] = useState<number>(100000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);

  // Analysis result state
  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<AnalysisReport[]>([]);

  // Load history from session storage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('chartiq_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      // sessionStorage unavailable
    }
  }, []);

  // Save history to session storage
  const saveToHistory = (report: AnalysisReport) => {
    try {
      const updated = [report, ...history.filter(h => h.id !== report.id)].slice(0, 15);
      setHistory(updated);
      sessionStorage.setItem('chartiq_history', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const deleteFromHistory = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    try {
      sessionStorage.setItem('chartiq_history', JSON.stringify(updated));
    } catch (e) {}
  };

  const clearAllHistory = () => {
    setHistory([]);
    try {
      sessionStorage.removeItem('chartiq_history');
    } catch (e) {}
  };

  // Run full analysis pipeline
  const handleAnalyze = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentReport(null);

    const steps = [
      'Scanning screenshot & multimodal Vision OCR...',
      'Connecting to authorized Indian market data engine (NSE/BSE)...',
      'Comparing screenshot structure against verified OHLC candles...',
      'Evaluating 25+ candlestick patterns & geometry...',
      'Executing Next Candle Confirmation Engine on completed candles...',
      'Analyzing Smart Money Concepts (BOS, CHoCH, Order Blocks)...',
      'Evaluating 12 systematic strategies & calculating confluence score...',
      'Formulating disciplined trading plan & position sizing...'
    ];

    let stepIndex = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStep(steps[stepIndex]);
    }, 700);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64 || undefined,
          mimeType,
          symbol,
          exchange,
          timeframe,
          tradingStyle,
          capital,
          riskPercent
        })
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed with HTTP status ${res.status}`);
      }

      const report: AnalysisReport = await res.json();
      setCurrentReport(report);
      saveToHistory(report);
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMessage(err.message || 'Error occurred while running quantitative analysis pipeline.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col font-sans">
      {/* 1. Statutory Financial Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 2. Indian Indices Real-Time Ticker Tape */}
      <TickerTape />

      {/* 3. Main Navigation Bar (No Login, No Register) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
      />

      {/* 4. Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {activeTab === 'analyze' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Header */}
            {!currentReport && (
              <div className="text-center max-w-3xl mx-auto space-y-3 pt-2 pb-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Indian Stock Market Technical Intelligence</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-mono">
                  CHART<span className="text-cyan-400">IQ</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 font-medium">
                  Upload your trading chart. Discover patterns. Understand market movements. Evaluate trading opportunities.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-2">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Analyze
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Evaluate
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Recommend
                  </span>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="bg-rose-950/60 border border-rose-500/80 rounded-xl p-4 flex items-start space-x-3 text-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-rose-300 font-mono">ANALYSIS ERROR</span>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Immediate Screenshot Upload & Control Section */}
            {!currentReport && (
              <div className="space-y-6">
                {/* 1. Screenshot Upload Area */}
                <ScreenshotUploadArea
                  imagePreview={imagePreview}
                  setImagePreview={setImagePreview}
                  setImageBase64={setImageBase64}
                  setMimeType={setMimeType}
                  imageQuality={imageQuality}
                  setImageQuality={setImageQuality}
                />

                {/* 2. Analysis Controls (Symbol, Exchange, Timeframe, Style, Button) */}
                <AnalysisControls
                  symbol={symbol}
                  setSymbol={setSymbol}
                  exchange={exchange}
                  setExchange={setExchange}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                  tradingStyle={tradingStyle}
                  setTradingStyle={setTradingStyle}
                  capital={capital}
                  setCapital={setCapital}
                  riskPercent={riskPercent}
                  setRiskPercent={setRiskPercent}
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  loadingStep={loadingStep}
                />
              </div>
            )}

            {/* Comprehensive Analysis Report View */}
            {currentReport && (
              <AnalysisResultView
                report={currentReport}
                onNewAnalysis={() => {
                  setCurrentReport(null);
                  setImagePreview(null);
                  setImageBase64(null);
                }}
              />
            )}
          </div>
        )}

        {/* TAB 2: MARKET SCANNER */}
        {activeTab === 'scanner' && (
          <MarketScannerView
            onSelectStock={(selectedSym) => {
              setSymbol(selectedSym);
              setActiveTab('analyze');
              handleAnalyze();
            }}
          />
        )}

        {/* TAB 3: BACKTESTING LAB */}
        {activeTab === 'backtest' && (
          <BacktestingLabView />
        )}

        {/* TAB 4: RISK CALCULATOR */}
        {activeTab === 'risk' && (
          <RiskCalculatorView />
        )}

        {/* TAB 5: STRATEGY & SMC GUIDE */}
        {activeTab === 'guide' && (
          <StrategyGuideView />
        )}

        {/* TAB 6: ANALYSIS HISTORY */}
        {activeTab === 'history' && (
          <AnalysisHistoryView
            history={history}
            onSelectReport={(rep) => {
              setCurrentReport(rep);
              setActiveTab('analyze');
            }}
            onDeleteReport={deleteFromHistory}
            onClearAll={clearAllHistory}
            onNewAnalysis={() => {
              setCurrentReport(null);
              setActiveTab('analyze');
            }}
          />
        )}
      </main>

      {/* 5. Professional Terminal Footer */}
      <footer className="border-t border-[#1a2333] bg-[#05070b] py-8 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white tracking-wider">CHARTIQ</span>
              <span>— Advanced AI-Powered Indian Stock Market Chart Intelligence</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-slate-400">
              <span>NSE / BSE Real-Time Architecture</span>
              <span>•</span>
              <span>Zero-Storage Privacy</span>
              <span>•</span>
              <span>Login-Free Platform</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed border-t border-[#161f30] pt-4">
            Financial Disclaimer: CHARTIQ provides AI-assisted technical analysis for informational and educational purposes only. Financial markets involve risk. AI analysis cannot guarantee future price movements or profits. Always independently verify trading information and consider your risk tolerance before making financial decisions. The platform does not execute automatic trades or solicit investments.
          </p>
        </div>
      </footer>
    </div>
  );
}

