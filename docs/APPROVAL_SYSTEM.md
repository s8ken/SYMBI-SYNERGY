# SYMBI Approval System with Conflict Detection

## Overview

The SYMBI platform now includes a comprehensive approval system that validates agent proposals and detects conflicts before execution. This system ensures safe and compliant AI agent orchestration with full audit trails.

## Features

### 🔍 Conflict Detection
- **Goal Mismatch Detection**: Identifies when agents propose significantly different goals
- **Approach Conflicts**: Detects different implementation approaches for the same artifacts  
- **Resource Conflicts**: Identifies competing resource requirements and cost conflicts
- **Risk Assessment**: Automatically categorizes conflicts as low, medium, or high risk

### ✅ Approval Validation
- **Automated Validation**: Proposals are automatically validated against safety criteria
- **Risk-Based Blocking**: High-risk conflicts automatically block approval
- **Warning System**: Medium-risk scenarios generate warnings but allow execution
- **Requirements Checking**: High-cost proposals require additional approval steps

### 📋 Audit Trail
- **Complete Logging**: All approval decisions are logged to the ledger service
- **Compliance Ready**: Full audit trail for regulatory compliance
- **Force Override Tracking**: Special logging when safety checks are bypassed

## API Endpoints

### POST /api/bridge/orchestrate
Enhanced orchestration endpoint that now includes conflict analysis.

**Request:**
```json
{
  "task": "Create user authentication system",
  "agents": ["v0", "codex", "trae"],
  "context": {},
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "proposals": [...],
  "recommended": {...},
  "conflicts": {
    "hasConflicts": true,
    "conflictCount": 2,
    "riskLevel": "medium",
    "conflicts": [
      {
        "type": "goal_mismatch",
        "severity": "high",
        "agents": ["codex", "v0"],
        "description": "Agents have conflicting goals",
        "details": {...}
      }
    ]
  }
}
```

### POST /api/bridge/validate
New endpoint for proposal validation before dispatch.

**Request:**
```json
{
  "agent_key": "codex",
  "proposal": {...},
  "allProposals": [...],
  "context": {}
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "approved": true,
    "reasons": [],
    "conflicts": {...},
    "warnings": ["Medium-risk conflicts detected"],
    "requirements": []
  },
  "approvalSummary": {...},
  "canProceed": true,
  "requiresReview": false
}
```

### POST /api/bridge/dispatch
Enhanced dispatch endpoint with approval validation.

**Request:**
```json
{
  "agent_key": "codex",
  "proposal": {...},
  "allProposals": [...],
  "context": {},
  "forceApproval": false
}
```

**Response:**
```json
{
  "success": true,
  "ok": true,
  "result": {...},
  "approved": true
}
```

## Conflict Types

### Goal Mismatch
Detected when agents propose significantly different goals for the same task.
- **Severity**: High
- **Action**: Blocks approval, requires manual review

### Approach Conflict  
Detected when agents propose different implementation approaches for the same artifacts.
- **Severity**: Medium
- **Action**: Warning, allows execution with caution

### Resource Conflict
Detected when proposals compete for resources or exceed cost thresholds.
- **Severity**: Medium
- **Action**: Warning, may require additional approval

## Risk Levels

### Low Risk
- No conflicts detected
- High confidence proposals
- Standard cost range
- **Action**: Auto-approve

### Medium Risk
- Minor conflicts detected
- Moderate confidence
- Elevated costs
- **Action**: Warning, proceed with caution

### High Risk
- Major conflicts detected
- Low confidence or missing data
- Excessive costs
- **Action**: Block approval, require manual review

## VS Code Extension Integration

The VS Code extension now provides enhanced approval workflow:

1. **Conflict Visualization**: Shows risk level in proposal selection
2. **Approval Status**: Clear indication of approval status
3. **Force Override**: Option for authorized users to bypass safety checks
4. **Detailed Review**: Access to full validation details

## Usage Examples

### Basic Workflow
```bash
# 1. Orchestrate proposals with conflict detection
curl -X POST /api/bridge/orchestrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"task": "Build user dashboard", "agents": ["codex", "v0"]}'

# 2. Validate chosen proposal
curl -X POST /api/bridge/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"agent_key": "codex", "proposal": {...}, "allProposals": [...]}'

# 3. Dispatch if approved
curl -X POST /api/bridge/dispatch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"agent_key": "codex", "proposal": {...}, "context": {}}'
```

### Force Override (Emergency)
```bash
curl -X POST /api/bridge/dispatch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"agent_key": "codex", "proposal": {...}, "forceApproval": true}'
```

## Testing

Run the included test scripts to validate the approval system:

```bash
# Test conflict detection and validation logic
node test-approval-system.js

# Test integration workflow
node test-integration-approval.js
```

## Configuration

### Thresholds
Edit `backend/services/bridge.service.js` to adjust:
- Confidence thresholds (default: 0.7)
- Cost thresholds (default: 500)
- Text similarity thresholds (default: 0.3 for conflicts)

### Risk Assessment
Modify `determineRiskLevel()` function to customize risk categorization logic.

## Compliance & Security

- **EU AI Act Ready**: Full audit trail and risk assessment
- **SOC 2 Compatible**: Comprehensive logging and access controls
- **Zero Trust**: All decisions logged and validated
- **Immutable Records**: Approval decisions stored in cryptographic ledger

## Troubleshooting

### Common Issues

**High-risk conflicts blocking all approvals:**
- Review conflict detection thresholds
- Consider manual review process
- Use force override for emergency situations

**Too many false positive conflicts:**
- Adjust text similarity thresholds
- Refine conflict detection algorithms
- Add domain-specific logic

**Performance concerns:**
- Consider caching validation results
- Optimize conflict detection algorithms
- Implement async processing for large proposal sets

## Future Enhancements

- Machine learning-based conflict prediction
- Integration with external approval systems
- Real-time collaboration features
- Advanced risk scoring models