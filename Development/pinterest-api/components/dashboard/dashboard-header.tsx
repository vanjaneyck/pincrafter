"use client"

import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardHeader() {
  const { data: session } = useSession()

  return (
    <header className="w-full px-6 py-4 md:px-8 md:py-6 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="cursor-pointer">
            <Image
              src="/logo.svg"
              alt="PostCrafter"
              width={140}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>
        </div>
        <div className="flex items-center gap-6">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/privacy" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/terms" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Terms of Service
            </Link>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="text-slate-900 font-medium">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

