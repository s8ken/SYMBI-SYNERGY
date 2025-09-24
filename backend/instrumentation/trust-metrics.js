// backend/instrumentation/trust-metrics.js
const client = require('prom-client');

const trustEvalCounter = new client.Counter({
  name: 'trust_evaluations_total',
  help: 'Count of Trust Oracle evaluations',
  labelNames: ['recommendation']
});

const trustViolationCounter = new client.Counter({
  name: 'trust_policy_violations_total',
  help: 'Policy violations by article and severity',
  labelNames: ['article','severity']
});

function recordTrustEvaluation(evaluation) {
  try {
    trustEvalCounter.inc({ recommendation: evaluation.recommendation || 'unknown' }, 1);
    (evaluation.violations || []).forEach(v => trustViolationCounter.inc({ article: v.articleId, severity: v.severity || 'unknown' }, 1));
  } catch {}
}

module.exports = { recordTrustEvaluation, register: client.register };