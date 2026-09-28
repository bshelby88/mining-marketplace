# 🚀 Mining Marketplace

A decentralized cryptocurrency mining marketplace with **x402 payment protocol** integration for seamless HTTP micropayments.

## 🌟 Features

- **x402 Payment Integration** - Accept USDC payments via HTTP 402 protocol
- **Decentralized Mining Services** - Connect with mining rig providers
- **Real-time Statistics** - Get mining metrics and earnings
- **Session Management** - Start/stop mining sessions with authenticated payments

## 📦 API Endpoints

| Endpoint | Payment Required | Description |
|----------|-----------------|-------------|
| `GET /health` | ❌ No | Health check endpoint |
| `GET /api/rigs` | ❌ No | List available mining rigs |
| `GET /api/rigs/:id` | ❌ No | Get rig details |
| `GET /api/session/start` | ✅ Yes | Start mining session (x402) |
| `GET /api/stats` | ✅ Yes | Get mining statistics (x402) |
| `GET /.well-known/x402` | ❌ No | x402 discovery endpoint |

## 💰 x402 Payment Flow

This service implements the [HTTP 402 Payment Required](https://x402.org/) protocol:

1. Client requests protected resource
2. Server responds with `402 Payment Required` and payment details
3. Client signs and submits payment via x402 protocol
4. Server validates payment and serves the resource

### Example Payment Request

```bash
curl -v http://localhost:3000/api/stats
# Response: 402 Payment Required with x402 payment schema
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/bshelby88/mining-marketplace.git
cd mining-marketplace
npm install
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## 🔧 Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ dist/
EXPOSE 3000
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
- [awesome-x402 Resource Hub](https://github.com/xpaysh/awesome-x402)
- [Coinbase x402 SDK](https://github.com/coinbase/x402)

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