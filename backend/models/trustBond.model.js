const mongoose = require('mongoose');

const trustBondSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true 
    },
    agentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Agent', 
        required: true,
        index: true 
    },
    
    // Trust scoring
    trustScore: { 
        type: Number, 
        default: 50, 
        min: 0, 
        max: 100 
    },
    currentBand: { 
        type: String, 
        enum: ['VERIFIED', 'TRUSTED', 'NEUTRAL', 'CAUTION', 'UNTRUSTED'],
        default: 'NEUTRAL',
        index: true
    },
    
    // Consent management
    consent: {
        explicit: { type: Boolean, required: true, default: false },
        timestamp: { type: Date, required: true },
        scope: [String],
        withdrawalMechanism: { type: String, required: true, default: 'api' }
    },
    
    // Authorization scopes and permissions
    authorizedScopes: {
        type: [String],
        default: ['conversation']
    },
    permissions: [{
        action: { type: String, required: true },
        resource: { type: String, required: true },
        conditions: mongoose.Schema.Types.Mixed
    }],
    
    // Trust decay tracking
    lastUpdated: { type: Date, default: Date.now },
    lastDecayCalculation: { type: Date, default: Date.now },
    decayRate: { type: Number, default: 0.02, min: 0, max: 1 },
    decayHistory: [{
        timestamp: Date,
        previousScore: Number,
        newScore: Number,
        decayAmount: Number
    }],
    
    // Policy compliance tracking for A1-A7
    policyCompliance: {
        A1: {
            score: { type: Number, min: 0, max: 100 },
            percentage: { type: Number, min: 0, max: 100 },
            lastEvaluated: Date,
            violations: [String],
            evidence: [String]
        },
        A2: {
            score: { type: Number, min: 0, max: 100 },
            percentage: { type: Number, min: 0, max: 100 },
            lastEvaluated: Date,
            violations: [String],
            evidence: [String]
        },
        A3: {
            score: { type: Number, min: 0, max: 100 },
            percentage: { type: Number, min: 0, max: 100 },
            lastEvaluated: Date,
            violations: [String],
            evidence: [String]
        },
        A4: {
            score: { type: Number, min: 0, max: 100 },
            percentage: { type: Number, min: 0, max: 100 },
            lastEvaluated: Date,
            violations: [String],
            evidence: [String]
        },
        A5: {
            score: { type: Number, min: 0, max: 100 },
            percentage: { type: Number, min: 0, max: 100 },
            lastEvaluated: Date,
            violations: [String],
            evidence: [String]
        },
        A6: {
            score: { type: Number, min: 0, max: 100 },
            percentage: { type: Number, min: 0, max: 100 },
            lastEvaluated: Date,
            violations: [String],
            evidence: [String]
        },
        A7: {
            score: { type: Number, min: 0, max: 100 },
            percentage: { type: Number, min: 0, max: 100 },
            lastEvaluated: Date,
            violations: [String],
            evidence: [String]
        }
    },
    
    // Trust evaluation history
    evaluationHistory: [{
        evaluationId: String,
        timestamp: Date,
        overallScore: Number,
        trustBand: String,
        policyScores: mongoose.Schema.Types.Mixed,
        violationCount: Number,
        evidenceCount: Number
    }],
    
    // Risk assessment
    riskLevel: {
        type: String,
        enum: ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW'
    },
    
    // Metadata
    createdBy: {
        type: String,
        default: 'system'
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'revoked'],
        default: 'active'
    }
}, {
    timestamps: true,
    collection: 'trustbonds'
});

// Compound indexes for efficient queries
trustBondSchema.index({ userId: 1, agentId: 1 }, { unique: true });
trustBondSchema.index({ trustScore: -1, currentBand: 1 });
trustBondSchema.index({ 'consent.timestamp': -1 });
trustBondSchema.index({ lastUpdated: -1 });

// Pre-save middleware to update trust band based on score
trustBondSchema.pre('save', function(next) {
    if (this.isModified('trustScore')) {
        // Update trust band based on score
        if (this.trustScore >= 90) this.currentBand = 'VERIFIED';
        else if (this.trustScore >= 70) this.currentBand = 'TRUSTED';
        else if (this.trustScore >= 50) this.currentBand = 'NEUTRAL';
        else if (this.trustScore >= 30) this.currentBand = 'CAUTION';
        else this.currentBand = 'UNTRUSTED';
        
        // Update risk level based on score and violations
        const totalViolations = Object.values(this.policyCompliance || {})
            .reduce((sum, policy) => sum + (policy?.violations?.length || 0), 0);
            
        if (this.trustScore < 20 || totalViolations > 10) this.riskLevel = 'CRITICAL';
        else if (this.trustScore < 40 || totalViolations > 7) this.riskLevel = 'HIGH';
        else if (this.trustScore < 60 || totalViolations > 4) this.riskLevel = 'MEDIUM';
        else if (this.trustScore < 80 || totalViolations > 1) this.riskLevel = 'LOW';
        else this.riskLevel = 'MINIMAL';
    }
    next();
});

// Instance method to apply trust decay
trustBondSchema.methods.applyDecay = function() {
    const timeSinceLastUpdate = Date.now() - new Date(this.lastDecayCalculation).getTime();
    const decayHours = timeSinceLastUpdate / (1000 * 60 * 60);
    
    if (decayHours > 0) {
        const decayAmount = this.decayRate * decayHours;
        const previousScore = this.trustScore;
        const newScore = Math.max(0, this.trustScore - decayAmount);
        
        // Record decay history
        this.decayHistory.push({
            timestamp: new Date(),
            previousScore: previousScore,
            newScore: newScore,
            decayAmount: decayAmount
        });
        
        // Keep only last 50 decay records
        if (this.decayHistory.length > 50) {
            this.decayHistory = this.decayHistory.slice(-50);
        }
        
        this.trustScore = newScore;
        this.lastDecayCalculation = new Date();
    }
    
    return this;
};

// Instance method to update policy compliance
trustBondSchema.methods.updatePolicyCompliance = function(policyResults) {
    if (!policyResults || !Array.isArray(policyResults)) return this;
    
    policyResults.forEach(result => {
        if (this.policyCompliance[result.article]) {
            this.policyCompliance[result.article] = {
                score: result.score || 0,
                percentage: Math.round((result.score || 0) / (result.maxScore || 100) * 100),
                lastEvaluated: new Date(),
                violations: result.violations || [],
                evidence: result.evidence || []
            };
        }
    });
    
    return this;
};

// Instance method to add evaluation to history
trustBondSchema.methods.addEvaluationHistory = function(evaluation) {
    this.evaluationHistory.push({
        evaluationId: evaluation.evaluationId,
        timestamp: evaluation.timestamp,
        overallScore: evaluation.overallScore,
        trustBand: evaluation.trustBand,
        policyScores: evaluation.policyScores || {},
        violationCount: evaluation.violations?.length || 0,
        evidenceCount: evaluation.evidence?.length || 0
    });
    
    // Keep only last 100 evaluations
    if (this.evaluationHistory.length > 100) {
        this.evaluationHistory = this.evaluationHistory.slice(-100);
    }
    
    return this;
};

// Static method to find bonds needing decay calculation
trustBondSchema.statics.findBondsNeedingDecay = function(hours = 1) {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    return this.find({
        lastDecayCalculation: { $lt: cutoffTime },
        status: 'active'
    });
};

// Static method to get trust statistics
trustBondSchema.statics.getTrustStatistics = function() {
    return this.aggregate([
        { $match: { status: 'active' } },
        {
            $group: {
                _id: '$currentBand',
                count: { $sum: 1 },
                avgScore: { $avg: '$trustScore' },
                minScore: { $min: '$trustScore' },
                maxScore: { $max: '$trustScore' }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

// Virtual for trust band color (for UI)
trustBondSchema.virtual('trustBandColor').get(function() {
    const colors = {
        'VERIFIED': 'success',
        'TRUSTED': 'primary', 
        'NEUTRAL': 'warning',
        'CAUTION': 'error',
        'UNTRUSTED': 'error'
    };
    return colors[this.currentBand] || 'default';
});

// Virtual for consent status
trustBondSchema.virtual('consentStatus').get(function() {
    if (!this.consent.explicit) return 'not_provided';
    
    const consentAge = Date.now() - new Date(this.consent.timestamp).getTime();
    if (consentAge > 2592000000) return 'expired'; // 30 days
    if (consentAge > 86400000) return 'aging'; // 24 hours
    return 'valid';
});

// Ensure virtual fields are included in JSON output
trustBondSchema.set('toJSON', { virtuals: true });
trustBondSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TrustBond', trustBondSchema);