// mining-marketplace - x402 compatible Node.js server
// Using CommonJS to match the working tiffany-miner pattern

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { x402ResourceServer, HTTPFacilitatorClient } = require('@x402/core/server');
const { ExactEvmScheme } = require('@x402/evm/exact/server');

const app = express();
const PORT = process.env.PORT || 3000;

// Price configuration
const PAY_TO = process.env.X402_PAY_TO || '0x7861db4efc14a1ed5dd8c96c528a3796560f1393';
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || 'https://x402-agent-pay.com/facilitator';
const SESSION_START_PRICE = 2550000; // $25.50 USDC in micro-units
const STATS_PRICE = 100000; // $1.00 USDC in micro-units

console.log('[mining-marketplace] Starting x402 server...');

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// x402 Resource Server initialization
const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const x402Server = new x402ResourceServer(facilitatorClient);
x402Server.register('eip155:8453', new ExactEvmScheme());

// Initialize x402 - fire and forget
x402Server.initialize().catch(err => {
    console.error('[mining-marketplace] x402 initialization warning:', err.message);
});

// Health check - free endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'mining-marketplace',
        timestamp: new Date().toISOString(),
        price: {
            session_start: SESSION_START_PRICE,
            stats: STATS_PRICE,
            network: 'eip155:8453',
            payTo: PAY_TO
        }
    });
});

// x402 Discovery Surface
app.get('/.well-known/x402', (req, res) => {
    res.json({
        ok: true,
        tool: 'mining-marketplace',
        price: {
            usdc: SESSION_START_PRICE,
            network: 'eip155:8453',
            payTo: PAY_TO,
            facilitator: FACILITATOR_URL
        },
        endpoints: {
            '/api/session/start': {
                method: 'POST',
                accepts: {
                    scheme: 'exact',
                    price: SESSION_START_PRICE,
                    network: 'eip155:8453',
                    payTo: PAY_TO,
                    extra: { facilitator: FACILITATOR_URL }
                },
                mimeType: 'application/json',
                description: 'Start mining session ($25.50 USDC)'
            },
            '/api/stats': {
                method: 'POST',
                accepts: {
                    scheme: 'exact',
                    price: STATS_PRICE,
                    network: 'eip155:8453',
                    payTo: PAY_TO,
                    extra: { facilitator: FACILITATOR_URL }
                },
                mimeType: 'application/json',
                description: 'Get mining statistics ($1.00 USDC)'
            }
        }
    });
});

// Pricing document
app.get('/pricing.md', (req, res) => {
    res.type('text/markdown').send(
        '# Pricing — Mining Marketplace x402\n\n' +
        'All costs in USDC on Base (eip155:8453).\n\n' +
        '| Route | Method | Price | Description |\n' +
        '|---|---|---|---|\n' +
        '| /api/session/start | POST | $25.50 | Start mining session (1 hour) |\n' +
        '| /api/stats | POST | $1.00 | Get mining statistics |\n' +
        '\n**PayTo:** ' + PAY_TO + '\n' +
        '*Last updated by mining-marketplace deploy.*'
    );
});

// LLM surface
app.get('/llms.txt', (req, res) => {
    res.type('text/plain').send(
        '# Mining Marketplace x402\n\n' +
        'POST /api/session/start — $25.50: Start mining session.\n' +
        'POST /api/stats — $1.00: Get mining statistics.\n' +
        'Payment: USDC on Base (eip155:8453), payTo ' + PAY_TO + '.\n' +
        'Challenge scheme: exact. Facilitator: ' + FACILITATOR_URL + '.\n' +
        'Free demo: GET /sample\n' +
        'Manifest: /.well-known/x402.json\n'
    );
});

// Sample endpoint
app.get('/sample', (req, res) => {
    res.json({
        label: 'synthetic/demo',
        price: SESSION_START_PRICE / 10000,
        payment_required: true,
        payment_scheme: 'exact',
        network: 'eip155:8453',
        payTo: PAY_TO,
        example_request: { rigId: 'rig-001', durationHours: 1 },
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

// Start mining session - requires x402 payment
app.post('/api/session/start', (req, res) => {
    x402Server.middleware(req, res, async (err) => {
        if (err) {
            return res.status(402).json({ error: 'Payment required', code: 'X402_REQUIRED' });
        }
        res.json({
            sessionId: `session-${Date.now()}`,
            rigId: req.body.rigId || 'rig-001',
            durationHours: req.body.durationHours || 1,
            startTime: new Date().toISOString(),
            status: 'active'
        });
    });
});

// Get mining stats - requires x402 payment
app.post('/api/stats', (req, res) => {
    x402Server.middleware(req, res, async (err) => {
        if (err) {
            return res.status(402).json({ error: 'Payment required', code: 'X402_REQUIRED' });
        }
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
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('[' + new Date().toISOString() + '] ERROR:', err.message);
    res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log('[mining-marketplace] Server listening on port', PORT);
    console.log('[mining-marketplace] x402 enabled • PAY_TO:', PAY_TO);
    console.log('[mining-marketplace] Facilitator:', FACILITATOR_URL);
    console.log('[mining-marketplace] Session Start: $25.50 USDC');
    console.log('[mining-marketplace] Stats: $1.00 USDC');
});