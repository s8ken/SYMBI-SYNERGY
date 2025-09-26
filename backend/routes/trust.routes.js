const express = require('express');
const {
  createTrustDeclaration,
  getTrustDeclarations,
  getTrustDeclarationById,
  updateTrustDeclaration,
  deleteTrustDeclaration,
  getTrustDeclarationsByAgent,
  auditTrustDeclaration,
  getTrustAnalytics
} = require('../controllers/trust.controller');
const { validateTrust, validateTrustUpdate } = require('../middleware/trust.middleware');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/security.middleware');

// NEW: Trust Oracle imports
const { TrustOracle } = require('../services/trustOracle');
const TrustBond = require('../models/trustBond.model');
const { evaluateTrustPolicy, requireMinimumTrust } = require('../middleware/trustPolicy');

const router = express.Router();
const trustOracle = new TrustOracle();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * ================================
 * TRUST ORACLE ENDPOINTS (NEW)
 * ================================
 */

/**
 * @route   GET /api/trust/oracle/bonds/:agentId
 * @desc    Get trust bond for user-agent pair
 * @access  Protected
 */
router.get('/oracle/bonds/:agentId', async (req, res) => {
  try {
    const trustBond = await TrustBond.findOne({
      userId: req.user.id,
      agentId: req.params.agentId
    });
    
    if (!trustBond) {
      return res.status(404).json({ 
        success: false,
        error: 'Trust bond not found',
        message: 'No trust relationship exists between this user and agent'
      });
    }
    
    res.json({
      success: true,
      data: trustBond,
      message: 'Trust bond retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve trust bond',
      message: error.message 
    });
  }
});

/**
 * @route   POST /api/trust/oracle/bonds
 * @desc    Create or update trust bond
 * @access  Protected
 */
router.post('/oracle/bonds', async (req, res) => {
  try {
    const { agentId, consent, authorizedScopes, permissions } = req.body;
    
    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: 'Agent ID is required'
      });
    }
    
    const trustBond = await TrustBond.findOneAndUpdate(
      { userId: req.user.id, agentId },
      {
        consent: {
          explicit: consent?.explicit || true,
          timestamp: new Date(),
          scope: consent?.scope || ['conversation'],
          withdrawalMechanism: 'api'
        },
        authorizedScopes: authorizedScopes || ['conversation', 'analysis'],
        permissions: permissions || [],
        status: 'active'
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      data: trustBond,
      message: 'Trust bond created/updated successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: 'Failed to create trust bond',
      message: error.message 
    });
  }
});

/**
 * @route   POST /api/trust/oracle/evaluate
 * @desc    Evaluate trust for current context
 * @access  Protected
 */
router.post('/oracle/evaluate', evaluateTrustPolicy, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.trustEvaluation,
      trustBond: req.trustBond ? {
        id: req.trustBond._id,
        trustScore: req.trustBond.trustScore,
        currentBand: req.trustBand.currentBand,
        riskLevel: req.trustBond.riskLevel
      } : null,
      message: 'Trust evaluation completed successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Trust evaluation failed',
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/trust/oracle/history/:agentId
 * @desc    Get trust evaluation history
 * @access  Protected
 */
router.get('/oracle/history/:agentId', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const trustBond = await TrustBond.findOne({
      userId: req.user.id,
      agentId: req.params.agentId
    }).select('evaluationHistory decayHistory policyCompliance');
    
    if (!trustBond) {
      return res.status(404).json({
        success: false,
        error: 'Trust bond not found'
      });
    }
    
    const recentEvaluations = trustBond.evaluationHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        evaluationHistory: recentEvaluations,
        decayHistory: trustBond.decayHistory?.slice(-20) || [],
        policyCompliance: trustBond.policyCompliance || {},
        summary: {
          totalEvaluations: trustBond.evaluationHistory?.length || 0,
          averageScore: recentEvaluations.length > 0 
            ? Math.round(recentEvaluations.reduce((sum, e) => sum + e.overallScore, 0) / recentEvaluations.length)
            : 0,
          lastEvaluation: recentEvaluations[0]?.timestamp || null
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve trust history',
      message: error.message 
    });
  }
});

/**
 * @route   DELETE /api/trust/oracle/bonds/:agentId/consent
 * @desc    Withdraw consent and revoke trust bond
 * @access  Protected
 */
router.delete('/oracle/bonds/:agentId/consent', async (req, res) => {
  try {
    const trustBond = await TrustBond.findOneAndUpdate(
      { userId: req.user.id, agentId: req.params.agentId },
      {
        'consent.explicit': false,
        'consent.timestamp': new Date(),
        authorizedScopes: [],
        status: 'revoked'
      },
      { new: true }
    );
    
    if (!trustBond) {
      return res.status(404).json({ 
        success: false,
        error: 'Trust bond not found' 
      });
    }
    
    res.json({ 
      success: true,
      data: trustBond,
      message: 'Consent withdrawn successfully - trust bond revoked' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to withdraw consent',
      message: error.message 
    });
  }
});

/**
 * ================================
 * EXISTING TRUST DECLARATION ENDPOINTS
 * ================================
 */

/**
 * @route   GET /api/trust/analytics
 * @desc    Get trust analytics and statistics
 * @access  Protected
 */
router.get('/analytics', getTrustAnalytics);

/**
 * @route   GET /api/trust/agent/:agentId
 * @desc    Get trust declarations by agent ID
 * @access  Protected
 */
router.get('/agent/:agentId', getTrustDeclarationsByAgent);

/**
 * @route   POST /api/trust/:id/audit
 * @desc    Audit a trust declaration (manual review)
 * @access  Protected (Admin only)
 * @note    In a real application, you might want to add an admin-only middleware here
 */
router.post('/:id/audit', requireRole('admin'), auditTrustDeclaration);

/**
 * @route   GET /api/trust/:id
 * @desc    Get a single trust declaration by ID
 * @access  Protected
 */
router.get('/:id', getTrustDeclarationById);

/**
 * @route   PUT /api/trust/:id
 * @desc    Update a trust declaration
 * @access  Protected
 */
router.put('/:id', requireRole('admin'), validateTrustUpdate, updateTrustDeclaration);

/**
 * @route   DELETE /api/trust/:id
 * @desc    Delete a trust declaration
 * @access  Protected
 */
router.delete('/:id', requireRole('admin'), deleteTrustDeclaration);

/**
 * @route   GET /api/trust
 * @desc    Get all trust declarations with filtering and pagination
 * @access  Protected
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   agent_id - Filter by agent ID
 * @query   min_compliance_score - Minimum compliance score filter
 * @query   max_guilt_score - Maximum guilt score filter
 * @query   sort_by - Sort field (default: declaration_date)
 * @query   sort_order - Sort order: asc/desc (default: desc)
 */
router.get('/', getTrustDeclarations);

/**
 * @route   POST /api/trust
 * @desc    Create a new trust declaration
 * @access  Protected
 * @body    trustDeclaration - Trust declaration object following SYMBI Trust Protocol schema
 */
router.post('/', validateTrust, createTrustDeclaration);

module.exports = router;

/**
 * Trust Routes Documentation
 * 
 * This module defines all routes for the SYMBI Trust Protocol system.
 * 
 * Route Structure:
 * - All routes require authentication (protect middleware)
 * - POST and PUT routes include validation middleware
 * - Routes follow RESTful conventions
 * 
 * Validation:
 * - POST /api/trust uses validateTrust middleware for full schema validation
 * - PUT /api/trust/:id uses validateTrustUpdate middleware for partial validation
 * 
 * Security:
 * - All routes require valid authentication token
 * - Audit routes should be restricted to admin users in production
 * 
 * Error Handling:
 * - Validation errors return 400 status with detailed error information
 * - Authentication errors return 401 status
 * - Not found errors return 404 status
 * - Server errors return 500 status
 * 
 * Response Format:
 * All responses follow the format:
 * {
 *   success: boolean,
 *   message?: string,
 *   data?: any,
 *   error?: string,
 *   details?: any
 * }
 */
