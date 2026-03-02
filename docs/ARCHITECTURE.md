# Architecture

## Overview

```
claw402 (npm)
├── src/
│   ├── client.ts          ← Core client: x402 V2 payment flow
│   ├── errors.ts          ← Error types
│   ├── index.ts           ← Package entry point
│   └── generated/         ← Auto-generated from providers/*.yaml
│       ├── coinank.ts     ← 78 endpoints: market data, ETF, liquidations, etc.
│       ├── nofxos.ts      ← 18 endpoints: AI signals, rankings, Upbit
│       └── index.ts       ← Re-exports
└── examples/
    └── basic.ts           ← Usage example
```

## Payment Flow (x402 V2)

```
Client                          claw402.ai                    Base L2
  │                                │                            │
  │─── GET /api/v1/... ──────────▶│                            │
  │◀── 402 + Payment-Required ────│                            │
  │                                │                            │
  │  [sign EIP-3009 locally]       │                            │
  │                                │                            │
  │─── GET + PAYMENT-SIGNATURE ──▶│                            │
  │                                │── verify + settle ────────▶│
  │                                │◀── tx confirmed ──────────│
  │◀── 200 + data ────────────────│                            │
```

## Code Generation

The `generated/` directory is produced by `sdks/codegen/` which reads
`providers/*.yaml` (the same YAML files that configure the Go gateway)
and emits typed SDK methods for TypeScript, Python, and Go.

Each YAML route becomes a typed method:

```yaml
# providers/coinank.yaml
- gateway_path: /api/v1/coinank/fund/realtime
  category: Fund
  allowed_params: [sortBy, productType, page, size]
```

Becomes:

```typescript
// generated/coinank.ts
async realtime(params?: { sortBy?: string; productType?: string; ... }) {
  return this.client._get('/api/v1/coinank/fund/realtime', params)
}
```
