# Backend Trust Receipt Verifier Implementation Guide

## Overview

The backend trust receipt verifier provides comprehensive cryptographic verification of trust receipts and ledger entries. It supports both Ed25519-signed receipts and hash chain verification for complete audit trail integrity.

## Architecture

### Core Components

1. **Receipt Verifier Controller** (`controllers/receiptVerifier.controller.js`)
   - Core verification logic
   - Multiple verification strategies
   - Comprehensive error handling

2. **Key Management** (`utils/receiptKeys.js`)
   - Ed25519 key pair generation
   - Environment variable integration
   - Development key auto-generation

3. **Receipt Service** (`services/receipt.service.js`)
   - Receipt generation
   - Canonical payload creation
   - Batch processing capabilities

4. **API Routes**
   - `routes/receiptVerifier.routes.js` - Verification endpoints
   - `routes/demoReceipt.routes.js` - Demo generation endpoints

## API Endpoints

### Verification Endpoints

#### `GET /api/receipts/public-key`
Retrieve the public key for client-side verification.

**Response:**
- Content-Type: `application/octet-stream`
- Returns: Base64url-encoded Ed25519 public key
- Cache: 24 hours

#### `POST /api/receipts/verify`
Verify a standalone trust receipt.

**Request:**
```json
{
  "receipt": {
    "payload": "canonical JSON string",
    "inputs_hash": "SHA-256 hex",
    "outputs_hash": "SHA-256 hex",
    "prev_hash": "previous entry hash or null",
    "entry_hash": "SHA-256 hex",
    "ed25519_pubkey": "base64url public key",
    "ed25519_sig": "base64url signature",
    "policy_id": "receipt policy version"
  }
}
```

**Response:**
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
      },
      {
        "field": "ed25519_sig",
        "status": "valid",
        "message": "Ed25519 signature verified"
      }
    ],
    "warnings": []
  }
}
```

#### `GET /api/receipts/verify/:event_id`
Verify a specific ledger entry by event_id (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "receipt_type": "ledger",
    "event_id": "uuid",
    "session_id": "uuid",
    "timestamp": "ISO timestamp",
    "checks": [...]
  }
}
```

#### `GET /api/receipts/verify-session?session_id=xxx`
Verify entire session hash chain (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "count": 10,
    "results": [
      {
        "index": 0,
        "event_id": "uuid",
        "hash_valid": true,
        "signature_valid": true,
        "expected_hash": "hex",
        "actual_hash": "hex",
        "prev_hash": null
      }
    ],
    "summary": {
      "total_events": 10,
      "hash_chain_valid": true,
      "signatures_valid": 8,
      "signatures_invalid": 0,
      "signatures_unchecked": 2
    }
  }
}
```

### Demo Generation Endpoints

#### `POST /api/demo-receipts/generate`
Generate a demo trust receipt for testing.

**Request:**
```json
{
  "session_id": "demo-session-123",
  "prompt": "Sample prompt",
  "response": "Sample response",
  "compliance_score": 0.98,
  "policy_id": "demo.receipt.v1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "receipt": {
      "payload": "...",
      "inputs_hash": "...",
      "outputs_hash": "...",
      "entry_hash": "...",
      "ed25519_pubkey": "...",
      "ed25519_sig": "..."
    },
    "meta": {
      "demo": true,
      "generated_at": "2024-01-01T00:00:00.000Z",
      "purpose": "trust_receipt_verification_demo"
    }
  }
}
```

#### `GET /api/demo-receipts/status`
Get demo receipt service status.

**Response:**
```json
{
  "success": true,
  "data": {
    "service": {
      "initialized": true,
      "keys": {
        "hasPrivateKeys": true,
        "hasPublicKey": true,
        "publicKeyAvailable": true,
        "privateKeyAvailable": true
      },
      "canSign": true,
      "canVerify": true,
      "mode": "production"
    },
    "demo_mode": true,
    "endpoints": {
      "generate": "POST /api/demo-receipts/generate",
      "verify": "POST /api/receipts/verify",
      "public_key": "GET /api/receipts/public-key"
    }
  }
}
```

## Verification Types

### 1. Ed25519-Signed Receipts

Full cryptographic verification with Ed25519 elliptic curve signatures.

**Verification Steps:**
1. Validate required fields present
2. Verify JSON payload integrity
3. Recompute entry hash from payload
4. Verify entry hash matches provided hash
5. Verify Ed25519 signature against entry hash

**Required Fields:**
- `payload`: Canonical JSON string
- `entry_hash`: SHA-256 hash of payload
- `ed25519_sig`: Base64url-encoded signature
- `ed25519_pubkey`: Base64url-encoded public key

### 2. Hash Chain Receipts

Lighter verification using only hash chain integrity.

**Verification Steps:**
1. Validate required fields present
2. Recompute entry hash: `SHA256(prev_hash + inputs_hash + outputs_hash)`
3. Verify recomputed hash matches provided hash

**Required Fields:**
- `entry_hash`: Computed hash
- `inputs_hash`: SHA-256 of inputs
- `outputs_hash`: SHA-256 of outputs
- `prev_hash`: Previous entry hash (null for first)

### 3. Ledger Entry Verification

Converts existing ledger entries to receipt format for verification.

**Process:**
1. Retrieve ledger entry by event_id
2. Convert to receipt format
3. Apply appropriate verification based on available data

## Security Features

### Key Management

**Production Keys:**
```bash
RECEIPT_SIGNING_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----\n..."
RECEIPT_VERIFY_PUBKEY_B64U="base64url_encoded_public_key"
```

**Development Keys:**
- Auto-generated on service start
- Displayed in console logs
- Not suitable for production

### Verification Guarantees

1. **Non-repudiation**: Ed25519 signatures prevent denial
2. **Integrity**: SHA-256 hashes detect tampering
3. **Immutability**: Hash chains preserve history
4. **Transparency**: Client-side verification possible

### Rate Limiting

- Inherits global API rate limiting
- Demo mode: 50 requests per 15 minutes
- Production: Configurable via environment

## Integration Guide

### Frontend Integration

```javascript
// Fetch public key
const publicKeyResponse = await fetch('/api/receipts/public-key');
const publicKey = await publicKeyResponse.text();

// Verify receipt
const verifyResponse = await fetch('/api/receipts/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ receipt })
});
const result = await verifyResponse.json();
```

### Demo Integration

```javascript
// Generate demo receipt
const generateResponse = await fetch('/api/demo-receipts/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Demo prompt',
    response: 'Demo response',
    compliance_score: 0.98
  })
});
const { receipt } = await generateResponse.json();
```

## Testing

### Unit Tests
Run comprehensive test suite:
```bash
npm test -- tests/receiptVerifier.test.js
```

### Manual Testing

1. **Verify Demo Receipt:**
   ```bash
   curl -X POST http://localhost:3000/api/demo-receipts/generate \
     -H "Content-Type: application/json" \
     -d '{"prompt": "test", "response": "test"}'
   ```

2. **Verify Receipt:**
   ```bash
   curl -X POST http://localhost:3000/api/receipts/verify \
     -H "Content-Type: application/json" \
     -d '{"receipt": {...}}'
   ```

3. **Get Public Key:**
   ```bash
   curl -X GET http://localhost:3000/api/receipts/public-key
   ```

## Error Handling

### Common Errors

**400 Bad Request:**
- Missing receipt object
- Unrecognized receipt format
- Invalid required fields

**404 Not Found:**
- Event ID not found
- Public key not configured

**500 Internal Server Error:**
- Key generation failure
- Signature verification error
- Database connectivity issues

### Error Response Format
```json
{
  "success": false,
  "error": "Descriptive error message",
  "details": "Additional error context"
}
```

## Performance Considerations

### Caching
- Public key cached for 24 hours
- Verification results not cached (always fresh)

### Scalability
- Stateless verification
- Minimal database queries
- Cryptographic operations optimized

### Monitoring
- Key initialization status
- Verification success/failure rates
- Performance metrics for cryptographic operations

## Deployment Checklist

### Environment Variables
- [ ] `RECEIPT_SIGNING_PRIVATE_KEY_PEM` configured
- [ ] `RECEIPT_VERIFY_PUBKEY_B64U` configured
- [ ] `NODE_ENV` set to `production`

### Security
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active

### Verification
- [ ] Service initializes successfully
- [ ] Demo receipt generation works
- [ ] Verification endpoints functional
- [ ] Public key accessible

## Troubleshooting

### Service Won't Start
- Check environment variables
- Verify key format
- Check Node.js version (>=18)

### Verification Failures
- Verify key compatibility
- Check receipt format
- Validate hash computation

### Performance Issues
- Monitor cryptographic operation timing
- Check for memory leaks
- Verify database query efficiency

## Future Enhancements

1. **Batch Verification**: Verify multiple receipts in single request
2. **Receipt Analytics**: Track verification patterns and statistics
3. **Hardware Security Modules**: Support for HSM-backed keys
4. **Multi-Algorithm Support**: Add support for other signature algorithms
5. **Receipt Revocation**: Support for invalidating compromised receipts

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the test suite for examples
3. Consult the API documentation
4. Check the server logs for detailed error information