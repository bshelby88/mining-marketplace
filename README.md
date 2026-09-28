# 🚀 Mining Marketplace

A decentralized cryptocurrency mining marketplace with **x402 payment protocol** integration for seamless HTTP micropayments.

## 🌟 Features

- **x402 Payment Integration** - Accept USDC payments via HTTP 402 protocol on Base
- **Decentralized Mining Services** - Connect with mining rig providers  
- **Real-time Statistics** - Get mining metrics and earnings
- **Session Management** - Start/stop mining sessions with authenticated payments
- **Full Discovery Surfaces** - Complete x402 discovery surface implementation

## 📚 x402 Discovery Surfaces

This service implements the four mandatory x402 discovery surfaces:

| Route | Purpose | Content Type |
|---|---|---|
| `GET /.well-known/x402.json` | Canonical route+schema list (live 402 challenge authority) | JSON |
| `GET /pricing.md` | Human+machine-readable pricing document | text/markdown |
| `GET /llms.txt` | LLM crawler surface with route + price per method | text/plain |
| `GET /collections.json` | ERC-8257 style tool collections manifest | JSON |
| `GET /sample` | Synthetic/demo response showing paid-response JSON shape | JSON |

## 📦 API Endpoints

| Endpoint | Method | Payment | Description |
|----------|--------|---------|-------------|
| `GET /health` | GET | ❌ No | Health check endpoint |
| `GET /` | GET | ❌ No | Root redirect |
| `GET /api/rigs` | GET | ❌ No | List available mining rigs |
| `GET /api/rigs/:id` | GET | ❌ No | Get rig details |
| `GET /.well-known/x402.json` | GET | ❌ No | Canonical x402 manifest |
| `GET /pricing.md` | GET | ❌ No | Pricing documentation |
| `GET /llms.txt` | GET | ❌ No | LLM crawler surface |
| `GET /collections.json` | GET | ❌ No | Tool collections manifest |
| `GET /sample` | GET | ❌ No | Synthetic paid-response sample |
| `POST /api/session/start` | POST | ✅ Yes | Start mining session |
| `POST /api/stats` | POST | ✅ Yes | Get mining statistics |

## 💰 x402 Payment Pricing

| Route | Price | Currency |
|-------|-------|----------|
| `/api/session/start` | $25.50 | USDC (Base) |
| `/api/stats` | $1.00 | USDC (Base) |

### Environment Variables

```bash
X402_PAY_TO=your_usdc_receive_address    # Required: Base USDC receive address
X402_PRICE_SESSION_START=25.50           # Price for session start (USDC)
X402_PRICE_STATS=1.00                    # Price for stats query (USDC)
PORT=3000                                # Server port
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Verify discovery surfaces
npm run verify:surfaces
```

## 📋 x402 Payment Flow

This service implements the [HTTP 402 Payment Required](https://x402.org/) protocol:

1. Client requests protected resource via POST
2. Server responds with `402 Payment Required` and payment details in `WWW-Authenticate` header
3. Client signs and submits payment via x402 protocol
4. Server validates payment and serves the resource

### Example Payment Request

```bash
curl -v http://localhost:3000/api/stats
# Response: 402 Payment Required with x402 payment schema
```

### Example with Payment

```bash
# Using curl with payment assertion (requires x402-payer)
x402-payer --url http://localhost:3000/api/stats --amount 1.00 \
  --key ./private-key.pem --network base
```

## 🔍 Discovery Surface Verification

All discovery surfaces must return HTTP 200 without payment:

```bash
# Verify canonical manifest
curl -4 -s -A "curl/8" http://localhost:3000/.well-known/x402.json | jq

# Verify pricing document
curl -4 -s -A "curl/8" http://localhost:3000/pricing.md

# Verify LLM crawler surface
curl -4 -s -A "curl/8" http://localhost:3000/llms.txt

# Verify collections manifest
curl -4 -s -A "curl/8" http://localhost:3000/collections.json

# Verify sample response
curl -4 -s -A "curl/8" http://localhost:3000/sample
```

## Docker Deployment

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
RUN mkdir -p /home/nextjs/app && chown -R nextjs:nodejs /home/nextjs/app
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production PORT=3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

## 🛠️ Built With

- **Express.js** - Web framework
- **x402** - HTTP 402 Payment Protocol ([@coinbase/x402](https://github.com/coinbase/x402))
- **TypeScript** - Type-safe JavaScript
- **Zod** - Schema validation

## 📚 x402 Integration

This project integrates with the x402 ecosystem for crypto micropayments:

- [x402 Protocol Specification](https://github.com/coinbase/x402)
- [x402 Discovery Surface Skill](../x402/x402-discovery-surface)
- [awesome-x402 Resource Hub](https://github.com/xpaysh/awesome-x402)
- [Coinbase x402 SDK](https://github.com/coinbase/x402)

## 🔐 Security Considerations

- Always use HTTPS in production
- Store private keys securely
- Validate all input with Zod schemas
- Use environment variables for sensitive configuration
- Enable rate limiting for production deployments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [xpaysh/awesome-x402](https://github.com/xpaysh/awesome-x402) - Curated x402 resources
- [Coinbase x402](https://github.com/coinbase/x402) - x402 protocol implementation
- RAEN Fleet x402 Discovery Surface patterns