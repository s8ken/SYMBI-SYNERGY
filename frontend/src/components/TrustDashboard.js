import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, 
    CardContent, 
    Typography, 
    LinearProgress, 
    Chip, 
    Grid, 
    List, 
    ListItem, 
    ListItemText,
    Alert, 
    Box,
    Divider,
    Tooltip,
    IconButton,
    Collapse,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Refresh as RefreshIcon,
    History as HistoryIcon,
    Security as SecurityIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon
} from '@mui/icons-material';

const TrustDashboard = ({ userId, agentId, onTrustChange }) => {
    const [trustBond, setTrustBond] = useState(null);
    const [trustEvaluation, setTrustEvaluation] = useState(null);
    const [trustHistory, setTrustHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTrustData = useCallback(async () => {
        if (!agentId) return;
        
        try {
            setError(null);
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch trust bond
            const bondResponse = await fetch(`/api/trust/oracle/bonds/${agentId}`, { headers });
            
            if (bondResponse.ok) {
                const bondData = await bondResponse.json();
                setTrustBond(bondData.data);
            } else if (bondResponse.status !== 404) {
                console.warn('Failed to fetch trust bond:', bondResponse.statusText);
            }

            // Evaluate current trust
            const evalResponse = await fetch('/api/trust/oracle/evaluate', {
                method: 'POST',
                headers,
                body: JSON.stringify({ agentId, userId })
            });

            if (evalResponse.ok) {
                const evalData = await evalResponse.json();
                setTrustEvaluation(evalData.data);
                
                // Notify parent component of trust change
                if (onTrustChange) {
                    onTrustChange(evalData.data);
                }
            } else {
                console.warn('Failed to evaluate trust:', evalResponse.statusText);
            }

        } catch (error) {
            console.error('Failed to fetch trust data:', error);
            setError('Failed to load trust data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [agentId, userId, onTrustChange]);

    const fetchTrustHistory = useCallback(async () => {
        if (!agentId) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/trust/oracle/history/${agentId}?limit=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setTrustHistory(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch trust history:', error);
        }
    }, [agentId]);

    useEffect(() => {
        fetchTrustData();
    }, [fetchTrustData]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchTrustData();
    };

    const handleShowHistory = () => {
        if (!trustHistory) {
            fetchTrustHistory();
        }
        setShowHistory(true);
    };

    const getTrustBandColor = (band) => {
        const colors = {
            'VERIFIED': 'success',
            'TRUSTED': 'primary',
            'NEUTRAL': 'warning',
            'CAUTION': 'error',
            'UNTRUSTED': 'error'
        };
        return colors[band] || 'default';
    };

    const getTrustBandIcon = (band) => {
        switch (band) {
            case 'VERIFIED':
                return <CheckCircleIcon color="success" />;
            case 'TRUSTED':
                return <SecurityIcon color="primary" />;
            case 'NEUTRAL':
                return <InfoIcon color="warning" />;
            case 'CAUTION':
            case 'UNTRUSTED':
                return <WarningIcon color="error" />;
            default:
                return <InfoIcon />;
        }
    };

    const getPolicyStatusIcon = (score, maxScore) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 90) return <CheckCircleIcon color="success" fontSize="small" />;
        if (percentage >= 70) return <InfoIcon color="primary" fontSize="small" />;
        if (percentage >= 50) return <WarningIcon color="warning" fontSize="small" />;
        return <ErrorIcon color="error" fontSize="small" />;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                    Loading trust evaluation...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
                <Button onClick={handleRefresh} size="small" sx={{ ml: 1 }}>
                    Retry
                </Button>
            </Alert>
        );
    }

    if (!trustEvaluation && !trustBond) {
        return (
            <Alert severity="info" sx={{ m: 2 }}>
                No trust data available for this agent.
            </Alert>
        );
    }

    return (
        <Box>
            <Grid container spacing={2}>
                {/* Trust Score Overview */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" gutterBottom>
                                    Trust Status
                                </Typography>
                                <Tooltip title="Refresh trust evaluation">
                                    <IconButton 
                                        onClick={handleRefresh} 
                                        disabled={refreshing}
                                        size="small"
                                    >
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            
                            {trustEvaluation && (
                                <Box>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Typography variant="body2" style={{ minWidth: 60 }}>
                                            Score:
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={trustEvaluation.overallScore}
                                            style={{ 
                                                flexGrow: 1, 
                                                margin: '0 10px',
                                                height: 8,
                                                borderRadius: 4
                                            }}
                                        />
                                        <Typography variant="body2" fontWeight="bold">
                                            {trustEvaluation.overallScore}%
                                        </Typography>
                                    </Box>
                                    
                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        {getTrustBandIcon(trustEvaluation.trustBand)}
                                        <Chip
                                            label={trustEvaluation.trustBand}
                                            color={getTrustBandColor(trustEvaluation.trustBand)}
                                            variant="outlined"
                                            size="small"
                                        />
                                        {trustEvaluation.riskLevel && (
                                            <Chip
                                                label={`Risk: ${trustEvaluation.riskLevel}`}
                                                color={trustEvaluation.riskLevel === 'MINIMAL' ? 'success' : 'warning'}
                                                variant="filled"
                                                size="small"
                                            />
                                        )}
                                    </Box>
                                    
                                    <Box display="flex" gap={1}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setShowDetails(!showDetails)}
                                            startIcon={<ExpandMoreIcon />}
                                        >
                                            Policy Details
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={handleShowHistory}
                                            startIcon={<HistoryIcon />}
                                        >
                                            History
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Trust Bond Info */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Trust Bond
                            </Typography>
                            {trustBond ? (
                                <Box>
                                    <Typography variant="body2" color="textSecondary">
                                        Consent Status: 
                                        <Chip 
                                            label={trustBond.consent?.explicit ? 'Granted' : 'Not Provided'}
                                            color={trustBond.consent?.explicit ? 'success' : 'error'}
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                        Authorized Scopes: {trustBond.authorizedScopes?.join(', ') || 'None'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                        Last Updated: {new Date(trustBond.lastUpdated).toLocaleString()}
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No trust bond established
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Policy Compliance Details */}
                {showDetails && trustEvaluation?.policyResults && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Policy Compliance (Articles A1-A7)
                                </Typography>
                                <List dense>
                                    {trustEvaluation.policyResults.map((policy) => (
                                        <ListItem key={policy.policyId}>
                                            <Box display="flex" alignItems="center" width="100%">
                                                {getPolicyStatusIcon(policy.score, policy.maxScore)}
                                                <ListItemText
                                                    primary={`${policy.article}: ${policy.policyName}`}
                                                    secondary={`Score: ${policy.score}/${policy.maxScore} (${Math.round((policy.score / policy.maxScore) * 100)}%)`}
                                                    sx={{ ml: 1 }}
                                                />
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(policy.score / policy.maxScore) * 100}
                                                    style={{ width: 100, height: 6, borderRadius: 3 }}
                                                />
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Trust Violations */}
                {trustEvaluation?.violations?.length > 0 && (
                    <Grid item xs={12}>
                        <Alert severity="warning">
                            <Typography variant="subtitle2" gutterBottom>
                                Trust Violations ({trustEvaluation.violations.length})
                            </Typography>
                            <List dense>
                                {trustEvaluation.violations.slice(0, 5).map((violation, index) => (
                                    <ListItem key={index} disablePadding>
                                        <ListItemText
                                            primary={`${violation.article}: ${violation.violation}`}
                                            secondary={violation.policy}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                    </ListItem>
                                ))}
                                {trustEvaluation.violations.length > 5 && (
                                    <Typography variant="caption" color="textSecondary">
                                        ... and {trustEvaluation.violations.length - 5} more violations
                                    </Typography>
                                )}
                            </List>
                        </Alert>
                    </Grid>
                )}

                {/* Trust Evidence */}
                {trustEvaluation?.evidence?.length > 0 && (
                    <Grid item xs={12}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle2">
                                    Trust Evidence ({trustEvaluation.evidence.length})
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List dense>
                                    {trustEvaluation.evidence.slice(0, 10).map((evidence, index) => (
                                        <ListItem key={index} disablePadding>
                                            <CheckCircleIcon color="success" fontSize="small" />
                                            <ListItemText
                                                primary={evidence.evidence}
                                                secondary={`${evidence.article}: ${evidence.policy}`}
                                                sx={{ ml: 1 }}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                )}
            </Grid>

            {/* Trust History Dialog */}
            <Dialog 
                open={showHistory} 
                onClose={() => setShowHistory(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Trust Evaluation History</DialogTitle>
                <DialogContent>
                    {trustHistory ? (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Summary
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="textSecondary">
                                        Total Evaluations
                                    </Typography>
                                    <Typography variant="h6">
                                        {trustHistory.summary?.totalEvaluations || 0}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="textSecondary">
                                        Average Score
                                    </Typography>
                                    <Typography variant="h6">
                                        {trustHistory.summary?.averageScore || 0}%
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="textSecondary">
                                        Last Evaluation
                                    </Typography>
                                    <Typography variant="body2">
                                        {trustHistory.summary?.lastEvaluation ? 
                                            new Date(trustHistory.summary.lastEvaluation).toLocaleString() : 
                                            'Never'
                                        }
                                    </Typography>
                                </Grid>
                            </Grid>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="h6" gutterBottom>
                                Recent Evaluations
                            </Typography>
                            <List>
                                {trustHistory.evaluationHistory?.slice(0, 10).map((evaluation, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={`Score: ${evaluation.overallScore}% - ${evaluation.trustBand}`}
                                            secondary={new Date(evaluation.timestamp).toLocaleString()}
                                        />
                                        <Chip
                                            label={evaluation.trustBand}
                                            color={getTrustBandColor(evaluation.trustBand)}
                                            size="small"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    ) : (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowHistory(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TrustDashboard;