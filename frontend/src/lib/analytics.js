// From javascript_google_analytics integration - Enterprise analytics for SYMBI platform
// Define the gtag function globally for TypeScript (this is a JS file, so declaration is in comments)
// Global gtag function will be available after script loads

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: REACT_APP_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
};

// Track page views - useful for single-page applications
export const trackPageView = (url) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events for enterprise demo analytics
export const trackEvent = (
  action, 
  category, 
  label, 
  value
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// SYMBI-specific analytics events for enterprise demo
export const trackAgentInteraction = (agentId, action, details = {}) => {
  trackEvent('agent_interaction', 'agent', `${action}_${agentId}`, details.duration);
};

export const trackBondingRitual = (step, agentId, success = true) => {
  trackEvent('bonding_ritual', 'trust_building', `${step}_${agentId}`, success ? 1 : 0);
};

export const trackContextBridge = (action, source, target) => {
  trackEvent('context_bridge', 'knowledge_sharing', `${action}_${source}_${target}`);
};

export const trackComplianceCheck = (result, trustScore, agentId) => {
  trackEvent('compliance_check', 'governance', `${result}_${agentId}`, Math.round(trustScore * 100));
};