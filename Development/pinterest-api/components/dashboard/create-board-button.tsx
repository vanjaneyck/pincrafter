"use client"

import { useState } from 'react'
import { toast } from 'sonner'
import { createSandboxBoard } from '@/app/actions/pinterest'
import { useRouter } from 'next/navigation'

export default function CreateBoardButton() {
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleCreateBoard = async () => {
    setIsCreating(true)

    try {
      const result = await createSandboxBoard()

      if (result.success) {
        toast.success('Test board created! 🎉', {
          description: result.board_id ? `Board ID: ${result.board_id}` : undefined,
        })
        // Refresh page to show new board
        router.refresh()
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred while creating the board.'
      
      toast.error('Error', {
        description: errorMessage,
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <button
      onClick={handleCreateBoard}
      disabled={isCreating}
      className="bg-pinterest-red hover:bg-[#d50e22] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
    >
      {isCreating ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Creating...</span>
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Create Test Board</span>
        </>
      )}
    </button>
  )
}

