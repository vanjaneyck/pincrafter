import { NextResponse } from 'next/server'

export async function GET() {
  // Check environment variables
  const envCheck = {
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
    PINTEREST_CLIENT_ID: !!process.env.PINTEREST_CLIENT_ID,
    PINTEREST_CLIENT_SECRET: !!process.env.PINTEREST_CLIENT_SECRET,
    PINTEREST_API_ENV: process.env.PINTEREST_API_ENV || 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set',
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: envCheck,
    message: 'Health check endpoint - check environment variables above',
  })
}

