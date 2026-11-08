# CHARTIQ
## AI-Powered Indian Stock Market Chart Intelligence & Trading Analysis Platform

**CHARTIQ** is an advanced, quantitative AI-assisted technical analysis platform engineered exclusively for the Indian stock market (**NSE & BSE**). It is designed to act like a disciplined institutional technical analyst: it analyzes uploaded trading chart screenshots, verifies them against live/authorized Indian market data, identifies candlestick and chart patterns, validates completed next-candle confirmations, scores 12 systematic strategies, calculates confluence with collinearity deduplication, and generates explainable, risk-managed trading plans.

---

### Core Philosophy
$$\text{Analyze} \longrightarrow \text{Verify} \longrightarrow \text{Confirm} \longrightarrow \text{Evaluate} \longrightarrow \text{Recommend}$$

Every recommendation must be supported by multiple technical confirmations. The system never recommends trades based on a single candlestick pattern or indicator. When evidence is insufficient, it strictly returns:
> **`NO TRADE – WAIT FOR CONFIRMATION`**

---

## 1. Key Architectural Features

### 🚫 Strict Zero-Auth & Privacy Policy
- **No Login, No Registration, No Accounts**: The platform opens immediately to the screenshot upload interface.
- **Zero Cloud Storage of Charts**: Uploaded chart screenshots and analysis histories are retained strictly within your temporary browser session and auto-deleted upon exit.
- **No Payments / No Subscriptions**: Clean, open fintech tool for Indian market participants.

### 📸 Immediate Screenshot Upload & Multimodal Vision
- Supports **PNG, JPG, JPEG, WEBP** up to 15MB.
- Drag-and-drop, file browser, image preview, zoom in/out, replace image, and upload progress.
- Automatic image resolution and quality checker.
- Multimodal Vision Engine powered by OpenAI Vision API (with automated computer-vision heuristics fallback).

### 🇮🇳 Authorized Indian Market Data Verification
- Dedicated market data service for **NSE India & BSE India** (supporting **NIFTY 50, BANK NIFTY, FINNIFTY, RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK, SBIN, etc.**).
- Provider abstraction (`IMarketDataProvider`) supporting live Yahoo Finance quotes / broker APIs with deterministic calibrated fallbacks.
- Market hours status detection: `OPEN` (09:15 - 15:30 IST), `PRE_MARKET`, `POST_MARKET`, `CLOSED`.
- Clear data status display: `LIVE` / `DELAYED` / `HISTORICAL`.

### 🔍 Screenshot vs. Market Data Comparison Engine
- Cross-verifies screenshot symbol, exchange, timeframe, and price levels against verified OHLC candles.
- Automatically flags **outdated screenshots** (>2.5% divergence) or timeframe/symbol mismatches.

### 🕯️ Advanced Candlestick Pattern Engine (25+ Patterns)
- **Bullish**: Hammer, Inverted Hammer, Bullish Engulfing, Piercing Pattern, Morning Star, Three White Soldiers, Tweezer Bottom, Dragonfly Doji, Bullish Marubozu, Bullish Harami, etc.
- **Bearish**: Shooting Star, Hanging Man, Bearish Engulfing, Dark Cloud Cover, Evening Star, Three Black Crows, Tweezer Top, Gravestone Doji, Bearish Marubozu, Bearish Harami, etc.
- **Neutral**: Doji, Long-Legged Doji, Spinning Top, Inside Bar (Compression), Outside Bar (Expansion).
- Calculates exact body size, upper/lower wicks, range, body-to-range ratios, and wick-to-body ratios.
- Evaluates location context (near support/resistance, after downtrend/uptrend).

### 🛡️ Next Candle Confirmation Engine (Core Discipline)
- Validates what happens after each pattern using actual **completed OHLC candles**.
- Explicitly handles Hammer, Shooting Star, Bullish Engulfing, Bearish Engulfing, Morning/Evening Star:
  - *Confirmed Reversal*: Subsequent completed candle closed firmly beyond pattern high/low with volume.
  - *Potential Reversal*: Favorable directional close but moderate volume.
  - *Weak Confirmation*: Failure to close beyond key pattern boundary.
  - *Failed Pattern*: Low/High breached, invalidating thesis.
  - *Waiting for Confirmation*: Pattern formed on latest candle; awaiting subsequent completed candle close.
- **Rule**: Currently forming candles are provisional.

### 📐 Chart Patterns & Smart Money Concepts (SMC)
- Identifies Double Tops/Bottoms, Head & Shoulders, Triangles, Flags, Wedges, Channels, and Ranges.
- **Smart Money Concepts (SMC / ICT)**:
  - **BOS** (Break of Structure) & **CHoCH** (Change of Character).
  - **Liquidity Sweeps**: Detection of buy-side / sell-side stop runs that close back inside the range.
  - **Order Blocks (OB)** & **Fair Value Gaps (FVG)**.
  - **Premium vs. Discount Zones** relative to the 50% dealing range equilibrium.

### 📈 Technical Indicator Engine
- **Trend**: EMA 9, 20, 21, 50, 100, 200; SMA 20, 50, 200.
- **Momentum**: RSI 14 (with Bullish/Bearish Divergence detection), MACD (12, 26, 9), Stochastic RSI, CCI 20, ADX 14 with +DI/-DI.
- **Volatility**: Bollinger Bands (20, 2), ATR 14.
- **Volume**: VWAP, On-Balance Volume (OBV), Volume MA 20, Relative Volume (RVOL), Breakout Volume (RVOL > 1.5x).

### 🎯 12 Systematic Strategies & Confluence Engine
1. Pure Price Action
2. Support & Resistance
3. High-Volume Range Breakouts
4. Breakout and Retest
5. EMA Crossover & Ribbon
6. VWAP Institutional Anchor
7. RSI Reversal & Divergence
8. MACD Momentum Acceleration
9. Fibonacci Golden Pocket (0.500 - 0.618)
10. Smart Money Concepts (SMC)
11. Trend Following (ADX > 22)
12. Systematic Exhaustion Reversal
- **Collinearity Deduplication**: RSI, Stoch RSI, and MACD are grouped as one momentum factor; EMA clusters are grouped as one trend factor to prevent double-counting.

### 📊 TradingView Lightweight Charts
- Interactive financial charting with emerald/rose candles, volume sub-panels, and real-time horizontal price lines for **Entry**, **Stop-Loss**, and **Targets**.

### 💰 Risk Management & Indian Transaction Taxes Calculator
- Sizing strictly capped by capital risk % (default conservative 1%).
- Calculates realistic Indian statutory trading charges:
  - **Brokerage**: Flat ₹20 or 0.03%
  - **STT**: 0.025% intraday sell / 0.1% delivery
  - **Exchange Turnover Charges**: NSE 0.00325%
  - **SEBI Charges**: ₹10/crore (0.0001%)
  - **Stamp Duty**: 0.003% intraday buy
  - **GST**: 18% on service charges
  - Points to breakeven calculation.

### 📡 Real-Time Indian Market Scanner
- Scans top NSE/BSE liquid instruments for RSI extremes (<30 / >70), EMA 9/21 crossovers, MACD crossovers, Volume breakouts, and tests of 20-day highs/lows.

### 🧪 Historical Backtesting Lab
- Validates rules against historical Indian OHLC data.
- Outputs Win Rate %, Profit Factor, Net Return %, Max Drawdown %, and itemized trade logs with zero look-ahead bias.

### 🤖 AI Explanation Assistant
- Context-grounded conversational analyst. Users can ask:
  - *"Why is this a BUY/WAIT?"*
  - *"Why is this Hammer not confirmed?"*
  - *"Where is the stop-loss and why?"*
  - *"What happens if support breaks?"*

---

## 2. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, TradingView Lightweight Charts (`lightweight-charts`).
- **Backend**: Next.js REST API routes (`/api/analyze`, `/api/market-data`, `/api/scanner`, `/api/backtest`, `/api/risk-calc`, `/api/ai-chat`).
- **AI & Vision**: OpenAI Vision API integration (`gpt-4o`) with structured JSON schema + automated computer-vision heuristics fallback.
- **Analytics & Math**: Pure deterministic quantitative algorithms for TA indicators, candle geometry, and SMC structures.

---

## 3. Running Locally

### Prerequisites
- Node.js (v18+ or v20+)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/chartiq.git
cd chartiq

# Install dependencies
npm install

# Build production bundle
npm run build

# Start production server on port 3000
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Configuration (Optional)
Create `.env.local` to configure an OpenAI API key for vision recognition:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```
*(If no API key is set, CHARTIQ automatically operates using its built-in automated computer-vision and quantitative engines).*

---

## 4. Statutory Financial Disclaimer
> **CHARTIQ provides AI-assisted technical analysis for informational and educational purposes only. Financial markets involve risk. AI analysis cannot guarantee future price movements or profits. Always independently verify trading information and consider your risk tolerance before making financial decisions.**

