/**
 * Basic usage of the claw402 TypeScript SDK.
 *
 * Usage:
 *   WALLET_PRIVATE_KEY=0x... npx tsx examples/basic.ts
 */

import { Claw402 } from "claw402"

const client = new Claw402({
  privateKey: process.env.WALLET_PRIVATE_KEY as `0x${string}`,
})

// 1. Fear & Greed Index (no params)
console.log("=== Fear & Greed Index ===")
const sentiment = await client.coinank.indicator.fearGreed()
console.log(JSON.stringify(sentiment, null, 2))

// 2. Fund flow with params
console.log("\n=== Fund Flow (SWAP, top 5) ===")
const flow = await client.coinank.fund.realtime({
  productType: "SWAP",
  size: 5,
})
console.log(JSON.stringify(flow, null, 2))

// 3. AI500 signals
console.log("\n=== AI500 Top Signals ===")
const ai500 = await client.nofxos.ai500.list({ limit: 10 })
console.log(JSON.stringify(ai500, null, 2))

// 4. Net capital inflow ranking
console.log("\n=== Net Inflow Top 10 (1h) ===")
const inflow = await client.nofxos.netflow.topRanking({
  limit: 10,
  duration: "1h",
})
console.log(JSON.stringify(inflow, null, 2))

// 5. BTC price
console.log("\n=== BTC Latest Price ===")
const price = await client.coinank.price.last({
  symbol: "BTCUSDT",
  exchange: "Binance",
  productType: "SWAP",
})
console.log(JSON.stringify(price, null, 2))
