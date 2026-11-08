'use client';

import { AlertTriangle, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';

export const DisclaimerBanner: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-[#0f172a]/95 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-200/90 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-400 shrink-0">STATUTORY FINANCIAL DISCLAIMER:</span>
          {!collapsed && (
            <span className="text-slate-300">
              CHARTIQ provides AI-assisted technical analysis for informational and educational purposes only. Financial markets involve risk. AI analysis cannot guarantee future price movements or profits. Always independently verify trading information and consider your risk tolerance before making financial decisions.
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" /> Analysis-Only Platform (Zero Trade Execution)
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-200 text-[11px] underline"
          >
            {collapsed ? 'Expand Disclaimer' : 'Collapse'}
          </button>
        </div>
      </div>
    </div>
  );
};

