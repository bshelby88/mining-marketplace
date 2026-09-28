import express from 'express';
import { handleX402Payment, createPaymentRequiredResponse } from '@coinbase/x402';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

/**
 * Mining Marketplace API
 * 
 * A decentralized marketplace for cryptocurrency mining services
 * with HTTP 402 (x402) payment protocol integration.
 */

// Health check endpoint (no payment required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mining-marketplace' });
});

// List available mining rigs/services (no payment required)
app.get('/api/rigs', (_req, res) => {
  res.json([
    {
      id: 'rig-001',
      name: 'BTC Miner Pro',
      hashrate: '150 TH/s',
      price_per_hour: '0.001 BTC',
      currency: 'BTC',
      x402_price: '25.50', // USDC
      x402_currency: 'USDC'
    },
    {
      id: 'rig-002',
      name: 'ETH Mining Rig',
      hashrate: '80 TH/s',
      price_per_hour: '0.002 ETH',
      currency: 'ETH',
      x402_price: '5.25', // USDC
      x402_currency: 'USDC'
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
      x402_price: '25.50',
      x402_currency: 'USDC',
      specs: { memory: '32GB', power: '1200W', efficiency: '95%' }
    },
    'rig-002': {
      id: 'rig-002',
      name: 'ETH Mining Rig',
      hashrate: '80 TH/s',
      price_per_hour: '0.002 ETH',
      currency: 'ETH',
      x402_price: '5.25',
      x402_currency: 'USDC',
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
app.get('/api/session/start', async (req, res) => {
  try {
    // Check for x402 payment
    await handleX402Payment(req, res, {
      // Price for 1 hour of mining
      price: '25.50',
      currency: 'USDC',
      resource: 'mining-session-start'
    });

    // If payment successful, return session info
    res.json({
      sessionId: `session-${Date.now()}`,
      rigId: req.query.rigId || 'rig-001',
      startTime: new Date().toISOString(),
      durationHours: 1,
      status: 'active'
    });
  } catch (error) {
    console.error('Payment handling error:', error);
    // Payment required response will be sent automatically
  }
});

// Get mining stats - requires x402 payment
app.get('/api/stats', async (req, res) => {
  try {
    // Check for x402 payment
    await handleX402Payment(req, res, {
      // Price for mining stats
      price: '1.00',
      currency: 'USDC',
      resource: 'mining-stats'
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

// Health check endpoint for x402 facilitator
app.get('/.well-known/x402', async (_req, res) => {
  res.json({
    method: 'GET',
    hash: 'x402_request_body',
    price: '0',
    currency: 'USDC',
    resource: 'x402-discovery'
  });
});

// Create price response for x402
app.use((req, res, next) => {
  createPaymentRequiredResponse(req, res, {
    price: '0',
    currency: 'USDC'
  });
});

app.listen(PORT, () => {
  console.log(`Mining Marketplace API running on port ${PORT}`);
  console.log(`x402 payment protocol enabled at /api/session/start and /api/stats`);
});

export default app;