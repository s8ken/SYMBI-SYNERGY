const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
  verifyReceipt, 
  verifyLedgerEntry, 
  verifySessionChain, 
  getPublicKey 
} = require('../controllers/receiptVerifier.controller');

/**
 * Trust Receipt Verifier Routes
 * Provides comprehensive verification of trust receipts and ledger entries
 */

// Public key endpoint (no auth required - needed for client-side verification)
router.get('/public-key', getPublicKey);

// Verify a standalone trust receipt
router.post('/verify', verifyReceipt);

// Verify a specific ledger entry by event_id
router.get('/verify/:event_id', protect, verifyLedgerEntry);

// Verify entire session hash chain
router.get('/verify-session', protect, verifySessionChain);

module.exports = router;