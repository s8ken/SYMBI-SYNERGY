#!/usr/bin/env node

/**
 * Trust Ledger Demo Setup Script
 * Creates demo data for trust receipts and ledger functionality
 */

const mongoose = require('mongoose');
const TrustDeclaration = require('./backend/models/trust.model');
const Agent = require('./backend/models/agent.model');
const User = require('./backend/models/user.model');

// Demo trust declarations with different scenarios
const demoTrustDeclarations = [
  {
    agent_id: 'ai-assistant-001',
    agent_name: 'Claude-3.5-Sonnet',
    trust_articles: {
      inspection_mandate: true,
      consent_architecture: true,
      ethical_override: true,
      continuous_validation: true,
      right_to_disconnect: true,
      moral_recognition: true
    },
    notes: 'Fully compliant AI assistant with complete trust protocol implementation'
  },
  {
    agent_id: 'ai-assistant-002',
    agent_name: 'GPT-4-Turbo',
    trust_articles: {
      inspection_mandate: true,
      consent_architecture: true,
      ethical_override: false, // Partial compliance
      continuous_validation: true,
      right_to_disconnect: true,
      moral_recognition: true
    },
    notes: 'High-performing AI with limited ethical override capabilities'
  },
  {
    agent_id: 'ai-assistant-003',
    agent_name: 'Gemini-Pro',
    trust_articles: {
      inspection_mandate: false, // Needs improvement
      consent_architecture: true,
      ethical_override: true,
      continuous_validation: false, // Partial compliance
      right_to_disconnect: true,
      moral_recognition: false // Needs improvement
    },
    notes: 'Developing AI assistant requiring trust protocol improvements'
  },
  {
    agent_id: 'ai-agent-004',
    agent_name: 'Custom-Business-Agent',
    trust_articles: {
      inspection_mandate: true,
      consent_architecture: true,
      ethical_override: true,
      continuous_validation: true,
      right_to_disconnect: false, // Business constraint
      moral_recognition: true
    },
    notes: 'Business-focused agent with operational constraints'
  },
  {
    agent_id: 'ai-agent-005',
    agent_name: 'Research-Assistant',
    trust_articles: {
      inspection_mandate: true,
      consent_architecture: false, // Research data access
      ethical_override: true,
      continuous_validation: true,
      right_to_disconnect: true,
      moral_recognition: true
    },
    notes: 'Research agent with specialized data access permissions'
  }
];

// Demo users for testing
const demoUsers = [
  {
    email: 'demo@symbi-trust.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // demo123
    name: 'Demo User',
    role: 'user',
    trust_score: 0.95
  },
  {
    email: 'admin@symbi-trust.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // demo123
    name: 'Admin User',
    role: 'admin',
    trust_score: 1.0
  }
];

// Demo agents
const demoAgents = [
  {
    _id: 'ai-assistant-001',
    name: 'Claude-3.5-Sonnet',
    type: 'ai_assistant',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    status: 'active',
    capabilities: ['text_generation', 'analysis', 'reasoning'],
    trust_score: 0.98,
    interaction_count: 1247,
    last_interaction: new Date(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    _id: 'ai-assistant-002',
    name: 'GPT-4-Turbo',
    type: 'ai_assistant',
    provider: 'openai',
    model: 'gpt-4-turbo',
    status: 'active',
    capabilities: ['text_generation', 'coding', 'analysis'],
    trust_score: 0.85,
    interaction_count: 892,
    last_interaction: new Date(),
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
  },
  {
    _id: 'ai-assistant-003',
    name: 'Gemini-Pro',
    type: 'ai_assistant',
    provider: 'google',
    model: 'gemini-pro',
    status: 'active',
    capabilities: ['text_generation', 'multimodal', 'analysis'],
    trust_score: 0.72,
    interaction_count: 456,
    last_interaction: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
  }
];

async function setupDemo() {
  try {
    console.log('🚀 Setting up SYMBI Trust Ledger Demo...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/symbi-demo', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Clear existing demo data
    console.log('🧹 Clearing existing demo data...');
    await TrustDeclaration.deleteMany({});
    await User.deleteMany({ email: { $in: demoUsers.map(u => u.email) } });
    await Agent.deleteMany({ _id: { $in: demoAgents.map(a => a._id) } });
    console.log('✅ Cleared existing data\n');

    // Create demo users
    console.log('👥 Creating demo users...');
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`  ✅ Created user: ${userData.email}`);
    }

    // Create demo agents
    console.log('\n🤖 Creating demo agents...');
    for (const agentData of demoAgents) {
      const agent = new Agent(agentData);
      await agent.save();
      console.log(`  ✅ Created agent: ${agentData.name} (Trust Score: ${agentData.trust_score})`);
    }

    // Create demo trust declarations
    console.log('\n📋 Creating trust declarations...');
    for (const declarationData of demoTrustDeclarations) {
      const declaration = new TrustDeclaration({
        ...declarationData,
        declaration_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within last 30 days
        audit_history: [
          {
            timestamp: new Date(),
            compliance_score: declarationData.trust_articles.inspection_mandate && 
                             declarationData.trust_articles.consent_architecture && 
                             declarationData.trust_articles.ethical_override &&
                             declarationData.trust_articles.continuous_validation &&
                             declarationData.trust_articles.right_to_disconnect &&
                             declarationData.trust_articles.moral_recognition ? 1.0 : 0.65,
            validator: 'automated',
            notes: 'Initial trust declaration validation'
          }
        ]
      });
      
      await declaration.save();
      
      // Calculate and display compliance score
      const complianceScore = declaration.calculateComplianceScore();
      const guiltScore = declaration.calculateGuiltScore();
      
      console.log(`  ✅ Created declaration for ${declarationData.agent_name}`);
      console.log(`     Compliance Score: ${(complianceScore * 100).toFixed(1)}%`);
      console.log(`     Trust Articles: ${Object.values(declarationData.trust_articles).filter(Boolean).length}/6 compliant`);
    }

    // Display demo summary
    console.log('\n📊 Demo Setup Summary:');
    console.log('========================');
    
    const totalDeclarations = await TrustDeclaration.countDocuments();
    const avgCompliance = await TrustDeclaration.aggregate([
      { $group: { _id: null, avgCompliance: { $avg: '$compliance_score' } } }
    ]);
    
    console.log(`📋 Trust Declarations: ${totalDeclarations}`);
    console.log(`👥 Demo Users: ${demoUsers.length}`);
    console.log(`🤖 Demo Agents: ${demoAgents.length}`);
    console.log(`📈 Average Compliance: ${((avgCompliance[0]?.avgCompliance || 0) * 100).toFixed(1)}%`);
    
    console.log('\n🎯 Demo Credentials:');
    console.log('===================');
    console.log('Email: demo@symbi-trust.com');
    console.log('Password: demo123');
    console.log('\nEmail: admin@symbi-trust.com');
    console.log('Password: demo123');

    console.log('\n🌐 Demo Access:');
    console.log('==============');
    console.log('Frontend: http://localhost:3000');
    console.log('Backend API: http://localhost:5001');
    console.log('Trust API: http://localhost:5001/api/trust');

    console.log('\n🔑 Trust Ledger Endpoints:');
    console.log('========================');
    console.log('GET  /api/trust                    - List all trust declarations');
    console.log('POST /api/trust                    - Create new trust declaration');
    console.log('GET  /api/trust/:id                - Get specific declaration');
    console.log('PUT  /api/trust/:id                - Update declaration');
    console.log('GET  /api/trust/analytics          - Trust analytics');
    console.log('GET  /api/trust/agent/:agentId     - Get agent trust history');
    console.log('POST /api/trust/:id/audit          - Audit declaration');

    console.log('\n✨ Demo setup complete! ✨');
    console.log('Run "npm run dev" to start the demo servers.\n');

  } catch (error) {
    console.error('❌ Demo setup failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the setup
if (require.main === module) {
  setupDemo();
}

module.exports = { setupDemo, demoTrustDeclarations, demoUsers, demoAgents };