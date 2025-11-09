import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security - YCQ Sonate | Enterprise AI Trust Infrastructure',
  description: 'Security controls, threat model, and compliance measures for YCQ Sonate AI trust infrastructure.',
  openGraph: {
    title: 'Security - YCQ Sonate',
    description: 'Enterprise-grade security for AI trust infrastructure',
  },
}

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Security & Trust</h1>
          <p className="text-xl text-stone-300">
            Enterprise-grade security controls designed for regulated AI operations
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        
        {/* Security Overview */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Security Architecture</h2>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-700 mb-6">
              YCQ Sonate is built on a zero-trust architecture with defense-in-depth principles. 
              Our security model addresses the unique challenges of AI governance and audit trail integrity.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Core Security Principles</h3>
                <ul className="space-y-2 text-stone-700">
                  <li>• Cryptographic integrity with Ed25519 signatures</li>
                  <li>• Immutable hash-chained audit trails</li>
                  <li>• Zero-knowledge proof capabilities</li>
                  <li>• End-to-end encryption for sensitive data</li>
                  <li>• Principle of least privilege enforcement</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Compliance Framework</h3>
                <ul className="space-y-2 text-stone-700">
                  <li>• EU AI Act Articles 13, 14, 61 alignment</li>
                  <li>• GDPR Articles 6, 17, 25 compliance</li>
                  <li>• ISO 42001 AI Management System ready</li>
                  <li>• SOC 2 Type II controls framework</li>
                  <li>• NIST AI RMF implementation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Controls */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Technical Security Controls</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-semibold text-stone-900 mb-4">Data Protection</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-stone-800 mb-2">Encryption</h4>
                  <ul className="text-sm text-stone-600 space-y-1">
                    <li>• AES-256-GCM at rest (MongoDB)</li>
                    <li>• TLS 1.3 in transit (mTLS available)</li>
                    <li>• SHA-256 for data integrity</li>
                    <li>• Ed25519 for signatures</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-stone-800 mb-2">Key Management</h4>
                  <ul className="text-sm text-stone-600 space-y-1">
                    <li>• HSM-backed key storage (production)</li>
                    <li>• Automated key rotation (90 days)</li>
                    <li>• Split-knowledge key recovery</li>
                    <li>• Zero-knowledge encryption options</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-semibold text-stone-900 mb-4">Access Control</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-stone-800 mb-2">Authentication</h4>
                  <ul className="text-sm text-stone-600 space-y-1">
                    <li>• OAuth 2.0 / OpenID Connect</li>
                    <li>• Multi-factor authentication (MFA)</li>
                    <li>• SAML 2.0 enterprise SSO</li>
                    <li>• JWT with RS256 signatures</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-stone-800 mb-2">Authorization</h4>
                  <ul className="text-sm text-stone-600 space-y-1">
                    <li>• Role-Based Access Control (RBAC)</li>
                    <li>• Attribute-Based Access Control (ABAC)</li>
                    <li>• Just-in-time access provisioning</li>
                    <li>• Privileged Access Management (PAM)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-semibold text-stone-900 mb-4">Infrastructure Security</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-stone-800 mb-2">Network Security</h4>
                  <ul className="text-sm text-stone-600 space-y-1">
                    <li>• VPC isolation with private subnets</li>
                    <li>• Web Application Firewall (WAF)</li>
                    <li>• DDoS protection (Cloudflare)</li>
                    <li>• Network segmentation and microservices</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-stone-800 mb-2">Monitoring & Detection</h4>
                  <ul className="text-sm text-stone-600 space-y-1">
                    <li>• 24/7 security monitoring</li>
                    <li>• SIEM integration</li>
                    <li>• Anomaly detection with AI</li>
                    <li>• Real-time alerting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Threat Model */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Threat Model & Mitigations</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-700 mb-6">
              Our threat model addresses the unique risks of AI governance systems, focusing on 
              audit trail integrity and unauthorized model access.
            </p>
            
            <div className="space-y-4">
              {[
                {
                  threat: "Audit Trail Tampering",
                  impact: "High",
                  mitigations: ["Immutable hash chains", "Ed25519 signatures", "Distributed ledger verification"]
                },
                {
                  threat: "Unauthorized Model Access",
                  impact: "Critical",
                  mitigations: ["Policy enforcement gateway", "Real-time monitoring", "Automatic access revocation"]
                },
                {
                  threat: "Data Privacy Violations",
                  impact: "High", 
                  mitigations: ["Zero-knowledge proofs", "Data minimization", "Automated retention policies"]
                },
                {
                  threat: "Bias/Fairness Manipulation",
                  impact: "Medium",
                  mitigations: ["Cryptographic fairness metrics", "Independent verification", "Transparency reports"]
                },
                {
                  threat: "Supply Chain Attacks",
                  impact: "High",
                  mitigations: ["Signed containers", "SBOM verification", "Third-party security audits"]
                }
              ].map((item, index) => (
                <div key={index} className="border-l-4 border-stone-300 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-stone-900">{item.threat}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.impact === 'Critical' ? 'bg-red-100 text-red-800' :
                      item.impact === 'High' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.impact} Impact
                    </span>
                  </div>
                  <div className="text-sm text-stone-600">
                    <strong>Mitigations:</strong> {item.mitigations.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Incident Response */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Incident Response</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Response SLAs</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-stone-700">Critical Security Incident</span>
                    <span className="font-medium text-red-600">&lt; 1 hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-700">High Priority</span>
                    <span className="font-medium text-orange-600">&lt; 4 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-700">Medium Priority</span>
                    <span className="font-medium text-yellow-600">&lt; 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-700">Low Priority</span>
                    <span className="font-medium text-stone-600">&lt; 72 hours</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">24/7 Security Operations</h3>
                <ul className="text-stone-700 space-y-2">
                  <li>• Dedicated security team</li>
                  <li>• Automated threat detection</li>
                  <li>• Incident containment procedures</li>
                  <li>• Forensic investigation capabilities</li>
                  <li>• Regulatory breach notification</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Security Certifications & Audits</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">SOC 2 Type II</h3>
              <p className="text-sm text-stone-600">In progress - Q2 2025</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">ISO 27001</h3>
              <p className="text-sm text-stone-600">Implementation in progress</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Annual Pentests</h3>
              <p className="text-sm text-stone-600">Third-party security assessments</p>
            </div>
          </div>
        </section>

        {/* Responsible Disclosure */}
        <section className="bg-stone-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Responsible Disclosure</h2>
          <p className="text-stone-700 mb-4">
            We welcome responsible security disclosures from the security research community. 
            If you discover a security vulnerability, please report it to us directly.
          </p>
          <div className="bg-white p-4 rounded border border-stone-200">
            <p className="font-mono text-stone-800">security@yseeku.com</p>
          </div>
          <p className="text-sm text-stone-600 mt-4">
            We commit to responding within 48 hours and working with researchers to responsibly disclose findings.
          </p>
        </section>
      </div>
    </div>
  )
}