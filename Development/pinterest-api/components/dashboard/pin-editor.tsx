"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { Board, createPin, createBoard } from '@/app/actions/pinterest'
import { extractMetadata } from '@/app/actions/fetch-metadata'

interface PinEditorProps {
  boards: Board[]
}

const DRAFT_STORAGE_KEY = 'postcrafter_pin_draft'

export default function PinEditor({ boards: initialBoards }: PinEditorProps) {
  const { data: session } = useSession()
  const [boards, setBoards] = useState<Board[]>(initialBoards)
  const [selectedBoard, setSelectedBoard] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [link, setLink] = useState<string>('')
  const [altText, setAltText] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [smartImportUrl, setSmartImportUrl] = useState<string>('')
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [newBoardName, setNewBoardName] = useState<string>('')
  const [isCreatingBoard, setIsCreatingBoard] = useState<boolean>(false)
  const [isFormReset, setIsFormReset] = useState<boolean>(false)

  // Best Practices Checklist Calculations
  const checklist = {
    hasImage: imageUrl.trim().length > 0,
    titleLength: title.length >= 20 && title.length <= 100,
    hasAltText: altText.trim().length > 0,
    hasDescription: description.length >= 50,
  }

  const allChecklistComplete = Object.values(checklist).every(Boolean)
  const checklistScore = Object.values(checklist).filter(Boolean).length

  // Load draft from localStorage (only on initial load)
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (savedDraft && !isFormReset) {
        const draft = JSON.parse(savedDraft)
        setSelectedBoard(draft.selectedBoard || '')
        setImageUrl(draft.imageUrl || '')
        setTitle(draft.title || '')
        setDescription(draft.description || '')
        setLink(draft.link || '')
        setAltText(draft.altText || '')
        setSmartImportUrl(draft.smartImportUrl || '')
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save form changes to localStorage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const draft = {
        selectedBoard,
        imageUrl,
        title,
        description,
        link,
        altText,
        smartImportUrl,
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [selectedBoard, imageUrl, title, description, link, altText, smartImportUrl])

  const resetForm = () => {
    setIsFormReset(true)
    setSelectedBoard('')
    setImageUrl('')
    setTitle('')
    setDescription('')
    setLink('')
    setAltText('')
    setSmartImportUrl('')
    localStorage.removeItem(DRAFT_STORAGE_KEY)
  }

  const handleSaveDraft = () => {
    const draft = {
      selectedBoard,
      imageUrl,
      title,
      description,
      link,
      altText,
      smartImportUrl,
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
    toast.success('Draft saved locally', {
      description: 'Your form data has been saved to your browser',
    })
  }

  const handleSmartImport = async () => {
    if (!smartImportUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }

    // Basic URL validation
    try {
      new URL(smartImportUrl.trim())
    } catch {
      toast.error('Invalid URL', {
        description: 'Please enter a valid URL (e.g., https://example.com)',
      })
      return
    }

    setIsFetching(true)

    try {
      // Try API route first (more reliable on Render)
      let metadata: any
      try {
        const response = await fetch('/api/fetch-metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: smartImportUrl.trim() }),
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.error || `HTTP ${response.status}`)
        }

        metadata = responseData
      } catch (apiError) {
        console.error('API route error:', apiError)
        // Fallback to server action if API route fails
        try {
          console.log('Trying server action as fallback...')
          metadata = await extractMetadata(smartImportUrl.trim())
        } catch (actionError) {
          console.error('Server action also failed:', actionError)
          throw apiError // Throw the original API error
        }
      }

      if (!metadata.success) {
        toast.error('Failed to fetch metadata', {
          description: metadata.error || 'An unknown error occurred',
          duration: 5000,
        })
        setIsFetching(false)
        return
      }

      // Fill form
      if (metadata.title) {
        setTitle(metadata.title.slice(0, 100))
      }
      if (metadata.description) {
        setDescription(metadata.description.slice(0, 500))
      }
      if (metadata.image) {
        setImageUrl(metadata.image)
      }
      if (metadata.url) {
        setLink(metadata.url)
      }

      toast.success('Metadata fetched successfully', {
        description: 'Form has been automatically filled',
      })
    } catch (error) {
      console.error('Smart import error:', error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred while fetching metadata'
      
      // Check for specific error types
      if (errorMessage.includes('Server Components') || errorMessage.includes('digest')) {
        toast.error('Server Error', {
          description: 'Unable to fetch metadata. Please check the URL and try again.',
          duration: 5000,
        })
      } else {
        toast.error('Error', {
          description: errorMessage.substring(0, 100),
          duration: 5000,
        })
      }
    } finally {
      setIsFetching(false)
    }
  }

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      toast.error('Please enter a board name')
      return
    }

    setIsCreatingBoard(true)

    try {
      const newBoard = await createBoard(newBoardName.trim())
      
      // Add new board to list
      setBoards([...boards, newBoard])
      
      // Auto-select the new board
      setSelectedBoard(newBoard.id)
      
      // Close modal and clear input
      setIsModalOpen(false)
      setNewBoardName('')
      
      toast.success('Board created successfully', {
        description: `${newBoard.name} has been created`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred while creating the board'
      
      toast.error('Error', {
        description: errorMessage,
      })
    } finally {
      setIsCreatingBoard(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)

    try {
      const result = await createPin({
        board_id: selectedBoard,
        image_url: imageUrl,
        title: title,
        description: description || undefined,
        link: link || undefined,
      })

      if (result.success && result.pin_id) {
        const pinUrl = `https://www.pinterest.com/pin/${result.pin_id}/`
        
        // Reset form and remove draft from localStorage
        resetForm()
        localStorage.removeItem(DRAFT_STORAGE_KEY)
        
        toast.success('Pin published successfully! 🎉', {
          description: 'Your pin has been created and published on Pinterest.',
          duration: 5000,
          action: {
            label: 'View on Pinterest',
            onClick: () => window.open(pinUrl, '_blank'),
          },
          className: 'bg-green-50 border border-green-200 text-green-900',
        })
      } else {
        resetForm()
        localStorage.removeItem(DRAFT_STORAGE_KEY)
        toast.success('Pin created successfully', {
          description: 'Your pin has been created successfully.',
          duration: 3000,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred while creating the pin.'
      
      // Custom error messages
      if (errorMessage.includes('image') || errorMessage.includes('media')) {
        toast.error('Image error', {
          description: 'The image URL may be invalid or inaccessible.',
        })
      } else if (errorMessage.includes('429') || errorMessage.includes('too many')) {
        toast.error('Too many requests', {
          description: 'Please try again in a few minutes.',
        })
      } else {
        toast.error('Error', {
          description: errorMessage,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT COLUMN - Editor Form */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Create Pin</h2>
        </div>

        {/* Best Practices Checklist - Premium Design */}
        <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                allChecklistComplete ? 'bg-green-100' : 'bg-slate-200'
              }`}>
                <svg className={`w-4 h-4 ${allChecklistComplete ? 'text-green-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Quality Control</h3>
                <p className="text-xs text-slate-500">Pinterest best practices</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              allChecklistComplete 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              {checklistScore}/4
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { 
                key: 'hasImage', 
                label: 'Image Uploaded', 
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              { 
                key: 'titleLength', 
                label: 'Title (20-100)', 
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )
              },
              { 
                key: 'hasAltText', 
                label: 'Alt Text', 
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )
              },
              { 
                key: 'hasDescription', 
                label: 'Description (50+)', 
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
            ].map((item) => {
              const isComplete = checklist[item.key as keyof typeof checklist]
              return (
                <div
                  key={item.key}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                    isComplete
                      ? 'bg-white border border-green-200 shadow-sm'
                      : 'bg-white/60 border border-slate-200'
                  }`}
                >
                  <div className={`flex-shrink-0 ${isComplete ? 'text-green-600' : 'text-slate-400'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-medium flex-1 ${isComplete ? 'text-slate-900' : 'text-slate-600'}`}>
                    {item.label}
                  </span>
                  {isComplete && (
                    <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Smart Import */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <label htmlFor="smartImport" className="block text-sm font-semibold text-slate-900 mb-2">
              🪄 Smart Import (Article URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="smartImport"
                value={smartImportUrl}
                onChange={(e) => setSmartImportUrl(e.target.value)}
                placeholder="https://example.com/blog-post"
                className="flex-1 h-10 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent text-slate-900 bg-white"
                disabled={isFetching}
              />
              <button
                type="button"
                onClick={handleSmartImport}
                disabled={isFetching || !smartImportUrl.trim()}
                className="h-10 px-4 bg-pinterest-red hover:bg-[#d50e22] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                {isFetching ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Fetch Data</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Paste a blog post or webpage URL, and the form will auto-fill!
            </p>
          </div>

          {/* Board Selection */}
          <div>
            <label htmlFor="board" className="block text-sm font-medium text-slate-700 mb-2">
              Select Board
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <select
                  id="board"
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent text-slate-900 bg-white appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select a board...</option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
                {/* Custom Dropdown Arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center justify-center min-w-[44px]"
                title="Create New Board"
              >
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
              </button>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent text-slate-900"
              required
            />
          </div>

          {/* Başlık */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Title
              <span className="text-slate-400 font-normal ml-1">
                ({title.length}/100)
              </span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              placeholder="Enter pin title..."
              maxLength={100}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent text-slate-900"
              required
            />
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description
              <span className="text-slate-400 font-normal ml-1">
                ({description.length}/500)
              </span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="Enter pin description..."
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent text-slate-900 resize-none"
            />
          </div>

          {/* Alt Text (Accessibility) */}
          <div>
            <label htmlFor="altText" className="block text-sm font-medium text-slate-700 mb-2">
              Alt Text (Accessibility)
              <span className="text-slate-400 font-normal ml-1 text-xs">(Recommended)</span>
            </label>
            <input
              type="text"
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive text for the image..."
              maxLength={200}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent text-slate-900"
            />
            <p className="text-xs text-slate-500 mt-1">
              Add descriptive text for image accessibility
            </p>
          </div>

          {/* Destination Link */}
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-slate-700 mb-2">
              Destination Link
            </label>
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent text-slate-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-semibold px-8 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-none ${
                allChecklistComplete
                  ? 'bg-pinterest-red hover:bg-[#d50e22] text-white'
                  : 'bg-pinterest-red/50 text-white/70 cursor-not-allowed'
              } disabled:bg-slate-400 disabled:cursor-not-allowed`}
              title={!allChecklistComplete ? 'Complete all quality checks' : ''}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
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
                  Publishing...
                </span>
              ) : (
                'Publish'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN - Live Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 lg:sticky lg:top-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Live Preview</h2>
        
        {/* Önizleme Kartı */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
          {/* Pinterest Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
            <button className="p-2 -ml-2">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1"></div>
            <button className="p-2 -mr-2">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto scrollbar-hide bg-white" style={{ maxHeight: '600px' }}>

            {/* Image Area */}
            <div className="px-4 pt-4">
              <div className="relative w-full rounded-xl overflow-hidden bg-slate-50">
                {imageUrl ? (
                  <>
                    <div className="relative w-full" style={{ aspectRatio: '9/16', maxHeight: '500px' }}>
                      <img
                        src={imageUrl.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}` : imageUrl}
                        alt={altText || title || 'Pin preview'}
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          // Fallback to direct URL if proxy fails
                          if (target.src.includes('/api/proxy-image')) {
                            target.src = imageUrl
                          } else {
                            target.style.display = 'none'
                          }
                        }}
                      />
                    </div>
                    {/* Save Button Overlay */}
                    <div className="absolute top-4 right-4 z-10">
                      <button className="bg-pinterest-red hover:bg-[#d50e22] text-white font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span>Save</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="relative w-full" style={{ aspectRatio: '9/16', minHeight: '300px' }}>
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 rounded-xl">
                      <div className="text-center p-8">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-slate-200 flex items-center justify-center">
                          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Image Preview</p>
                        <p className="text-xs text-slate-500">Waiting for image...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="px-4 py-5 bg-white">
              {/* Title */}
              {title ? (
                <h1 className="text-lg font-bold text-slate-900 mb-3 leading-tight">
                  {title}
                </h1>
              ) : (
                <div className="h-5 bg-slate-200 rounded w-4/5 mb-3 animate-pulse"></div>
              )}

              {/* Description */}
              {description ? (
                <div className="mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {description.length > 150 ? (
                      <>
                        {description.substring(0, 150)}
                        <span className="text-pinterest-red font-semibold ml-1 cursor-pointer">... More</span>
                      </>
                    ) : (
                      description
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-slate-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded w-4/6 animate-pulse"></div>
                </div>
              )}

              {/* Profile */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-slate-300 rounded-full animate-pulse"></div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">on Pinterest</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="border-t border-slate-200 px-4 py-4 bg-white">
            {link ? (
              <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Visit</span>
              </button>
            ) : (
              <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>Save</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Create New Board Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Create New Board
            </h3>
            
            <div className="mb-6">
              <label htmlFor="boardName" className="block text-sm font-medium text-slate-700 mb-2">
                Board Name
              </label>
              <input
                type="text"
                id="boardName"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="e.g., Recipe Ideas"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent text-slate-900"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isCreatingBoard) {
                    handleCreateBoard()
                  }
                }}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setNewBoardName('')
                }}
                disabled={isCreatingBoard}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateBoard}
                disabled={isCreatingBoard || !newBoardName.trim()}
                className="px-4 py-2 bg-pinterest-red hover:bg-[#d50e22] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {isCreatingBoard ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                  'Create'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

