/**
 * Trust Dashboard Integration Examples
 * Shows how to integrate Trust Oracle components into existing SYMBI-SYNERGY frontend
 */

// Example 1: Enhanced Demo Page with Trust Oracle
const enhancedDemoPageExample = `
// frontend/src/pages/Demo/TrustScoringDemo.js
import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import TrustDashboard from '../../components/TrustDashboard';

function TrustScoringDemo() {
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [trustData, setTrustData] = useState(null);
    const [user, setUser] = useState({ id: 'demo-user', verified: true });

    const demoAgents = [
        { id: 'openai-gpt4', name: 'OpenAI GPT-4', provider: 'OpenAI' },
        { id: 'anthropic-claude', name: 'Anthropic Claude', provider: 'Anthropic' },
        { id: 'perplexity-ai', name: 'Perplexity AI', provider: 'Perplexity' }
    ];

    const handleAgentSelect = (agent) => {
        setSelectedAgent(agent);
        setTrustData(null); // Reset trust data for new agent
    };

    const handleTrustChange = (newTrustData) => {
        setTrustData(newTrustData);
        // Update parent component or global state
        console.log('Trust evaluation updated:', newTrustData);
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Trust Oracle Demo - Real-time AI Trust Evaluation
            </Typography>
            
            <Grid container spacing={3}>
                {/* Agent Selection */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Select AI Agent
                            </Typography>
                            {demoAgents.map(agent => (
                                <Button
                                    key={agent.id}
                                    variant={selectedAgent?.id === agent.id ? 'contained' : 'outlined'}
                                    onClick={() => handleAgentSelect(agent)}
                                    fullWidth
                                    sx={{ mb: 1 }}
                                >
                                    {agent.name}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Trust Dashboard */}
                <Grid item xs={12} md={8}>
                    {selectedAgent ? (
                        <TrustDashboard
                            userId={user.id}
                            agentId={selectedAgent.id}
                            onTrustChange={handleTrustChange}
                        />
                    ) : (
                        <Card>
                            <CardContent>
                                <Typography variant="body1" color="textSecondary">
                                    Select an AI agent to view trust evaluation
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>

                {/* Trust Actions */}
                {trustData && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Trust Actions
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Based on trust score of {trustData.overallScore}% ({trustData.trustBand}),
                                    the following actions are available:
                                </Typography>
                                
                                {trustData.overallScore >= 70 && (
                                    <Button variant="contained" color="primary" sx={{ mr: 1 }}>
                                        Start Conversation
                                    </Button>
                                )}
                                
                                {trustData.overallScore >= 50 && (
                                    <Button variant="outlined" color="primary" sx={{ mr: 1 }}>
                                        Basic Analysis
                                    </Button>
                                )}
                                
                                {trustData.overallScore < 50 && (
                                    <Button variant="outlined" color="error" disabled>
                                        Improve Trust Score First
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}

export default TrustScoringDemo;
`;

// Example 2: Conversation Page with Trust Integration
const conversationIntegrationExample = `
// frontend/src/pages/Conversation.js
import React, { useState, useEffect } from 'react';
import TrustDashboard from '../components/TrustDashboard';

function ConversationPage() {
    const [messages, setMessages] = useState([]);
    const [trustData, setTrustData] = useState(null);
    const [showTrustDetails, setShowTrustDetails] = useState(false);

    const sendMessage = async (message) => {
        // Include trust evaluation in message sending
        const response = await fetch('/api/conversations/message', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                agentId: selectedAgent.id,
                userId: user.id
            })
        });

        const result = await response.json();
        
        // Trust evaluation is automatically included via middleware
        if (result.trustEvaluation) {
            setTrustData(result.trustEvaluation);
        }
        
        setMessages(prev => [...prev, result.data]);
    };

    return (
        <div>
            {/* Trust Status Header */}
            {trustData && (
                <Box mb={2}>
                    <Chip
                        label={\`Trust: \${trustData.overallScore}% (\${trustData.trustBand})\`}
                        color={getTrustBandColor(trustData.trustBand)}
                        onClick={() => setShowTrustDetails(true)}
                        clickable
                    />
                </Box>
            )}

            {/* Main Conversation Interface */}
            <ConversationInterface 
                messages={messages}
                onSendMessage={sendMessage}
                trustData={trustData}
            />

            {/* Trust Details Modal */}
            <Dialog open={showTrustDetails} onClose={() => setShowTrustDetails(false)}>
                <DialogContent>
                    <TrustDashboard
                        userId={user.id}
                        agentId={selectedAgent.id}
                        onTrustChange={setTrustData}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
`;

// Example 3: Admin Dashboard with Trust Analytics
const adminDashboardExample = `
// frontend/src/pages/Admin/TrustAnalytics.js
import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';

function TrustAnalytics() {
    const [trustStats, setTrustStats] = useState(null);
    const [policyTrends, setPolicyTrends] = useState(null);

    useEffect(() => {
        fetchTrustAnalytics();
    }, []);

    const fetchTrustAnalytics = async () => {
        // Fetch trust statistics from backend
        const response = await fetch('/api/trust/analytics', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await response.json();
        setTrustStats(data.stats);
        setPolicyTrends(data.trends);
    };

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" gutterBottom>
                Trust Oracle Analytics Dashboard
            </Typography>
            
            <Grid container spacing={3}>
                {/* Trust Band Distribution */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Trust Band Distribution
                            </Typography>
                            {trustStats && (
                                <Doughnut 
                                    data={{
                                        labels: ['VERIFIED', 'TRUSTED', 'NEUTRAL', 'CAUTION', 'UNTRUSTED'],
                                        datasets: [{
                                            data: trustStats.distribution,
                                            backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9e9e9e']
                                        }]
                                    }}
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Policy Compliance Trends */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                A1-A7 Policy Compliance Trends
                            </Typography>
                            {policyTrends && (
                                <Line 
                                    data={{
                                        labels: policyTrends.dates,
                                        datasets: policyTrends.policies.map((policy, index) => ({
                                            label: policy.name,
                                            data: policy.scores,
                                            borderColor: \`hsl(\${index * 50}, 70%, 50%)\`,
                                            tension: 0.1
                                        }))
                                    }}
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
`;

console.log('🎨 Frontend Integration Examples Generated');
console.log('');
console.log('📋 Available Examples:');
console.log('1. Enhanced Demo Page with Trust Oracle');
console.log('2. Conversation Page with Trust Integration');  
console.log('3. Admin Dashboard with Trust Analytics');
console.log('');
console.log('💡 Copy these examples to integrate Trust Oracle into your existing frontend pages');
console.log('🔧 Modify the code to match your existing component structure and styling');
console.log('🎯 Focus on the TrustDashboard component integration patterns shown above');

module.exports = {
    enhancedDemoPageExample,
    conversationIntegrationExample,
    adminDashboardExample
};