import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts"
import type { Hex } from "viem"
import { Claw402Error } from "./errors.js"
import { AlpacaResource } from "./generated/alpaca.js"
import { AlphavantageResource } from "./generated/alphavantage.js"
import { AnthropicResource } from "./generated/anthropic.js"
import { CoinankResource } from "./generated/coinank.js"
import { DeepseekResource } from "./generated/deepseek.js"
import { NofxosResource } from "./generated/nofxos.js"
import { OpenaiResource } from "./generated/openai.js"
import { PolygonResource } from "./generated/polygon.js"
import { QwenResource } from "./generated/qwen.js"
import { TushareResource } from "./generated/tushare.js"
import { TwelvedataResource } from "./generated/twelvedata.js"

/** Base chain ID (Coinbase L2) */
const BASE_CHAIN_ID = 8453

/** EIP-3009 TransferWithAuthorization typed data types */
const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const

interface PaymentRequirements {
  scheme: string
  network: string
  asset: string
  amount: string
  payTo: string
  maxTimeoutSeconds: number
  extra: { name: string; version: string }
}

interface PaymentRequired {
  x402Version: number
  resource: { url: string; description: string }
  accepts: PaymentRequirements[]
}

export interface Claw402Options {
  /** Hex-encoded private key for x402 payments (e.g. "0x...") */
  privateKey: string
  /** Base URL of the claw402 gateway. Default: "https://claw402.ai" */
  baseUrl?: string
}

export class Claw402 {
  private _account: PrivateKeyAccount
  private _baseUrl: string

  /** CoinAnk — Professional crypto derivatives & on-chain data */
  coinank: CoinankResource
  /** nofxos.ai — AI-powered crypto trading intelligence */
  nofxos: NofxosResource
  /** Alpha Vantage — US stock quotes, OHLCV, fundamentals, technical indicators */
  alphavantage: AlphavantageResource
  /** Polygon.io — US stock tick data, options, snapshots, reference data */
  polygon: PolygonResource
  /** Alpaca Markets — US equities quotes, bars, trades, snapshots */
  alpaca: AlpacaResource
  /** Tushare Pro — Chinese A-share market data, financials, northbound capital */
  tushare: TushareResource
  /** Twelve Data — Forex, metals, indices, crypto OHLCV & technical indicators */
  twelvedata: TwelvedataResource
  /** OpenAI — GPT-4o, GPT-4o-mini, DALL-E, text embeddings */
  openai: OpenaiResource
  /** Anthropic — Claude Sonnet, Haiku, Opus via Messages API */
  anthropic: AnthropicResource
  /** DeepSeek — DeepSeek-Chat and DeepSeek-Reasoner via OpenAI-compatible API */
  deepseek: DeepseekResource
  /** Qwen — Alibaba Qwen chat, coder, and vision models via OpenAI-compatible API */
  qwen: QwenResource

  constructor(opts: Claw402Options) {
    if (!opts.privateKey.startsWith("0x")) {
      throw new Error("privateKey must be a hex string starting with 0x")
    }
    this._account = privateKeyToAccount(opts.privateKey as Hex)
    this._baseUrl = (opts.baseUrl ?? "https://claw402.ai").replace(/\/$/, "")
    // Crypto data
    this.coinank = new CoinankResource(this)
    this.nofxos = new NofxosResource(this)
    // US stocks
    this.alphavantage = new AlphavantageResource(this)
    this.polygon = new PolygonResource(this)
    this.alpaca = new AlpacaResource(this)
    // Chinese A-shares
    this.tushare = new TushareResource(this)
    // Forex, metals, indices
    this.twelvedata = new TwelvedataResource(this)
    // AI models
    this.openai = new OpenaiResource(this)
    this.anthropic = new AnthropicResource(this)
    this.deepseek = new DeepseekResource(this)
    this.qwen = new QwenResource(this)
  }

  /** @internal — sign and send x402 payment for either GET or POST */
  private async _x402Request(
    urlStr: string,
    init: RequestInit,
    retryInit: RequestInit
  ): Promise<any> {
    // Step 1: initial request — expect 402
    const initResp = await fetch(urlStr, init)
    if (initResp.ok) return initResp.json()
    if (initResp.status !== 402) throw new Claw402Error(initResp.status, await initResp.text())

    // Step 2: decode Payment-Required header
    const headerB64 = initResp.headers.get("Payment-Required")
    if (!headerB64) throw new Claw402Error(402, "No Payment-Required header in 402 response")

    const paymentRequired: PaymentRequired = JSON.parse(Buffer.from(headerB64, "base64").toString("utf-8"))
    const req = paymentRequired.accepts.find(
      (a) => a.scheme === "exact" && a.network === `eip155:${BASE_CHAIN_ID}`
    )
    if (!req) {
      throw new Claw402Error(
        402,
        `No compatible payment method found. Available: ${paymentRequired.accepts.map((a) => `${a.scheme}@${a.network}`).join(", ")}`
      )
    }

    // Step 3: sign EIP-3009 TransferWithAuthorization
    const validBefore = BigInt(Math.floor(Date.now() / 1000) + req.maxTimeoutSeconds)
    const nonceBytes = crypto.getRandomValues(new Uint8Array(32))
    const nonceHex = ("0x" + Array.from(nonceBytes).map((b) => b.toString(16).padStart(2, "0")).join("")) as Hex

    const signature = await this._account.signTypedData({
      domain: {
        name: req.extra.name,
        version: req.extra.version,
        chainId: BASE_CHAIN_ID,
        verifyingContract: req.asset as Hex,
      },
      types: TRANSFER_WITH_AUTHORIZATION_TYPES,
      primaryType: "TransferWithAuthorization",
      message: {
        from: this._account.address,
        to: req.payTo as Hex,
        value: BigInt(req.amount),
        validAfter: BigInt(0),
        validBefore,
        nonce: nonceHex,
      },
    })

    // Step 4: build x402 v2 payment payload
    const payload = {
      x402Version: 2,
      payload: {
        signature,
        authorization: {
          from: this._account.address,
          to: req.payTo,
          value: req.amount,
          validAfter: "0",
          validBefore: validBefore.toString(),
          nonce: nonceHex,
        },
      },
      accepted: {
        scheme: "exact",
        network: req.network,
        asset: req.asset,
        amount: req.amount,
        payTo: req.payTo,
        maxTimeoutSeconds: req.maxTimeoutSeconds,
        extra: req.extra,
      },
    }
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64")

    // Step 5: retry with payment signature
    const paidResp = await fetch(urlStr, {
      ...retryInit,
      headers: { ...(retryInit.headers as Record<string, string> ?? {}), "PAYMENT-SIGNATURE": payloadB64 },
    })

    if (!paidResp.ok) {
      let errMsg = ""
      const errHeader = paidResp.headers.get("Payment-Required")
      if (errHeader) {
        try {
          const decoded = JSON.parse(Buffer.from(errHeader, "base64").toString("utf-8"))
          errMsg = decoded.error ?? ""
        } catch { /* ignore */ }
      }
      if (!errMsg) errMsg = await paidResp.text()
      throw new Claw402Error(paidResp.status, errMsg)
    }

    return paidResp.json()
  }

  /** @internal — POST with JSON body, handles x402 payment */
  async _post(path: string, body: Record<string, unknown>): Promise<any> {
    const urlStr = this._baseUrl + path
    const init: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
    return this._x402Request(urlStr, init, init)
  }

  /** @internal — used by generated resource classes */
  async _get(
    path: string,
    params?: Record<string, string | number | undefined>
  ): Promise<any> {
    const url = new URL(this._baseUrl + path)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v))
      }
    }
    const urlStr = url.toString()
    return this._x402Request(urlStr, {}, {})
  }
}
