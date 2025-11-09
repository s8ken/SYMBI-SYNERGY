import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - YCQ Sonate | Enterprise AI Trust Infrastructure',
  description: 'Terms of service and legal agreement for YCQ Sonate AI trust infrastructure platform.',
  openGraph: {
    title: 'Terms of Service - YCQ Sonate',
    description: 'Legal terms for enterprise AI trust infrastructure',
  },
}

export default function TermsPage() {
  const lastUpdated = "January 15, 2025"

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-stone-300">
            Legal agreement for YCQ Sonate AI trust infrastructure services
          </p>
          <p className="text-stone-400 mt-4">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        
        {/* Legal Notice */}
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Legal Notice:</strong> This is a template terms of service document. 
            For actual deployment, this should be reviewed by qualified legal counsel 
            and adapted to your specific business requirements and jurisdiction.
          </p>
        </div>

        {/* Agreement */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">1. Agreement to Terms</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-700 mb-4">
              By accessing and using YCQ Sonate ("the Service"), you agree to be bound by 
              these Terms of Service ("Terms"). If you are entering into this agreement on 
              behalf of a company or other legal entity, you represent that you have the 
              authority to bind such entity.
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-stone-900">Acceptance of Terms</h4>
                <p className="text-stone-600 text-sm">
                  Your use of the Service constitutes acceptance of these Terms, our 
                  Privacy Policy, and any other applicable policies.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Modifications</h4>
                <p className="text-stone-600 text-sm">
                  We reserve the right to modify these Terms at any time. Changes will be 
                  effective upon posting, with material changes communicated via email or 
                  Service notifications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Description */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">2. Service Description</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-700 mb-4">
              YCQ Sonate provides enterprise AI trust infrastructure services including:
            </p>
            
            <ul className="space-y-2 text-stone-700">
              <li>• <strong>Sonate Ledger:</strong> Cryptographic audit trails with Ed25519 signatures</li>
              <li>• <strong>Sonate Guardrails:</strong> Multi-model AI policy enforcement</li>
              <li>• <strong>Sonate Roundtable:</strong> Fairness-aware quality assurance</li>
              <li>• <strong>Compliance Reporting:</strong> Regulatory audit documentation</li>
              <li>• <strong>Trust Receipts:</strong> Verifiable cryptographic proofs of compliance</li>
            </ul>
            
            <div className="mt-4 p-4 bg-stone-50 rounded-lg">
              <p className="text-stone-600 text-sm">
                <strong>Service Availability:</strong> We strive for 99.9% uptime for paid services. 
                Demo and sandbox environments may have scheduled maintenance windows.
              </p>
            </div>
          </div>
        </section>

        {/* Customer Responsibilities */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">3. Customer Responsibilities</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-stone-900">Data Management</h4>
                <p className="text-stone-600 text-sm">
                  You are responsible for the accuracy, legality, and appropriateness of all 
                  data and AI models you process through the Service.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Access Control</h4>
                <p className="text-stone-600 text-sm">
                  You must maintain appropriate access controls for your user accounts and 
                  immediately notify us of any unauthorized access or security breaches.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Compliance</h4>
                <p className="text-stone-600 text-sm">
                  You are responsible for ensuring your use of AI systems complies with 
                  applicable laws, regulations, and industry standards.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Prohibited Uses</h4>
                <ul className="text-stone-600 text-sm space-y-1">
                  <li>• Use for illegal activities or content</li>
                  <li>• Reverse engineering or circumventing security controls</li>
                  <li>• Interference with Service operations or other customers</li>
                  <li>• Violation of AI provider terms of service</li>
                  <li>• Processing of prohibited content categories</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">4. Intellectual Property</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-stone-900">YCQ Sonate IP</h4>
                <p className="text-stone-600 text-sm">
                  We retain all rights to the Service, including software, algorithms, 
                  documentation, and trademarks. You receive a non-exclusive, non-transferable 
                  license to use the Service during your subscription period.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Customer Data</h4>
                <p className="text-stone-600 text-sm">
                  You retain ownership of all data you input into the Service. We only 
                  process your data as necessary to provide the Service and maintain 
                  audit trails as specified in our Privacy Policy.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Feedback</h4>
                <p className="text-stone-600 text-sm">
                  Any feedback, suggestions, or improvements you provide may be used by 
                  YCQ Sonate to improve the Service without obligation or compensation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Protection and Privacy */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">5. Data Protection and Privacy</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-700 mb-4">
              Our data processing practices are governed by our Privacy Policy, which forms 
              part of these Terms. Key provisions include:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-stone-900 mb-2">Data Processing</h4>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>• Processing only for Service delivery</li>
                  <li>• Encryption at rest and in transit</li>
                  <li>• Secure data deletion capabilities</li>
                  <li>• Audit trail maintenance</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900 mb-2">Your Rights</h4>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>• Data access and portability</li>
                  <li>• Correction and erasure requests</li>
                  <li>• Processing restriction options</li>
                  <li>• Automated decision-making safeguards</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Service Level and Availability */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">6. Service Level and Availability</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-stone-900">Uptime Commitment</h4>
                <p className="text-stone-600 text-sm">
                  Paid services are covered by a 99.9% monthly uptime guarantee, excluding 
                  scheduled maintenance and force majeure events.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Service Credits</h4>
                <p className="text-stone-600 text-sm">
                  If we fail to meet our uptime commitment, you may be eligible for service 
                  credits as detailed in our Service Level Agreement (SLA).
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Maintenance Windows</h4>
                <p className="text-stone-600 text-sm">
                  Scheduled maintenance is performed during off-peak hours with at least 
                  72 hours notice. Emergency maintenance may be performed without notice 
                  for critical security or stability issues.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Confidentiality */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">7. Confidentiality</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-700 mb-4">
              Both parties agree to maintain confidentiality of information marked as 
              confidential or that should reasonably be understood as confidential.
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-stone-900">Our Confidential Information</h4>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>• Service architecture and source code</li>
                  <li>• Business plans and financial information</li>
                  <li>• Customer lists and pricing</li>
                  <li>• Trade secrets and proprietary algorithms</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Your Confidential Information</h4>
                <ul className="text-sm text-stoke-600 space-y-1">
                  <li>• AI models and training data</li>
                  <li>• Business processes and workflows</li>
                  <li>• Customer and user data</li>
                  <li>• Proprietary algorithms and IP</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Liability and Limitation */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">8. Liability and Limitation</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-stone-900">Service Disclaimer</h4>
                <p className="text-stone-600 text-sm">
                  The Service is provided "as is" without warranties of any kind. We do not 
                  guarantee that the Service will meet your specific requirements or be 
                  error-free.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Limitation of Liability</h4>
                <p className="text-stone-600 text-sm">
                  Our total liability for any claim related to the Service shall not exceed 
                  the fees paid by you in the 12 months preceding the claim. We are not 
                  liable for indirect, incidental, or consequential damages.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">AI-Specific Limitations</h4>
                <p className="text-stone-600 text-sm">
                  We are not responsible for the outputs or decisions made by AI systems 
                  monitored through our Service. You remain responsible for AI system 
                  validation and human oversight as required by regulations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Term and Termination */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">9. Term and Termination</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-stone-900">Subscription Term</h4>
                <p className="text-stone-600 text-sm">
                  Paid subscriptions are typically annual unless otherwise specified in your 
                  service agreement. The term automatically renews unless cancelled.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Termination for Cause</h4>
                <p className="text-stone-600 text-sm">
                  Either party may terminate for material breach with 30 days notice to cure. 
                  We may terminate immediately for illegal use or security violations.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Data Export</h4>
                <p className="text-stone-600 text-sm">
                  Upon termination, you have 30 days to export your data. After this period, 
                  data will be securely deleted according to our retention policies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Governing Law */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">10. Governing Law and Dispute Resolution</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-700 mb-4">
              These Terms are governed by the laws of [Jurisdiction] without regard to 
              conflict of law principles. Disputes will be resolved through binding 
              arbitration in [City], [Jurisdiction].
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-stone-900">Arbitration</h4>
                <p className="text-stone-600 text-sm">
                  Disputes will be resolved through confidential arbitration under the rules 
                  of [Arbitration Organization], with the possibility of class action waivers.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-900">Jurisdiction-Specific Rights</h4>
                <p className="text-stone-600 text-sm">
                  Nothing in these Terms limits your statutory rights that cannot be 
                  contracted away under applicable law.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-stone-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-stone-900 mb-2">Legal Inquiries</h3>
              <p className="text-stone-700">
                <span className="font-mono">legal@yseeku.com</span>
              </p>
              <p className="text-sm text-stone-600 mt-1">For questions about these Terms</p>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 mb-2">General Support</h3>
              <p className="text-stone-700">
                <span className="font-mono">support@yseeku.com</span>
              </p>
              <p className="text-sm text-stone-600 mt-1">For service-related issues</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}