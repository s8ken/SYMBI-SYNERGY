#!/usr/bin/env node

/**
 * SYMBI Trust Ledger Demo - Standalone Server
 * Demonstrates trust receipts, cryptographic verification, and audit trails
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/build')));

// In-memory demo storage
const TRUST_RECEIPTS = new Map();
const TRUST_DECLARATIONS = new Map();
const AGENTS = new Map();

// Demo data
const demoAgents = [
  {
    id: 'ai-assistant-001',
    name: 'Claude-3.5-Sonnet',
    provider: 'anthropic',
    trustScore: 0.98,
    complianceScore: 1.0,
    interactions: 1247
  },
  {
    id: 'ai-assistant-002',
    name: 'GPT-4-Turbo',
    provider: 'openai',
    trustScore: 0.85,
    complianceScore: 0.83,
    interactions: 892
  },
  {
    id: 'ai-assistant-003',
    name: 'Gemini-Pro',
    provider: 'google',
    trustScore: 0.72,
    complianceScore: 0.67,
    interactions: 456
  }
];

const demoTrustDeclarations = [
  {
    id: 'trust-decl-001',
    agentId: 'ai-assistant-001',
    agentName: 'Claude-3.5-Sonnet',
    declarationDate: new Date().toISOString(),
    trustArticles: {
      inspection_mandate: true,
      consent_architecture: true,
      ethical_override: true,
      continuous_validation: true,
      right_to_disconnect: true,
      moral_recognition: true
    },
    complianceScore: 1.0,
    guiltScore: 0.0,
    notes: 'Fully compliant AI assistant'
  },
  {
    id: 'trust-decl-002',
    agentId: 'ai-assistant-002',
    agentName: 'GPT-4-Turbo',
    declarationDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    trustArticles: {
      inspection_mandate: true,
      consent_architecture: true,
      ethical_override: false, // Violation
      continuous_validation: true,
      right_to_disconnect: true,
      moral_recognition: true
    },
    complianceScore: 0.83,
    guiltScore: 0.17,
    notes: 'Limited ethical override capabilities'
  },
  {
    id: 'trust-decl-003',
    agentId: 'ai-assistant-003',
    agentName: 'Gemini-Pro',
    declarationDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    trustArticles: {
      inspection_mandate: false, // Violation
      consent_architecture: true,
      ethical_override: true,
      continuous_validation: false, // Violation
      right_to_disconnect: true,
      moral_recognition: false // Violation
    },
    complianceScore: 0.5,
    guiltScore: 0.5,
    notes: 'Multiple compliance issues requiring attention'
  }
];

// Initialize demo data
demoAgents.forEach(agent => AGENTS.set(agent.id, agent));
demoTrustDeclarations.forEach(decl => TRUST_DECLARATIONS.set(decl.id, decl));

// Utility functions
function generateTrustReceipt(data) {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  const contentHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  const previousHash = TRUST_RECEIPTS.size > 0 ? 
    Array.from(TRUST_RECEIPTS.values()).pop().contentHash : 
    '0000000000000000000000000000000000000000000000000000000000000000';
  
  const receiptData = {
    eventId,
    timestamp,
    contentHash,
    previousHash,
    data
  };
  
  // Create signature (simplified for demo)
  const signature = crypto.createHash('sha256').update(JSON.stringify(receiptData)).digest('hex');
  
  const receipt = {
    ...receiptData,
    signature,
    verificationUrl: `/api/trust/verify/${eventId}`
  };
  
  TRUST_RECEIPTS.set(eventId, receipt);
  return receipt;
}

function verifyTrustReceipt(eventId) {
  const receipt = TRUST_RECEIPTS.get(eventId);
  if (!receipt) {
    return { valid: false, error: 'Receipt not found' };
  }
  
  // Verify hash chain
  const expectedHash = crypto.createHash('sha256').update(JSON.stringify({
    eventId: receipt.eventId,
    timestamp: receipt.timestamp,
    contentHash: receipt.contentHash,
    previousHash: receipt.previousHash,
    data: receipt.data
  })).digest('hex');
  
  const isValid = receipt.signature === expectedHash;
  
  return {
    isValid,
    receipt,
    verificationDetails: {
      contentIntegrity: isValid ? 'VERIFIED' : 'FAILED',
      signatureValid: isValid,
      chainIntegrity: 'VERIFIED', // Simplified for demo
      trustScore: 0.95,
      compliance: {
        biasDetected: false,
        fairnessScore: 0.92,
        policyViolations: [],
        regulatoryFlags: []
      },
      auditTrail: {
        created: receipt.timestamp,
        verified: new Date().toISOString(),
        eventId: receipt.eventId
      }
    }
  };
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'SYMBI Trust Ledger Demo',
    timestamp: new Date().toISOString(),
    receipts: TRUST_RECEIPTS.size,
    declarations: TRUST_DECLARATIONS.size
  });
});

// Authentication (simplified for demo)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'demo@symbi-trust.com' && password === 'demo123') {
    res.json({
      success: true,
      data: {
        token: 'demo_jwt_token_' + Date.now(),
        user: {
          id: 'user-001',
          email: 'demo@symbi-trust.com',
          name: 'Demo User',
          role: 'user'
        }
      }
    });
  } else if (email === 'admin@symbi-trust.com' && password === 'demo123') {
    res.json({
      success: true,
      data: {
        token: 'admin_jwt_token_' + Date.now(),
        user: {
          id: 'user-002',
          email: 'admin@symbi-trust.com',
          name: 'Admin User',
          role: 'admin'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Trust Ledger Routes
app.get('/api/trust', (req, res) => {
  const declarations = Array.from(TRUST_DECLARATIONS.values());
  res.json({
    success: true,
    data: declarations,
    pagination: {
      current_page: 1,
      total_pages: 1,
      total_items: declarations.length,
      items_per_page: 10
    }
  });
});

app.get('/api/trust/analytics', (req, res) => {
  const declarations = Array.from(TRUST_DECLARATIONS.values());
  const receipts = Array.from(TRUST_RECEIPTS.values());
  
  const avgCompliance = declarations.reduce((sum, d) => sum + d.complianceScore, 0) / declarations.length;
  const avgGuilt = declarations.reduce((sum, d) => sum + d.guiltScore, 0) / declarations.length;
  
  res.json({
    success: true,
    data: {
      overview: {
        total_declarations: declarations.length,
        total_receipts: receipts.length,
        timeframe: '30d'
      },
      score_statistics: {
        avg_compliance: avgCompliance,
        avg_guilt: avgGuilt,
        max_compliance: Math.max(...declarations.map(d => d.complianceScore)),
        min_compliance: Math.min(...declarations.map(d => d.complianceScore))
      },
      compliance_distribution: [
        { range: '0.8-1.0', count: 1, avg_guilt: 0.0 },
        { range: '0.6-0.8', count: 1, avg_guilt: 0.17 },
        { range: '0.4-0.6', count: 1, avg_guilt: 0.5 }
      ]
    }
  });
});

app.get('/api/trust/:id', (req, res) => {
  const declaration = TRUST_DECLARATIONS.get(req.params.id);
  if (!declaration) {
    return res.status(404).json({
      success: false,
      error: 'Trust declaration not found'
    });
  }
  
  res.json({
    success: true,
    data: declaration
  });
});

app.post('/api/trust', (req, res) => {
  const { agentId, agentName, trustArticles, notes } = req.body;
  
  const complianceScore = Object.values(trustArticles).filter(Boolean).length / 6;
  const guiltScore = 1 - complianceScore;
  
  const declaration = {
    id: 'trust-decl-' + Date.now(),
    agentId,
    agentName,
    declarationDate: new Date().toISOString(),
    trustArticles,
    complianceScore,
    guiltScore,
    notes: notes || '',
    audit_history: [{
      timestamp: new Date().toISOString(),
      compliance_score: complianceScore,
      guilt_score: guiltScore,
      validator: 'automated',
      notes: 'Initial trust declaration validation'
    }]
  };
  
  TRUST_DECLARATIONS.set(declaration.id, declaration);
  
  // Generate trust receipt
  const receipt = generateTrustReceipt({
    type: 'trust_declaration_created',
    declarationId: declaration.id,
    agentId,
    complianceScore,
    guiltScore
  });
  
  res.status(201).json({
    success: true,
    message: 'Trust declaration created successfully',
    data: declaration,
    trustReceipt: receipt,
    scoring_details: {
      compliance_score: complianceScore,
      guilt_score: guiltScore,
      breakdown: {
        total_articles: 6,
        compliant_articles: Object.values(trustArticles).filter(Boolean).length,
        violations: Object.entries(trustArticles).filter(([key, value]) => !value).map(([key]) => key)
      }
    }
  });
});

// LLM Generate with Trust Receipt
app.post('/api/llm/generate', (req, res) => {
  const { prompt, provider, model, includeReceipt = true } = req.body;
  
  // Simulate AI response
  const mockResponse = `Based on your request about "${prompt.substring(0, 50)}...", here's a comprehensive analysis...`;
  
  const responseData = {
    response: mockResponse,
    metadata: {
      model: model || 'claude-3-5-sonnet',
      provider: provider || 'anthropic',
      tokens: Math.floor(Math.random() * 500) + 100,
      cost: (Math.random() * 0.01).toFixed(4),
      responseTime: Math.floor(Math.random() * 2000) + 500
    }
  };
  
  if (includeReceipt) {
    const receipt = generateTrustReceipt({
      type: 'llm_generation',
      prompt: prompt.substring(0, 100) + '...',
      response: mockResponse.substring(0, 100) + '...',
      provider: provider || 'anthropic',
      model: model || 'claude-3-5-sonnet',
      metadata: responseData.metadata
    });
    
    responseData.trustReceipt = receipt;
  }
  
  res.json({
    success: true,
    data: responseData
  });
});

// Trust Receipt Verification
app.get('/api/trust/verify/:eventId', (req, res) => {
  const verification = verifyTrustReceipt(req.params.eventId);
  
  if (!verification.valid) {
    return res.status(404).json({
      success: false,
      error: verification.error
    });
  }
  
  res.json({
    success: true,
    verification: verification.verificationDetails
  });
});

// Agent information
app.get('/api/agents', (req, res) => {
  const agents = Array.from(AGENTS.values());
  res.json({
    success: true,
    data: agents
  });
});

app.get('/api/trust/agent/:agentId', (req, res) => {
  const agentDeclarations = Array.from(TRUST_DECLARATIONS.values())
    .filter(d => d.agentId === req.params.agentId);
  
  const agent = AGENTS.get(req.params.agentId);
  
  if (agentDeclarations.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'No trust declarations found for this agent'
    });
  }
  
  const avgCompliance = agentDeclarations.reduce((sum, d) => sum + d.complianceScore, 0) / agentDeclarations.length;
  const avgGuilt = agentDeclarations.reduce((sum, d) => sum + d.guiltScore, 0) / agentDeclarations.length;
  
  const metrics = {
    total_declarations: agentDeclarations.length,
    average_compliance: avgCompliance,
    average_guilt: avgGuilt,
    trust_trend: 'stable',
    last_declaration_date: agentDeclarations[0].declarationDate,
    agent_info: agent
  };
  
  res.json({
    success: true,
    data: agentDeclarations,
    agent_metrics: metrics
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 SYMBI Trust Ledger Demo Server Started!');
  console.log('==========================================');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
  console.log(`🔐 Trust Ledger: http://localhost:${PORT}/api/trust`);
  console.log('\n🎯 Demo Credentials:');
  console.log('===================');
  console.log('Email: demo@symbi-trust.com');
  console.log('Password: demo123');
  console.log('\n📋 Available Endpoints:');
  console.log('====================');
  console.log('GET  /api/health              - Health check');
  console.log('POST /api/auth/login           - Authentication');
  console.log('GET  /api/trust                - List trust declarations');
  console.log('POST /api/trust                - Create trust declaration');
  console.log('GET  /api/trust/analytics      - Trust analytics');
  console.log('GET  /api/trust/:id            - Get declaration');
  console.log('GET  /api/trust/verify/:eventId - Verify receipt');
  console.log('POST /api/llm/generate         - Generate with receipt');
  console.log('GET  /api/agents               - List agents');
  console.log('\n🧪 Test Commands:');
  console.log('================');
  console.log(`curl http://localhost:${PORT}/api/health`);
  console.log(`curl http://localhost:${PORT}/api/trust/analytics`);
  console.log(`curl -X POST http://localhost:${PORT}/api/auth/login -H "Content-Type: application/json" -d '{"email":"demo@symbi-trust.com","password":"demo123"}'`);
  console.log('\n✨ Trust Ledger Demo is ready! ✨\n');
});

module.exports = app;