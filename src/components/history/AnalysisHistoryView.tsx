'use client';

import { AnalysisReport } from '@/types';
import { ArrowRight, Download, History, Trash2 } from 'lucide-react';
import React from 'react';

interface AnalysisHistoryViewProps {
  history: AnalysisReport[];
  onSelectReport: (report: AnalysisReport) => void;
  onDeleteReport: (id: string) => void;
  onClearAll: () => void;
  onNewAnalysis: () => void;
}

export const AnalysisHistoryView: React.FC<AnalysisHistoryViewProps> = ({
  history,
  onSelectReport,
  onDeleteReport,
  onClearAll,
  onNewAnalysis
}) => {
  const exportAsJson = (report: AnalysisReport) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${report.stockInfo.symbol}_CHARTIQ_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-[#0d131f] border border-[#1e293b] p-5 rounded-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            TEMPORARY SESSION ANALYSIS HISTORY
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero logins or cloud tracking. Analysis history is stored strictly in your browser session and auto-cleared on exit.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onNewAnalysis}
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs transition-colors"
          >
            Upload New Chart
          </button>
          {history.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-[#0b0f17] border border-[#1a2333] rounded-xl p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center mx-auto text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold font-mono text-white">No Analysis History In Current Session</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Uploaded chart analyses will appear here during this session for quick recall and comparison.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-[#0d131f] border border-[#1e293b] hover:border-cyan-500/40 rounded-xl p-4 shadow-xl space-y-3 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#161f30]">
                  <span className="font-bold text-white font-mono text-base">{item.stockInfo.symbol}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                    item.tradingPlan.recommendation.includes('BUY') ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                    item.tradingPlan.recommendation.includes('SELL') ? 'bg-rose-950 text-rose-400 border-rose-800' :
                    'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {item.tradingPlan.recommendation}
                  </span>
                </div>

                <div className="pt-2 text-xs space-y-1.5 text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Price:</span>
                    <span>₹{item.stockInfo.currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timeframe:</span>
                    <span>{item.stockInfo.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Strategy:</span>
                    <span className="truncate max-w-[150px]">{item.selectedStrategy.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date/Time:</span>
                    <span className="text-[11px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#161f30] flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectReport(item)}
                  className="flex-1 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 font-bold text-xs border border-cyan-500/30 flex items-center justify-center gap-1 transition-all"
                >
                  <span>Open Report</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => exportAsJson(item)}
                  title="Export JSON"
                  className="p-1.5 rounded bg-[#161f30] hover:bg-[#202c42] text-slate-300 border border-[#24334c]"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteReport(item.id)}
                  title="Delete"
                  className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900 text-rose-400 border border-rose-800/60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

