const mongoose = require('mongoose');

const trustMetricsSchema = new mongoose.Schema({
  reliability: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  transparency: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  consistency: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  responsiveness: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  competence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  }
}, { _id: false });

const interactionHistorySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  interaction_type: {
    type: String,
    enum: ['message', 'task_completion', 'collaboration', 'conflict', 'assistance'],
    required: true
  },
  outcome: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    required: true
  },
  trust_impact: {
    type: Number,
    min: -1,
    max: 1,
    default: 0
  },
  context: {
    type: String,
    maxlength: 500
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

const trustBondSchema = new mongoose.Schema({
  // Core relationship identifiers
  agent_a: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
    index: true
  },
  agent_b: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
    index: true
  },
  
  // Bond metadata
  bond_type: {
    type: String,
    enum: ['peer', 'hierarchical', 'collaborative', 'competitive', 'mentor'],
    default: 'peer'
  },
  
  bond_status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'terminated'],
    default: 'pending'
  },
  
  // Trust metrics (A's trust in B)
  trust_metrics: {
    type: trustMetricsSchema,
    required: true,
    default: () => ({})
  },
  
  // Aggregated trust score
  overall_trust_score: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  
  // Risk assessment
  risk_level: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Interaction tracking
  interaction_count: {
    type: Number,
    default: 0,
    min: 0
  },
  
  last_interaction: {
    type: Date,
    default: Date.now
  },
  
  interaction_history: [interactionHistorySchema],
  
  // Trust evolution tracking
  trust_trend: {
    type: String,
    enum: ['improving', 'stable', 'declining', 'volatile'],
    default: 'stable'
  },
  
  // Validation and verification
  last_validated: {
    type: Date,
    default: Date.now
  },
  
  validation_frequency: {
    type: Number,
    default: 24, // hours
    min: 1
  },
  
  // Oracle-specific fields
  oracle_flags: {
    requires_monitoring: {
      type: Boolean,
      default: false
    },
    escalation_threshold: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.3
    },
    auto_suspend: {
      type: Boolean,
      default: false
    }
  },
  
  // Audit trail
  audit_log: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      required: true
    },
    previous_score: Number,
    new_score: Number,
    trigger: String,
    validator: String,
    notes: String
  }],
  
  // Metadata for extensibility
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
trustBondSchema.index({ agent_a: 1, agent_b: 1 }, { unique: true });
trustBondSchema.index({ bond_status: 1, overall_trust_score: -1 });
trustBondSchema.index({ risk_level: 1, last_interaction: -1 });
trustBondSchema.index({ 'oracle_flags.requires_monitoring': 1 });

// Instance method to calculate overall trust score
trustBondSchema.methods.calculateOverallTrustScore = function() {
  const metrics = this.trust_metrics;
  const weights = {
    reliability: 0.25,
    transparency: 0.20,
    consistency: 0.20,
    responsiveness: 0.15,
    competence: 0.20
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.keys(weights).forEach(metric => {
    if (metrics[metric] !== undefined) {
      weightedSum += metrics[metric] * weights[metric];
      totalWeight += weights[metric];
    }
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
};

// Instance method to assess risk level
trustBondSchema.methods.assessRiskLevel = function() {
  const score = this.overall_trust_score;
  const interactionCount = this.interaction_count;
  const daysSinceLastInteraction = (Date.now() - this.last_interaction) / (1000 * 60 * 60 * 24);
  
  if (score < 0.3 || daysSinceLastInteraction > 30) {
    return 'critical';
  } else if (score < 0.5 || daysSinceLastInteraction > 14) {
    return 'high';
  } else if (score < 0.7 || interactionCount < 5) {
    return 'medium';
  } else {
    return 'low';
  }
};

// Instance method to determine trust trend
trustBondSchema.methods.calculateTrustTrend = function() {
  const recentInteractions = this.interaction_history
    .slice(-10)
    .sort((a, b) => b.timestamp - a.timestamp);
  
  if (recentInteractions.length < 3) {
    return 'stable';
  }
  
  const impacts = recentInteractions.map(i => i.trust_impact);
  const avgRecent = impacts.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, impacts.length);
  const avgOlder = impacts.slice(5).reduce((a, b) => a + b, 0) / Math.max(1, impacts.length - 5);
  
  const variance = impacts.reduce((acc, val) => acc + Math.pow(val - avgRecent, 2), 0) / impacts.length;
  
  if (variance > 0.5) {
    return 'volatile';
  } else if (avgRecent > avgOlder + 0.1) {
    return 'improving';
  } else if (avgRecent < avgOlder - 0.1) {
    return 'declining';
  } else {
    return 'stable';
  }
};

// Instance method to add interaction
trustBondSchema.methods.addInteraction = function(interactionData) {
  this.interaction_history.push(interactionData);
  this.interaction_count += 1;
  this.last_interaction = new Date();
  
  // Keep only last 50 interactions for performance
  if (this.interaction_history.length > 50) {
    this.interaction_history = this.interaction_history.slice(-50);
  }
  
  return this.save();
};

// Instance method to update trust metrics
trustBondSchema.methods.updateTrustMetrics = function(newMetrics, trigger = 'manual') {
  const previousScore = this.overall_trust_score;
  
  // Update metrics
  Object.keys(newMetrics).forEach(key => {
    if (this.trust_metrics[key] !== undefined) {
      this.trust_metrics[key] = Math.max(0, Math.min(1, newMetrics[key]));
    }
  });
  
  // Recalculate derived values
  this.overall_trust_score = this.calculateOverallTrustScore();
  this.risk_level = this.assessRiskLevel();
  this.trust_trend = this.calculateTrustTrend();
  this.last_validated = new Date();
  
  // Add audit entry
  this.audit_log.push({
    action: 'trust_metrics_updated',
    previous_score: previousScore,
    new_score: this.overall_trust_score,
    trigger: trigger,
    notes: `Updated metrics: ${Object.keys(newMetrics).join(', ')}`
  });
  
  return this.save();
};

// Pre-save middleware to auto-calculate derived fields
trustBondSchema.pre('save', function(next) {
  if (this.isModified('trust_metrics') || this.isNew) {
    this.overall_trust_score = this.calculateOverallTrustScore();
    this.risk_level = this.assessRiskLevel();
    this.trust_trend = this.calculateTrustTrend();
    this.last_validated = new Date();
  }
  
  // Check for auto-suspension
  if (this.oracle_flags.auto_suspend && this.overall_trust_score < this.oracle_flags.escalation_threshold) {
    if (this.bond_status === 'active') {
      this.bond_status = 'suspended';
      this.audit_log.push({
        action: 'auto_suspended',
        previous_score: this.overall_trust_score,
        new_score: this.overall_trust_score,
        trigger: 'oracle_auto_suspend',
        notes: `Trust score ${this.overall_trust_score} below threshold ${this.oracle_flags.escalation_threshold}`
      });
    }
  }
  
  next();
});

// Static method to find bonds requiring validation
trustBondSchema.statics.findBondsRequiringValidation = function() {
  const cutoffTime = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours ago
  return this.find({
    bond_status: 'active',
    last_validated: { $lt: cutoffTime }
  });
};

// Static method to get trust statistics
trustBondSchema.statics.getTrustStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$bond_status',
        count: { $sum: 1 },
        avgTrustScore: { $avg: '$overall_trust_score' },
        avgInteractions: { $avg: '$interaction_count' }
      }
    }
  ]);
};

module.exports = mongoose.model('TrustBond', trustBondSchema);