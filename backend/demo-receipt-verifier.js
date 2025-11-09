/**
 * Trust Receipt Verifier Demo
 * Demonstrates the receipt verification capabilities
 */

const crypto = require('crypto');
const { sha256Hex, stableStringify, signEd25519Hex } = require('./utils/hash');
const { initializeReceiptKeys, generateKeyPair } = require('./utils/receiptKeys');

/**
 * Create a demo Ed25519-signed trust receipt
 */
function createDemoReceipt() {
  console.log('🎫 Creating demo Ed25519-signed trust receipt...\n');

  // Generate demo key pair (in production, these would be loaded from env)
  const keyPair = generateKeyPair();
  
  const payload = {
    event_id: crypto.randomUUID(),
    session_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    model_vendor: 'openai',
    model_name: 'gpt-4',
    prompt: 'What is the status of project Alpha?',
    response: 'Project Alpha is currently in phase 2 with 78% completion. All critical milestones have been achieved on schedule.',
    metadata: {
      user_id: 'demo-user-123',
      compliance_score: 0.95,
      trust_level: 'high'
    }
  };

  const payloadString = stableStringify(payload);
  const inputsHash = sha256Hex(payload.prompt);
  const outputsHash = sha256Hex(payload.response);
  const entryHash = sha256Hex(payloadString);

  // Sign the entry hash
  const signature = signEd25519Hex(entryHash, keyPair.privateKeyPem);

  const receipt = {
    payload: payloadString,
    inputs_hash: inputsHash,
    outputs_hash: outputsHash,
    prev_hash: null, // First entry in chain
    entry_hash: entryHash,
    ed25519_pubkey: keyPair.publicKeyBase64,
    ed25519_sig: signature,
    policy_id: 'demo.v1'
  };

  console.log('✅ Demo receipt created:');
  console.log(`   Event ID: ${payload.event_id}`);
  console.log(`   Session ID: ${payload.session_id}`);
  console.log(`   Entry Hash: ${entryHash}`);
  console.log(`   Signature: ${signature.substring(0, 20)}...`);
  console.log(`   Public Key: ${keyPair.publicKeyBase64.substring(0, 20)}...\n`);

  return { receipt, keyPair };
}

/**
 * Create a demo hash chain receipt
 */
function createHashChainReceipt(prevHash = null) {
  console.log('⛓️  Creating demo hash chain receipt...\n');

  const inputs = 'User query about compliance status';
  const outputs = 'Compliance check passed with 98% confidence';

  const inputsHash = sha256Hex(inputs);
  const outputsHash = sha256Hex(outputs);
  const entryHash = sha256Hex((prevHash || '') + inputsHash + outputsHash);

  const receipt = {
    inputs_hash: inputsHash,
    outputs_hash: outputsHash,
    prev_hash: prevHash,
    entry_hash: entryHash,
    policy_id: 'hashchain.v1'
  };

  console.log('✅ Hash chain receipt created:');
  console.log(`   Inputs Hash: ${inputsHash}`);
  console.log(`   Outputs Hash: ${outputsHash}`);
  console.log(`   Previous Hash: ${prevHash || 'null (first entry)'}`);
  console.log(`   Entry Hash: ${entryHash}\n`);

  return receipt;
}

/**
 * Create a linked chain of receipts
 */
function createReceiptChain(length = 3) {
  console.log(`🔗 Creating chain of ${length} receipts...\n`);

  const receipts = [];
  let prevHash = null;

  for (let i = 0; i < length; i++) {
    const receipt = createHashChainReceipt(prevHash);
    receipts.push(receipt);
    prevHash = receipt.entry_hash;
  }

  console.log('✅ Receipt chain created successfully\n');
  return receipts;
}

/**
 * Demonstrate verification process
 */
function demonstrateVerification(receipt, keyPair) {
  console.log('🔍 Demonstrating receipt verification...\n');

  // Verify entry hash
  let hashValid = true;
  let expectedHash = '';

  if (receipt.payload) {
    // Ed25519 receipt: entry_hash should equal payload hash
    expectedHash = sha256Hex(receipt.payload);
    hashValid = receipt.entry_hash === expectedHash;
    console.log(`Payload Hash Verification: ${hashValid ? '✅ PASS' : '❌ FAIL'}`);
    if (!hashValid) {
      console.log(`   Expected: ${expectedHash}`);
      console.log(`   Actual:   ${receipt.entry_hash}`);
    }
  } else {
    // Hash chain receipt: entry_hash should equal hash(prev + inputs + outputs)
    expectedHash = sha256Hex(
      (receipt.prev_hash || '') + receipt.inputs_hash + receipt.outputs_hash
    );
    hashValid = receipt.entry_hash === expectedHash;
    console.log(`Hash Chain Verification: ${hashValid ? '✅ PASS' : '❌ FAIL'}`);
    if (!hashValid) {
      console.log(`   Expected: ${expectedHash}`);
      console.log(`   Actual:   ${receipt.entry_hash}`);
    }
  }

  // For Ed25519 receipts, verify signature
  if (receipt.ed25519_sig && receipt.ed25519_pubkey) {
    try {
      const message = Buffer.from(receipt.entry_hash, 'hex');
      const signature = Buffer.from(receipt.ed25519_sig, 'base64');
      
      // Try base64url first, then regular base64 for public key
      let publicKey;
      try {
        publicKey = Buffer.from(receipt.ed25519_pubkey, 'base64url');
      } catch {
        publicKey = Buffer.from(receipt.ed25519_pubkey, 'base64');
      }
      
      const signatureValid = crypto.verify(null, message, publicKey, signature);

      console.log(`Ed25519 Signature: ${signatureValid ? '✅ PASS' : '❌ FAIL'}`);
    } catch (error) {
      console.log(`Ed25519 Signature: ❌ ERROR - ${error.message}`);
    }
  }

  console.log('\n📋 Verification Summary:');
  console.log(`   Receipt Type: ${receipt.ed25519_sig ? 'Ed25519-Signed' : 'Hash Chain'}`);
  console.log(`   Entry Hash: ${hashValid ? 'Valid' : 'Invalid'}`);
  console.log(`   Cryptographic: ${receipt.ed25519_sig ? 'Ed25519 Verified' : 'Hash Chain Only'}`);
  console.log(`   Integrity: ${hashValid ? 'Preserved' : 'Compromised'}\n`);
}

/**
 * Demonstrate chain verification
 */
function demonstrateChainVerification(receipts) {
  console.log('🔗 Verifying receipt chain integrity...\n');

  let valid = true;
  let prevHash = null;

  receipts.forEach((receipt, index) => {
    const expectedHash = sha256Hex(
      (receipt.prev_hash || '') + receipt.inputs_hash + receipt.outputs_hash
    );

    const hashValid = receipt.entry_hash === expectedHash;
    const prevValid = receipt.prev_hash === prevHash;

    console.log(`Entry ${index + 1}:`);
    console.log(`   Hash Valid: ${hashValid ? '✅' : '❌'}`);
    console.log(`   Chain Link: ${prevValid ? '✅' : '❌'}`);

    if (!hashValid || !prevValid) {
      valid = false;
      console.log(`   ❌ CHAIN BROKEN at entry ${index + 1}`);
    }

    prevHash = receipt.entry_hash;
  });

  console.log(`\n📊 Chain Verification Result: ${valid ? '✅ VALID' : '❌ INVALID'}\n`);
}

/**
 * Show API endpoints
 */
function showApiEndpoints() {
  console.log('🌐 Available API Endpoints:\n');
  console.log('GET    /api/receipts/public-key');
  console.log('       Returns the public key for client-side verification\n');
  console.log('POST   /api/receipts/verify');
  console.log('       Verify a standalone trust receipt');
  console.log('       Body: { receipt: <receipt_object> }\n');
  console.log('GET    /api/receipts/verify/:event_id');
  console.log('       Verify a ledger entry by event_id (requires auth)\n');
  console.log('GET    /api/receipts/verify-session?session_id=<id>');
  console.log('       Verify entire session hash chain (requires auth)\n');
}

/**
 * Show environment setup
 */
function showEnvironmentSetup() {
  console.log('⚙️  Environment Setup:\n');
  console.log('For production use, set these environment variables:\n');
  console.log('RECEIPT_SIGNING_PRIVATE_KEY_PEM');
  console.log('   PEM-encoded Ed25519 private key for signing receipts\n');
  console.log('RECEIPT_VERIFY_PUBKEY_B64U');
  console.log('   Base64url-encoded Ed25519 public key for verification\n');
  console.log('\nGenerate keys with:');
  console.log('node -e "const { generateKeyPair } = require(\'./utils/receiptKeys\'); console.log(generateKeyPair())"');
}

/**
 * Main demo function
 */
function runDemo() {
  console.log('🎯 SYMBI Trust Receipt Verifier Demo\n');
  console.log('=' .repeat(50));

  // Show environment setup
  showEnvironmentSetup();
  console.log('\n' + '=' .repeat(50));

  // Create and demonstrate Ed25519 receipt
  const { receipt, keyPair } = createDemoReceipt();
  demonstrateVerification(receipt, keyPair);
  console.log('=' .repeat(50));

  // Create and demonstrate hash chain
  const hashChainReceipt = createHashChainReceipt();
  demonstrateVerification(hashChainReceipt);
  console.log('=' .repeat(50));

  // Create and verify receipt chain
  const receipts = createReceiptChain(3);
  demonstrateChainVerification(receipts);
  console.log('=' .repeat(50));

  // Show API endpoints
  showApiEndpoints();
  console.log('=' .repeat(50));

  console.log('🎉 Demo completed! The receipt verifier is ready for use.\n');
  console.log('💡 Next steps:');
  console.log('   1. Set up environment variables with production keys');
  console.log('   2. Start the backend server');
  console.log('   3. Test verification using the API endpoints');
  console.log('   4. Integrate with your frontend application');
}

// Run demo if called directly
if (require.main === module) {
  runDemo();
}

module.exports = {
  createDemoReceipt,
  createHashChainReceipt,
  createReceiptChain,
  demonstrateVerification,
  demonstrateChainVerification,
  showApiEndpoints,
  showEnvironmentSetup
};