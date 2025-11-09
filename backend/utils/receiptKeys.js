const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Receipt Key Management Utilities
 * Handles Ed25519 key generation and management for trust receipts
 */

/**
 * Generate a new Ed25519 key pair
 */
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Convert public key to base64url for easy transmission
  const publicKeyBase64 = extractBase64FromPem(publicKey);
  const publicKeyBase64Url = publicKeyBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return {
    publicKeyPem: publicKey,
    privateKeyPem: privateKey,
    publicKeyBase64: publicKeyBase64,
    publicKeyBase64Url: publicKeyBase64Url,
    privateKeyBase64: extractBase64FromPem(privateKey)
  };
}

/**
 * Extract base64 from PEM format
 */
function extractBase64FromPem(pem) {
  const lines = pem.split('\n');
  const base64Lines = lines.filter(line => 
    line.trim() && 
    !line.includes('-----BEGIN') && 
    !line.includes('-----END')
  );
  return base64Lines.join('');
}

/**
 * Load keys from environment variables or generate new ones
 */
function loadOrGenerateKeys() {
  let privateKey = process.env.RECEIPT_SIGNING_PRIVATE_KEY_PEM;
  let publicKey = process.env.RECEIPT_VERIFY_PUBKEY_B64U;

  // If keys are in environment, use them
  if (privateKey && publicKey) {
    console.log('✅ Receipt keys loaded from environment variables');
    
    // Validate the keys work together
    try {
      const testMessage = 'test';
      const testSignature = crypto.signSync(null, Buffer.from(testMessage), privateKey);
      const publicKeyBuffer = Buffer.from(publicKey, 'base64url');
      const isValid = crypto.verifySync(null, Buffer.from(testMessage), publicKeyBuffer, testSignature);
      
      if (!isValid) {
        throw new Error('Generated signature verification failed');
      }
      
      return {
        privateKeyPem: privateKey,
        publicKeyBase64Url: publicKey,
        isValid: true
      };
    } catch (error) {
      console.error('❌ Invalid keys in environment variables:', error.message);
      throw error;
    }
  }

  // Generate new keys for development
  console.log('⚠️  No receipt keys in environment, generating new keys (FOR DEVELOPMENT ONLY)');
  const keyPair = generateKeyPair();
  
  console.log('📝 Generated keys (add these to your environment):');
  console.log(`RECEIPT_SIGNING_PRIVATE_KEY_PEM="${keyPair.privateKeyPem.replace(/\n/g, '\\n')}"`);
  console.log(`RECEIPT_VERIFY_PUBKEY_B64U="${keyPair.publicKeyBase64Url}"`);

  return {
    privateKeyPem: keyPair.privateKeyPem,
    publicKeyBase64Url: keyPair.publicKeyBase64Url,
    publicKeyPem: keyPair.publicKeyPem,
    isGenerated: true
  };
}

/**
 * Sign a message with the private key
 */
function signMessage(message, privateKeyPem) {
  if (!privateKeyPem) {
    throw new Error('Private key not available for signing');
  }

  try {
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const messageBuffer = Buffer.from(message, 'hex');
    const signature = crypto.signSync(null, messageBuffer, privateKey);
    return signature.toString('base64');
  } catch (error) {
    throw new Error(`Failed to sign message: ${error.message}`);
  }
}

/**
 * Verify a signature with the public key
 */
function verifySignature(message, signatureBase64, publicKeyBase64Url) {
  try {
    const messageBuffer = Buffer.from(message, 'hex');
    const signature = Buffer.from(signatureBase64, 'base64');
    const publicKeyBuffer = Buffer.from(publicKeyBase64Url, 'base64url');
    
    return crypto.verifySync(null, messageBuffer, publicKeyBuffer, signature);
  } catch (error) {
    throw new Error(`Failed to verify signature: ${error.message}`);
  }
}

/**
 * Get key information
 */
function getKeyInfo() {
  const hasPrivateKey = !!process.env.RECEIPT_SIGNING_PRIVATE_KEY_PEM;
  const hasPublicKey = !!process.env.RECEIPT_VERIFY_PUBKEY_B64U;
  
  if (hasPrivateKey && hasPublicKey) {
    return {
      available: true,
      source: 'environment',
      warning: null
    };
  }
  
  return {
    available: false,
    source: 'none',
    warning: 'Receipt signing keys not configured. Add RECEIPT_SIGNING_PRIVATE_KEY_PEM and RECEIPT_VERIFY_PUBKEY_B64U to environment variables for production use.'
  };
}

/**
 * Initialize receipt keys and validate them
 */
function initializeReceiptKeys() {
  try {
    const keyInfo = getKeyInfo();
    
    if (!keyInfo.available) {
      console.log('🔐 Receipt keys not configured, using development mode');
      const keys = loadOrGenerateKeys();
      
      if (keys.isGenerated) {
        console.log('⚠️  DEVELOPMENT MODE: Using auto-generated keys');
        console.log('📋 Add these environment variables for production:');
        console.log(`   RECEIPT_SIGNING_PRIVATE_KEY_PEM="${keys.privateKeyPem.replace(/\n/g, '\\n')}"`);
        console.log(`   RECEIPT_VERIFY_PUBKEY_B64U="${keys.publicKeyBase64Url}"`);
      }
      
      return keys;
    }
    
    // Validate existing keys
    const keys = loadOrGenerateKeys();
    console.log('✅ Receipt keys initialized and validated');
    
    return keys;
  } catch (error) {
    console.error('❌ Failed to initialize receipt keys:', error.message);
    throw error;
  }
}

module.exports = {
  generateKeyPair,
  loadOrGenerateKeys,
  signMessage,
  verifySignature,
  getKeyInfo,
  initializeReceiptKeys,
  extractBase64FromPem
};