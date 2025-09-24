const asyncHandler = require('express-async-handler');
const TrustBond = require('../models/TrustBond');
const Agent = require('../models/agent.model');
const { trustOracle } = require('../core/trustOracle');

/**
 * @desc    Create a new trust bond between agents
 * @route   POST /api/trust/bonds
 * @access  Protected
 */
const createTrustBond = asyncHandler(async (req, res) => {
  try {
    const { agent_a, agent_b, bond_type, initial_metrics, metadata } = req.body;

    // Validate agents exist
    const [agentA, agentB] = await Promise.all([
      Agent.findById(agent_a),
      Agent.findById(agent_b)
    ]);

    if (!agentA || !agentB) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        message: 'One or both agents do not exist'
      });
    }

    // Check if bond already exists
    const existingBond = await TrustBond.findOne({
      $or: [
        { agent_a: agent_a, agent_b: agent_b },
        { agent_a: agent_b, agent_b: agent_a }
      ]
    });

    if (existingBond) {
      return res.status(409).json({
        success: false,
        error: 'Bond already exists',
        message: 'Trust bond between these agents already exists',
        data: existingBond
      });
    }

    // Create new trust bond
    const trustBond = new TrustBond({
      agent_a,
      agent_b,
      bond_type: bond_type || 'peer',
      trust_metrics: initial_metrics || {},
      metadata: metadata || {},
      oracle_flags: {
        requires_monitoring: true,
        escalation_threshold: 0.3,
        auto_suspend: true
      }
    });

    const savedBond = await trustBond.save();
    await savedBond.populate('agent_a agent_b');

    // Perform initial trust evaluation
    const evaluation = await trustOracle.evaluateTrust(
      agent_a,
      agent_b,
      { trigger: 'bond_creation', userId: req.user?.id }
    );

    res.status(201).json({
      success: true,
      message: 'Trust bond created successfully',
      data: savedBond,
      initial_evaluation: evaluation
    });
  } catch (error) {
    console.error('Create trust bond error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * @desc    Get all trust bonds with filtering and pagination
 * @route   GET /api/trust/bonds
 * @access  Protected
 */
const getTrustBonds = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      agent_id,
      bond_status,
      bond_type,
      risk_level,
      min_trust_score,
      max_trust_score,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (agent_id) {
      filter.$or = [
        { agent_a: agent_id },
        { agent_b: agent_id }
      ];
    }
    
    if (bond_status) {
      filter.bond_status = bond_status;
    }
    
    if (bond_type) {
      filter.bond_type = bond_type;
    }
    
    if (risk_level) {
      filter.risk_level = risk_level;
    }
    
    if (min_trust_score || max_trust_score) {
      filter.overall_trust_score = {};
      if (min_trust_score) filter.overall_trust_score.$gte = parseFloat(min_trust_score);
      if (max_trust_score) filter.overall_trust_score.$lte = parseFloat(max_trust_score);
    }

    // Build sort object
    const sortOrder = sort_order === 'asc' ? 1 : -1;
    const sort = { [sort_by]: sortOrder };

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [bonds, total] = await Promise.all([
      TrustBond.find(filter)
        .populate('agent_a', 'name type')
        .populate('agent_b', 'name type')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      TrustBond.countDocuments(filter)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: bonds,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage
      },
      filters_applied: filter
    });
  } catch (error) {
    console.error('Get trust bonds error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * @desc    Get a single trust bond by ID
 * @route   GET /api/trust/bonds/:id
 * @access  Protected
 */
const getTrustBondById = asyncHandler(async (req, res) => {
  try {
    const bond = await TrustBond.findById(req.params.id)
      .populate('agent_a', 'name type metadata')
      .populate('agent_b', 'name type metadata');

    if (!bond) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Trust bond not found'
      });
    }

    // Get recent trust evaluation
    const evaluation = await trustOracle.evaluateTrust(
      bond.agent_a._id.toString(),
      bond.agent_b._id.toString(),
      { trigger: 'bond_query', userId: req.user?.id }
    );

    res.json({
      success: true,
      data: bond,
      current_evaluation: evaluation
    });
  } catch (error) {
    console.error('Get trust bond error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * @desc    Update trust bond metrics
 * @route   PUT /api/trust/bonds/:id
 * @access  Protected
 */
const updateTrustBond = asyncHandler(async (req, res) => {
  try {
    const { trust_metrics, bond_status, oracle_flags, metadata } = req.body;

    const bond = await TrustBond.findById(req.params.id);
    if (!bond) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Trust bond not found'
      });
    }

    // Update trust metrics if provided
    if (trust_metrics) {
      await bond.updateTrustMetrics(trust_metrics, 'manual_update');
    }

    // Update other fields
    if (bond_status) bond.bond_status = bond_status;
    if (oracle_flags) Object.assign(bond.oracle_flags, oracle_flags);
    if (metadata) Object.assign(bond.metadata, metadata);

    const updatedBond = await bond.save();
    await updatedBond.populate('agent_a agent_b');

    // Perform fresh evaluation after update
    const evaluation = await trustOracle.evaluateTrust(
      bond.agent_a._id.toString(),
      bond.agent_b._id.toString(),
      { trigger: 'bond_update', userId: req.user?.id }
    );

    res.json({
      success: true,
      message: 'Trust bond updated successfully',
      data: updatedBond,
      updated_evaluation: evaluation
    });
  } catch (error) {
    console.error('Update trust bond error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * @desc    Delete a trust bond
 * @route   DELETE /api/trust/bonds/:id
 * @access  Protected (Admin only)
 */
const deleteTrustBond = asyncHandler(async (req, res) => {
  try {
    const bond = await TrustBond.findById(req.params.id);
    if (!bond) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Trust bond not found'
      });
    }

    await TrustBond.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Trust bond deleted successfully',
      deleted_bond_id: req.params.id
    });
  } catch (error) {
    console.error('Delete trust bond error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * @desc    Get trust bonds for a specific agent
 * @route   GET /api/trust/bonds/agent/:agentId
 * @access  Protected
 */
const getTrustBondsByAgent = asyncHandler(async (req, res) => {
  try {
    const { agentId } = req.params;
    const { include_evaluations = false } = req.query;

    // Verify agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        message: 'Specified agent does not exist'
      });
    }

    // Find all bonds involving this agent
    const bonds = await TrustBond.find({
      $or: [
        { agent_a: agentId },
        { agent_b: agentId }
      ]
    })
    .populate('agent_a', 'name type')
    .populate('agent_b', 'name type')
    .sort({ overall_trust_score: -1 });

    // Optionally include current evaluations
    let bondsWithEvaluations = bonds;
    if (include_evaluations === 'true') {
      bondsWithEvaluations = await Promise.all(
        bonds.map(async (bond) => {
          const evaluation = await trustOracle.evaluateTrust(
            bond.agent_a._id.toString(),
            bond.agent_b._id.toString(),
            { trigger: 'agent_query', userId: req.user?.id }
          );
          return {
            ...bond.toObject(),
            current_evaluation: evaluation
          };
        })
      );
    }

    // Calculate summary statistics
    const summary = {
      total_bonds: bonds.length,
      active_bonds: bonds.filter(b => b.bond_status === 'active').length,
      average_trust_score: bonds.length > 0 
        ? bonds.reduce((sum, b) => sum + b.overall_trust_score, 0) / bonds.length 
        : 0,
      risk_distribution: bonds.reduce((acc, b) => {
        acc[b.risk_level] = (acc[b.risk_level] || 0) + 1;
        return acc;
      }, {}),
      bond_types: bonds.reduce((acc, b) => {
        acc[b.bond_type] = (acc[b.bond_type] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: bondsWithEvaluations,
      agent: {
        id: agent._id,
        name: agent.name,
        type: agent.type
      },
      summary
    });
  } catch (error) {
    console.error('Get agent trust bonds error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * @desc    Evaluate trust between two agents
 * @route   POST /api/trust/bonds/evaluate
 * @access  Protected
 */
const evaluateTrustBetweenAgents = asyncHandler(async (req, res) => {
  try {
    const { agent_a, agent_b, context } = req.body;

    if (!agent_a || !agent_b) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Both agent_a and agent_b are required'
      });
    }

    // Verify agents exist
    const [agentA, agentB] = await Promise.all([
      Agent.findById(agent_a),
      Agent.findById(agent_b)
    ]);

    if (!agentA || !agentB) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        message: 'One or both agents do not exist'
      });
    }

    // Perform trust evaluation
    const evaluation = await trustOracle.evaluateTrust(
      agent_a,
      agent_b,
      { 
        ...context,
        trigger: 'manual_evaluation',
        userId: req.user?.id 
      }
    );

    res.json({
      success: true,
      message: 'Trust evaluation completed',
      data: evaluation,
      agents: {
        agent_a: { id: agentA._id, name: agentA.name },
        agent_b: { id: agentB._id, name: agentB.name }
      }
    });
  } catch (error) {
    console.error('Trust evaluation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * @desc    Record interaction between agents
 * @route   POST /api/trust/bonds/interaction
 * @access  Protected
 */
const recordInteraction = asyncHandler(async (req, res) => {
  try {
    const { agent_a, agent_b, interaction_data } = req.body;

    if (!agent_a || !agent_b || !interaction_data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'agent_a, agent_b, and interaction_data are required'
      });
    }

    // Record the interaction
    await trustOracle.recordInteraction(agent_a, agent_b, interaction_data);

    res.json({
      success: true,
      message: 'Interaction recorded successfully',
      recorded_at: new Date()
    });
  } catch (error) {
    console.error('Record interaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * @desc    Get trust bond analytics and statistics
 * @route   GET /api/trust/bonds/analytics
 * @access  Protected
 */
const getTrustBondAnalytics = asyncHandler(async (req, res) => {
  try {
    // Get overall statistics
    const [
      totalBonds,
      bondsByStatus,
      bondsByRisk,
      trustScoreDistribution,
      oracleMetrics
    ] = await Promise.all([
      TrustBond.countDocuments(),
      TrustBond.aggregate([
        { $group: { _id: '$bond_status', count: { $sum: 1 } } }
      ]),
      TrustBond.aggregate([
        { $group: { _id: '$risk_level', count: { $sum: 1 } } }
      ]),
      TrustBond.aggregate([
        {
          $bucket: {
            groupBy: '$overall_trust_score',
            boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
            default: 'other',
            output: { count: { $sum: 1 } }
          }
        }
      ]),
      Promise.resolve(trustOracle.getMetrics())
    ]);

    // Get recent activity
    const recentActivity = await TrustBond.find({
      last_interaction: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .populate('agent_a agent_b', 'name')
    .sort({ last_interaction: -1 })
    .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          total_bonds: totalBonds,
          bonds_by_status: bondsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          bonds_by_risk: bondsByRisk.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          trust_score_distribution: trustScoreDistribution
        },
        oracle_metrics: oracleMetrics,
        recent_activity: recentActivity
      },
      generated_at: new Date()
    });
  } catch (error) {
    console.error('Get trust bond analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

module.exports = {
  createTrustBond,
  getTrustBonds,
  getTrustBondById,
  updateTrustBond,
  deleteTrustBond,
  getTrustBondsByAgent,
  evaluateTrustBetweenAgents,
  recordInteraction,
  getTrustBondAnalytics
};