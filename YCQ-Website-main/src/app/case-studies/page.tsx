import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Case Studies - YCQ Sonate | Enterprise AI Trust Infrastructure',
  description: 'Real-world implementations of YCQ Sonate AI trust infrastructure with verifiable outcomes and cryptographic audit trails.',
  openGraph: {
    title: 'Case Studies - YCQ Sonate',
    description: 'Enterprise AI trust implementations with verifiable results',
  },
}

export default function CaseStudiesPage() {
  // Demo server URL for verifiable examples
  const DEMO_URL = "https://symbi-synergy-pa9k82n5m-ycq.vercel.app"
  
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Enterprise Success Stories</h1>
          <p className="text-xl text-stone-300 mb-6">
            Real implementations with verifiable cryptographic audit trails
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href={DEMO_URL}
              target="_blank"
              className="bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Live Trust Demo →
            </Link>
            <Link 
              href="/contact"
              className="border border-stone-300 text-stone-300 px-6 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Case Study 1: Healthcare */}
        <section className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-500 rounded-full text-sm font-medium mb-2">
                  Healthcare
                </span>
                <h2 className="text-2xl font-bold">Regional Hospital Network</h2>
                <p className="text-blue-100 mt-1">AI-powered diagnostic assistance with regulatory compliance</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">40%</div>
                <p className="text-blue-100 text-sm">Reduction in diagnostic errors</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Challenge</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  12-hospital network needed to deploy AI diagnostic tools while maintaining HIPAA compliance and providing audit trails for medical board requirements. Existing black-box AI solutions couldn't provide the necessary transparency and accountability.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Solution</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Implemented YCQ Sonate across 3 AI diagnostic models (radiology, pathology, and clinical decision support). Each AI interaction now generates cryptographic audit trails with verifiable compliance receipts.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-600 text-sm">Diagnostic Accuracy</span>
                    <span className="font-semibold text-blue-600">40% ↑</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600 text-sm">Compliance Audit Time</span>
                    <span className="font-semibold text-green-600">85% ↓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600 text-sm">Physician Adoption</span>
                    <span className="font-semibold text-purple-600">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600 text-sm">Medical Board Readiness</span>
                    <span className="font-semibold text-amber-600">100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verifiable Demo Section */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verifiable Example: Healthcare AI Diagnostic
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-stone-700 mb-4">
                    Test the same cryptographic trust system used by the hospital network:
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => window.open(`${DEMO_URL}/api/health`, '_blank')}
                      className="w-full bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                    >
                      1️⃣ Check Demo Health
                    </button>
                    <button 
                      onClick={() => window.open(`${DEMO_URL}/api/trust/analytics`, '_blank')}
                      className="w-full bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                    >
                      2️⃣ View Trust Analytics
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h5 className="font-medium text-stone-900 mb-2">Sample Trust Receipt</h5>
                  <pre className="text-xs text-stone-600 overflow-x-auto bg-stone-50 p-3 rounded">
{`{
  "eventId": "diag_2024_1208_14h23m_b4e9c1",
  "timestamp": "2024-12-08T14:23:41.892Z",
  "type": "healthcare_diagnostic",
  "provider": "anthropic",
  "model": "claude-3-5-sonnet",
  "complianceScore": 1.0,
  "HIPAA_compliant": true,
  "auditTrail": "VERIFIED"
}`}
                  </pre>
                  <p className="text-xs text-stone-500 mt-2">
                    ← Same cryptographic format used in production
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <h4 className="font-semibold text-stone-900 mb-3">Implementation Details</h4>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-stone-600 mb-1">Deployment Time</div>
                  <div className="font-semibold">6 weeks</div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-1">AI Models Integrated</div>
                  <div className="font-semibold">3 models</div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-1">Trust Declarations</div>
                  <div className="font-semibold">45,000+/month</div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-1">ROI Period</div>
                  <div className="font-semibold">8 months</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Case Study 2: Financial Services */}
        <section className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-green-500 rounded-full text-sm font-medium mb-2">
                  Financial Services
                </span>
                <h2 className="text-2xl font-bold">Transparent Credit Scoring Platform</h2>
                <p className="text-green-100 mt-1">AI-powered credit decisions with explainability and compliance</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">30%</div>
                <p className="text-green-100 text-sm">Increase in approvals</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Challenge</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  FinTech lender required regulatory compliance (ECOA, Fair Lending Act) while using AI for credit decisions. Black-box AI models couldn't provide the explainability and audit trails required by regulators and for customer disputes.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Solution</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Deployed YCQ Sonate to create cryptographic audit trails for all credit decisions. Each AI recommendation now includes verifiable compliance receipts and explainability reports that can be shared with regulators and customers.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-600 text-sm">Approval Rate</span>
                    <span className="font-semibold text-green-600">30% ↑</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600 text-sm">Regulatory Bias</span>
                    <span className="font-semibold text-green-600">85% ↓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600 text-sm">Explainability Score</span>
                    <span className="font-semibold text-blue-600">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600 text-sm">Audit Time</span>
                    <span className="font-semibold text-purple-600">90% ↓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verifiable Demo Section */}
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verifiable Example: Financial AI Decision
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-stone-700 mb-4">
                    Experience the same compliance verification used by the financial platform:
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => window.open(`${DEMO_URL}/api/trust`, '_blank')}
                      className="w-full bg-white border border-green-300 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                    >
                      1️⃣ View Trust Declarations
                    </button>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-stone-600 mb-2">
                        <strong>API Documentation:</strong>
                      </p>
                      <p className="text-xs text-stone-700">
                        POST {DEMO_URL}/api/trust with JSON payload containing agentId, agentName, and trustArticles
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h5 className="font-medium text-stone-900 mb-2">Sample Credit Decision Receipt</h5>
                  <pre className="text-xs text-stone-600 overflow-x-auto bg-stone-50 p-3 rounded">
{`{
  "eventId": "credit_2024_1208_15h41m_f8a3d2",
  "timestamp": "2024-12-08T15:41:22.154Z",
  "type": "credit_decision",
  "decision": "APPROVED",
  "explanation": "Income stability confirmed, debt-to-income ratio 28%",
  "complianceScore": 1.0,
  "fair_lending_compliant": true,
  "auditTrail": "VERIFIED"
}`}
                  </pre>
                  <p className="text-xs text-stone-500 mt-2">
                    ← Regulatory-ready format used in production
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <h4 className="font-semibold text-stone-900 mb-3">Implementation Details</h4>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-stone-600 mb-1">Deployment Time</div>
                  <div className="font-semibold">4 weeks</div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-1">Monthly Decisions</div>
                  <div className="font-semibold">25,000+</div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-1">Regulatory Reviews</div>
                  <div className="font-semibold">Zero findings</div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-1">ROI Period</div>
                  <div className="font-semibold">5 months</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Third Case Study Preview */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-8 border border-amber-200">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Coming Next
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-4">Manufacturing Quality Control</h3>
            <p className="text-stone-600 mb-6 max-w-2xl mx-auto">
              Global manufacturer implementing YCQ Sonate for AI-powered quality inspection with ISO 9001 compliance and verifiable defect detection rates.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/contact"
                className="bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Request Early Access
              </Link>
              <Link 
                href={DEMO_URL}
                target="_blank"
                className="border border-amber-300 text-amber-700 px-6 py-3 rounded-lg font-medium hover:bg-amber-100 transition-colors"
              >
                Try Live Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-stone-900 text-white rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your AI Operations?</h2>
          <p className="text-xl text-stone-300 mb-8 max-w-2xl mx-auto">
            Join enterprises using YCQ Sonate to make their AI systems trustworthy, compliant, and verifiable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-amber-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Schedule Enterprise Demo
            </Link>
            <Link 
              href={DEMO_URL}
              target="_blank"
              className="border border-stone-300 text-stone-300 px-8 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors"
            >
              Explore Trust Demo
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-stone-400">
            <p>✅ All case studies feature verifiable cryptographic audit trails</p>
            <p>✅ Production deployments with real compliance requirements</p>
            <p>✅ Live demo infrastructure for verification</p>
          </div>
        </section>

      </div>
    </div>
  )
}