# Launch Guide — Mining Marketplace Discovery Surfaces

**Created:** 2026-09-27  
**Author:** Tiffany (MINING MARKETPLACE DISCOVERY SURFACES)  
**Purpose:** Prepare and verify x402 discovery surfaces for the Mining Marketplace

---

## 1. 📋 Prerequisite Checklist

Before deploying, ensure:

- [ ] **X402_PAY_TO** environment variable set (Base USDC receive address)
- [ ] **Node.js 20+** installed locally or in deployment environment
- [ ] **npm** or **yarn** package manager available
- [ ] **Source code committed** to version control
- [ ] **Tests passing** (`npm test`)
- [ ] **TypeScript compiles** (`npm run build`)

---

## 2. 🔧 Environment Configuration

### Required Environment Variables

```bash
# x402 Payment Configuration
X402_PAY_TO=0x<your_base_usdc_address>

# Pricing (optional - defaults if not set)
X402_PRICE_SESSION_START=25.50
X402_PRICE_STATS=1.00

# Server Port (optional - defaults to 3000)
PORT=3000
```

### Create .env File

```bash
cp .env.example .env
# Edit .env with your values
```

---

## 3. 📦 Build and Test

### Install Dependencies

```bash
npm ci
# or
npm install
```

### Build TypeScript

```bash
npm run build
```

### Run Tests

```bash
npm test
```

All tests should pass, specifically:
- Discovery surfaces return 200 (not 402)
- Manifest format is correct
- Pricing document is generated correctly

---

## 4. 🚀 Deployment

### Fly.io Deployment

```bash
# Set secrets
fly secrets set X402_PAY_TO=0x<your_base_usdc_address>
fly secrets set X402_PRICE_SESSION_START=25.50
fly secrets set X402_PRICE_STATS=1.00

# Deploy
fly deploy
```

### Docker Deployment

```bash
# Build image
docker build -t mining-marketplace:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e X402_PAY_TO=0x<your_base_usdc_address> \
  mining-marketplace:latest
```

### Vercel/Netlify

Deploy the `dist/` directory to your preferred platform.

---

## 5. ✅ Verification Procedure

After deployment, verify all four discovery surfaces:

### Step 1: Verify Canonical Manifest

```bash
curl -4 -s -A "curl/8" https://<your-domain>/.well-known/x402.json | jq
```

Expected output:
```json
{
  "version": "2.0.0",
  "service": { "name": "mining-marketplace", ... },
  "endpoints": {
    "/api/session/start": { "method": "POST", "accepts": { ... } },
    "/api/stats": { "method": "POST", "accepts": { ... } }
  }
}
```

### Step 2: Verify Pricing Document

```bash
curl -4 -s -A "curl/8" https://<your-domain>/pricing.md
```

Expected content includes:
- Markdown header
- Routes table with prices
- Currency info (USDC on Base)
- Last updated timestamp

### Step 3: Verify LLM Crawler Surface

```bash
curl -4 -s -A "curl/8" https://<your-domain>/llms.txt
```

Expected content includes:
- Plain text format
- Route + price info
- Payment scheme details
- References to manifest and sample

### Step 4: Verify Collections

```bash
curl -4 -s -A "curl/8" https://<your-domain>/collections.json | jq
```

Expected output:
```json
{
  "collections": [{
    "id": "mining-marketplace",
    "name": "Mining Marketplace",
    "tools": [...]
  }]
}
```

### Step 5: Verify Sample Response

```bash
curl -4 -s -A "curl/8" https://<your-domain>/sample | jq
```

Expected output:
```json
{
  "label": "synthetic/demo",
  "payment_required": true,
  "payment_scheme": "exact",
  "network": "eip155:8453",
  "payTo": "0x...",
  "live_result": { "ok": true, ... }
}
```

### Step 6: Decode Live 402 Challenge

```bash
curl -X POST -d '{}' -H "Content-Type: application/json" \
  https://<your-domain>/api/session/start | jq
```

Expected: 402 response with valid WWW-Authenticate header containing correct payTo.

---

## 6. 🧪 Full Test Suite

Run the complete verification:

```bash
# Local tests
npm test

# Specific discovery surface tests
npm test -- "Discovery Surfaces"
```

---

## 7. 📊 Post-Deployment Checklist

- [ ] All discovery surfaces return HTTP 200 (not 402)
- [ ] Manifest `/.well-known/x402.json` is correct
- [ ] Legacy `/.well-known/x402` redirects to `/.well-known/x402.json`
- [ ] `/pricing.md` matches manifest prices
- [ ] `/llms.txt` references correct manifest URL
- [ ] `/collections.json` lists all paid endpoints
- [ ] `/sample` shows valid paid-response shape
- [ ] x402 challenge encodes correct payTo
- [ ] x402 challenge amount matches manifest price

---

## 8. 🔄 Updates and Maintenance

### When Updating Prices

1. Update `X402_PRICE_SESSION_START` or `X402_PRICE_STATS` in environment
2. Redeploy the service
3. Verify `/pricing.md` reflects new prices
4. Verify 402 challenge reflects new prices

### When Adding New Endpoints

1. Add endpoint to `src/index.ts` under the appropriate route handler
2. Add to payment middleware configuration if payment required
3. Add to `/.well-known/x402.json` manifest
4. Add to `/pricing.md` document
5. Add to `/llms.txt` crawler surface
6. Add to `/collections.json` manifest
7. Add test cases in `src/index.test.ts`
8. Update `README.md` documentation

---

## 9. 📞 Support

For x402 protocol issues:
- [x402 Protocol Documentation](https://docs.x402.org)
- [Coinbase x402 SDK](https://github.com/coinbase/x402)

For Mining Marketplace issues:
- GitHub Issues: https://github.com/bshelby88/mining-marketplace/issues

---

## 10. 🔗 Related Documentation

- [x402 Discovery Surface Skill](../x402/x402-discovery-surface/SKILL.md)
- [Surface Audit Checklist](../x402/x402-discovery-surface/references/surface-audit-checklist.md)
- [Launch Guide](LAUNCH_GUIDE.md) - This document

---