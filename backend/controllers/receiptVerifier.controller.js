const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { stableStringify, sha256Hex } = require('../utils/hash');
const InteractionEvent = require('../models/interactionEvent.model');

/**
 * Verify a trust receipt (standalone or from ledger)
 * Supports both Ed25519 signatures and hash chain verification
 */
const verifyReceipt = asyncHandler(async (req, res) => {
  const { receipt } = req.body;
  
  if (!receipt) {
    return res.status(400).json({
      success: false,
      error: 'Receipt object is required'
    });
  }

  try {
    const result = await verifyReceiptStructure(receipt);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      details: error.details
    });
  }
});

/**
 * Verify a receipt by event_id (from the ledger)
 */
const verifyLedgerEntry = asyncHandler(async (req, res) => {
  const { event_id } = req.params;
  
  if (!event_id) {
    return res.status(400).json({
      success: false,
      error: 'event_id is required'
    });
  }

  try {
    const event = await InteractionEvent.findOne({ event_id }).lean();
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Convert ledger entry to receipt format
    const receipt = ledgerEntryToReceipt(event);
    const result = await verifyReceiptStructure(receipt);
    
    res.json({
      success: true,
      data: {
        ...result,
        event_id: event.event_id,
        session_id: event.session_id,
        timestamp: event.timestamp
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      details: error.details
    });
  }
});

/**
 * Verify entire session hash chain
 */
const verifySessionChain = asyncHandler(async (req, res) => {
  const { session_id } = req.query;
  
  if (!session_id) {
    return res.status(400).json({
      success: false,
      error: 'session_id is required'
    });
  }

  try {
    const events = await InteractionEvent.find({ session_id })
      .sort({ timestamp: 1 })
      .lean();

    if (events.length === 0) {
      return res.json({
        success: true,
        data: {
          valid: true,
          message: 'No events found in session',
          count: 0
        }
      });
    }

    const chainResults = [];
    let prevHash = null;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const receipt = ledgerEntryToReceipt(event);
      
      // Verify hash chain
      const expectedHash = sha256Hex(prevHash + receipt.inputs_hash + receipt.outputs_hash);
      const hashValid = receipt.entry_hash === expectedHash;
      
      // Verify signature if present
      let signatureValid = null;
      if (receipt.ed25519_sig && receipt.ed25519_pubkey) {
        signatureValid = await verifyEd25519Signature(
          receipt.entry_hash,
          receipt.ed25519_sig,
          receipt.ed25519_pubkey
        );
      }

      chainResults.push({
        index: i,
        event_id: event.event_id,
        hash_valid: hashValid,
        signature_valid: signatureValid,
        expected_hash: expectedHash,
        actual_hash: receipt.entry_hash,
        prev_hash: prevHash
      });

      prevHash = receipt.entry_hash;

      if (!hashValid) {
        break; // Stop at first hash chain break
      }
    }

    const allValid = chainResults.every(r => r.hash_valid && (r.signature_valid === null || r.signature_valid));

    res.json({
      success: true,
      data: {
        valid: allValid,
        count: events.length,
        results: chainResults,
        summary: {
          total_events: events.length,
          hash_chain_valid: chainResults.every(r => r.hash_valid),
          signatures_valid: chainResults.filter(r => r.signature_valid === true).length,
          signatures_invalid: chainResults.filter(r => r.signature_valid === false).length,
          signatures_unchecked: chainResults.filter(r => r.signature_valid === null).length
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      details: error.details
    });
  }
});

/**
 * Get public key for receipt verification
 */
const getPublicKey = asyncHandler(async (req, res) => {
  const publicKeyBase64 = process.env.RECEIPT_VERIFY_PUBKEY_B64U;
  
  if (!publicKeyBase64) {
    return res.status(404).json({
      success: false,
      error: 'Public key not configured'
    });
  }

  // Set proper content type for PEM file
  res.set('Content-Type', 'application/octet-stream');
  res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  
  // Return raw base64url-encoded public key
  res.send(publicKeyBase64);
});

/**
 * Core verification logic
 */
async function verifyReceiptStructure(receipt) {
  const result = {
    valid: true,
    checks: [],
    warnings: [],
    receipt_type: null
  };

  // Determine receipt type
  if (receipt.payload && receipt.ed25519_sig && receipt.ed25519_pubkey) {
    result.receipt_type = 'ed25519_signed';
    await verifyEd25519Receipt(receipt, result);
  } else if (receipt.entry_hash && receipt.inputs_hash && receipt.outputs_hash) {
    result.receipt_type = 'hash_chain';
    verifyHashChainReceipt(receipt, result);
  } else {
    throw new Error('Unrecognized receipt format');
  }

  // Common validations
  validateCommonFields(receipt, result);

  return result;
}

/**
 * Verify Ed25519-signed receipt
 */
async function verifyEd25519Receipt(receipt, result) {
  const { payload, entry_hash, ed25519_sig, ed25519_pubkey } = receipt;

  // Check required fields
  ['payload', 'entry_hash', 'ed25519_sig', 'ed25519_pubkey'].forEach(field => {
    if (!receipt[field]) {
      result.valid = false;
      result.checks.push({ field, status: 'missing', message: `Required field missing: ${field}` });
    }
  });

  if (!result.valid) return;

  // Verify payload integrity
  let payloadHash;
  try {
    payloadHash = sha256Hex(stableStringify(JSON.parse(payload)));
  } catch (e) {
    result.valid = false;
    result.checks.push({ field: 'payload', status: 'invalid', message: 'Invalid JSON payload' });
    return;
  }

  // Verify entry hash matches payload hash
  if (payloadHash !== entry_hash) {
    result.valid = false;
    result.checks.push({
      field: 'entry_hash',
      status: 'mismatch',
      message: 'Entry hash does not match payload hash',
      expected: payloadHash,
      actual: entry_hash
    });
  } else {
    result.checks.push({ field: 'entry_hash', status: 'valid', message: 'Entry hash matches payload' });
  }

  // Verify Ed25519 signature
  try {
    const signatureValid = await verifyEd25519Signature(entry_hash, ed25519_sig, ed25519_pubkey);
    if (signatureValid) {
      result.checks.push({ field: 'ed25519_sig', status: 'valid', message: 'Ed25519 signature verified' });
    } else {
      result.valid = false;
      result.checks.push({ field: 'ed25519_sig', status: 'invalid', message: 'Ed25519 signature verification failed' });
    }
  } catch (error) {
    result.valid = false;
    result.checks.push({ field: 'ed25519_sig', status: 'error', message: error.message });
  }

  // Parse and validate payload structure
  try {
    const parsed = JSON.parse(payload);
    validatePayloadStructure(parsed, result);
  } catch (e) {
    result.warnings.push({ field: 'payload', message: 'Could not validate payload structure' });
  }
}

/**
 * Verify hash chain receipt
 */
function verifyHashChainReceipt(receipt, result) {
  const { entry_hash, inputs_hash, outputs_hash, prev_hash } = receipt;

  // Check required fields
  ['entry_hash', 'inputs_hash', 'outputs_hash'].forEach(field => {
    if (!receipt[field]) {
      result.valid = false;
      result.checks.push({ field, status: 'missing', message: `Required field missing: ${field}` });
    }
  });

  if (!result.valid) return;

  // Recompute entry hash
  const expectedHash = sha256Hex((prev_hash || '') + inputs_hash + outputs_hash);
  
  if (expectedHash === entry_hash) {
    result.checks.push({ field: 'entry_hash', status: 'valid', message: 'Hash chain verified' });
  } else {
    result.valid = false;
    result.checks.push({
      field: 'entry_hash',
      status: 'mismatch',
      message: 'Entry hash does not match recomputed hash',
      expected: expectedHash,
      actual: entry_hash,
      components: { prev_hash, inputs_hash, outputs_hash }
    });
  }
}

/**
 * Verify Ed25519 signature
 */
async function verifyEd25519Signature(messageHex, signatureBase64, publicKeyBase64) {
  try {
    const message = Buffer.from(messageHex, 'hex');
    const signature = Buffer.from(signatureBase64, 'base64');
    
    // Try base64url first, then regular base64
    let publicKey;
    try {
      publicKey = Buffer.from(publicKeyBase64, 'base64url');
    } catch {
      publicKey = Buffer.from(publicKeyBase64, 'base64');
    }

    return crypto.verify(null, message, publicKey, signature);
  } catch (error) {
    throw new Error(`Signature verification failed: ${error.message}`);
  }
}

/**
 * Validate common receipt fields
 */
function validateCommonFields(receipt, result) {
  // Check timestamp if present
  if (receipt.timestamp) {
    const ts = new Date(receipt.timestamp);
    if (isNaN(ts.getTime())) {
      result.warnings.push({ field: 'timestamp', message: 'Invalid timestamp format' });
    }
  }

  // Check policy_id if present
  if (receipt.policy_id && typeof receipt.policy_id !== 'string') {
    result.warnings.push({ field: 'policy_id', message: 'policy_id should be a string' });
  }
}

/**
 * Validate payload structure for Ed25519 receipts
 */
function validatePayloadStructure(payload, result) {
  const requiredFields = ['event_id', 'session_id', 'timestamp'];
  const optionalFields = ['model_vendor', 'model_name', 'metadata'];

  requiredFields.forEach(field => {
    if (!payload[field]) {
      result.warnings.push({ field: 'payload', message: `Recommended field missing: ${field}` });
    }
  });

  // Validate event_id format (UUID)
  if (payload.event_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.event_id)) {
    result.warnings.push({ field: 'payload', message: 'event_id should be a UUID' });
  }
}

/**
 * Convert ledger entry to receipt format
 */
function ledgerEntryToReceipt(event) {
  const canonical = {
    event_id: event.event_id,
    session_id: event.session_id,
    user: event.user?.toString?.() || event.user,
    model_vendor: event.model_vendor,
    model_name: event.model_name,
    timestamp: event.timestamp?.toISOString?.() || event.timestamp,
    prompt: event.prompt,
    response: event.response,
    metadata: event.metadata,
    analysis: event.analysis || null,
    prev_hash: event.ledger?.prev_hash || null
  };

  const payload = stableStringify(canonical);
  const inputsHash = sha256Hex(canonical.prompt || '');
  const outputsHash = sha256Hex(canonical.response || '');

  return {
    payload,
    inputs_hash: inputsHash,
    outputs_hash: outputsHash,
    prev_hash: event.ledger?.prev_hash || null,
    entry_hash: event.ledger?.row_hash || '',
    ed25519_pubkey: process.env.RECEIPT_VERIFY_PUBKEY_B64U || null,
    ed25519_sig: event.ledger?.signature || null,
    policy_id: 'ledger.v1'
  };
}

module.exports = {
  verifyReceipt,
  verifyLedgerEntry,
  verifySessionChain,
  getPublicKey
};