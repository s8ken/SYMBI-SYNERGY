const { recordTrustEvaluation } = require('../instrumentation/trust-metrics');

/**
 * Send a chat message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function sendMessage(req, res) {
  try {
    const { message, agentId, userId } = req.body;
    
    // Trust context should be available from Trust Oracle middleware
    const trustContext = req.trustContext;
    
    // Validate required fields
    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        code: 'MISSING_MESSAGE'
      });
    }
    
    // Record trust evaluation if available
    if (trustContext) {
      recordTrustEvaluation(trustContext);
    }
    
    // Simulate message processing
    const response = {
      id: `msg_${Date.now()}`,
      message: `Echo: ${message}`,
      agentId: agentId || 'default-agent',
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      trustScore: trustContext?.trustScore ?? null,
      trustEvaluation: trustContext || null,
      processed: true
    };
    
    res.json({
      success: true,
      data: response,
      trustContext: trustContext ? {
        recommendation: trustContext.recommendation,
        trustScore: trustContext.trustScore,
        riskLevel: trustContext.riskLevel
      } : null
    });
    
  } catch (error) {
    console.error('Chat sendMessage error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'CHAT_ERROR',
      message: error.message
    });
  }
}

module.exports = {
  sendMessage
};