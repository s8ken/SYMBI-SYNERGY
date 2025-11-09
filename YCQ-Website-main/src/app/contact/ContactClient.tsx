'use client'

import { useState } from 'react'
// Using SVG icons instead of lucide-react to avoid dependency issues

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    useCase: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate with actual contact handling
    console.log('Contact form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="bg-stone-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contact YCQ Sonate
          </h1>
          <p className="text-xl text-stone-300">
            Enterprise AI trust infrastructure with cryptographic audit trails
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-stone-900 mb-6">
              Schedule a Consultation
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-stone-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-stone-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-stone-700 mb-2">
                    Your Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  >
                    <option value="">Select your role</option>
                    <option value="c-level">C-Level Executive</option>
                    <option value="vp">VP/Director</option>
                    <option value="engineering">Engineering Lead</option>
                    <option value="compliance">Compliance/Risk</option>
                    <option value="legal">Legal Counsel</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="useCase" className="block text-sm font-medium text-stone-700 mb-2">
                  Primary Use Case
                </label>
                <select
                  id="useCase"
                  name="useCase"
                  value={formData.useCase}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                >
                  <option value="">Select primary interest</option>
                  <option value="compliance">Regulatory Compliance (EU AI Act, GDPR)</option>
                  <option value="audit">Audit & Compliance Documentation</option>
                  <option value="guardrails">AI Guardrails & Policy Enforcement</option>
                  <option value="fairness">Fairness & Bias Monitoring</option>
                  <option value="enterprise">Enterprise AI Governance</option>
                  <option value="evaluation">Technical Evaluation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your AI trust infrastructure needs..."
                  className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 text-white py-3 px-6 rounded-md hover:bg-stone-800 transition-colors font-medium"
              >
                Schedule Consultation
              </button>
              
              <p className="text-sm text-stone-500 text-center">
                We'll respond within 24 hours to schedule your demo
              </p>
            </form>
          </div>

          {/* Information Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-6">
                Why Enterprise Teams Choose YCQ Sonate
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-stone-900 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-1">
                      Cryptographic Trust Infrastructure
                    </h3>
                    <p className="text-stone-600">
                      Real-time audit trails with Ed25519 signatures and SHA-256 integrity verification. 
                      Turn AI governance from policy into provable mathematics.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-stone-900 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-1">
                      Enterprise-Ready Implementation
                    </h3>
                    <p className="text-stone-600">
                      18,000+ lines of production code, 95% test coverage, and designed for 
                      multi-model AI operations at scale.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-stone-900 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-1">
                      Regulatory Alignment
                    </h3>
                    <p className="text-stone-600">
                      Built for EU AI Act compliance with mapped Articles 13, 14, and 61. 
                      GDPR-aligned data handling with audit-ready documentation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-stone-100 p-6 rounded-lg">
              <h3 className="font-semibold text-stone-900 mb-4">Direct Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-stone-700">contact@yseeku.com</span>
                </div>
                <div className="text-sm text-stone-600 mt-4">
                  <p className="mb-2"><strong>Response Time:</strong> Within 24 hours</p>
                  <p><strong>Demo Availability:</strong> Weekdays, 9 AM - 5 PM PST</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-semibold text-stone-900 mb-4">Quick Access</h3>
              <div className="space-y-2">
                <a href="/demo" className="block text-stone-700 hover:text-stone-900">
                  → Try Trust Ledger Demo
                </a>
                <a href="/metrics-methodology" className="block text-stone-700 hover:text-stone-900">
                  → View Metrics Methodology
                </a>
                <a href="/verifier.html" className="block text-stone-700 hover:text-stone-900">
                  → Verify Trust Receipts
                </a>
                <a href="/technology" className="block text-stone-700 hover:text-stone-900">
                  → Technology Overview
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}