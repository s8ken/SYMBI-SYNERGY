import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-stone-800">YCQ</div>
              <div className="ml-2 text-sm text-stone-600">Y Seek U</div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="/solutions" className="text-stone-700 hover:text-stone-900 px-3 py-2 text-sm font-medium">
                  Solutions
                </Link>
                <Link href="/case-studies" className="text-stone-700 hover:text-stone-900 px-3 py-2 text-sm font-medium">
                  Case Studies
                </Link>
                <Link href="/risk-assessment" className="text-stone-700 hover:text-stone-900 px-3 py-2 text-sm font-medium">
                  Risk Assessment
                </Link>
                <Link href="/contact" className="bg-stone-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-stone-900">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-stone-900 mb-6">
              Enterprise AI Implementation
              <span className="block text-amber-700">Done Right</span>
            </h1>
            <p className="text-xl text-stone-600 mb-8 max-w-3xl mx-auto">
              Navigate AI adoption risks with confidence. SYMBI provides transparent, 
              accountable AI solutions that protect your business while delivering results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment" className="bg-stone-800 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-stone-900 transition-colors">
                Start Risk Assessment
              </Link>
              <Link href="/demo" className="border border-stone-300 text-stone-700 px-8 py-3 rounded-md text-lg font-medium hover:bg-stone-50 transition-colors">
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Highlights Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">
              AI Implementation Risks Are Real
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Without proper oversight, AI systems can expose your business to significant risks. 
              SYMBI provides the transparency and accountability you need.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-stone-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Bias & Discrimination</h3>
              <p className="text-stone-600">
                AI systems can perpetuate harmful biases, leading to unfair treatment and legal liability.
              </p>
            </div>
            
            <div className="bg-stone-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Data Privacy Breaches</h3>
              <p className="text-stone-600">
                Inadequate data handling can expose sensitive information and violate privacy regulations.
              </p>
            </div>
            
            <div className="bg-stone-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Lack of Accountability</h3>
              <p className="text-stone-600">
                Black-box AI systems make it impossible to understand or justify critical business decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SYMBI Solution Section */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">
              SYMBI: Transparent AI You Can Trust
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Our sovereign AI platform provides complete transparency, auditability, 
              and accountability for enterprise AI implementations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-6">Complete Transparency</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Audit Trail</h4>
                    <p className="text-stone-600">Every AI decision is logged and traceable</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Explainable Decisions</h4>
                    <p className="text-stone-600">Understand exactly how and why decisions are made</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Independent Oversight</h4>
                    <p className="text-stone-600">Third-party validation of AI behavior and outcomes</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-stone-900 mb-4">Risk Mitigation Dashboard</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Bias Detection</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Privacy Compliance</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">GDPR Ready</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Decision Auditability</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">100% Tracked</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Performance Monitoring</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">Real-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Implement AI Safely?
          </h2>
          <p className="text-xl text-stone-300 mb-8 max-w-2xl mx-auto">
            Start with a comprehensive risk assessment and discover how SYMBI 
            can protect your business while unlocking AI's potential.
          </p>
          <Link href="/assessment" className="bg-amber-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-amber-700 transition-colors">
            Get Your Free Risk Assessment
          </Link>
        </div>
      </section>
    </div>
  );
}
