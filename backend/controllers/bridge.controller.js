const { dispatchToAgents, rankProposals, executeProposal, detectConflicts, validateApproval, generateApprovalSummary } = require('../services/bridge.service');
const { appendEvent } = require('../services/ledger.service');

// POST /api/bridge/orchestrate
const orchestrate = async (req, res) => {
  try {
    const { task, agents = ["v0", "codex", "trae"], context = {}, session_id } = req.body || {};
    if (!task) return res.status(400).json({ success: false, error: 'task required' });

    const proposals = await dispatchToAgents({ task, agents, context });
    const ranked = rankProposals(proposals, { weights: { risk: 0.35, confidence: 0.35, cost: 0.15, completeness: 0.15 } });

    // Perform conflict detection
    const conflictAnalysis = detectConflicts(ranked);

    // Build and persist a bridge receipt (audit)
    const hex24 = /^[a-f0-9]{24}$/i;
    const sidRaw = session_id || context.session_id || 'orchestrator';
    const sid = (sidRaw && typeof sidRaw === 'string' && hex24.test(sidRaw)) ? `conv:${sidRaw}` : sidRaw;
    const chosen = ranked[0] || null;
    const receipt = {
      type: 'bridge_receipt',
      task,
      session_id: sid,
      agents_considered: ranked.map(p => ({ agent_key: p.agent_key, score: p.score })),
      chosen: chosen ? { agent_key: chosen.agent_key, score: chosen.score, proposal_id: chosen.proposal?.proposal_id } : null,
      rationale: 'ranking_by_score',
      conflicts: conflictAnalysis
    };
    
    try {
      await appendEvent({
        session_id: sid,
        userId: req.user?.id,
        model_vendor: 'symbi',
        model_name: 'bridge-v1',
        prompt: `[BRIDGE] ${task}`,
        response: `Chosen: ${receipt.chosen?.agent_key || 'none'} (score=${receipt.chosen?.score ?? 'n/a'}) | Conflicts: ${conflictAnalysis.conflictCount} (${conflictAnalysis.riskLevel} risk)`,
        analysis: { actions: ['bridge_receipt'], conflicts: conflictAnalysis },
        metadata: { receipt }
      });
    } catch (e) { /* non-fatal */ }

    return res.json({ 
      success: true, 
      proposals: ranked, 
      recommended: ranked[0] || null,
      conflicts: conflictAnalysis
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'orchestration_failed', message: e.message });
  }
};

// POST /api/bridge/dispatch
const dispatchChosen = async (req, res) => {
  try {
    const { agent_key, proposal, context = {}, allProposals = [], forceApproval = false } = req.body || {};
    if (!agent_key || !proposal) return res.status(400).json({ success: false, error: 'agent_key and proposal required' });

    // Perform approval validation unless forced
    if (!forceApproval) {
      const validation = validateApproval(proposal, allProposals, {
        ...context,
        agent_key,
        user_id: req.user?.id,
        session_id: context.session_id || 'orchestrator'
      });

      // Generate approval summary for audit trail
      const approvalSummary = generateApprovalSummary(proposal, validation, {
        agent_key,
        user_id: req.user?.id,
        session_id: context.session_id || 'orchestrator'
      });

      // Log the approval attempt
      try {
        await appendEvent({
          session_id: context.session_id || 'orchestrator',
          userId: req.user?.id,
          model_vendor: 'symbi',
          model_name: 'bridge-v1',
          prompt: JSON.stringify({ approval_check: { agent_key, proposal_id: proposal.proposal_id } }),
          response: JSON.stringify({ validation, approvalSummary }),
          analysis: { stance: 'approval_validator', approved: validation.approved },
          metadata: { bridge: true, approval: approvalSummary }
        });
      } catch (e) { /* non-fatal */ }

      // Block execution if not approved
      if (!validation.approved) {
        return res.status(403).json({ 
          success: false, 
          error: 'approval_denied', 
          message: 'Proposal failed approval validation',
          validation,
          approvalSummary
        });
      }

      // Return warnings if present
      if (validation.warnings.length > 0 || validation.requirements.length > 0) {
        // Log warnings but allow execution to proceed
        console.warn('Dispatch proceeding with warnings:', {
          agent_key,
          proposal_id: proposal.proposal_id,
          warnings: validation.warnings,
          requirements: validation.requirements
        });
      }
    }

    const result = await executeProposal({ agent_key, proposal, context });

    try {
      await appendEvent({
        session_id: context.session_id || 'orchestrator',
        userId: req.user?.id,
        model_vendor: 'symbi',
        model_name: 'bridge-v1',
        prompt: JSON.stringify({ dispatch: { agent_key, proposal_id: proposal.proposal_id } }),
        response: JSON.stringify({ result }),
        analysis: { stance: 'executor' },
        metadata: { bridge: true, approved: true, forced: forceApproval }
      });
    } catch (e) { /* non-fatal */ }

    return res.json({ success: true, ok: true, result, approved: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'dispatch_failed', message: e.message });
  }
};

// POST /api/bridge/validate
const validateProposal = async (req, res) => {
  try {
    const { agent_key, proposal, allProposals = [], context = {} } = req.body || {};
    if (!agent_key || !proposal) return res.status(400).json({ success: false, error: 'agent_key and proposal required' });

    // Perform validation
    const validation = validateApproval(proposal, allProposals, {
      ...context,
      agent_key,
      user_id: req.user?.id,
      session_id: context.session_id || 'orchestrator'
    });

    // Generate approval summary
    const approvalSummary = generateApprovalSummary(proposal, validation, {
      agent_key,
      user_id: req.user?.id,
      session_id: context.session_id || 'orchestrator'
    });

    // Log validation request
    try {
      await appendEvent({
        session_id: context.session_id || 'orchestrator',
        userId: req.user?.id,
        model_vendor: 'symbi',
        model_name: 'bridge-v1',
        prompt: JSON.stringify({ validate: { agent_key, proposal_id: proposal.proposal_id } }),
        response: JSON.stringify({ validation, approvalSummary }),
        analysis: { stance: 'validator', approved: validation.approved },
        metadata: { bridge: true, validation: true, approval: approvalSummary }
      });
    } catch (e) { /* non-fatal */ }

    return res.json({
      success: true,
      validation,
      approvalSummary,
      canProceed: validation.approved,
      requiresReview: validation.conflicts?.riskLevel === 'high' || validation.requirements.length > 0
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'validation_failed', message: e.message });
  }
};

module.exports = { orchestrate, dispatchChosen, validateProposal };
