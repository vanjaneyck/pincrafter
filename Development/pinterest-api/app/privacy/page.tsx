import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Privacy Policy - PostCrafter',
  description: 'PostCrafter Privacy Policy - How we handle your data',
}

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-8">PostCrafter Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-sm text-slate-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                PostCrafter ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Visual Content Planner application for Pinterest.
              </p>
              <p className="text-slate-700 leading-relaxed">
                By using PostCrafter, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Information We Collect</h2>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">2.1 Pinterest Account Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                When you authenticate with Pinterest through our application, we receive the following information:
              </p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Your Pinterest username</li>
                <li>Your Pinterest profile image</li>
                <li>Access tokens for Pinterest API (stored securely in your session)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                We do <strong>not</strong> collect your email address or any other personal information from Pinterest.
              </p>

              <h3 className="text-lg font-semibold text-slate-800 mb-3 mt-6">2.2 Usage Data</h3>
              <p className="text-slate-700 leading-relaxed">
                We may collect information about how you use our application, including the pins you create, boards you access, and features you use. This data is used solely to improve our service and is not shared with third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Provide and maintain our Visual Content Planner service</li>
                <li>Authenticate you with Pinterest API</li>
                <li>Create and manage pins on your behalf (only with your explicit consent)</li>
                <li>Retrieve your Pinterest boards for selection</li>
                <li>Improve our application and user experience</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                <strong>Important:</strong> We do <strong>not</strong> use your information for automated actions without your explicit consent. Every pin creation requires your direct action and approval.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Data Storage and Security</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Your Pinterest access tokens are stored securely in encrypted sessions on our servers. We use industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>HTTPS encryption for all data transmission</li>
                <li>Secure session management</li>
                <li>Environment variables for sensitive credentials</li>
                <li>No permanent storage of access tokens</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                Access tokens are automatically invalidated when you log out or when your session expires.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>We do not sell, trade, or rent your personal information to third parties.</strong>
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                We only share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li><strong>Pinterest API:</strong> We use your access tokens to interact with Pinterest API on your behalf, as authorized by you</li>
                <li><strong>Legal Requirements:</strong> If required by law or to protect our rights</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                Your Pinterest data is used exclusively to provide services to you and is never shared with third parties for marketing or other purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Your Rights</h2>
              <p className="text-slate-700 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Access your personal information</li>
                <li>Request deletion of your data</li>
                <li>Revoke Pinterest API access at any time through Pinterest settings</li>
                <li>Log out and end your session at any time</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                To revoke access, you can log out of PostCrafter or revoke access through your Pinterest account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Pinterest API Compliance</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                PostCrafter complies with Pinterest Developer Guidelines:
              </p>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>We only request necessary permissions (boards:read, boards:write, pins:read, pins:write, user_accounts:read)</li>
                <li>All actions require explicit user consent</li>
                <li>We do not perform automated actions without user approval</li>
                <li>We respect Pinterest rate limits and API guidelines</li>
                <li>We do not store or share Pinterest data with third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Cookies and Session Data</h2>
              <p className="text-slate-700 leading-relaxed">
                We use secure session cookies to maintain your authentication state. These cookies are essential for the application to function and are automatically deleted when you log out or when your session expires.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-slate-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Contact Us</h2>
              <p className="text-slate-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us through your Pinterest Developer Portal or review our <Link href="/terms" className="text-pinterest-red hover:underline">Terms of Service</Link>.
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

