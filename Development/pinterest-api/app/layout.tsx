import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PostCrafter - Visual Content Planner for Pinterest',
  description: 'PostCrafter is a professional Visual Content Planner application that helps users plan, preview, and publish Pinterest pins safely. Not a spam bot - every action requires explicit user consent. Create pins with live preview, manage boards, and optimize your Pinterest content strategy.',
  keywords: ['Pinterest', 'Content Planner', 'Pin Creator', 'Visual Content', 'Pinterest Tools', 'Social Media Management'],
  authors: [{ name: 'PostCrafter' }],
  openGraph: {
    title: 'PostCrafter - Visual Content Planner for Pinterest',
    description: 'Plan, preview, and publish your Pinterest pins safely. Professional content planning tool with live preview and explicit user consent for every action.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster 
            position="top-right" 
            richColors
            toastOptions={{
              className: 'font-medium',
              style: {
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}

