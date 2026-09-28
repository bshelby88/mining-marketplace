import express from 'express';
import { handleX402Payment, createPaymentRequiredResponse } from '@coinbase/x402';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Price configuration - interpolate from env for discovery surfaces
const PRICE_SESSION_START = process.env.X402_PRICE_SESSION_START || '25.50';
const PRICE_STATS = process.env.X402_PRICE_STATS || '1.00';
const NETWORK = 'eip155:8453'; // Base mainnet
const PAY_TO = process.env.X402_PAY_TO || '0x0000000000000000000000000000000000000000';

// Middleware
app.use(express.json());

/**
 * Mining Marketplace API
 * 
 * A decentralized marketplace for cryptocurrency mining services
 * with HTTP 402 (x402) payment protocol integration.
 */

// ============================================
// DISCOVERY SURFACES (ALL FREE - No payment required)
// ============================================

/**
 * GET /.well-known/x402.json
 * Canonical route+schema list (live 402 challenge authority)
 * This is the REQUIRED manifest route - NOT /manifest
 */
app.get('/.well-known/x402.json', (_req, res) => {
  res.type('application/json').json({
    version: '2.0.0',
    service: {
      name: 'mining-marketplace',
      description: 'Decentralized cryptocurrency mining marketplace with x402 payment protocol integration',
      contact: 'ops@mining-marketplace.example',
      operator: 'RAEN Fleet Mining Team',
      url: 'https://mining-marketplace.fly.dev'
    },
    endpoints: {
      'POST /api/session/start': {
        method: 'POST',
        accepts: {
          scheme: 'exact',
          price: `$$${PRICE_SESSION_START}`,
          network: NETWORK,
          payTo: PAY_TO
        },
        description: 'Start a mining session with authenticated payment',
        mimeType: 'application/json',
        extra: {
          facilitator: 'https://x402-agent-pay.com/facilitator'
        }
      },
      'POST /api/stats': {
        method: 'POST',
        accepts: {
          scheme: 'exact',
          price: `$$${PRICE_STATS}`,
          network: NETWORK,
          payTo: PAY_TO
        },
        description: 'Get real-time mining statistics (hashrate, power, earnings)',
        mimeType: 'application/json',
        extra: {
          facilitator: 'https://x402-agent-pay.com/facilitator'
        }
      }
    }
  });
});

/**
 * GET /.well-known/x402
 * Legacy redirect to canonical /x402.json
 */
app.get('/.well-known/x402', (_req, res) => {
  res.redirect(301, '/.well-known/x402.json');
});

/**
 * GET /pricing.md
 * Human+machine-readable pricing document
 */
app.get('/pricing.md', (_req, res) => {
  res.type('text/markdown').send(
    '# Pricing — Mining Marketplace x402\n\n' +
    'Every paid route is listed below with its exact cost. ' +
    'The live 402 challenge is authoritative — if this document says one thing and the challenge says another, the challenge wins.\n\n' +
    '## Routes\n\n' +
    '| Route | Method | Price | Description |\n' +
    '|---|---|---|---|\n' +
    '| /api/session/start | POST | $' + PRICE_SESSION_START + ' | Start a mining session (1 hour) |\n' +
    '| /api/stats | POST | $' + PRICE_STATS + ' | Get mining statistics |\n' +
    '\n' +
    '**Currency:** USDC on Base (eip155:8453). PayTo: `' + PAY_TO + '`.\n' +
    '*Last updated by mining-marketplace deploy.*'
  );
});

/**
 * GET /llms.txt
 * LLM crawler surface with route + price per method
 */
app.get('/llms.txt', (_req, res) => {
  res.type('text/plain').send(
    '# Mining Marketplace x402\n\n' +
    'POST /api/session/start — $' + PRICE_SESSION_START + ': Start a mining session with authenticated payment.\n' +
    'POST /api/stats — $' + PRICE_STATS + ': Get real-time mining statistics including hashrate, power consumption, efficiency, and earnings.\n' +
    'Payment: USDC on Base (eip155:8453), payTo ' + PAY_TO + '.\n' +
    'Challenge scheme: exact. Facilitator: https://x402-agent-pay.com/facilitator.\n' +
    'Free demo: GET /sample\n' +
    'Manifest: /.well-known/x402.json\n' +
    'Collections: GET /collections.json\n'
  );
});

/**
 * GET /collections.json
 * ERC-8257-style collections manifest for tool discovery
 */
app.get('/collections.json', (_req, res) => {
  res.json({
    collections: [
      {
        id: 'mining-marketplace',
        name: 'Mining Marketplace',
        description: 'Decentralized cryptocurrency mining services',
        tools: [
          {
            id: 'session-start',
            name: 'Start Mining Session',
            description: 'Start an authenticated mining session',
            route: '/api/session/start',
            method: 'POST',
            price: `$${PRICE_SESSION_START}`,
            currency: 'USDC',
            network: NETWORK,
            input: {
              type: 'object',
              properties: {
                rigId: { type: 'string', description: 'ID of the mining rig to use' },
                durationHours: { type: 'number', description: 'Duration in hours' }
              },
              required: ['rigId']
            },
            output: {
              type: 'object',
              properties: {
                sessionId: { type: 'string' },
                status: { type: 'string' },
                startTime: { type: 'string', format: 'date-time' }
              }
            }
          },
          {
            id: 'get-stats',
            name: 'Get Mining Stats',
            description: 'Get real-time mining statistics',
            route: '/api/stats',
            method: 'POST',
            price: `$${PRICE_STATS}`,
            currency: 'USDC',
            network: NETWORK,
            input: {
              type: 'object',
              properties: {
                sessionId: { type: 'string', description: 'Optional session ID to query' }
              }
            },
            output: {
              type: 'object',
              properties: {
                hashrate: { type: 'string' },
                power: { type: 'string' },
                efficiency: { type: 'string' },
                earnings: { type: 'object' }
              }
            }
          }
        ]
      }
    ]
  });
});

/**
 * GET /sample
 * Synthetic/demo response showing exact paid-response JSON shape
 * This must be accessible WITHOUT payment
 */
app.get('/sample', (_req, res) => {
  // Show what a successful paid response looks like
  res.json({
    label: 'synthetic/demo',
    price: parseFloat(PRICE_SESSION_START),
    payment_required: true,
    payment_scheme: 'exact',
    network: NETWORK,
    payTo: PAY_TO,
    example_request: {
      rigId: 'rig-001',
      durationHours: 1
    },
    live_result: {
      ok: true,
      sessionId: 'session-sample',
      rigId: 'rig-001',
      startTime: new Date().toISOString(),
      durationHours: 1,
      status: 'active'
    }
  });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mining-marketplace' });
});

// ============================================
// API ENDPOINTS
// ============================================

// List available mining rigs/services (no payment required)
app.get('/api/rigs', (_req, res) => {
  res.json([
    {
      id: 'rig-001',
      name: 'BTC Miner Pro',
      hashrate: '150 TH/s',
      price_per_hour: '0.001 BTC',
      currency: 'BTC',
      x402_price: PRICE_SESSION_START, // USDC
      x402_currency: 'USDC',
      network: NETWORK,
      payTo: PAY_TO
    },
    {
      id: 'rig-002',
      name: 'ETH Mining Rig',
      hashrate: '80 TH/s',
      price_per_hour: '0.002 ETH',
      currency: 'ETH',
      x402_price: PRICE_STATS, // USDC
      x402_currency: 'USDC',
      network: NETWORK,
      payTo: PAY_TO
    }
  ]);
});

// Get mining rig details (no payment required)
app.get('/api/rigs/:id', (req, res) => {
  const rigs = {
    'rig-001': {
      id: 'rig-001',
      name: 'BTC Miner Pro',
      hashrate: '150 TH/s',
      price_per_hour: '0.001 BTC',
      currency: 'BTC',
      x402_price: PRICE_SESSION_START,
      x402_currency: 'USDC',
      network: NETWORK,
      payTo: PAY_TO,
      specs: { memory: '32GB', power: '1200W', efficiency: '95%' }
    },
    'rig-002': {
      id: 'rig-002',
      name: 'ETH Mining Rig',
      hashrate: '80 TH/s',
      price_per_hour: '0.002 ETH',
      currency: 'ETH',
      x402_price: PRICE_STATS,
      x402_currency: 'USDC',
      network: NETWORK,
      payTo: PAY_TO,
      specs: { memory: '16GB', power: '800W', efficiency: '92%' }
    }
  };

  const rig = rigs[req.params.id as keyof typeof rigs];
  if (rig) {
    res.json(rig);
  } else {
    res.status(404).json({ error: 'Rig not found' });
  }
});

// Start mining session - requires x402 payment
app.post('/api/session/start', async (req, res) => {
  try {
    // Check for x402 payment
    await handleX402Payment(req, res, {
      price: `$${PRICE_SESSION_START}`,
      currency: 'USDC',
      network: NETWORK,
      payTo: PAY_TO,
      resource: 'mining-session-start',
      extra: {
        facilitator: 'https://x402-agent-pay.com/facilitator'
      }
    });

    // If payment successful, return session info
    res.json({
      sessionId: `session-${Date.now()}`,
      rigId: req.body.rigId || 'rig-001',
      durationHours: req.body.durationHours || 1,
      startTime: new Date().toISOString(),
      status: 'active'
    });
  } catch (error) {
    console.error('Payment handling error:', error);
    // Payment required response will be sent automatically
  }
});

// Get mining stats - requires x402 payment
app.post('/api/stats', async (req, res) => {
  try {
    // Check for x402 payment
    await handleX402Payment(req, res, {
      price: `$${PRICE_STATS}`,
      currency: 'USDC',
      network: NETWORK,
      payTo: PAY_TO,
      resource: 'mining-stats',
      extra: {
        facilitator: 'https://x402-agent-pay.com/facilitator'
      }
    });

    res.json({
      hashrate: '150 TH/s',
      power: '1200W',
      efficiency: '95%',
      uptime: '99.5%',
      earnings: {
        btc: '0.025',
        eth: '0.15',
        usdc: '125.00'
      }
    });
  } catch (error) {
    console.error('Payment handling error:', error);
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// Fallback 402 handler for undefined routes
app.use((req, res) => {
  createPaymentRequiredResponse(req, res, {
    price: '0',
    currency: 'USDC'
  });
});

app.listen(PORT, () => {
  console.log(`→ Mining Marketplace API running on port ${PORT}`);
  console.log(`→ x402 payment protocol enabled for /api/session/start and /api/stats`);
  console.log(`→ Discovery surfaces: /.well-known/x402.json, /pricing.md, /llms.txt, /collections.json, /sample`);
});

export default app;