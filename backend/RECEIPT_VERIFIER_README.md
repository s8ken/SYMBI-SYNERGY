# SYMBI Trust Receipt Verifier

A comprehensive backend system for generating and verifying cryptographically signed trust receipts for AI interactions. This implementation provides both Ed25519 digital signatures and hash chain verification for immutable audit trails.

## 🎯 Overview

The Trust Receipt Verifier enables:

- **Cryptographic Integrity**: Ed25519 digital signatures ensure non-repudiation
- **Immutable Audit Trails**: Hash chains prevent tampering with historical records  
- **Regulatory Compliance**: Meets EU AI Act Articles 13, 14, and 61 requirements
- **Zero-Trust Verification**: Client-side verification without trusting the server
- **Production Ready**: Enterprise-grade security with proper key management

## 🏗️ Architecture

### Core Components

1. **Receipt Generation Service** (`services/receipt.service.js`)
   - Creates Ed25519-signed trust receipts
   - Manages canonical JSON serialization
   - Handles batch receipt generation

2. **Verification Controller** (`controllers/receiptVerifier.controller.js`)
   - Verifies standalone receipts
   - Validates ledger entries
   - Checks hash chain integrity

3. **Key Management** (`utils/receiptKeys.js`)
   - Secure Ed25519 key pair generation
   - Environment variable configuration
   - Development/production key handling

4. **API Routes** (`routes/receiptVerifier.routes.js`)
   - RESTful verification endpoints
   - Public key distribution
   - Session chain verification

## 🔐 Cryptographic Details

### Ed25519 Signatures

- **Algorithm**: Ed25519 elliptic curve cryptography
- **Hashing**: SHA-256 for content integrity
- **Encoding**: Base64url for URL-safe transmission
- **Key Format**: PEM for private keys, base64url for public keys

### Hash Chains

- **Formula**: `entry_hash = SHA256(prev_hash + inputs_hash + outputs_hash)`
- **Purpose**: Immutable linking of sequential events
- **Verification**: Recomputation and comparison
- **Chaining**: Each entry references the previous entry's hash

### Receipt Structure

```json
{
  "payload": "canonical JSON string",
  "inputs_hash": "SHA-256 of input content",
  "outputs_hash": "SHA-256 of output content", 
  "prev_hash": "previous entry hash or null",
  "entry_hash": "SHA-256 of payload or hash chain",
  "ed25519_pubkey": "base64url public key",
  "ed25519_sig": "base64 signature",
  "policy_id": "policy identifier"
}
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Generate production keys
node -e "const { generateKeyPair } = require('./utils/receiptKeys'); console.log(generateKeyPair())"

# Set environment variables
export RECEIPT_SIGNING_PRIVATE_KEY_PEM="your-pem-private-key"
export RECEIPT_VERIFY_PUBKEY_B64U="your-base64url-public-key"
```

### 2. Start the Backend

```bash
npm install
npm start
```

### 3. Test the Demo

```bash
node demo-receipt-verifier.js
```

## 📡 API Endpoints

### GET /api/receipts/public-key
Returns the public key for client-side verification.

**Response**: Raw base64url-encoded public key
**Headers**: `Content-Type: application/octet-stream`, `Cache-Control: public, max-age=86400`

### POST /api/receipts/verify
Verify a standalone trust receipt.

**Request Body**:
```json
{
  "receipt": {
    "payload": "...",
    "entry_hash": "...",
    "ed25519_sig": "...",
    "ed25519_pubkey": "..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "receipt_type": "ed25519_signed",
    "checks": [
      {
        "field": "entry_hash",
        "status": "valid",
        "message": "Entry hash matches payload"
      }
    ],
    "warnings": []
  }
}
```

### GET /api/receipts/verify/:event_id
Verify a ledger entry by event_id (requires authentication).

### GET /api/receipts/verify-session?session_id=<id>
Verify entire session hash chain (requires authentication).

### POST /api/demo-receipts/generate
Generate a demo trust receipt (for testing).

## 🧪 Testing

### Unit Tests

```bash
npm test -- tests/receiptVerifier.test.js
```

### Manual Testing

```bash
# Run the comprehensive demo
node demo-receipt-verifier.js

# Generate a test receipt
curl -X POST http://localhost:3001/api/demo-receipts/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test prompt", "response": "Test response"}'
```

## 🔒 Security Considerations

### Key Management

- **Production**: Use environment variables with PEM-encoded keys
- **Development**: Auto-generated keys with clear warnings
- **Rotation**: Regular key rotation supported
- **Storage**: Never commit private keys to version control

### Verification Security

- **Client-Side**: All verification can happen in the browser
- **Zero Trust**: No need to trust server responses
- **Integrity**: Hash chains detect any tampering
- **Non-repudiation**: Ed25519 signatures prevent denial

### Rate Limiting

- **Default**: 50 requests per 15 minutes per IP
- **Demo Mode**: Enhanced rate limiting for public access
- **Authentication**: Higher limits for authenticated users

## 📊 Integration Examples

### Frontend Integration

```javascript
// Verify a receipt in the browser
async function verifyReceipt(receipt) {
  const response = await fetch('/api/receipts/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receipt })
  });
  
  const result = await response.json();
  return result.data.valid;
}
```

### Backend Integration

```javascript
const { generateTrustReceipt } = require('./services/receipt.service');

// Generate receipt for AI interaction
const receipt = generateTrustReceipt({
  event_id: 'uuid-here',
  session_id: 'session-uuid',
  prompt: userPrompt,
  response: aiResponse,
  model_vendor: 'openai',
  model_name: 'gpt-4'
});
```

## 🎛️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RECEIPT_SIGNING_PRIVATE_KEY_PEM` | No | PEM-encoded Ed25519 private key |
| `RECEIPT_VERIFY_PUBKEY_B64U` | No | Base64url-encoded Ed25519 public key |
| `NODE_ENV` | No | Environment (development/production) |
| `CORS_ORIGINS` | No | Allowed CORS origins |

### Default Behavior

- **No Keys**: Development mode with auto-generated keys
- **Missing Keys**: Warning logged, receipts generated without signatures
- **Invalid Keys**: Service fails to initialize with clear error

## 🛠️ Advanced Usage

### Batch Receipt Generation

```javascript
const { generateBatchReceipts } = require('./services/receipt.service');

const receipts = generateBatchReceipts(interactions, {
  policy_id: 'batch.v1',
  prev_hash: startingHash
});
```

### Custom Receipt Policies

```javascript
const receipt = generateTrustReceipt(data, {
  policy_id: 'custom.v1',
  prev_hash: customPrevHash
});
```

### Ledger Integration

```javascript
// Convert ledger entry to receipt format
const receipt = ledgerEntryToReceipt(ledgerEntry);
```

## 📈 Monitoring and Analytics

### Service Status

```bash
curl http://localhost:3001/api/demo-receipts/status
```

### Health Check

```bash
curl http://localhost:3001/api/health
```

### Key Information

```javascript
const { getServiceStatus } = require('./services/receipt.service');
console.log(getServiceStatus());
```

## 🔍 Debugging

### Common Issues

1. **Signature Verification Fails**
   - Check public key format (base64url vs base64)
   - Verify message encoding (hex)
   - Ensure consistent hashing

2. **Hash Chain Breaks**
   - Verify `prev_hash` references
   - Check hash computation order
   - Ensure UTF-8 encoding consistency

3. **Key Generation Errors**
   - Use supported Node.js version (>=16)
   - Check crypto module availability
   - Verify environment variable format

### Debug Tools

```bash
# Verify key pair compatibility
node -e "const { generateKeyPair } = require('./utils/receiptKeys'); console.log(generateKeyPair())"

# Test hash computation
node -e "const { sha256Hex } = require('./utils/hash'); console.log(sha256Hex('test'))"

# Run full demo with debugging
DEBUG=receipt:* node demo-receipt-verifier.js
```

## 📚 Related Documentation

- [SYMBI Trust Protocol](../README.md)
- [Security Documentation](./SECURITY.md)
- [API Documentation](./openapi.yaml)
- [Deployment Guide](./DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This software is licensed under the MIT License. See [LICENSE](../LICENSE) for details.

## 🆘 Support

For technical support:
- Create an issue in the repository
- Check the troubleshooting section
- Review the demo output for debugging information

---

**Note**: This is a critical security component. Always test thoroughly in development before deploying to production. Ensure proper key management and rotation procedures are in place.