"use client"

import Link from 'next/link'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const handleSignIn = () => {
    signIn('pinterest', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 md:px-8 md:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="PostCrafter"
              width={140}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </div>
          <button 
            onClick={handleSignIn}
            className="px-4 py-2 text-slate-900 font-medium hover:text-slate-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Plan, Preview, Publish to Pinterest
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            The safest way to draft and optimize your pins before going live.
          </p>
          <button 
            onClick={handleSignIn}
            className="bg-pinterest-red hover:bg-[#d50e22] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Start for Free
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-6 md:px-8 md:py-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
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

