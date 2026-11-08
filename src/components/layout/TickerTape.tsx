'use client';

import React from 'react';

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const TICKERS: TickerItem[] = [
  { symbol: 'NIFTY 50', price: '24,250.80', change: '+0.42%', isPositive: true },
  { symbol: 'BANK NIFTY', price: '51,780.40', change: '+0.65%', isPositive: true },
  { symbol: 'FINNIFTY', price: '23,900.20', change: '+0.31%', isPositive: true },
  { symbol: 'RELIANCE', price: '₹2,985.50', change: '+1.12%', isPositive: true },
  { symbol: 'HDFCBANK', price: '₹1,665.40', change: '+0.55%', isPositive: true },
  { symbol: 'TCS', price: '₹4,120.00', change: '-0.28%', isPositive: false },
  { symbol: 'INFY', price: '₹1,845.20', change: '+0.84%', isPositive: true },
  { symbol: 'ICICIBANK', price: '₹1,240.75', change: '+1.30%', isPositive: true },
  { symbol: 'SBIN', price: '₹815.30', change: '+0.45%', isPositive: true },
  { symbol: 'BHARTIARTL', price: '₹1,585.00', change: '+0.95%', isPositive: true },
  { symbol: 'TATAMOTORS', price: '₹965.80', change: '-0.40%', isPositive: false },
  { symbol: 'MARUTI', price: '₹11,950.00', change: '+0.70%', isPositive: true },
];

export const TickerTape: React.FC = () => {
  return (
    <div className="bg-[#0b0f17] border-b border-[#1a2333] overflow-hidden whitespace-nowrap py-1.5 text-xs font-mono">
      <div className="flex animate-marquee space-x-8 px-4">
        {[...TICKERS, ...TICKERS].map((t, idx) => (
          <div key={idx} className="inline-flex items-center space-x-2">
            <span className="text-slate-400 font-semibold">{t.symbol}</span>
            <span className="text-slate-200">{t.price}</span>
            <span className={t.isPositive ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
              {t.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

