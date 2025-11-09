const express = require('express');
const router = express.Router();
const { generateDemoReceipt } = require('../services/receipt.service');
const { isDemoMode } = require('../middleware/demo.middleware');

/**
 * Demo Receipt Generation Routes
 * Provides endpoints for generating trust receipts in demo mode
 */

// Generate a demo trust receipt
router.post('/generate', async (req, res) => {
  try {
    const options = {
      session_id: req.body.session_id,
      user_id: req.body.user_id,
      prompt: req.body.prompt,
      response: req.body.response,
      compliance_score: req.body.compliance_score,
      prev_hash: req.body.prev_hash,
      policy_id: req.body.policy_id || 'demo.receipt.v1'
    };

    const receipt = generateDemoReceipt(options);

    res.json({
      success: true,
      data: {
        receipt,
        meta: {
          demo: true,
          generated_at: new Date().toISOString(),
          purpose: 'trust_receipt_verification_demo'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get demo receipt service status
router.get('/status', (req, res) => {
  const { getServiceStatus } = require('../services/receipt.service');
  const status = getServiceStatus();

  res.json({
    success: true,
    data: {
      service: status,
      demo_mode: isDemoMode(),
      endpoints: {
        generate: 'POST /api/demo-receipts/generate',
        verify: 'POST /api/receipts/verify',
        public_key: 'GET /api/receipts/public-key'
      }
    }
  });
});

// Generate a receipt from form data (for the trust demo)
router.post('/from-form', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const receipt = generateDemoReceipt({
      prompt: req.body.prompt || 'Sample interaction prompt',
      response: req.body.response || 'Sample interaction response',
      compliance_score: parseFloat(req.body.compliance_score) || 0.98
    });

    // Redirect to verification page with receipt in hash
    const receiptBase64 = Buffer.from(JSON.stringify(receipt)).toString('base64url');
    res.redirect(`/verifier.html#r=${receiptBase64}`);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;