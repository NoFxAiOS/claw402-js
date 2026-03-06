# claw402

[![npm version](https://img.shields.io/npm/v/claw402.svg)](https://www.npmjs.com/package/claw402)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Typed TypeScript SDK for [claw402.ai](https://claw402.ai) — pay-per-call data APIs via [x402](https://www.x402.org/) micropayments.

**200+ endpoints** covering crypto market data, US stocks, China A-shares, forex, global time-series, and AI (OpenAI/Anthropic/DeepSeek/Qwen). No API key, no signup, no subscription — just a Base wallet with USDC.

## Install

```bash
npm install NoFxAiOS/claw402-js
```

## Quick Start

```typescript
import { Claw402 } from "claw402"

const client = new Claw402({
  privateKey: process.env.WALLET_PRIVATE_KEY as `0x${string}`,
})

// Crypto: Fund flow — $0.001/call
const flow = await client.coinank.fund.realtime({ productType: "SWAP" })
console.log(flow)

// US Stocks: Latest quote — $0.001/call
const quote = await client.alpaca.quotes.latest({ symbols: "AAPL,TSLA" })
console.log(quote)

// US Stocks: Market snapshot — $0.002/call
const snap = await client.polygon.snapshot.all({ tickers: "AAPL" })
console.log(snap)

// China A-shares — $0.001/call
const stocks = await client.tushare.cn.stockBasic({ listStatus: "L" })
console.log(stocks)

// Forex time-series — $0.001/call  (use getTimeSeries, not timeSeries which is a sub-resource)
const ts = await client.twelvedata.getTimeSeries({ symbol: "EUR/USD", interval: "1h" })
console.log(ts)

// AI: OpenAI chat — $0.01/call
const resp = await client.openai.openai.chat({ messages: [{ role: "user", content: "Hello" }] })
console.log(resp)

// AI: Anthropic Claude — $0.015/call
const msg = await client.anthropic.anthropic.messages({ messages: [{ role: "user", content: "Hello" }] })
console.log(msg)
```

## Features

- **Typed methods** — every endpoint has a dedicated TypeScript method with inline type hints
- **Automatic x402 payment** — signs EIP-3009 USDC transfers locally, never sends your key
- **11 provider groups** — crypto, US stocks, China stocks, forex, global data, and AI
- **Zero config** — just a private key, no API keys or registration
- **Base mainnet** — pays USDC per call on Coinbase L2

## API Overview

### Crypto Market Data

#### Coinank

| Resource | Methods | Description |
|----------|---------|-------------|
| `coinank.fund` | `realtime`, `history` | Real-time & historical fund flow |
| `coinank.oi` | `all`, `aggChart`, `symbolChart`, `kline`, ... | Open interest data |
| `coinank.liquidation` | `orders`, `intervals`, `aggHistory`, `liqMap`, `heatMap`, ... | Liquidation tracking |
| `coinank.fundingRate` | `current`, `accumulated`, `hist`, `weighted`, `heatmap`, ... | Funding rate analytics |
| `coinank.longshort` | `realtime`, `buySell`, `person`, `position`, ... | Long/short ratios |
| `coinank.hyper` | `topPosition`, `topAction` | HyperLiquid whale tracking |
| `coinank.etf` | `usBtc`, `usEth`, `usBtcInflow`, `usEthInflow`, `hkInflow` | ETF flow data |
| `coinank.indicator` | `fearGreed`, `altcoinSeason`, `btcMultiplier`, `ahr999`, ... | Market cycle indicators |
| `coinank.marketOrder` | `cvd`, `aggCvd`, `buySellValue`, ... | Taker flow / CVD |
| `coinank.kline` | `lists` | OHLCV candlestick data |
| `coinank.price` | `last` | Real-time price |
| `coinank.rank` | `screener`, `oi`, `volume`, `price`, `liquidation`, ... | Rankings & screeners |
| `coinank.news` | `list`, `detail` | Crypto news & alerts |

#### Nofxos (AI Signals)

| Resource | Methods | Description |
|----------|---------|-------------|
| `nofxos.ai500` | `list`, `stats` | AI500 high-potential coin signals |
| `nofxos.ai300` | `list`, `stats` | AI300 quant model rankings |
| `nofxos.netflow` | `topRanking`, `lowRanking` | Net capital flow rankings |
| `nofxos.oi` | `topRanking`, `lowRanking` | OI change rankings |
| `nofxos.fundingRate` | `top`, `low` | Extreme funding rate coins |
| `nofxos.price` | `ranking` | Price change rankings |
| `nofxos.upbit` | `hot`, `netflowTopRanking`, `netflowLowRanking` | Korean market data |

### US Stock & Options Market

#### Alpaca

| Resource | Methods | Description |
|----------|---------|-------------|
| `alpaca.quotes` | `latest`, `history` | Real-time & historical quotes — $0.001–0.002/call |
| `alpaca.bars` | `latest` | Latest OHLCV bar — $0.001/call |
| `alpaca.trades` | `latest`, `history` | Real-time & historical trades — $0.001–0.002/call |
| `alpaca.options` | `bars`, `quotesLatest`, `snapshots` | Options chain data — $0.003/call |
| `alpaca` | `getBars`, `snapshots`, `snapshot`, `movers`, `mostActives`, `news`, `corporateActions` | Direct market endpoints — $0.001–0.002/call |

```typescript
// Latest quotes for multiple symbols
const q = await client.alpaca.quotes.latest({ symbols: "AAPL,MSFT,TSLA" })

// Historical bars (note: getBars, not bars, to avoid collision with alpaca.bars sub-resource)
const bars = await client.alpaca.getBars({ symbols: "AAPL", timeframe: "1Day", start: "2024-01-01" })

// Top market movers
const movers = await client.alpaca.movers({ top: 10, marketType: "stocks" })

// Options snapshots
const opts = await client.alpaca.options.snapshots({ symbols: "AAPL240119C00150000" })
```

#### Polygon

| Resource | Methods | Description |
|----------|---------|-------------|
| `polygon.aggs` | `aggs`, `groupedDaily`, `dailyOpenClose`, `previousClose` | Aggregates / OHLCV bars — $0.001/call |
| `polygon.snapshots` | `allTickers`, `singleTicker`, `gainersLosers`, `universalSnapshot`, `optionsChain` | Full market snapshots — $0.002/call |
| `polygon.trades` | `trades`, `lastTrade`, `quotes`, `lastQuote` | Trade & quote tick data — $0.002/call |
| `polygon` | `tickerDetails`, `marketStatus`, `tickerTypes`, `exchanges`, `conditions`, `sma`, `ema`, `rsi`, `macd` | Reference & technical indicators — $0.001–0.003/call |

```typescript
// OHLCV bars
const bars = await client.polygon.aggs.aggs({
  stocksTicker: "AAPL", multiplier: 1, timespan: "day",
  from: "2024-01-01", to: "2024-12-31"
})

// RSI indicator
const rsi = await client.polygon.rsi({ stocksTicker: "AAPL", timespan: "day", window: 14 })

// Options chain
const chain = await client.polygon.snapshots.optionsChain({ underlyingAsset: "AAPL" })
```

#### Alpha Vantage

| Resource | Methods | Description |
|----------|---------|-------------|
| `alphavantage.us` | `quote`, `search`, `daily`, `dailyAdjusted`, `intraday`, `weekly`, `monthly`, `overview`, `earnings`, `income`, `balanceSheet`, `cashFlow`, `movers`, `news`, `rsi`, `macd`, `bbands`, `sma`, `ema` | Comprehensive financial data — $0.001–0.003/call |

```typescript
// Real-time quote
const quote = await client.alphavantage.us.quote({ symbol: "AAPL" })

// Daily OHLCV
const daily = await client.alphavantage.us.daily({ symbol: "AAPL", outputsize: "compact" })

// Top movers (no params)
const movers = await client.alphavantage.us.movers()

// News sentiment
const news = await client.alphavantage.us.news({ tickers: "AAPL" })
```

### China A-Shares

#### Tushare

| Resource | Methods | Description |
|----------|---------|-------------|
| `tushare.cn` | `stockBasic`, `daily`, `weekly`, `monthly`, `dailyBasic`, `tradeCal`, `income`, `balanceSheet`, `cashFlow`, `dividend`, `northbound`, `moneyflow`, `margin`, `marginDetail`, `topList`, `topInst` | China A-share market data — $0.001–0.003/call |

```typescript
// Stock list
const stocks = await client.tushare.cn.stockBasic({ listStatus: "L" })

// Daily OHLCV
const daily = await client.tushare.cn.daily({ tsCode: "000001.SZ", startDate: "20240101", endDate: "20240131" })

// Money flow
const flow = await client.tushare.cn.moneyflow({ tsCode: "000001.SZ", startDate: "20240101" })
```

### Global Time-Series & Forex

#### Twelve Data

| Resource | Methods | Description |
|----------|---------|-------------|
| `twelvedata.timeSeries` | `complex` (POST) | Complex multi-symbol/indicator query — $0.005/call |
| `twelvedata.indicator` | `sma`, `ema`, `rsi`, `macd`, `bbands`, `atr` | Technical indicators — $0.002/call |
| `twelvedata.metals` | `price`, `timeSeries` | Precious metals prices — $0.001/call |
| `twelvedata.indices` | `list`, `quote` | Global index data — $0.001/call |
| `twelvedata` | `getTimeSeries`, `price`, `quote`, `eod`, `exchangeRate`, `forexPairs`, `economicCalendar` | Direct endpoints — $0.001/call |

```typescript
// Time series (use getTimeSeries, NOT timeSeries — timeSeries is a sub-resource)
const ts = await client.twelvedata.getTimeSeries({ symbol: "EUR/USD", interval: "1h", outputsize: 3 })

// RSI indicator
const rsi = await client.twelvedata.indicator.rsi({ symbol: "AAPL", interval: "1day", timePeriod: 14 })

// Real-time price
const price = await client.twelvedata.price({ symbol: "BTC/USD" })

// Metals
const gold = await client.twelvedata.metals.price({ symbol: "XAU/USD" })
```

### AI Providers

#### OpenAI

| Resource | Methods | Description |
|----------|---------|-------------|
| `openai.openai` | `chat`, `chatMini`, `embeddings`, `embeddingsLarge`, `images`, `models` | OpenAI API — $0.001–0.05/call |

```typescript
// Chat (GPT-4o)
const resp = await client.openai.openai.chat({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Analyze AAPL stock trend" }]
})

// Embeddings
const emb = await client.openai.openai.embeddings({
  input: "crypto market sentiment",
  model: "text-embedding-3-small"
})
```

#### Anthropic

| Resource | Methods | Description |
|----------|---------|-------------|
| `anthropic.anthropic` | `messages`, `messagesExtended`, `countTokens` | Anthropic Claude API — $0.01–0.015/call |

```typescript
// Claude messages
const resp = await client.anthropic.anthropic.messages({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Summarize this earnings report: ..." }]
})
```

#### DeepSeek

| Resource | Methods | Description |
|----------|---------|-------------|
| `deepseek.deepseek` | `chat`, `chatReasoner`, `completions`, `models` | DeepSeek chat, reasoning, beta completions, model listing — $0.001–0.005/call |

```typescript
const resp = await client.deepseek.deepseek.chat({
  messages: [{ role: "user", content: "Explain BTC basis trade" }]
})
```

#### Qwen

| Resource | Methods | Description |
|----------|---------|-------------|
| `qwen.qwen` | `chatMax`, `chatPlus`, `chatTurbo`, `chatFlash`, `chatCoder`, `chatVl` | Qwen chat, coder, and vision models — $0.002–0.01/call |

```typescript
const resp = await client.qwen.qwen.chatMax({
  messages: [{ role: "user", content: "Write a Go HTTP middleware" }]
})
```

## Configuration

```typescript
// Custom base URL
const client = new Claw402({
  privateKey: "0x...",
  baseUrl: "https://custom.gateway",
})
```

## How Payment Works

1. SDK sends a GET/POST request to the endpoint
2. Server responds with `402 Payment Required` + payment details in header
3. SDK signs an EIP-3009 `TransferWithAuthorization` for USDC on Base
4. SDK retries the request with the `PAYMENT-SIGNATURE` header
5. Server verifies payment on-chain and returns the data

Your private key **never leaves your machine** — it only signs the payment locally.

## Requirements

- Node.js 18+
- A wallet with USDC on [Base mainnet](https://base.org)
- Get USDC on Base: [bridge.base.org](https://bridge.base.org)

## License

MIT
