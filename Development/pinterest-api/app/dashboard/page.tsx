import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/config'
import { getBoards, type Board } from '@/app/actions/pinterest'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import PinEditor from '@/components/dashboard/pin-editor'
import CreateBoardButton from '@/components/dashboard/create-board-button'
import Link from 'next/link'

export default async function Dashboard() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      redirect('/')
    }

    let boards: Board[] = []
    try {
      boards = await getBoards()
    } catch (error) {
      console.error('Error loading boards:', error)
      // Boards yüklenemezse bile sayfa gösterilebilir
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12 md:px-8 md:py-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Create Pin
            </h1>
            <p className="text-slate-600">
              Design a new pin and publish it to Pinterest
            </p>
          </div>

          {boards.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 text-slate-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  No Boards Found
                </h2>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  No boards have been created in the sandbox environment yet. Create a test board first to create pins.
                </p>
                <CreateBoardButton />
                <p className="text-xs text-slate-500 mt-4">
                  This board will be created in the sandbox environment and used for testing purposes.
                </p>
              </div>
            </div>
          ) : (
            <PinEditor boards={boards} />
          )}
        </main>

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
  } catch (error) {
    console.error('Dashboard error:', error)
    // Production'da daha güvenli hata mesajı
    if (process.env.NODE_ENV === 'development') {
      throw error
    }
    // Production'da kullanıcıya genel bir hata sayfası göster
    redirect('/')
  }
}

