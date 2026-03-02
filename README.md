# claw402

[![npm version](https://img.shields.io/npm/v/claw402.svg)](https://www.npmjs.com/package/claw402)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Typed TypeScript SDK for [claw402.ai](https://claw402.ai) — pay-per-call crypto data APIs via [x402](https://www.x402.org/) micropayments.

**96+ endpoints** covering fund flow, liquidations, ETF flows, AI trading signals, whale tracking, funding rates, open interest, and more. No API key, no signup, no subscription — just a Base wallet with USDC.

## Install

```bash
npm install claw402
```

## Quick Start

```typescript
import { Claw402 } from "claw402"

const client = new Claw402({
  privateKey: process.env.WALLET_PRIVATE_KEY as `0x${string}`,
})

// Fund flow — $0.001 per call
const flow = await client.coinank.fund.realtime({ productType: "SWAP" })
console.log(flow)

// AI trading signals
const signals = await client.nofxos.netflow.topRanking({ limit: 20, duration: "1h" })
console.log(signals)

// Fear & Greed Index
const sentiment = await client.coinank.indicator.fearGreed()
console.log(sentiment)
```

## Features

- **Typed methods** — every endpoint has a dedicated function with TypeScript types
- **Automatic x402 payment** — signs EIP-3009 USDC transfers locally, never sends your key
- **Two resource groups** — `client.coinank.*` (market data) and `client.nofxos.*` (AI signals)
- **Zero config** — just a private key, no API keys or registration
- **Base mainnet** — pays $0.001 USDC per call on Coinbase L2

## API Overview

### Coinank (Market Data)

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

### Nofxos (AI Signals)

| Resource | Methods | Description |
|----------|---------|-------------|
| `nofxos.ai500` | `list`, `stats` | AI500 high-potential coin signals |
| `nofxos.ai300` | `list`, `stats` | AI300 quant model rankings |
| `nofxos.netflow` | `topRanking`, `lowRanking` | Net capital flow rankings |
| `nofxos.oi` | `topRanking`, `lowRanking` | OI change rankings |
| `nofxos.fundingRate` | `top`, `low` | Extreme funding rate coins |
| `nofxos.price` | `ranking` | Price change rankings |
| `nofxos.upbit` | `hot`, `netflowTopRanking`, `netflowLowRanking` | Korean market data |

## Configuration

```typescript
// Custom base URL
const client = new Claw402({
  privateKey: "0x...",
  baseUrl: "https://custom.gateway",
})
```

## How Payment Works

1. SDK sends a GET request to the endpoint
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
