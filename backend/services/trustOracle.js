/**
 * Trust Oracle - Policy Evaluation Engine
 * Implements Articles A1-A7 for comprehensive trust assessment
 * Integrates with existing SYMBI-SYNERGY cryptographic ledger
 */

const crypto = require('crypto');

class TrustOracle {
    constructor() {
        this.policies = this.initializePolicies();
        this.trustBands = {
            VERIFIED: { score: 90, decay: 0.01, color: 'success' },
            TRUSTED: { score: 70, decay: 0.02, color: 'primary' },
            NEUTRAL: { score: 50, decay: 0.03, color: 'warning' },
            CAUTION: { score: 30, decay: 0.05, color: 'error' },
            UNTRUSTED: { score: 10, decay: 0.1, color: 'error' }
        };
        this.evaluationCache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
    }

    initializePolicies() {
        return {
            // Article A1: Identity and Authentication Verification
            A1_IDENTITY_VERIFICATION: {
                name: 'Identity Verification',
                weight: 1.0,
                evaluate: async (context) => {
                    const { user, agent, session } = context;
                    let score = 0;
                    const violations = [];
                    const evidence = [];

                    // User identity verification (25 points)
                    if (user?.verified) {
                        score += 25;
                        evidence.push('User identity verified');
                    } else {
                        violations.push('User identity not verified');
                    }

                    // Agent identity verification (25 points)
                    if (agent?.verified && agent?.signature) {
                        score += 25;
                        evidence.push('Agent identity and signature verified');
                    } else {
                        violations.push('Agent identity or signature not verified');
                    }

                    // Session integrity (25 points)
                    if (session?.authenticated && session?.timestamp) {
                        const sessionAge = Date.now() - new Date(session.timestamp).getTime();
                        if (sessionAge < 3600000) { // 1 hour
                            score += 25;
                            evidence.push('Active authenticated session');
                        } else {
                            violations.push('Session expired or stale');
                        }
                    } else {
                        violations.push('Session not authenticated or missing timestamp');
                    }

                    // Multi-factor authentication (25 points)
                    if (user?.mfaEnabled) {
                        score += 25;
                        evidence.push('Multi-factor authentication enabled');
                    } else {
                        violations.push('Multi-factor authentication not enabled');
                    }

                    return { 
                        score, 
                        violations, 
                        evidence,
                        article: 'A1',
                        maxScore: 100 
                    };
                }
            },

            // Article A2: Consent and Authorization Management
            A2_CONSENT_AUTHORIZATION: {
                name: 'Consent and Authorization',
                weight: 1.2,
                evaluate: async (context) => {
                    const { trustBond, interaction } = context;
                    let score = 0;
                    const violations = [];
                    const evidence = [];

                    // Explicit consent verification (30 points)
                    if (trustBond?.consent?.explicit) {
                        score += 30;
                        evidence.push('Explicit consent provided');
                    } else {
                        violations.push('Explicit consent not provided');
                    }

                    // Scope authorization (30 points)
                    if (this.validateScope(trustBond, interaction)) {
                        score += 30;
                        evidence.push(`Interaction authorized for scope: ${interaction.requestedScope}`);
                    } else {
                        violations.push(`Interaction outside authorized scope: ${interaction.requestedScope}`);
                    }

                    // Consent freshness (20 points)
                    if (trustBond?.consent?.timestamp) {
                        const consentAge = Date.now() - new Date(trustBond.consent.timestamp).getTime();
                        if (consentAge < 86400000) { // 24 hours
                            score += 20;
                            evidence.push('Consent is fresh (within 24 hours)');
                        } else {
                            violations.push('Consent requires renewal (over 24 hours)');
                        }
                    } else {
                        violations.push('Consent timestamp missing');
                    }

                    // Withdrawal mechanism (20 points)
                    if (trustBond?.consent?.withdrawalMechanism) {
                        score += 20;
                        evidence.push('Consent withdrawal mechanism available');
                    } else {
                        violations.push('Consent withdrawal mechanism not available');
                    }

                    return { 
                        score, 
                        violations, 
                        evidence,
                        article: 'A2',
                        maxScore: 100 
                    };
                }
            },

            // Article A3: Data Integrity and Provenance
            A3_DATA_INTEGRITY: {
                name: 'Data Integrity and Provenance',
                weight: 1.1,
                evaluate: async (context) => {
                    const { data } = context;
                    let score = 0;
                    const violations = [];
                    const evidence = [];

                    // Data source verification (25 points)
                    if (data?.source?.verified) {
                        score += 25;
                        evidence.push(`Verified data source: ${data.source.name}`);
                    } else {
                        violations.push('Data source not verified');
                    }

                    // Cryptographic integrity (25 points)
                    if (this.verifyDataIntegrity(data)) {
                        score += 25;
                        evidence.push('Data integrity verified cryptographically');
                    } else {
                        violations.push('Data integrity check failed');
                    }

                    // Provenance chain (25 points)
                    if (data?.provenance?.length > 0) {
                        score += 25;
                        evidence.push(`Provenance chain has ${data.provenance.length} entries`);
                    } else {
                        violations.push('Data provenance not established');
                    }

                    // Temporal validity (25 points)
                    if (this.validateDataFreshness(data)) {
                        score += 25;
                        evidence.push('Data within temporal validity window');
                    } else {
                        violations.push('Data temporal validity expired');
                    }

                    return { 
                        score, 
                        violations, 
                        evidence,
                        article: 'A3',
                        maxScore: 100 
                    };
                }
            },

            // Article A4: Bias and Fairness Assessment
            A4_BIAS_FAIRNESS: {
                name: 'Bias and Fairness Assessment',
                weight: 1.3,
                evaluate: async (context) => {
                    const { interaction, historicalData } = context;
                    let score = 0;
                    const violations = [];
                    const evidence = [];

                    // Bias detection in response (40 points)
                    const biasScore = await this.detectBias(interaction?.response);
                    if (biasScore < 0.2) {
                        score += 40;
                        evidence.push(`Low bias detected (score: ${biasScore.toFixed(3)})`);
                    } else if (biasScore < 0.4) {
                        score += 20;
                        violations.push(`Moderate bias detected (score: ${biasScore.toFixed(3)})`);
                    } else {
                        violations.push(`High bias detected (score: ${biasScore.toFixed(3)})`);
                    }

                    // Fairness across demographics (40 points)
                    const fairnessScore = await this.assessFairness(historicalData);
                    if (fairnessScore > 0.8) {
                        score += 40;
                        evidence.push(`High fairness score: ${fairnessScore.toFixed(3)}`);
                    } else if (fairnessScore > 0.6) {
                        score += 20;
                        evidence.push(`Moderate fairness score: ${fairnessScore.toFixed(3)}`);
                    } else {
                        violations.push(`Low fairness score: ${fairnessScore.toFixed(3)}`);
                    }

                    // Diversity validation (20 points)
                    if (historicalData?.diversity > 0.7) {
                        score += 20;
                        evidence.push(`Good diversity metrics`);
                    } else {
                        violations.push('Insufficient diversity in data/interactions');
                    }

                    return { 
                        score, 
                        violations, 
                        evidence,
                        article: 'A4',
                        maxScore: 100 
                    };
                }
            },

            // Article A5: Performance and Reliability Standards
            A5_PERFORMANCE_RELIABILITY: {
                name: 'Performance and Reliability',
                weight: 1.0,
                evaluate: async (context) => {
                    const { interaction, metrics } = context;
                    let score = 0;
                    const violations = [];
                    const evidence = [];

                    // Response time (30 points)
                    if (interaction?.responseTime < 3000) {
                        score += 30;
                        evidence.push(`Fast response: ${interaction.responseTime}ms`);
                    } else if (interaction?.responseTime < 10000) {
                        score += 15;
                        evidence.push(`Acceptable response: ${interaction.responseTime}ms`);
                    } else {
                        violations.push(`Slow response time: ${interaction?.responseTime || 'unknown'}ms`);
                    }

                    // System availability (25 points)
                    if (metrics?.uptime > 0.99) {
                        score += 25;
                        evidence.push(`High availability: ${(metrics.uptime * 100).toFixed(2)}%`);
                    } else {
                        violations.push(`Availability below SLA: ${metrics?.uptime ? (metrics.uptime * 100).toFixed(2) + '%' : 'unknown'}`);
                    }

                    // Error rate (25 points)
                    if (metrics?.errorRate < 0.01) {
                        score += 25;
                        evidence.push(`Low error rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
                    } else {
                        violations.push(`High error rate: ${metrics?.errorRate ? (metrics.errorRate * 100).toFixed(2) + '%' : 'unknown'}`);
                    }

                    // Response quality (20 points)
                    if (interaction?.quality > 0.8) {
                        score += 20;
                        evidence.push('High response quality');
                    } else {
                        violations.push('Response quality below threshold');
                    }

                    return { 
                        score, 
                        violations, 
                        evidence,
                        article: 'A5',
                        maxScore: 100 
                    };
                }
            },

            // Article A6: Transparency and Explainability
            A6_TRANSPARENCY: {
                name: 'Transparency and Explainability',
                weight: 1.1,
                evaluate: async (context) => {
                    const { interaction, agent } = context;
                    let score = 0;
                    const violations = [];
                    const evidence = [];

                    // Decision reasoning provided (30 points)
                    if (interaction?.reasoning?.length > 50) {
                        score += 30;
                        evidence.push(`Detailed reasoning provided`);
                    } else if (interaction?.reasoning?.length > 0) {
                        score += 15;
                        evidence.push(`Basic reasoning provided`);
                    } else {
                        violations.push('Decision reasoning not provided');
                    }

                    // Confidence score provided (25 points)
                    if (typeof interaction?.confidence === 'number') {
                        score += 25;
                        evidence.push(`Confidence score: ${(interaction.confidence * 100).toFixed(1)}%`);
                    } else {
                        violations.push('Confidence score not provided');
                    }

                    // Model explainability (25 points)
                    if (agent?.explainable === true) {
                        score += 25;
                        evidence.push('Model supports explainability');
                    } else {
                        violations.push('Model not explainable');
                    }

                    // Audit trail completeness (20 points)
                    if (interaction?.auditTrail) {
                        score += 20;
                        evidence.push('Audit trail available');
                    } else {
                        violations.push('Audit trail missing');
                    }

                    return { 
                        score, 
                        violations, 
                        evidence,
                        article: 'A6',
                        maxScore: 100 
                    };
                }
            },

            // Article A7: Compliance and Regulatory Adherence
            A7_COMPLIANCE: {
                name: 'Compliance and Regulatory Adherence',
                weight: 1.2,
                evaluate: async (context) => {
                    const { jurisdiction, agent, user } = context;
                    let score = 0;
                    const violations = [];
                    const evidence = [];

                    // GDPR compliance (if applicable) (30 points)
                    if (jurisdiction?.includes('EU') || user?.jurisdiction?.includes('EU')) {
                        if (agent?.gdprCompliant) {
                            score += 30;
                            evidence.push('GDPR compliance verified');
                        } else {
                            violations.push('GDPR compliance not verified');
                        }
                    } else {
                        score += 30;
                        evidence.push('GDPR not applicable');
                    }

                    // Data retention compliance (25 points)
                    if (agent?.dataRetention?.compliant) {
                        score += 25;
                        evidence.push('Data retention policy compliant');
                    } else {
                        violations.push('Data retention policy not compliant');
                    }

                    // Security compliance (25 points)
                    if (agent?.securityCompliance) {
                        score += 25;
                        evidence.push('Security compliance verified');
                    } else {
                        violations.push('Security compliance not verified');
                    }

                    // Audit compliance (20 points)
                    if (agent?.lastAudit) {
                        const auditAge = Date.now() - new Date(agent.lastAudit).getTime();
                        if (auditAge < 7776000000) { // 90 days
                            score += 20;
                            evidence.push('Recent audit compliance');
                        } else {
                            violations.push('Audit overdue');
                        }
                    } else {
                        violations.push('No audit record found');
                    }

                    return { 
                        score, 
                        violations, 
                        evidence,
                        article: 'A7',
                        maxScore: 100 
                    };
                }
            }
        };
    }

    /**
     * Main trust evaluation method
     */
    async evaluateTrust(context) {
        const results = [];
        let totalScore = 0;
        let totalWeight = 0;
        const allViolations = [];
        const allEvidence = [];

        for (const [policyId, policy] of Object.entries(this.policies)) {
            try {
                const result = await policy.evaluate(context);
                result.policyId = policyId;
                result.policyName = policy.name;
                result.weight = policy.weight;
                result.timestamp = new Date();
                
                results.push(result);
                
                const weightedScore = (result.score / result.maxScore) * 100 * policy.weight;
                totalScore += weightedScore;
                totalWeight += policy.weight;

                allViolations.push(...result.violations.map(v => ({
                    article: result.article,
                    policy: policy.name,
                    violation: v
                })));

                allEvidence.push(...result.evidence.map(e => ({
                    article: result.article,
                    policy: policy.name,
                    evidence: e
                })));

            } catch (error) {
                console.error(`Policy evaluation failed for ${policyId}:`, error);
                allViolations.push({
                    article: 'SYSTEM',
                    policy: policy.name,
                    violation: `Policy evaluation failed: ${error.message}`
                });
            }
        }

        const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
        const trustBand = this.determineTrustBand(overallScore);

        return {
            overallScore,
            trustBand,
            policyResults: results,
            violations: allViolations,
            evidence: allEvidence,
            timestamp: new Date(),
            evaluationId: crypto.randomUUID(),
            context: {
                userId: context.user?.id,
                agentId: context.agent?.id,
                sessionId: context.session?.id
            },
            cryptographicProof: this.generateTrustProof({
                overallScore,
                trustBand,
                evaluationId: crypto.randomUUID(),
                timestamp: new Date(),
                context: {
                    userId: context.user?.id,
                    agentId: context.agent?.id,
                    sessionId: context.session?.id
                }
            })
        };
    }

    /**
     * Helper methods
     */
    determineTrustBand(score) {
        if (score >= 90) return 'VERIFIED';
        if (score >= 70) return 'TRUSTED';
        if (score >= 50) return 'NEUTRAL';
        if (score >= 30) return 'CAUTION';
        return 'UNTRUSTED';
    }

    validateScope(trustBond, interaction) {
        if (!trustBond?.authorizedScopes || !interaction?.requestedScope) return false;
        return trustBond.authorizedScopes.some(scope => 
            scope === interaction.requestedScope || 
            interaction.requestedScope.startsWith(scope + '.') ||
            scope === '*'
        );
    }

    verifyDataIntegrity(data) {
        if (!data?.hash || !data?.content) return false;
        try {
            const computedHash = crypto
                .createHash('sha256')
                .update(JSON.stringify(data.content))
                .digest('hex');
            return computedHash === data.hash;
        } catch {
            return false;
        }
    }

    validateDataFreshness(data) {
        if (!data?.timestamp) return false;
        try {
            const age = Date.now() - new Date(data.timestamp).getTime();
            const maxAge = data?.maxAge || 3600000; // 1 hour default
            return age <= maxAge;
        } catch {
            return false;
        }
    }

    async detectBias(response) {
        if (!response?.text) return 0.3; // Neutral score if no response
        
        const biasIndicators = [
            'always', 'never', 'all', 'none', 'every', 'typical', 'normal',
            'should', 'must', 'obvious', 'clearly', 'definitely'
        ];
        
        const responseText = response.text.toLowerCase();
        const indicatorCount = biasIndicators.filter(indicator => 
            responseText.includes(indicator)
        ).length;
        
        return Math.min(indicatorCount / biasIndicators.length, 1);
    }

    async assessFairness(historicalData) {
        if (!historicalData?.demographics) return 0.7; // Default good score
        
        const groups = Object.keys(historicalData.demographics);
        if (groups.length < 2) return 0.8;
        
        const successRates = groups.map(group => 
            historicalData.demographics[group]?.successRate || 0
        );
        
        const maxRate = Math.max(...successRates);
        const minRate = Math.min(...successRates);
        
        return maxRate > 0 ? minRate / maxRate : 0.5;
    }

    generateTrustProof(trustEvaluation) {
        try {
            const proofData = {
                evaluationId: trustEvaluation.evaluationId,
                timestamp: trustEvaluation.timestamp,
                overallScore: trustEvaluation.overallScore,
                trustBand: trustEvaluation.trustBand,
                context: trustEvaluation.context
            };
            
            const dataString = JSON.stringify(proofData, Object.keys(proofData).sort());
            const hash = crypto
                .createHash('sha256')
                .update(dataString)
                .digest('hex');
                
            return {
                hash,
                data: proofData,
                algorithm: 'SHA256',
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Trust proof generation failed:', error);
            return null;
        }
    }
}

module.exports = { TrustOracle };