const crypto = require('crypto');
const { stableStringify, sha256Hex } = require('../utils/hash');
const { signMessage, initializeReceiptKeys } = require('../utils/receiptKeys');

/**
 * Trust Receipt Generation Service
 * Creates cryptographically signed trust receipts for AI interactions
 */

// Initialize keys on service load
let receiptKeys = null;

/**
 * Initialize the receipt service
 */
function initializeService() {
  try {
    receiptKeys = initializeReceiptKeys();
    return receiptKeys;
  } catch (error) {
    console.error('Failed to initialize receipt service:', error.message);
    throw error;
  }
}

/**
 * Generate a trust receipt from interaction data
 */
function generateTrustReceipt(interactionData, options = {}) {
  if (!receiptKeys) {
    throw new Error('Receipt service not initialized');
  }

  const {
    event_id,
    session_id,
    user_id,
    prompt,
    response,
    metadata = {},
    model_vendor = 'unknown',
    model_name = null,
    timestamp = new Date().toISOString()
  } = interactionData;

  // Validate required fields
  if (!event_id || !session_id || !prompt || !response) {
    throw new Error('Missing required fields: event_id, session_id, prompt, response');
  }

  // Create canonical payload
  const payload = createCanonicalPayload({
    event_id,
    session_id,
    user_id,
    prompt,
    response,
    metadata,
    model_vendor,
    model_name,
    timestamp
  });

  // Compute hashes
  const inputsHash = sha256Hex(prompt);
  const outputsHash = sha256Hex(response);
  const payloadHash = sha256Hex(stableStringify(payload));

  // Create receipt structure
  const receipt = {
    payload: stableStringify(payload),
    inputs_hash: inputsHash,
    outputs_hash: outputsHash,
    prev_hash: options.prev_hash || null,
    entry_hash: payloadHash,
    ed25519_pubkey: receiptKeys.publicKeyBase64Url,
    ed25519_sig: null,
    policy_id: options.policy_id || 'trust.receipt.v1',
    created_at: timestamp
  };

  // Sign the entry hash
  if (receiptKeys.privateKeyPem) {
    try {
      receipt.ed25519_sig = signMessage(payloadHash, receiptKeys.privateKeyPem);
    } catch (error) {
      console.warn('Failed to sign receipt:', error.message);
      // Continue without signature for development
    }
  }

  return receipt;
}

/**
 * Create canonical JSON payload
 */
function createCanonicalPayload(data) {
  const {
    event_id,
    session_id,
    user_id,
    prompt,
    response,
    metadata,
    model_vendor,
    model_name,
    timestamp
  } = data;

  return {
    event_id,
    session_id,
    user_id,
    model_vendor,
    model_name,
    timestamp,
    prompt_length: prompt.length,
    response_length: response.length,
    prompt_hash: sha256Hex(prompt),
    response_hash: sha256Hex(response),
    metadata: metadata || {},
    trust_version: '1.0',
    compliance: {
      consent_architecture: true,
      inspection_mandate: true,
      continuous_validation: true,
      ethical_override: false,
      right_to_disconnect: true,
      moral_recognition: true
    }
  };
}

/**
 * Generate a demo receipt for testing
 */
function generateDemoReceipt(options = {}) {
  const demoData = {
    event_id: crypto.randomUUID(),
    session_id: options.session_id || 'demo-session-' + Date.now(),
    user_id: options.user_id || 'demo-user',
    prompt: options.prompt || 'This is a demo prompt for trust receipt verification.',
    response: options.response || 'This is a demo response demonstrating cryptographic audit trails.',
    metadata: {
      demo: true,
      purpose: 'trust_receipt_verification',
      compliance_score: options.compliance_score || 0.98
    },
    model_vendor: 'demo',
    model_name: 'demo-model',
    timestamp: new Date().toISOString()
  };

  return generateTrustReceipt(demoData, options);
}

/**
 * Convert a ledger entry to receipt format
 */
function ledgerEntryToReceipt(ledgerEntry) {
  if (!receiptKeys) {
    throw new Error('Receipt service not initialized');
  }

  const {
    event_id,
    session_id,
    user,
    prompt,
    response,
    metadata,
    model_vendor,
    model_name,
    timestamp,
    ledger
  } = ledgerEntry;

  // Create canonical payload
  const payload = createCanonicalPayload({
    event_id,
    session_id,
    user_id: user?.toString?.() || user,
    prompt,
    response,
    metadata,
    model_vendor,
    model_name,
    timestamp: timestamp?.toISOString?.() || timestamp
  });

  const payloadHash = sha256Hex(stableStringify(payload));
  const inputsHash = sha256Hex(prompt);
  const outputsHash = sha256Hex(response);

  return {
    payload: stableStringify(payload),
    inputs_hash: inputsHash,
    outputs_hash: outputsHash,
    prev_hash: ledger?.prev_hash || null,
    entry_hash: ledger?.row_hash || payloadHash,
    ed25519_pubkey: receiptKeys.publicKeyBase64Url,
    ed25519_sig: ledger?.signature || null,
    policy_id: 'ledger.v1',
    created_at: timestamp?.toISOString?.() || new Date().toISOString()
  };
}

/**
 * Get receipt service status
 */
function getServiceStatus() {
  const keyInfo = {
    hasPrivateKeys: !!receiptKeys?.privateKeyPem,
    hasPublicKey: !!receiptKeys?.publicKeyBase64Url,
    publicKeyAvailable: !!process.env.RECEIPT_VERIFY_PUBKEY_B64U,
    privateKeyAvailable: !!process.env.RECEIPT_SIGNING_PRIVATE_KEY_PEM
  };

  return {
    initialized: !!receiptKeys,
    keys: keyInfo,
    canSign: keyInfo.hasPrivateKeys,
    canVerify: keyInfo.hasPublicKey,
    mode: keyInfo.privateKeyAvailable ? 'production' : 'development'
  };
}

/**
 * Batch generate receipts for multiple interactions
 */
function generateBatchReceipts(interactions, options = {}) {
  if (!receiptKeys) {
    throw new Error('Receipt service not initialized');
  }

  const receipts = [];
  let prevHash = options.prev_hash || null;

  for (let i = 0; i < interactions.length; i++) {
    const interaction = interactions[i];
    const receipt = generateTrustReceipt(interaction, {
      ...options,
      prev_hash: prevHash
    });

    receipts.push(receipt);
    prevHash = receipt.entry_hash;
  }

  return receipts;
}

// Initialize service on module load
try {
  initializeService();
} catch (error) {
  console.error('Warning: Receipt service failed to initialize:', error.message);
}

module.exports = {
  initializeService,
  generateTrustReceipt,
  generateDemoReceipt,
  ledgerEntryToReceipt,
  generateBatchReceipts,
  getServiceStatus,
  createCanonicalPayload
};