const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const axios = require('axios');
const { openaiCall } = require('./llm.util');

function loadConfig() {
  try {
    const p = path.join(process.cwd(), 'backend', 'bridge', 'bridge.config.yaml');
    const txt = fs.readFileSync(p, 'utf8');
    return yaml.load(txt) || { agents: [] };
  } catch (e) {
    return { agents: [] };
  }
}

const CFG = loadConfig();

const BRIDGE_CONTRACT = `You are SYMBI agent. Return JSON only with keys: {"proposal_id","goal","steps","artifacts","risks","assumptions","est_cost","est_confidence"}. No extra prose.`;

function resolveEnvTemplates(str) {
  if (!str) return str;
  return str.replace(/\$\{([A-Z0-9_]+)\}/g, (_, v) => process.env[v] || '');
}

async function askHttp(agent, payload) {
  const url = agent.route ? `${agent.base_url}${agent.route}` : agent.base_url;
  const headers = { 'Content-Type': 'application/json' };
  if (agent.auth_header) headers['Authorization'] = resolveEnvTemplates(agent.auth_header);
  const res = await axios.post(url, { task: payload.task, context: payload.context, contract: BRIDGE_CONTRACT }, { headers, timeout: 30000 });
  const raw = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  return { agent_key: agent.key, raw, proposal: safeParseJson(raw) };
}

async function askLlm(agent, payload) {
  const msg = `Task: ${payload.task}\nContext: ${JSON.stringify(payload.context)}\n\n${BRIDGE_CONTRACT}`;
  const text = await openaiCall(agent.model || 'gpt-4o', '', [
    { role: 'system', content: BRIDGE_CONTRACT },
    { role: 'user', content: msg }
  ]);
  return { agent_key: agent.key, raw: text, proposal: safeParseJson(text) };
}

function safeParseJson(s) { try { return JSON.parse(s); } catch { return null; } }

async function dispatchToAgents({ task, agents, context }) {
  const active = (CFG.agents || []).filter(a => agents.includes(a.key) && a.enabled);
  const outs = await Promise.all(active.map(async (a) => {
    try {
      if (a.kind === 'http') return await askHttp(a, { task, context });
      if (a.kind === 'llm') return await askLlm(a, { task, context });
      return { agent_key: a.key, error: `Unknown kind ${a.kind}` };
    } catch (e) {
      return { agent_key: a.key, error: String(e?.message || e) };
    }
  }));
  return outs.filter(Boolean);
}

function rankProposals(arr, { weights }) {
  return (arr || []).map(x => {
    const p = x.proposal || {};
    const completeness = Math.min(1, ((p.steps?.length || 0) + (p.artifacts?.length || 0)) / 8);
    const risk = scoreInverse((p.risks?.length || 0));
    const cost = p.est_cost != null ? 1 / (1 + Number(p.est_cost)) : 0.5;
    const confidence = clamp(Number(p.est_confidence ?? 0.5), 0, 1);
    const score = (weights.risk * risk) + (weights.confidence * confidence) + (weights.cost * cost) + (weights.completeness * completeness);
    return { ...x, score };
  }).sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Detect conflicts between agent proposals
 * @param {Array} proposals - Array of ranked proposals
 * @returns {Object} Conflict analysis result
 */
function detectConflicts(proposals) {
  if (!proposals || proposals.length < 2) {
    return { hasConflicts: false, conflicts: [], riskLevel: 'low' };
  }

  const conflicts = [];
  const goals = [];
  const artifacts = [];
  const approaches = [];

  // Extract key information from each proposal
  proposals.forEach((prop, index) => {
    const p = prop.proposal || {};
    goals.push({ index, agent: prop.agent_key, goal: p.goal || '' });
    artifacts.push({ index, agent: prop.agent_key, artifacts: p.artifacts || [] });
    approaches.push({ index, agent: prop.agent_key, steps: p.steps || [] });
  });

  // Check for goal conflicts
  for (let i = 0; i < goals.length; i++) {
    for (let j = i + 1; j < goals.length; j++) {
      const similarity = calculateTextSimilarity(goals[i].goal, goals[j].goal);
      if (similarity < 0.3) { // Goals are significantly different
        conflicts.push({
          type: 'goal_mismatch',
          severity: 'high',
          agents: [goals[i].agent, goals[j].agent],
          description: `Agents ${goals[i].agent} and ${goals[j].agent} have conflicting goals`,
          details: {
            goal1: goals[i].goal,
            goal2: goals[j].goal,
            similarity: similarity
          }
        });
      }
    }
  }

  // Check for artifact conflicts (same artifact different approaches)
  for (let i = 0; i < artifacts.length; i++) {
    for (let j = i + 1; j < artifacts.length; j++) {
      const commonArtifacts = findCommonElements(artifacts[i].artifacts, artifacts[j].artifacts);
      if (commonArtifacts.length > 0) {
        const stepsSimilarity = calculateStepsSimilarity(approaches[i].steps, approaches[j].steps);
        if (stepsSimilarity < 0.5) { // Same artifacts, different approaches
          conflicts.push({
            type: 'approach_conflict',
            severity: 'medium',
            agents: [artifacts[i].agent, artifacts[j].agent],
            description: `Agents propose different approaches for same artifacts`,
            details: {
              commonArtifacts,
              stepsSimilarity
            }
          });
        }
      }
    }
  }

  // Check for resource conflicts
  const resourceConflicts = detectResourceConflicts(proposals);
  conflicts.push(...resourceConflicts);

  const riskLevel = determineRiskLevel(conflicts);
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    riskLevel,
    conflictCount: conflicts.length,
    highSeverityCount: conflicts.filter(c => c.severity === 'high').length
  };
}

/**
 * Calculate text similarity between two strings (simple implementation)
 */
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  return intersection.length / union.length;
}

/**
 * Find common elements between two arrays
 */
function findCommonElements(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
  return arr1.filter(item => arr2.includes(item));
}

/**
 * Calculate similarity between step arrays
 */
function calculateStepsSimilarity(steps1, steps2) {
  if (!Array.isArray(steps1) || !Array.isArray(steps2)) return 0;
  if (steps1.length === 0 && steps2.length === 0) return 1;
  if (steps1.length === 0 || steps2.length === 0) return 0;
  
  let matchCount = 0;
  const maxLength = Math.max(steps1.length, steps2.length);
  
  for (let i = 0; i < Math.min(steps1.length, steps2.length); i++) {
    const similarity = calculateTextSimilarity(steps1[i], steps2[i]);
    if (similarity > 0.6) matchCount++;
  }
  
  return matchCount / maxLength;
}

/**
 * Detect resource conflicts between proposals
 */
function detectResourceConflicts(proposals) {
  const conflicts = [];
  const totalCost = proposals.reduce((sum, p) => sum + (p.proposal?.est_cost || 0), 0);
  
  // Check if total cost is excessive
  if (totalCost > 1000) { // Arbitrary threshold
    conflicts.push({
      type: 'resource_conflict',
      severity: 'medium',
      agents: proposals.map(p => p.agent_key),
      description: 'Combined proposals exceed cost threshold',
      details: { totalCost, threshold: 1000 }
    });
  }

  // Check for time conflicts
  const highCostProposals = proposals.filter(p => (p.proposal?.est_cost || 0) > 500);
  if (highCostProposals.length > 1) {
    conflicts.push({
      type: 'resource_conflict',
      severity: 'medium',
      agents: highCostProposals.map(p => p.agent_key),
      description: 'Multiple high-cost proposals may compete for resources',
      details: { highCostProposals: highCostProposals.length }
    });
  }

  return conflicts;
}

/**
 * Determine overall risk level based on conflicts
 */
function determineRiskLevel(conflicts) {
  if (conflicts.length === 0) return 'low';
  
  const hasHighSeverity = conflicts.some(c => c.severity === 'high');
  const hasMediumSeverity = conflicts.some(c => c.severity === 'medium');
  
  if (hasHighSeverity || conflicts.length > 3) return 'high';
  if (hasMediumSeverity || conflicts.length > 1) return 'medium';
  return 'low';
}

/**
 * Validate if a proposal can be approved for execution
 * @param {Object} proposal - The proposal to validate
 * @param {Array} allProposals - All proposals for conflict checking
 * @param {Object} context - Execution context
 * @returns {Object} Validation result
 */
function validateApproval(proposal, allProposals, context = {}) {
  const validation = {
    approved: false,
    reasons: [],
    conflicts: {},
    warnings: [],
    requirements: []
  };

  // Check if proposal has required fields
  if (!proposal || !proposal.proposal_id) {
    validation.reasons.push('Proposal missing required proposal_id');
    return validation;
  }

  if (!proposal.goal || !proposal.steps) {
    validation.reasons.push('Proposal missing required goal or steps');
    return validation;
  }

  // Run conflict detection
  const conflictAnalysis = detectConflicts(allProposals);
  validation.conflicts = conflictAnalysis;

  // Block approval if high-risk conflicts exist
  if (conflictAnalysis.riskLevel === 'high') {
    validation.reasons.push('High-risk conflicts detected - manual review required');
    return validation;
  }

  // Add warnings for medium-risk conflicts
  if (conflictAnalysis.riskLevel === 'medium') {
    validation.warnings.push('Medium-risk conflicts detected - proceed with caution');
  }

  // Check confidence threshold
  const confidence = Number(proposal.est_confidence ?? 0);
  if (confidence < 0.7) {
    validation.warnings.push(`Low confidence score: ${confidence.toFixed(2)}`);
  }

  // Check cost threshold
  const cost = Number(proposal.est_cost ?? 0);
  if (cost > 500) {
    validation.requirements.push('High cost proposal requires additional approval');
  }

  // Check for required context
  if (context.requiresHumanApproval && !context.humanApproved) {
    validation.reasons.push('Human approval required but not provided');
    return validation;
  }

  // If we made it here, approval can proceed
  validation.approved = true;
  return validation;
}

/**
 * Generate approval summary for logging and audit
 */
function generateApprovalSummary(proposal, validation, context = {}) {
  return {
    timestamp: new Date().toISOString(),
    proposal_id: proposal?.proposal_id,
    agent_key: context.agent_key,
    approved: validation.approved,
    riskLevel: validation.conflicts?.riskLevel || 'unknown',
    conflictCount: validation.conflicts?.conflictCount || 0,
    warnings: validation.warnings,
    reasons: validation.reasons,
    requirements: validation.requirements,
    confidence: proposal?.est_confidence,
    cost: proposal?.est_cost,
    session_id: context.session_id,
    user_id: context.user_id
  };
}

async function executeProposal({ agent_key, proposal, context }) {
  // For now, dry-run dispatch description
  return { dispatched: agent_key, proposal_id: proposal?.proposal_id, mode: 'dry-run', context };
}

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function scoreInverse(n) { return 1 / (1 + n); }

module.exports = { 
  dispatchToAgents, 
  rankProposals, 
  executeProposal, 
  detectConflicts, 
  validateApproval, 
  generateApprovalSummary 
};

