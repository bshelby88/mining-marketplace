import request from 'supertest';
import app from './index';

describe('Mining Marketplace API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'mining-marketplace');
    });
  });

  describe('GET /api/rigs', () => {
    it('should return list of mining rigs', async () => {
      const response = await request(app).get('/api/rigs');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('x402_price');
    });
  });

  describe('GET /api/rigs/:id', () => {
    it('should return rig details for valid ID', async () => {
      const response = await request(app).get('/api/rigs/rig-001');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'rig-001');
      expect(response.body).toHaveProperty('name');
      expect(response.body.specs).toBeDefined();
    });

    it('should return 404 for invalid ID', async () => {
      const response = await request(app).get('/api/rigs/invalid-id');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Rig not found');
    });
  });

  describe('x402 Payment Integration', () => {
    it('should require payment for /api/session/start', async () => {
      const response = await request(app).post('/api/session/start');
      // Should return 402 for payment required
      expect(response.status).toBe(402);
      expect(response.headers['www-authenticate']).toBeDefined();
    });

    it('should require payment for /api/stats', async () => {
      const response = await request(app).post('/api/stats');
      // Should return 402 for payment required
      expect(response.status).toBe(402);
      expect(response.headers['www-authenticate']).toBeDefined();
    });
  });

  // ============================================
  // DISCOVERY SURFACE TESTS
  // ============================================

  describe('GET /.well-known/x402.json (Canonical Manifest)', () => {
    it('should return the canonical x402 manifest', async () => {
      const response = await request(app).get('/.well-known/x402.json');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('version', '2.0.0');
      expect(response.body).toHaveProperty('service');
      expect(response.body.service).toHaveProperty('name', 'mining-marketplace');
      expect(response.body).toHaveProperty('endpoints');
    });

    it('should list all paid endpoints in the manifest', async () => {
      const response = await request(app).get('/.well-known/x402.json');
      expect(response.status).toBe(200);
      const endpoints = response.body.endpoints;
      expect(endpoints).toHaveProperty('/api/session/start');
      expect(endpoints).toHaveProperty('/api/stats');
      
      // Verify endpoint structure
      const sessionStart = endpoints['/api/session/start'];
      expect(sessionStart).toHaveProperty('method', 'POST');
      expect(sessionStart).toHaveProperty('accepts');
      expect(sessionStart.accepts).toHaveProperty('scheme', 'exact');
      expect(sessionStart.accepts).toHaveProperty('price');
      expect(sessionStart.accepts).toHaveProperty('network', 'eip155:8453');
      expect(sessionStart.accepts).toHaveProperty('payTo');
    });
  });

  describe('GET /.well-known/x402 (Legacy Redirect)', () => {
    it('should redirect to canonical /x402.json', async () => {
      const response = await request(app).get('/.well-known/x402');
      expect(response.status).toBe(301);
      expect(response.headers.location).toBe('/.well-known/x402.json');
    });
  });

  describe('GET /pricing.md', () => {
    it('should return markdown pricing document', async () => {
      const response = await request(app).get('/pricing.md');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/markdown');
      expect(response.text).toContain('# Pricing');
      expect(response.text).toContain('/api/session/start');
      expect(response.text).toContain('/api/stats');
      expect(response.text).toContain('USDC on Base');
    });

    it('should not require payment', async () => {
      const response = await request(app).get('/pricing.md');
      expect(response.status).toBe(200);
      expect(response.status).not.toBe(402);
    });
  });

  describe('GET /llms.txt', () => {
    it('should return LLM crawler surface', async () => {
      const response = await request(app).get('/llms.txt');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toContain('Mining Marketplace x402');
      expect(response.text).toContain('/api/session/start');
      expect(response.text).toContain('/api/stats');
      expect(response.text).toContain('Manifest: /.well-known/x402.json');
    });

    it('should not require payment', async () => {
      const response = await request(app).get('/llms.txt');
      expect(response.status).toBe(200);
      expect(response.status).not.toBe(402);
    });
  });

  describe('GET /collections.json', () => {
    it('should return ERC-8257-style collections manifest', async () => {
      const response = await request(app).get('/collections.json');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('collections');
      expect(Array.isArray(response.body.collections)).toBe(true);
      expect(response.body.collections.length).toBeGreaterThan(0);
    });

    it('should list tools in each collection', async () => {
      const response = await request(app).get('/collections.json');
      const collection = response.body.collections[0];
      expect(collection).toHaveProperty('id');
      expect(collection).toHaveProperty('name');
      expect(collection).toHaveProperty('tools');
      expect(collection.tools.length).toBeGreaterThan(0);
    });

    it('should include price and network info for each tool', async () => {
      const response = await request(app).get('/collections.json');
      const tool = response.body.collections[0].tools[0];
      expect(tool).toHaveProperty('route');
      expect(tool).toHaveProperty('method');
      expect(tool).toHaveProperty('price');
      expect(tool).toHaveProperty('currency', 'USDC');
      expect(tool).toHaveProperty('network', 'eip155:8453');
    });

    it('should not require payment', async () => {
      const response = await request(app).get('/collections.json');
      expect(response.status).toBe(200);
      expect(response.status).not.toBe(402);
    });
  });

  describe('GET /sample', () => {
    it('should return synthetic demo response', async () => {
      const response = await request(app).get('/sample');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('label', 'synthetic/demo');
      expect(response.body).toHaveProperty('payment_required', true);
      expect(response.body).toHaveProperty('payment_scheme', 'exact');
      expect(response.body).toHaveProperty('network', 'eip155:8453');
      expect(response.body).toHaveProperty('payTo');
    });

    it('should show example request and live result structure', async () => {
      const response = await request(app).get('/sample');
      expect(response.body).toHaveProperty('example_request');
      expect(response.body).toHaveProperty('live_result');
      expect(response.body.live_result).toHaveProperty('ok', true);
    });

    it('should not require payment', async () => {
      const response = await request(app).get('/sample');
      expect(response.status).toBe(200);
      expect(response.status).not.toBe(402);
    });
  });

  // ============================================
  // DISCOVERY SURFACE INTEGRATION TESTS
  // ============================================

  describe('Discovery Surfaces Integration', () => {
    it('all discovery surfaces should return 200 without payment', async () => {
      const endpoints = [
        '/.well-known/x402.json',
        '/pricing.md',
        '/llms.txt',
        '/collections.json',
        '/sample'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(200);
        expect(response.status).not.toBe(402);
      }
    });

    it('manifest and pricing should have consistent price values', async () => {
      const manifestRes = await request(app).get('/.well-known/x402.json');
      const pricingRes = await request(app).get('/pricing.md');
      
      if (process.env.X402_PRICE_SESSION_START) {
        const priceInManifest = manifestRes.body.endpoints['/api/session/start'].accepts.price;
        expect(pricingRes.text).toContain(priceInManifest);
      }
    });
  });
});