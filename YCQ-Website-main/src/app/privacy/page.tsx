import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - YCQ Sonate | Enterprise AI Trust Infrastructure',
  description: 'Privacy policy and data handling practices for YCQ Sonate AI trust infrastructure.',
  openGraph: {
    title: 'Privacy Policy - YCQ Sonate',
    description: 'Enterprise privacy controls for AI governance data',
  },
}

export default function PrivacyPage() {
  const lastUpdated = "January 15, 2025"

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-stone-300">
            Enterprise-grade privacy controls designed for regulated AI operations
          </p>
          <p className="text-stone-400 mt-4">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        
        {/* Overview */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Privacy by Design</h2>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-700 mb-6">
              YCQ Sonate is built with privacy as a foundational requirement. Our AI trust infrastructure 
              enables organizations to maintain regulatory compliance while preserving data privacy through 
              cryptographic techniques and minimal data collection.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Privacy Principles</h3>
                <ul className="space-y-2 text-stone-700">
                  <li>• Data minimization by design</li>
                  <li>• Purpose limitation enforcement</li>
                  <li>• Automated retention policies</li>
                  <li>• Privacy-preserving analytics</li>
                  <li>• Zero-knowledge proof capabilities</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Regulatory Alignment</h3>
                <ul className="space-y-2 text-stone-700">
                  <li>• GDPR Articles 6, 17, 25 compliance</li>
                  <li>• CCPA/CPRA data rights</li>
                  <li>• LGPD implementation</li>
                  <li>• PIPEDA requirements</li>
                  <li>• Industry-specific HIPAA considerations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Collection */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Data Collection & Processing</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-semibold text-stone-900 mb-4">What We Collect</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-stone-800 mb-2">Essential Operational Data</h4>
                  <ul className="text-sm text-stone-600 space-y-1">
                    <li>• AI interaction logs (for audit trails)</li>
                    <li>• Policy compliance metadata</li>
                    <li>• System performance metrics</li>
                    <li>• Security event logs</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-stone-800 mb-2">Customer-Provided Data</h4>
                  <ul className="text-sm text-stone-600 space-y-1">
                    <li>• Organizational policies and rules</li>
                    <li>• AI model configuration</li>
                    <li>• User access credentials</li>
                    <li>• Custom compliance frameworks</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-stone-800 mb-2">What We DON'T Collect</h4>
                  <ul className="text-sm text-stone-600 space-y-1">
                    <li>• Personal user content or conversations</li>
                    <li>• Training data from AI models</li>
                    <li>• Personal identifiers beyond what's necessary</li>
                    <li>• Behavioral analytics for marketing</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-semibold text-stone-900 mb-4">Data Processing Purposes</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-stone-800 mb-2">Primary Purposes</h4>
                  <ul className="text-sm text-stone-600 space-y-1">
                    <li>• Generate cryptographic audit trails</li>
                    <li>• Enforce compliance policies</li>
                    <li>• Monitor AI system behavior</li>
                    <li>• Provide regulatory reporting</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-stone-800 mb-2">Secondary Purposes</h4>
                  <ul className="text-sm text-stone-600 space-y-1">
                    <li>• System security and maintenance</li>
                    <li>• Performance optimization</li>
                    <li>• Customer support</li>
                    <li>• Legal compliance requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Data Retention & Deletion</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Retention Policies</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-700">Audit Trails</span>
                    <span className="text-stone-600">7 years (configurable)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-700">System Logs</span>
                    <span className="text-stone-600">90 days</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-700">Performance Metrics</span>
                    <span className="text-stone-600">1 year</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-700">Customer Configuration</span>
                    <span className="text-stone-600">Until termination</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-stone-700">Demo/Sandbox Data</span>
                    <span className="text-stone-600">24 hours</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Deletion Methods</h3>
                <ul className="text-stone-700 space-y-2">
                  <li>• <strong>Cryptographic Erasure:</strong> Secure key destruction</li>
                  <li>• <strong>Secure Wipe:</strong> 7-pass DoD 5220.22-M</li>
                  <li>• <strong>Automated Cleanup:</strong> Scheduled retention policies</li>
                  <li>• <strong>Right to be Forgotten:</strong> On-demand deletion</li>
                  <li>• <strong>Data Portability:</strong> Export before deletion</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Subject Rights */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Your Data Rights</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-700 mb-6">
              As an enterprise customer, you maintain full control over your data and can exercise 
              all applicable data subject rights under global privacy regulations.
            </p>
            
            <div className="space-y-4">
              {[
                {
                  right: "Right to Access",
                  description: "Export all data associated with your organization in machine-readable format"
                },
                {
                  right: "Right to Rectification", 
                  description: "Correct inaccurate or incomplete data in your audit trails and configurations"
                },
                {
                  right: "Right to Erasure",
                  description: "Request permanent deletion of your data with certified secure destruction"
                },
                {
                  right: "Right to Portability",
                  description: "Transfer your data and audit trails to other providers in standard formats"
                },
                {
                  right: "Right to Restrict Processing",
                  description: "Limit processing of specific data while maintaining essential operations"
                },
                {
                  right: "Right to Object",
                  description: "Object to processing based on legitimate interest with specific justifications"
                }
              ].map((item, index) => (
                <div key={index} className="border-l-4 border-stone-300 pl-4 py-2">
                  <h4 className="font-semibold text-stone-900">{item.right}</h4>
                  <p className="text-stone-600 text-sm mt-1">{item.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-stone-100 rounded-lg">
              <p className="text-stone-700 font-medium">
                To exercise these rights, contact: <span className="font-mono">privacy@yseeku.com</span>
              </p>
              <p className="text-sm text-stone-600 mt-2">
                We will respond within 30 days as required by applicable regulations.
              </p>
            </div>
          </div>
        </section>

        {/* International Transfers */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">International Data Transfers</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Data Residency</h3>
                <ul className="text-stone-700 space-y-2">
                  <li>• EU data centers for European customers</li>
                  <li>• US data centers for North American customers</li>
                  <li>• Asia-Pacific regional deployments</li>
                  <li>• Customer-controlled data location</li>
                  <li>• No cross-border transfers without consent</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Transfer Mechanisms</h3>
                <ul className="text-stone-700 space-y-2">
                  <li>• EU Standard Contractual Clauses (SCCs)</li>
                  <li>• Binding Corporate Rules (BCRs)</li>
                  <li>• Adequacy decisions where applicable</li>
                  <li>• Supplemental safeguards for high-risk transfers</li>
                  <li>• Customer-approved transfer documentation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Security Measures */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Security Measures for Privacy</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-semibold text-stone-900 mb-4">Technical Safeguards</h3>
              <ul className="text-sm text-stone-600 space-y-1">
                <li>• End-to-end encryption (AES-256-GCM)</li>
                <li>• Zero-knowledge proof implementations</li>
                <li>• Homomorphic encryption capabilities</li>
                <li>• Secure multi-party computation</li>
                <li>• Differential privacy techniques</li>
                <li>• Privacy-enhancing technologies (PETs)</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-semibold text-stone-900 mb-4">Organizational Safeguards</h3>
              <ul className="text-sm text-stone-600 space-y-1">
                <li>• Privacy Impact Assessments (PIAs)</li>
                <li>• Data Protection Officer (DPO) oversight</li>
                <li>• Privacy training for all staff</li>
                <li>• Regular privacy audits</li>
                <li>• Breach notification procedures</li>
                <li>• Vendor privacy assessments</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Cookies and Tracking */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Cookies & Tracking</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-700 mb-6">
              Our privacy-by-design approach extends to web tracking. We minimize data collection 
              and provide transparent controls.
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-stone-800 mb-2">Essential Cookies</h4>
                <ul className="text-sm text-stone-600">
                  <li>• Session management and security</li>
                  <li>• Authentication state maintenance</li>
                  <li>• Load balancing and security</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-stone-800 mb-2">Optional Cookies</h4>
                <ul className="text-sm text-stone-600">
                  <li>• Analytics (with anonymization)</li>
                  <li>• Preference storage</li>
                  <li>• Feature flags and A/B testing</li>
                </ul>
              </div>
              
              <div className="mt-4 p-4 bg-stone-100 rounded-lg">
                <p className="text-stone-700 text-sm">
                  <strong>No third-party tracking</strong> - We don't use advertising trackers, 
                  cross-site tracking, or sell data to third parties.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-stone-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Privacy Contact</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-stone-900 mb-2">Data Protection Officer</h3>
              <p className="text-stone-700">
                <span className="font-mono">dpo@yseeku.com</span>
              </p>
              <p className="text-sm text-stone-600 mt-1">For privacy concerns and rights requests</p>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 mb-2">General Privacy Inquiries</h3>
              <p className="text-stone-700">
                <span className="font-mono">privacy@yseeku.com</span>
              </p>
              <p className="text-sm text-stone-600 mt-1">For questions about this privacy policy</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}