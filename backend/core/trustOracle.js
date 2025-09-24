const TrustBond = require('../models/TrustBond');
const TrustDeclaration = require('../models/trust.model');
const Agent = require('../models/agent.model');

/**
 * Trust Oracle - Core trust evaluation and middleware system
 * Provides real-time trust assessment and intervention capabilities
 */
class TrustOracle {
  constructor(options = {}) {
    this.config = {
      // Trust thresholds
      minTrustThreshold: options.minTrustThreshold || 0.3,
      warningThreshold: options.warningThreshold || 0.5,
      optimalThreshold: options.optimalThreshold || 0.7,
      
      // Intervention settings
      enableAutoSuspension: options.enableAutoSuspension || true,
      enableRealTimeMonitoring: options.enableRealTimeMonitoring || true,
      
      // Scoring weights
      trustWeights: {
        reliability: 0.25,
        transparency: 0.20,
        consistency: 0.20,
        responsiveness: 0.15,
        competence: 0.20,
        ...options.trustWeights
      },
      
      // Risk assessment parameters
      riskFactors: {
        lowInteractionCount: 5,
        staleInteractionDays: 14,
        volatilityThreshold: 0.3,
        ...options.riskFactors
      }
    };
    
    this.metrics = {
      evaluationsPerformed: 0,
      interventionsTriggered: 0,
      bondsMonitored: 0,
      lastEvaluationTime: null
    };
  }

  /**
   * Evaluate trust between two agents
   * @param {string} agentAId - First agent ID
   * @param {string} agentBId - Second agent ID
   * @param {Object} context - Interaction context
   * @returns {Promise<Object>} Trust evaluation result
   */
  async evaluateTrust(agentAId, agentBId, context = {}) {
    try {
      this.metrics.evaluationsPerformed++;
      this.metrics.lastEvaluationTime = new Date();

      // Find or create trust bond
      let bond = await TrustBond.findOne({
        $or: [
          { agent_a: agentAId, agent_b: agentBId },
          { agent_a: agentBId, agent_b: agentAId }
        ]
      }).populate('agent_a agent_b');

      if (!bond) {
        bond = await this.createInitialBond(agentAId, agentBId);
      }

      // Get trust declarations for both agents
      const [declarationA, declarationB] = await Promise.all([
        TrustDeclaration.findOne({ agent_id: agentAId }).sort({ declaration_date: -1 }),
        TrustDeclaration.findOne({ agent_id: agentBId }).sort({ declaration_date: -1 })
      ]);

      // Perform comprehensive trust evaluation
      const evaluation = {
        bondId: bond._id,
        trustScore: bond.overall_trust_score,
        riskLevel: bond.risk_level,
        trustTrend: bond.trust_trend,
        
        // Detailed analysis
        analysis: {
          bondMetrics: bond.trust_metrics,
          interactionHistory: bond.interaction_history.slice(-5),
          complianceScores: {
            agentA: declarationA?.compliance_score || 0,
            agentB: declarationB?.compliance_score || 0
          },
          riskFactors: this.assessRiskFactors(bond, context),
          recommendations: this.generateRecommendations(bond, declarationA, declarationB)
        },
        
        // Oracle decision
        decision: this.makeOracleDecision(bond, declarationA, declarationB, context),
        
        // Metadata
        evaluatedAt: new Date(),
        context: context
      };

      // Update bond if needed
      if (evaluation.decision.updateRequired) {
        await this.updateBondFromEvaluation(bond, evaluation);
      }

      return evaluation;
    } catch (error) {
      console.error('Trust evaluation error:', error);
      throw new Error(`Trust evaluation failed: ${error.message}`);
    }
  }

  /**
   * Create initial trust bond between agents
   */
  async createInitialBond(agentAId, agentBId) {
    const bond = new TrustBond({
      agent_a: agentAId,
      agent_b: agentBId,
      bond_type: 'peer',
      bond_status: 'active',
      oracle_flags: {
        requires_monitoring: true,
        escalation_threshold: this.config.minTrustThreshold,
        auto_suspend: this.config.enableAutoSuspension
      }
    });

    await bond.save();
    this.metrics.bondsMonitored++;
    return bond;
  }

  /**
   * Assess risk factors for a trust bond
   */
  assessRiskFactors(bond, context) {
    const factors = [];
    const daysSinceLastInteraction = (Date.now() - bond.last_interaction) / (1000 * 60 * 60 * 24);

    if (bond.interaction_count < this.config.riskFactors.lowInteractionCount) {
      factors.push({
        type: 'low_interaction_count',
        severity: 'medium',
        description: `Only ${bond.interaction_count} interactions recorded`
      });
    }

    if (daysSinceLastInteraction > this.config.riskFactors.staleInteractionDays) {
      factors.push({
        type: 'stale_interaction',
        severity: 'high',
        description: `${Math.round(daysSinceLastInteraction)} days since last interaction`
      });
    }

    if (bond.trust_trend === 'declining') {
      factors.push({
        type: 'declining_trust',
        severity: 'high',
        description: 'Trust trend is declining'
      });
    }

    if (bond.trust_trend === 'volatile') {
      factors.push({
        type: 'volatile_trust',
        severity: 'medium',
        description: 'Trust pattern is volatile and unpredictable'
      });
    }

    if (bond.overall_trust_score < this.config.minTrustThreshold) {
      factors.push({
        type: 'low_trust_score',
        severity: 'critical',
        description: `Trust score ${bond.overall_trust_score.toFixed(2)} below minimum threshold`
      });
    }

    return factors;
  }

  /**
   * Generate recommendations based on trust evaluation
   */
  generateRecommendations(bond, declarationA, declarationB) {
    const recommendations = [];

    if (bond.overall_trust_score < this.config.warningThreshold) {
      recommendations.push({
        type: 'trust_improvement',
        priority: 'high',
        action: 'Increase interaction frequency and transparency',
        rationale: 'Low trust score requires active improvement measures'
      });
    }

    if (bond.interaction_count < 10) {
      recommendations.push({
        type: 'interaction_building',
        priority: 'medium',
        action: 'Engage in more collaborative activities',
        rationale: 'Limited interaction history affects trust assessment accuracy'
      });
    }

    if (!declarationA || !declarationB) {
      recommendations.push({
        type: 'compliance_check',
        priority: 'high',
        action: 'Ensure both agents have current trust declarations',
        rationale: 'Missing trust declarations prevent proper compliance assessment'
      });
    }

    if (bond.trust_trend === 'declining') {
      recommendations.push({
        type: 'intervention_required',
        priority: 'critical',
        action: 'Immediate review and intervention needed',
        rationale: 'Declining trust trend indicates potential relationship breakdown'
      });
    }

    return recommendations;
  }

  /**
   * Make oracle decision based on evaluation
   */
  makeOracleDecision(bond, declarationA, declarationB, context) {
    const decision = {
      allow: true,
      confidence: bond.overall_trust_score,
      interventions: [],
      updateRequired: false,
      reasoning: []
    };

    // Check trust threshold
    if (bond.overall_trust_score < this.config.minTrustThreshold) {
      decision.allow = false;
      decision.interventions.push('BLOCK_INTERACTION');
      decision.reasoning.push(`Trust score ${bond.overall_trust_score.toFixed(2)} below minimum threshold`);
    }

    // Check compliance scores
    const minCompliance = Math.min(
      declarationA?.compliance_score || 0,
      declarationB?.compliance_score || 0
    );

    if (minCompliance < 0.5) {
      decision.interventions.push('COMPLIANCE_WARNING');
      decision.reasoning.push('Low compliance score detected');
    }

    // Check for suspicious patterns
    if (bond.trust_trend === 'volatile' && bond.overall_trust_score < this.config.warningThreshold) {
      decision.interventions.push('ENHANCED_MONITORING');
      decision.reasoning.push('Volatile trust pattern requires enhanced monitoring');
    }

    // Auto-suspension check
    if (this.config.enableAutoSuspension && bond.overall_trust_score < bond.oracle_flags.escalation_threshold) {
      decision.interventions.push('AUTO_SUSPEND');
      decision.updateRequired = true;
      decision.reasoning.push('Trust score below escalation threshold');
    }

    // Context-specific checks
    if (context.highRiskOperation && bond.overall_trust_score < this.config.optimalThreshold) {
      decision.interventions.push('REQUIRE_APPROVAL');
      decision.reasoning.push('High-risk operation requires higher trust level');
    }

    return decision;
  }

  /**
   * Update bond based on evaluation results
   */
  async updateBondFromEvaluation(bond, evaluation) {
    if (evaluation.decision.interventions.includes('AUTO_SUSPEND')) {
      bond.bond_status = 'suspended';
      bond.audit_log.push({
        action: 'oracle_auto_suspend',
        previous_score: bond.overall_trust_score,
        new_score: bond.overall_trust_score,
        trigger: 'trust_oracle_evaluation',
        notes: evaluation.decision.reasoning.join('; ')
      });
    }

    if (evaluation.decision.interventions.includes('ENHANCED_MONITORING')) {
      bond.oracle_flags.requires_monitoring = true;
      bond.validation_frequency = Math.min(bond.validation_frequency, 6); // Every 6 hours
    }

    await bond.save();
  }

  /**
   * Record interaction outcome for trust learning
   */
  async recordInteraction(agentAId, agentBId, interactionData) {
    try {
      const bond = await TrustBond.findOne({
        $or: [
          { agent_a: agentAId, agent_b: agentBId },
          { agent_a: agentBId, agent_b: agentAId }
        ]
      });

      if (!bond) {
        console.warn(`No trust bond found between agents ${agentAId} and ${agentBId}`);
        return;
      }

      await bond.addInteraction({
        interaction_type: interactionData.type || 'message',
        outcome: interactionData.outcome || 'neutral',
        trust_impact: interactionData.trustImpact || 0,
        context: interactionData.context || '',
        metadata: interactionData.metadata || {}
      });

      // Trigger re-evaluation if significant impact
      if (Math.abs(interactionData.trustImpact || 0) > 0.1) {
        await this.evaluateTrust(agentAId, agentBId, { 
          trigger: 'significant_interaction',
          ...interactionData 
        });
      }
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }

  /**
   * Get oracle metrics and statistics
   */
  getMetrics() {
    return {
      ...this.metrics,
      config: this.config,
      uptime: process.uptime()
    };
  }

  /**
   * Perform periodic trust validation
   */
  async performPeriodicValidation() {
    try {
      const bondsToValidate = await TrustBond.findBondsRequiringValidation();
      
      for (const bond of bondsToValidate) {
        await this.evaluateTrust(
          bond.agent_a.toString(),
          bond.agent_b.toString(),
          { trigger: 'periodic_validation' }
        );
      }

      return {
        validatedBonds: bondsToValidate.length,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Periodic validation error:', error);
      throw error;
    }
  }
}

// Singleton instance
const trustOracle = new TrustOracle();

/**
 * Express middleware factory for trust-based request filtering
 */
function createTrustMiddleware(options = {}) {
  return async (req, res, next) => {
    try {
      // Skip if no user context
      if (!req.user || !req.body) {
        return next();
      }

      // Extract agent information from request
      const sourceAgentId = req.user.id;
      const targetAgentId = req.body.targetAgent || req.body.recipientId;

      // Skip if no target agent
      if (!targetAgentId) {
        return next();
      }

      // Perform trust evaluation
      const evaluation = await trustOracle.evaluateTrust(
        sourceAgentId,
        targetAgentId,
        {
          endpoint: req.path,
          method: req.method,
          highRiskOperation: options.highRisk || false,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        }
      );

      // Apply oracle decision
      if (!evaluation.decision.allow) {
        return res.status(403).json({
          success: false,
          error: 'Trust Oracle Intervention',
          message: 'Interaction blocked due to insufficient trust',
          trustScore: evaluation.trustScore,
          reasoning: evaluation.decision.reasoning,
          recommendations: evaluation.analysis.recommendations
        });
      }

      // Add trust context to request
      req.trustEvaluation = evaluation;

      // Apply interventions
      if (evaluation.decision.interventions.includes('REQUIRE_APPROVAL')) {
        req.requiresApproval = true;
      }

      if (evaluation.decision.interventions.includes('ENHANCED_MONITORING')) {
        req.enhancedMonitoring = true;
      }

      next();
    } catch (error) {
      console.error('Trust middleware error:', error);
      // Fail open in case of errors (configurable)
      if (options.failClosed) {
        return res.status(500).json({
          success: false,
          error: 'Trust evaluation failed',
          message: 'Unable to assess trust level'
        });
      }
      next();
    }
  };
}

/**
 * Middleware for recording interaction outcomes
 */
function createInteractionRecorder() {
  return (req, res, next) => {
    // Capture original res.json to intercept responses
    const originalJson = res.json;
    
    res.json = function(data) {
      // Record interaction outcome based on response
      if (req.trustEvaluation && req.body.targetAgent) {
        const outcome = res.statusCode < 400 ? 'positive' : 'negative';
        const trustImpact = res.statusCode < 400 ? 0.05 : -0.1;
        
        // Async recording (don't block response)
        setImmediate(() => {
          trustOracle.recordInteraction(
            req.user.id,
            req.body.targetAgent,
            {
              type: 'api_interaction',
              outcome: outcome,
              trustImpact: trustImpact,
              context: `${req.method} ${req.path}`,
              metadata: {
                statusCode: res.statusCode,
                endpoint: req.path,
                timestamp: new Date()
              }
            }
          );
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

module.exports = {
  TrustOracle,
  trustOracle,
  createTrustMiddleware,
  createInteractionRecorder
};