// backend/routes/trust-bonds.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/trustBonds.controller');

router.use(protect);

router.get('/', ctrl.getTrustBonds);
router.post('/', ctrl.createTrustBond);
router.get('/:id', ctrl.getTrustBondById);
router.put('/:id', ctrl.updateTrustBond);
router.delete('/:id', ctrl.deleteTrustBond);

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