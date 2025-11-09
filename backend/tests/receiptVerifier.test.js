const request = require('supertest');
const app = require('../app');
const { sha256Hex, stableStringify } = require('../utils/hash');
const crypto = require('crypto');

describe('Receipt Verifier API', () => {
  let testPublicKey;
  let testPrivateKey;
  let testReceipt;

  beforeAll(async () => {
    // Generate test Ed25519 key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    testPublicKey = publicKey.export({ type: 'spki', format: 'pem' });
    testPrivateKey = privateKey.export({ type: 'pkcs8', format: 'pem' });

    // Create test receipt
    const payload = JSON.stringify({
      event_id: crypto.randomUUID(),
      session_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      model_vendor: 'openai',
      model_name: 'gpt-4',
      prompt: 'Test prompt',
      response: 'Test response'
    });

    const inputsHash = sha256Hex('Test prompt');
    const outputsHash = sha256Hex('Test response');
    const entryHash = sha256Hex(stableStringify(JSON.parse(payload)));

    const signature = crypto.sign(null, Buffer.from(entryHash, 'hex'), testPrivateKey);

    testReceipt = {
      payload,
      inputs_hash: inputsHash,
      outputs_hash: outputsHash,
      prev_hash: null,
      entry_hash: entryHash,
      ed25519_pubkey: testPublicKey,
      ed25519_sig: signature.toString('base64'),
      policy_id: 'test.v1'
    };

    // Set environment variables for testing
    process.env.RECEIPT_VERIFY_PUBKEY_B64U = Buffer.from(testPublicKey).toString('base64url');
  });

  describe('GET /api/receipts/public-key', () => {
    it('should return the public key', async () => {
      const response = await request(app)
        .get('/api/receipts/public-key')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/octet-stream/);
      expect(response.text).toBeTruthy();
    });

    it('should cache the public key', async () => {
      const response = await request(app)
        .get('/api/receipts/public-key')
        .expect(200);

      expect(response.headers['cache-control']).toContain('max-age=86400');
    });
  });

  describe('POST /api/receipts/verify', () => {
    it('should verify a valid Ed25519 receipt', async () => {
      const response = await request(app)
        .post('/api/receipts/verify')
        .send({ receipt: testReceipt })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.receipt_type).toBe('ed25519_signed');
      expect(response.body.data.checks).toHaveLength(4); // entry_hash, ed25519_sig, and 2 field checks
    });

    it('should reject a receipt with invalid signature', async () => {
      const invalidReceipt = {
        ...testReceipt,
        ed25519_sig: 'invalid_signature'
      };

      const response = await request(app)
        .post('/api/receipts/verify')
        .send({ receipt: invalidReceipt })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.checks.some(c => c.field === 'ed25519_sig' && c.status === 'invalid')).toBe(true);
    });

    it('should reject a receipt with hash mismatch', async () => {
      const invalidReceipt = {
        ...testReceipt,
        entry_hash: 'invalid_hash'
      };

      const response = await request(app)
        .post('/api/receipts/verify')
        .send({ receipt: invalidReceipt })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.checks.some(c => c.field === 'entry_hash' && c.status === 'mismatch')).toBe(true);
    });

    it('should verify hash chain receipt', async () => {
      const inputsHash = sha256Hex('Test input');
      const outputsHash = sha256Hex('Test output');
      const entryHash = sha256Hex('' + inputsHash + outputsHash);

      const hashChainReceipt = {
        inputs_hash: inputsHash,
        outputs_hash: outputsHash,
        prev_hash: null,
        entry_hash: entryHash,
        policy_id: 'hashchain.v1'
      };

      const response = await request(app)
        .post('/api/receipts/verify')
        .send({ receipt: hashChainReceipt })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.receipt_type).toBe('hash_chain');
    });

    it('should reject receipt without required fields', async () => {
      const response = await request(app)
        .post('/api/receipts/verify')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Receipt object is required');
    });

    it('should reject unrecognized receipt format', async () => {
      const invalidReceipt = { invalid: 'format' };

      const response = await request(app)
        .post('/api/receipts/verify')
        .send({ receipt: invalidReceipt })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unrecognized receipt format');
    });
  });

  describe('Hash Chain Verification', () => {
    it('should verify linked hash chain', async () => {
      const firstInputs = sha256Hex('First input');
      const firstOutputs = sha256Hex('First output');
      const firstEntry = sha256Hex('' + firstInputs + firstOutputs);

      const secondInputs = sha256Hex('Second input');
      const secondOutputs = sha256Hex('Second output');
      const secondEntry = sha256Hex(firstEntry + secondInputs + secondOutputs);

      const firstReceipt = {
        inputs_hash: firstInputs,
        outputs_hash: firstOutputs,
        prev_hash: null,
        entry_hash: firstEntry,
        policy_id: 'hashchain.v1'
      };

      const secondReceipt = {
        inputs_hash: secondInputs,
        outputs_hash: secondOutputs,
        prev_hash: firstEntry,
        entry_hash: secondEntry,
        policy_id: 'hashchain.v1'
      };

      // Verify second receipt
      const response = await request(app)
        .post('/api/receipts/verify')
        .send({ receipt: secondReceipt })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.receipt_type).toBe('hash_chain');
    });

    it('should detect broken hash chain', async () => {
      const firstEntry = sha256Hex('input' + 'output');
      const secondInputs = sha256Hex('Second input');
      const secondOutputs = sha256Hex('Second output');
      const wrongEntry = sha256Hex('wrong' + secondInputs + secondOutputs);

      const brokenReceipt = {
        inputs_hash: secondInputs,
        outputs_hash: secondOutputs,
        prev_hash: firstEntry,
        entry_hash: wrongEntry,
        policy_id: 'hashchain.v1'
      };

      const response = await request(app)
        .post('/api/receipts/verify')
        .send({ receipt: brokenReceipt })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.checks.some(c => c.field === 'entry_hash' && c.status === 'mismatch')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON payload', async () => {
      const malformedReceipt = {
        ...testReceipt,
        payload: 'not valid json'
      };

      const response = await request(app)
        .post('/api/receipts/verify')
        .send({ receipt: malformedReceipt })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.checks.some(c => c.field === 'payload' && c.status === 'invalid')).toBe(true);
    });

    it('should handle missing signature fields', async () => {
      const incompleteReceipt = {
        payload: testReceipt.payload,
        entry_hash: testReceipt.entry_hash
        // Missing ed25519_sig and ed25519_pubkey
      };

      const response = await request(app)
        .post('/api/receipts/verify')
        .send({ receipt: incompleteReceipt })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.receipt_type).toBe('ed25519_signed');
      expect(response.body.data.checks.some(c => c.status === 'missing')).toBe(true);
    });
  });

  describe('Validation Warnings', () => {
    it('should warn about invalid timestamp', async () => {
      const receiptWithBadTimestamp = {
        ...testReceipt,
        payload: JSON.stringify({
          ...JSON.parse(testReceipt.payload),
          timestamp: 'invalid-timestamp'
        })
      };

      const response = await request(app)
        .post('/api/receipts/verify')
        .send({ receipt: receiptWithBadTimestamp })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.warnings.some(w => w.field === 'timestamp')).toBe(true);
    });

    it('should warn about missing recommended payload fields', async () => {
      const minimalPayload = JSON.stringify({
        prompt: 'test'
        // Missing event_id, session_id, timestamp
      });

      const minimalReceipt = {
        ...testReceipt,
        payload: minimalPayload
      };

      const response = await request(app)
        .post('/api/receipts/verify')
        .send({ receipt: minimalReceipt })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.warnings.some(w => w.field === 'payload')).toBe(true);
    });
  });
});