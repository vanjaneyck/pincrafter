import { NextRequest, NextResponse } from 'next/server'

// Use require for cheerio in API route (Node.js environment)
let cheerio: any
try {
  cheerio = require('cheerio')
} catch (e) {
  console.error('Failed to load cheerio:', e)
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      return NextResponse.json(
        { success: false, error: 'URL cannot be empty' },
        { status: 400 }
      )
    }

    // URL validation
    let parsedUrl: URL
    try {
      parsedUrl = new URL(trimmedUrl)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Protocol check
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { success: false, error: 'URL must use http or https protocol' },
        { status: 400 }
      )
    }

    // Fetch with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    let response: Response
    try {
      response = await fetch(trimmedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timed out. Please try again.' },
          { status: 408 }
        )
      }
      throw fetchError
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to load page: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const html = await response.text()

    if (!html || html.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Empty response from URL' },
        { status: 400 }
      )
    }

    // Parse HTML
    if (!cheerio || typeof cheerio.load !== 'function') {
      console.error('Cheerio is not available')
      return NextResponse.json(
        { success: false, error: 'Server configuration error: HTML parser not available' },
        { status: 500 }
      )
    }

    let $: any
    try {
      $ = cheerio.load(html)
    } catch (cheerioError) {
      console.error('Cheerio parsing error:', cheerioError)
      return NextResponse.json(
        { success: false, error: 'Failed to parse HTML content' },
        { status: 500 }
      )
    }

    // Extract metadata
    const result: any = {
      success: true,
      url: trimmedUrl,
    }

    // Title
    result.title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text() ||
      ''

    // Description
    result.description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      ''

    // Image
    let imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[name="twitter:image:src"]').attr('content') ||
      ''

    // Resolve relative image URLs
    if (imageUrl && !imageUrl.startsWith('http')) {
      if (imageUrl.startsWith('//')) {
        imageUrl = `${parsedUrl.protocol}${imageUrl}`
      } else if (imageUrl.startsWith('/')) {
        imageUrl = `${parsedUrl.origin}${imageUrl}`
      } else {
        imageUrl = `${parsedUrl.origin}/${imageUrl}`
      }
    }

    result.image = imageUrl || undefined

    // Clean up title and description
    if (result.title) {
      result.title = result.title.trim().replace(/\s+/g, ' ')
    }
    if (result.description) {
      result.description = result.description.trim().replace(/\s+/g, ' ')
      if (result.description.length > 500) {
        result.description = result.description.substring(0, 497) + '...'
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error extracting metadata:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error) || 'An unknown error occurred'

    // Handle specific error types
    if (errorMessage.includes('timeout') || errorMessage.includes('aborted') || errorMessage.includes('AbortError')) {
      return NextResponse.json(
        { success: false, error: 'Request timed out. Please try again.' },
        { status: 408 }
      )
    }

    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      return NextResponse.json(
        { success: false, error: 'Unable to connect to the URL. Please check if the URL is accessible.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: `Failed to extract metadata: ${errorMessage.substring(0, 200)}` },
      { status: 500 }
    )
  }
}

