const prometheus = require('prom-client');

// Create a Registry to register the metrics
const register = new prometheus.Registry();

// Add default metrics (CPU, memory, etc.)
prometheus.collectDefaultMetrics({ register });

/**
 * Trust Bond Metrics
 */

// Counter for trust bond operations
const trustBondOperations = new prometheus.Counter({
  name: 'trust_bond_operations_total',
  help: 'Total number of trust bond operations',
  labelNames: ['operation', 'status', 'bond_type'],
  registers: [register]
});

// Histogram for trust score distribution
const trustScoreDistribution = new prometheus.Histogram({
  name: 'trust_score_distribution',
  help: 'Distribution of trust scores across all bonds',
  buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  labelNames: ['bond_type', 'agent_type'],
  registers: [register]
});

// Gauge for active trust bonds
const activeTrustBonds = new prometheus.Gauge({
  name: 'active_trust_bonds_total',
  help: 'Total number of active trust bonds',
  labelNames: ['bond_type', 'risk_level'],
  registers: [register]
});

// Counter for trust evaluations
const trustEvaluations = new prometheus.Counter({
  name: 'trust_evaluations_total',
  help: 'Total number of trust evaluations performed',
  labelNames: ['evaluation_type', 'result', 'agent_type'],
  registers: [register]
});

// Histogram for trust evaluation duration
const trustEvaluationDuration = new prometheus.Histogram({
  name: 'trust_evaluation_duration_seconds',
  help: 'Duration of trust evaluations in seconds',
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0],
  labelNames: ['evaluation_type'],
  registers: [register]
});

/**
 * Trust Oracle Metrics
 */

// Counter for Oracle interventions
const oracleInterventions = new prometheus.Counter({
  name: 'oracle_interventions_total',
  help: 'Total number of Oracle interventions',
  labelNames: ['intervention_type', 'severity', 'outcome'],
  registers: [register]
});

// Gauge for Oracle confidence levels
const oracleConfidence = new prometheus.Gauge({
  name: 'oracle_confidence_level',
  help: 'Current Oracle confidence level',
  labelNames: ['decision_type'],
  registers: [register]
});

// Counter for blocked requests due to trust
const blockedRequests = new prometheus.Counter({
  name: 'trust_blocked_requests_total',
  help: 'Total number of requests blocked due to trust issues',
  labelNames: ['endpoint', 'reason', 'agent_type'],
  registers: [register]
});

// Histogram for trust middleware processing time
const trustMiddlewareDuration = new prometheus.Histogram({
  name: 'trust_middleware_duration_seconds',
  help: 'Duration of trust middleware processing in seconds',
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0],
  labelNames: ['endpoint', 'result'],
  registers: [register]
});

/**
 * Interaction and Learning Metrics
 */

// Counter for recorded interactions
const recordedInteractions = new prometheus.Counter({
  name: 'trust_interactions_recorded_total',
  help: 'Total number of trust interactions recorded',
  labelNames: ['interaction_type', 'outcome', 'agent_type'],
  registers: [register]
});

// Gauge for trust learning rate
const trustLearningRate = new prometheus.Gauge({
  name: 'trust_learning_rate',
  help: 'Current trust learning rate',
  labelNames: ['learning_type'],
  registers: [register]
});

// Counter for trust model updates
const trustModelUpdates = new prometheus.Counter({
  name: 'trust_model_updates_total',
  help: 'Total number of trust model updates',
  labelNames: ['update_type', 'trigger'],
  registers: [register]
});

/**
 * Risk Assessment Metrics
 */

// Gauge for current risk levels
const currentRiskLevels = new prometheus.Gauge({
  name: 'current_risk_levels',
  help: 'Current risk levels across the system',
  labelNames: ['risk_category', 'agent_type'],
  registers: [register]
});

// Counter for risk alerts
const riskAlerts = new prometheus.Counter({
  name: 'risk_alerts_total',
  help: 'Total number of risk alerts generated',
  labelNames: ['alert_level', 'risk_type', 'resolution'],
  registers: [register]
});

/**
 * System Health Metrics
 */

// Gauge for trust system health
const trustSystemHealth = new prometheus.Gauge({
  name: 'trust_system_health_score',
  help: 'Overall trust system health score (0-1)',
  registers: [register]
});

// Counter for system errors
const trustSystemErrors = new prometheus.Counter({
  name: 'trust_system_errors_total',
  help: 'Total number of trust system errors',
  labelNames: ['error_type', 'component', 'severity'],
  registers: [register]
});

/**
 * Metric Recording Functions
 */

class TrustMetrics {
  // Trust Bond Operations
  static recordBondOperation(operation, status, bondType = 'default') {
    trustBondOperations.inc({ operation, status, bond_type: bondType });
  }

  static recordTrustScore(score, bondType = 'default', agentType = 'default') {
    trustScoreDistribution.observe({ bond_type: bondType, agent_type: agentType }, score);
  }

  static setActiveBonds(count, bondType = 'default', riskLevel = 'medium') {
    activeTrustBonds.set({ bond_type: bondType, risk_level: riskLevel }, count);
  }

  // Trust Evaluations
  static recordEvaluation(evaluationType, result, agentType = 'default') {
    trustEvaluations.inc({ evaluation_type: evaluationType, result, agent_type: agentType });
  }

  static recordEvaluationDuration(duration, evaluationType) {
    trustEvaluationDuration.observe({ evaluation_type: evaluationType }, duration);
  }

  // Oracle Interventions
  static recordIntervention(interventionType, severity, outcome) {
    oracleInterventions.inc({ intervention_type: interventionType, severity, outcome });
  }

  static setOracleConfidence(confidence, decisionType) {
    oracleConfidence.set({ decision_type: decisionType }, confidence);
  }

  static recordBlockedRequest(endpoint, reason, agentType = 'default') {
    blockedRequests.inc({ endpoint, reason, agent_type: agentType });
  }

  static recordMiddlewareDuration(duration, endpoint, result) {
    trustMiddlewareDuration.observe({ endpoint, result }, duration);
  }

  // Interactions and Learning
  static recordInteraction(interactionType, outcome, agentType = 'default') {
    recordedInteractions.inc({ interaction_type: interactionType, outcome, agent_type: agentType });
  }

  static setLearningRate(rate, learningType) {
    trustLearningRate.set({ learning_type: learningType }, rate);
  }

  static recordModelUpdate(updateType, trigger) {
    trustModelUpdates.inc({ update_type: updateType, trigger });
  }

  // Risk Assessment
  static setRiskLevel(level, riskCategory, agentType = 'default') {
    currentRiskLevels.set({ risk_category: riskCategory, agent_type: agentType }, level);
  }

  static recordRiskAlert(alertLevel, riskType, resolution = 'pending') {
    riskAlerts.inc({ alert_level: alertLevel, risk_type: riskType, resolution });
  }

  // System Health
  static setSystemHealth(score) {
    trustSystemHealth.set(score);
  }

  static recordSystemError(errorType, component, severity = 'medium') {
    trustSystemErrors.inc({ error_type: errorType, component, severity });
  }

  // Utility Methods
  static async getMetrics() {
    return register.metrics();
  }

  static getRegister() {
    return register;
  }

  // Batch update method for efficiency
  static batchUpdate(updates) {
    updates.forEach(update => {
      const { method, args } = update;
      if (typeof this[method] === 'function') {
        this[method](...args);
      }
    });
  }

  // Health check method
  static getHealthStatus() {
    const metrics = {
      activeBonds: activeTrustBonds._hashMap.size || 0,
      totalEvaluations: trustEvaluations.hashMap?.size || 0,
      totalInterventions: oracleInterventions.hashMap?.size || 0,
      systemHealth: trustSystemHealth._value || 0,
      lastUpdate: new Date().toISOString()
    };
    return metrics;
  }

  // Reset all metrics (for testing)
  static reset() {
    register.clear();
  }
}

/**
 * Middleware for automatic metric collection
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const endpoint = req.route?.path || req.path;
    const result = res.statusCode < 400 ? 'success' : 'error';
    
    // Record middleware duration if this is a trust-related endpoint
    if (endpoint.includes('trust') || endpoint.includes('bond')) {
      TrustMetrics.recordMiddlewareDuration(duration, endpoint, result);
    }
  });
  
  next();
};

/**
 * Express endpoint for metrics exposure
 */
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    TrustMetrics.recordSystemError('metrics_export', 'instrumentation', 'high');
    res.status(500).end('Error collecting metrics');
  }
};

module.exports = {
  TrustMetrics,
  metricsMiddleware,
  metricsEndpoint,
  register,
  // Export individual metrics for direct access if needed
  metrics: {
    trustBondOperations,
    trustScoreDistribution,
    activeTrustBonds,
    trustEvaluations,
    trustEvaluationDuration,
    oracleInterventions,
    oracleConfidence,
    blockedRequests,
    trustMiddlewareDuration,
    recordedInteractions,
    trustLearningRate,
    trustModelUpdates,
    currentRiskLevels,
    riskAlerts,
    trustSystemHealth,
    trustSystemErrors
  }
};

/**
 * Trust Metrics Instrumentation Documentation
 * 
 * This module provides comprehensive metrics collection and monitoring
 * for the Trust Oracle and Trust Bonds system.
 * 
 * Metric Categories:
 * 
 * 1. Trust Bond Metrics:
 *    - Operations: Create, read, update, delete operations
 *    - Score Distribution: Histogram of trust scores
 *    - Active Bonds: Current number of active trust relationships
 * 
 * 2. Trust Oracle Metrics:
 *    - Interventions: Oracle decisions and actions
 *    - Confidence: Oracle confidence in decisions
 *    - Blocked Requests: Security interventions
 *    - Processing Time: Middleware performance
 * 
 * 3. Learning Metrics:
 *    - Interactions: Recorded agent interactions
 *    - Learning Rate: Model adaptation speed
 *    - Model Updates: Trust model evolution
 * 
 * 4. Risk Assessment:
 *    - Risk Levels: Current system risk state
 *    - Alerts: Risk-based notifications
 * 
 * 5. System Health:
 *    - Health Score: Overall system wellness
 *    - Errors: System error tracking
 * 
 * Usage Examples:
 * 
 * // Record a trust bond creation
 * TrustMetrics.recordBondOperation('create', 'success', 'agent_to_agent');
 * 
 * // Record trust evaluation
 * TrustMetrics.recordEvaluation('real_time', 'approved', 'ai_agent');
 * 
 * // Set system health
 * TrustMetrics.setSystemHealth(0.95);
 * 
 * Integration:
 * - Prometheus-compatible metrics
 * - Express middleware for automatic collection
 * - Health check endpoints
 * - Batch update capabilities
 * 
 * Monitoring:
 * - Grafana dashboards
 * - Alerting rules
 * - Performance tracking
 * - Anomaly detection
 * 
 * Security:
 * - No sensitive data in metrics
 * - Aggregated statistics only
 * - Rate limiting on metrics endpoint
 * - Access control integration
 */