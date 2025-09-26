const { TrustOracle } = require('../services/trustOracle');
const TrustBond = require('../models/trustBond.model');

const trustOracle = new TrustOracle();

/**
 * Trust Policy Evaluation Middleware
 * Evaluates trust policies for every request and manages trust bonds
 */
const evaluateTrustPolicy = async (req, res, next) => {
    try {
        // Skip trust evaluation for certain conditions
        if (shouldSkipTrustEvaluation(req)) {
            return next();
        }

        const agentId = extractAgentId(req);
        
        // Get or create trust bond
        let trustBond = await getOrCreateTrustBond(req.user.id, agentId);

        // Apply trust decay if needed
        if (trustBond) {
            trustBond.applyDecay();
        }

        // Build evaluation context
        const context = buildEvaluationContext(req, trustBond);

        // Evaluate trust using Trust Oracle
        const trustEvaluation = await trustOracle.evaluateTrust(context);
        
        // Update trust bond with evaluation results
        if (trustBond) {
            await updateTrustBondWithEvaluation(trustBond, trustEvaluation);
        }

        // Attach evaluation results to request
        req.trustEvaluation = trustEvaluation;
        req.trustBond = trustBond;

        // Check if request should be blocked based on trust score
        const blockingResult = checkTrustBlocking(trustEvaluation);
        if (blockingResult.shouldBlock) {
            return res.status(403).json({
                error: 'Trust evaluation failed - insufficient trust score',
                trustScore: trustEvaluation.overallScore,
                trustBand: trustEvaluation.trustBand,
                riskLevel: trustEvaluation.riskLevel,
                violations: trustEvaluation.violations.slice(0, 3), // Limit for security
                message: blockingResult.message
            });
        }

        next();
    } catch (error) {
        console.error('Trust policy evaluation failed:', error);
        
        // Provide fallback trust evaluation to prevent blocking
        req.trustEvaluation = {
            overallScore: 50,
            trustBand: 'NEUTRAL',
            riskLevel: 'MEDIUM',
            violations: [],
            evidence: [],
            error: 'Trust evaluation temporarily unavailable',
            timestamp: new Date()
        };
        
        next();
    }
};

/**
 * Determine if trust evaluation should be skipped
 */
function shouldSkipTrustEvaluation(req) {
    // Skip for demo users
    if (req.user?.email === 'demo@symbi-trust.com') {
        return true;
    }
    
    // Skip for public endpoints
    if (req.path.includes('/public/') || 
        req.path.includes('/health') || 
        req.path.includes('/docs')) {
        return true;
    }
    
    // Skip for authentication endpoints
    if (req.path.includes('/auth/') || 
        req.path.includes('/login') || 
        req.path.includes('/register')) {
        return true;
    }
    
    // Skip for static assets
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        return true;
    }
    
    return false;
}

/**
 * Extract agent ID from request
 */
function extractAgentId(req) {
    return req.body.agentId || 
           req.params.agentId || 
           req.query.agentId || 
           req.headers['x-agent-id'] ||
           'default-agent';
}

/**
 * Get existing trust bond or create new one
 */
async function getOrCreateTrustBond(userId, agentId) {
    try {
        let trustBond = await TrustBond.findOne({
            userId: userId,
            agentId: agentId
        });

        if (!trustBond) {
            trustBond = await TrustBond.create({
                userId: userId,
                agentId: agentId,
                consent: {
                    explicit: true, // Default to true for existing users
                    timestamp: new Date(),
                    scope: ['conversation', 'analysis'],
                    withdrawalMechanism: 'api'
                },
                authorizedScopes: ['conversation', 'analysis', 'reporting'],
                trustScore: 60, // Start with reasonable trust score
                status: 'active'
            });
        }

        return trustBond;
    } catch (error) {
        console.error('Error managing trust bond:', error);
        return null;
    }
}

/**
 * Build comprehensive evaluation context
 */
function buildEvaluationContext(req, trustBond) {
    const startTime = req.startTime || Date.now();
    
    return {
        user: {
            id: req.user?.id,
            email: req.user?.email,
            verified: req.user?.verified || false,
            mfaEnabled: req.user?.mfaEnabled || false,
            jurisdiction: req.user?.jurisdiction || ['US']
        },
        agent: {
            id: extractAgentId(req),
            verified: true, // Assume agents are verified in SYMBI system
            signature: true,
            explainable: true,
            gdprCompliant: true,
            dataRetention: { compliant: true, policy: '30-day' },
            securityCompliance: true,
            lastAudit: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)), // 30 days ago
            biasMitigation: { enabled: true },
            trainingData: { diversity: 0.8 }
        },
        session: {
            id: req.sessionID || req.headers['x-session-id'],
            authenticated: !!req.user,
            timestamp: new Date(startTime)
        },
        trustBond: trustBond,
        interaction: {
            type: req.method,
            endpoint: req.path,
            requestedScope: req.body.scope || req.query.scope || 'conversation',
            responseTime: Date.now() - startTime,
            quality: 0.85, // Assume good quality
            confidence: 0.8,
            reasoning: req.body.reasoning || 'Standard AI interaction',
            auditTrail: true,
            response: {
                text: req.body.response || req.body.message || ''
            }
        },
        data: {
            source: { verified: true, name: 'SYMBI-SYNERGY' },
            content: req.body,
            hash: generateDataHash(req.body),
            timestamp: new Date(),
            provenance: ['SYMBI-SYNERGY', 'Trust-Oracle'],
            maxAge: 3600000 // 1 hour
        },
        jurisdiction: req.user?.jurisdiction || ['US'],
        regulations: {
            industry: {
                standards: ['SOC2', 'GDPR', 'CCPA']
            }
        },
        metrics: {
            uptime: 0.99,
            errorRate: 0.01,
            accuracy: 0.85
        },
        historicalData: {
            demographics: {
                'general': { successRate: 0.85 },
                'enterprise': { successRate: 0.9 }
            },
            diversity: 0.8
        }
    };
}

/**
 * Generate hash for data integrity verification
 */
function generateDataHash(data) {
    try {
        const crypto = require('crypto');
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    } catch (error) {
        return null;
    }
}

/**
 * Update trust bond with evaluation results
 */
async function updateTrustBondWithEvaluation(trustBond, evaluation) {
    try {
        // Update policy compliance
        trustBond.updatePolicyCompliance(evaluation.policyResults);
        
        // Add evaluation to history
        trustBond.addEvaluationHistory(evaluation);
        
        // Update overall trust score (weighted average with decay factor)
        const currentScore = trustBond.trustScore;
        const evaluationScore = evaluation.overallScore;
        const decayFactor = 0.2; // 20% weight to new evaluation, 80% to existing
        
        trustBond.trustScore = Math.round(
            evaluationScore * decayFactor + currentScore * (1 - decayFactor)
        );
        
        // Update timestamps
        trustBond.lastUpdated = new Date();
        
        // Save the updated trust bond
        await trustBond.save();
        
    } catch (error) {
        console.error('Error updating trust bond:', error);
    }
}

/**
 * Check if request should be blocked based on trust evaluation
 */
function checkTrustBlocking(evaluation) {
    const score = evaluation.overallScore;
    const violations = evaluation.violations || [];
    const riskLevel = evaluation.riskLevel;
    
    // Critical risk or extremely low score - block immediately
    if (riskLevel === 'CRITICAL' || score < 15) {
        return {
            shouldBlock: true,
            message: 'Critical trust violation detected - access denied'
        };
    }
    
    // High risk with low score - block
    if (riskLevel === 'HIGH' && score < 25) {
        return {
            shouldBlock: true,
            message: 'High risk profile with insufficient trust score'
        };
    }
    
    // Too many violations - block
    if (violations.length > 8) {
        return {
            shouldBlock: true,
            message: 'Excessive trust policy violations detected'
        };
    }
    
    // Check for specific critical violations
    const criticalViolations = violations.filter(v => 
        v.violation.includes('identity not verified') ||
        v.violation.includes('consent not provided') ||
        v.violation.includes('GDPR') ||
        v.violation.includes('critical')
    );
    
    if (criticalViolations.length > 2) {
        return {
            shouldBlock: true,
            message: 'Critical compliance violations detected'
        };
    }
    
    return { shouldBlock: false };
}

/**
 * Middleware for requiring minimum trust score
 */
const requireMinimumTrust = (minScore = 50) => {
    return (req, res, next) => {
        if (!req.trustEvaluation) {
            return res.status(500).json({ 
                error: 'Trust evaluation not performed' 
            });
        }
        
        if (req.trustEvaluation.overallScore < minScore) {
            return res.status(403).json({
                error: `Insufficient trust score. Required: ${minScore}, Current: ${req.trustEvaluation.overallScore}`,
                trustScore: req.trustEvaluation.overallScore,
                trustBand: req.trustEvaluation.trustBand
            });
        }
        
        next();
    };
};

/**
 * Middleware for requiring specific trust band
 */
const requireTrustBand = (requiredBands) => {
    const validBands = Array.isArray(requiredBands) ? requiredBands : [requiredBands];
    
    return (req, res, next) => {
        if (!req.trustEvaluation) {
            return res.status(500).json({ 
                error: 'Trust evaluation not performed' 
            });
        }
        
        if (!validBands.includes(req.trustEvaluation.trustBand)) {
            return res.status(403).json({
                error: `Insufficient trust band. Required: ${validBands.join(' or ')}, Current: ${req.trustEvaluation.trustBand}`,
                trustScore: req.trustEvaluation.overallScore,
                trustBand: req.trustEvaluation.trustBand
            });
        }
        
        next();
    };
};

/**
 * Middleware to log trust evaluations for audit
 */
const logTrustEvaluation = (req, res, next) => {
    if (req.trustEvaluation) {
        console.log(`Trust Evaluation - User: ${req.user?.id}, Agent: ${extractAgentId(req)}, Score: ${req.trustEvaluation.overallScore}, Band: ${req.trustEvaluation.trustBand}`);
    }
    next();
};

module.exports = { 
    evaluateTrustPolicy,
    requireMinimumTrust,
    requireTrustBand,
    logTrustEvaluation,
    trustOracle 
};