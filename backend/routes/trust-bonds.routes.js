const express = require('express');
const {
  createTrustBond,
  getTrustBonds,
  getTrustBondById,
  updateTrustBond,
  deleteTrustBond,
  getTrustBondsByAgent,
  evaluateTrustBetweenAgents,
  recordInteraction,
  getTrustBondAnalytics
} = require('../controllers/trustBonds.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/security.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route   GET /api/trust/bonds/analytics
 * @desc    Get trust bond analytics and statistics
 * @access  Protected
 */
router.get('/analytics', getTrustBondAnalytics);

/**
 * @route   POST /api/trust/bonds/evaluate
 * @desc    Evaluate trust between two agents
 * @access  Protected
 */
router.post('/evaluate', evaluateTrustBetweenAgents);

/**
 * @route   POST /api/trust/bonds/interaction
 * @desc    Record interaction between agents for trust learning
 * @access  Protected
 */
router.post('/interaction', recordInteraction);

/**
 * @route   GET /api/trust/bonds/agent/:agentId
 * @desc    Get all trust bonds for a specific agent
 * @access  Protected
 */
router.get('/agent/:agentId', getTrustBondsByAgent);

/**
 * @route   GET /api/trust/bonds/:id
 * @desc    Get a single trust bond by ID
 * @access  Protected
 */
router.get('/:id', getTrustBondById);

/**
 * @route   PUT /api/trust/bonds/:id
 * @desc    Update a trust bond
 * @access  Protected (Admin only for sensitive updates)
 */
router.put('/:id', updateTrustBond);

/**
 * @route   DELETE /api/trust/bonds/:id
 * @desc    Delete a trust bond
 * @access  Protected (Admin only)
 */
router.delete('/:id', requireRole('admin'), deleteTrustBond);

/**
 * @route   GET /api/trust/bonds
 * @desc    Get all trust bonds with filtering and pagination
 * @access  Protected
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   agent_id - Filter by agent ID
 * @query   bond_status - Filter by bond status
 * @query   bond_type - Filter by bond type
 * @query   risk_level - Filter by risk level
 * @query   min_trust_score - Minimum trust score filter
 * @query   max_trust_score - Maximum trust score filter
 * @query   sort_by - Sort field (default: createdAt)
 * @query   sort_order - Sort order: asc/desc (default: desc)
 */
router.get('/', getTrustBonds);

/**
 * @route   POST /api/trust/bonds
 * @desc    Create a new trust bond between agents
 * @access  Protected
 * @body    agent_a - First agent ID
 * @body    agent_b - Second agent ID
 * @body    bond_type - Type of bond (optional)
 * @body    initial_metrics - Initial trust metrics (optional)
 * @body    metadata - Additional metadata (optional)
 */
router.post('/', createTrustBond);

module.exports = router;

/**
 * Trust Bonds Routes Documentation
 * 
 * This module defines all routes for the Trust Bonds system, which manages
 * trust relationships between agents in the SYMBI ecosystem.
 * 
 * Route Structure:
 * - All routes require authentication (protect middleware)
 * - Admin-only routes are protected with requireRole('admin')
 * - Routes follow RESTful conventions with additional specialized endpoints
 * 
 * Key Features:
 * - CRUD operations for trust bonds
 * - Real-time trust evaluation between agents
 * - Interaction recording for trust learning
 * - Analytics and reporting capabilities
 * - Agent-specific bond queries
 * 
 * Security Considerations:
 * - All routes require valid authentication
 * - Sensitive operations (delete, some updates) require admin role
 * - Trust evaluations are logged for audit purposes
 * - Rate limiting applied through parent middleware
 * 
 * Trust Bond Lifecycle:
 * 1. Creation: POST /api/trust/bonds
 * 2. Monitoring: GET /api/trust/bonds/:id
 * 3. Evaluation: POST /api/trust/bonds/evaluate
 * 4. Learning: POST /api/trust/bonds/interaction
 * 5. Management: PUT /api/trust/bonds/:id
 * 6. Analytics: GET /api/trust/bonds/analytics
 * 
 * Query Parameters:
 * - Filtering: agent_id, bond_status, bond_type, risk_level
 * - Scoring: min_trust_score, max_trust_score
 * - Pagination: page, limit
 * - Sorting: sort_by, sort_order
 * 
 * Response Format:
 * All responses follow the standard format:
 * {
 *   success: boolean,
 *   message?: string,
 *   data?: any,
 *   error?: string,
 *   pagination?: object (for list endpoints)
 * }
 * 
 * Error Handling:
 * - 400: Bad Request (validation errors, missing fields)
 * - 401: Unauthorized (authentication required)
 * - 403: Forbidden (insufficient permissions)
 * - 404: Not Found (bond or agent not found)
 * - 409: Conflict (bond already exists)
 * - 500: Internal Server Error (system errors)
 * 
 * Integration with Trust Oracle:
 * - Automatic trust evaluation on bond creation/update
 * - Real-time trust scoring and risk assessment
 * - Intervention triggers based on trust thresholds
 * - Continuous learning from interaction patterns
 */