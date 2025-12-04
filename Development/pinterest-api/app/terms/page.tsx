import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Terms of Service - PostCrafter',
  description: 'PostCrafter Terms of Service - Usage terms and conditions',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="w-full px-6 py-4 md:px-8 md:py-6 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="PostCrafter"
              width={140}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>
          <Link href="/dashboard" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
            Dashboard
          </Link>
        </div>
      </header>
      
      <div className="max-w-3xl mx-auto px-6 py-12 md:px-8 md:py-16">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12 prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-sm text-slate-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                By accessing and using PostCrafter ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
              </p>
              <p className="text-slate-700 leading-relaxed">
                PostCrafter is a Visual Content Planner application designed to help users plan, preview, and publish content to Pinterest. It is <strong>not</strong> a spam bot or automated posting tool.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                PostCrafter provides the following services:
              </p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Visual content planning and preview for Pinterest pins</li>
                <li>Pin creation with user approval and explicit consent</li>
                <li>Board management and selection</li>
                <li>Metadata extraction from URLs for quick content filling</li>
                <li>Live preview of pins before publishing</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                All actions require explicit user consent. We do not perform automated actions without your direct approval.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Pinterest API Usage</h2>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">3.1 Compliance with Pinterest Guidelines</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                PostCrafter complies with Pinterest Developer Guidelines and API Terms of Service:
              </p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>We only request necessary permissions (boards:read, boards:write, pins:read, pins:write, user_accounts:read)</li>
                <li>All pin creations require explicit user action and approval</li>
                <li>We respect Pinterest rate limits and API guidelines</li>
                <li>We do not perform bulk or automated posting</li>
                <li>We do not store or share Pinterest data with third parties</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mb-3 mt-6">3.2 User Responsibilities</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Ensuring all content you create complies with Pinterest's Terms of Service</li>
                <li>Verifying that you have rights to use any images or content you upload</li>
                <li>Not using the Service for spam, harassment, or illegal activities</li>
                <li>Respecting Pinterest's community guidelines</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">4. User Accounts and Authentication</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                To use PostCrafter, you must authenticate with your Pinterest account through OAuth 2.0. By authenticating, you grant us permission to:
              </p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Read your Pinterest boards</li>
                <li>Create pins on your behalf (only with your explicit approval)</li>
                <li>Access your basic account information (username, profile image)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                You can revoke access at any time through your Pinterest account settings or by logging out of PostCrafter.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Prohibited Uses</h2>
              <p className="text-slate-700 leading-relaxed mb-4">You agree not to use PostCrafter to:</p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Create spam or unwanted content</li>
                <li>Violate Pinterest's Terms of Service or Community Guidelines</li>
                <li>Post copyrighted material without permission</li>
                <li>Engage in any illegal activities</li>
                <li>Attempt to circumvent rate limits or API restrictions</li>
                <li>Use the Service for bulk or automated posting without user oversight</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Intellectual Property</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                The Service and its original content, features, and functionality are owned by PostCrafter and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Content you create using PostCrafter remains your property. We do not claim ownership of pins or content you create through our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Service Availability</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We strive to provide reliable service, but we do not guarantee:
              </p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Uninterrupted or error-free service</li>
                <li>Immediate availability of all features</li>
                <li>Compatibility with all Pinterest API changes</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue the Service at any time with or without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                PostCrafter is provided "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Any loss or damage resulting from your use of the Service</li>
                <li>Pinterest API changes or service interruptions</li>
                <li>Content you create or publish through the Service</li>
                <li>Third-party actions or services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Rate Limiting and API Usage</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We respect Pinterest API rate limits. If you encounter rate limiting:
              </p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Wait before making additional requests</li>
                <li>Reduce the frequency of your actions</li>
                <li>Contact us if you believe there is an issue</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                We implement retry logic with exponential backoff to handle rate limits gracefully.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Termination</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may terminate or suspend your access to the Service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
              <p className="text-slate-700 leading-relaxed">
                You may terminate your use of the Service at any time by logging out and revoking access through your Pinterest account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">11. Changes to Terms</h2>
              <p className="text-slate-700 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">12. Contact Information</h2>
              <p className="text-slate-700 leading-relaxed">
                If you have questions about these Terms of Service, please review our <Link href="/privacy" className="text-pinterest-red hover:underline">Privacy Policy</Link> or contact us through the Pinterest Developer Portal.
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-slate-200">
              <Link href="/dashboard" className="text-pinterest-red hover:underline font-medium">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full px-6 py-6 md:px-8 md:py-8 border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors font-medium">
                Privacy Policy
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/terms" className="hover:text-slate-900 transition-colors font-medium">
                Terms of Service
              </Link>
            </div>
            <p className="text-xs text-slate-500 text-center">
              This app is not affiliated with Pinterest.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

