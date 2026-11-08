import { IndianStockSymbol } from '@/types';

export const INDIAN_STOCKS: IndianStockSymbol[] = [
  { symbol: 'NIFTY 50', name: 'NIFTY 50 Index', exchange: 'NSE', sector: 'Indices', isIndex: true },
  { symbol: 'BANK NIFTY', name: 'NIFTY Bank Index', exchange: 'NSE', sector: 'Indices', isIndex: true },
  { symbol: 'FINNIFTY', name: 'NIFTY Financial Services', exchange: 'NSE', sector: 'Indices', isIndex: true },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', exchange: 'NSE', sector: 'Oil & Gas / Telecom' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', exchange: 'NSE', sector: 'IT Services' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'INFY', name: 'Infosys Ltd.', exchange: 'NSE', sector: 'IT Services' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', exchange: 'NSE', sector: 'Telecommunications' },
  { symbol: 'ITC', name: 'ITC Ltd.', exchange: 'NSE', sector: 'FMCG' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', exchange: 'NSE', sector: 'Construction & Engineering' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', exchange: 'NSE', sector: 'Automobile' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', exchange: 'NSE', sector: 'Automobile' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', exchange: 'NSE', sector: 'Pharmaceuticals' },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', exchange: 'NSE', sector: 'Consumer Goods' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', exchange: 'NSE', sector: 'NBFC / Financials' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', exchange: 'NSE', sector: 'Metals & Mining' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', exchange: 'NSE', sector: 'Paints / Consumer' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', exchange: 'NSE', sector: 'IT Services' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', exchange: 'NSE', sector: 'IT Services' },
  { symbol: 'NTPC', name: 'NTPC Ltd.', exchange: 'NSE', sector: 'Power & Utilities' },
  { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation', exchange: 'NSE', sector: 'Oil & Gas' },
  { symbol: 'POWERGRID', name: 'Power Grid Corp of India', exchange: 'NSE', sector: 'Power' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', exchange: 'NSE', sector: 'Cement' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', exchange: 'NSE', sector: 'Automobile' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.', exchange: 'NSE', sector: 'Mining' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', exchange: 'NSE', sector: 'Conglomerate' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd.', exchange: 'NSE', sector: 'Infrastructure' },
];

export function getYahooTicker(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  if (clean === 'NIFTY 50' || clean === 'NIFTY') return '^NSEI';
  if (clean === 'BANK NIFTY' || clean === 'BANKNIFTY') return '^NSEBANK';
  if (clean === 'FINNIFTY') return 'NIFTY_FIN_SERVICE.NS';
  if (clean === 'SENSEX') return '^BSESN';
  return `${clean}.NS`;
}

