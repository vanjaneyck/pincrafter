"use server"

import * as cheerio from "cheerio"

export interface MetadataResult {
  title?: string
  description?: string
  image?: string
  url?: string
  success: boolean
  error?: string
}

export async function extractMetadata(url: string): Promise<MetadataResult> {
  // Input validation
  if (!url || typeof url !== 'string') {
    return {
      success: false,
      error: "URL is required",
    }
  }

  const trimmedUrl = url.trim()
  if (!trimmedUrl) {
    return {
      success: false,
      error: "URL cannot be empty",
    }
  }

  try {
    // URL validasyonu
    let parsedUrl: URL
    try {
      parsedUrl = new URL(trimmedUrl)
    } catch {
      return {
        success: false,
        error: "Invalid URL format",
      }
    }

    // Protocol kontrolü
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        success: false,
        error: "URL must use http or https protocol",
      }
    }

    // URL'den HTML çek
    // Timeout için AbortController kullan (Node.js 18 uyumluluğu için)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 saniye timeout

    let response: Response
    try {
      response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          success: false,
          error: "Request timed out. Please try again.",
        }
      }
      throw fetchError
    }

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to load page: ${response.status} ${response.statusText}`,
      }
    }

    const html = await response.text()
    
    if (!html || html.length === 0) {
      return {
        success: false,
        error: "Empty response from URL",
      }
    }

    let $: cheerio.CheerioAPI
    try {
      $ = cheerio.load(html)
    } catch (cheerioError) {
      console.error("Cheerio parsing error:", cheerioError)
      return {
        success: false,
        error: "Failed to parse HTML content",
      }
    }

    // Meta verileri çek
    const result: MetadataResult = {
      success: true,
      url: url,
    }

    // Başlık: og:title -> title -> h1
    result.title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text() ||
      $("h1").first().text() ||
      ""

    // Açıklama: og:description -> meta description -> twitter:description
    result.description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      ""

    // Görsel: og:image -> twitter:image -> ilk img tag
    let imageUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[name="twitter:image:src"]').attr("content") ||
      ""

    // Eğer görsel relative URL ise, base URL ile birleştir
    if (imageUrl && !imageUrl.startsWith("http")) {
      if (imageUrl.startsWith("//")) {
        imageUrl = `${parsedUrl.protocol}${imageUrl}`
      } else if (imageUrl.startsWith("/")) {
        imageUrl = `${parsedUrl.origin}${imageUrl}`
      } else {
        imageUrl = `${parsedUrl.origin}/${imageUrl}`
      }
    }

    result.image = imageUrl || undefined

    // Başlık ve açıklama temizleme (boşlukları ve yeni satırları düzenle)
    if (result.title) {
      result.title = result.title.trim().replace(/\s+/g, " ")
    }
    if (result.description) {
      result.description = result.description.trim().replace(/\s+/g, " ")
      // Açıklama çok uzunsa kısalt
      if (result.description.length > 500) {
        result.description = result.description.substring(0, 497) + "..."
      }
    }

    return result
  } catch (error) {
    // Log full error for debugging
    console.error("Error extracting metadata:", {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      url: url,
    })
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error) || "An unknown error occurred"

    // Timeout hatası kontrolü
    if (errorMessage.includes("timeout") || errorMessage.includes("aborted") || errorMessage.includes("AbortError")) {
      return {
        success: false,
        error: "Request timed out. Please try again.",
      }
    }

    // Network hatası kontrolü
    if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("ENOTFOUND")) {
      return {
        success: false,
        error: "Unable to connect to the URL. Please check if the URL is accessible.",
      }
    }

    // DNS hatası
    if (errorMessage.includes("getaddrinfo") || errorMessage.includes("ENOTFOUND")) {
      return {
        success: false,
        error: "Domain not found. Please check the URL.",
      }
    }

    // SSL/TLS hatası
    if (errorMessage.includes("certificate") || errorMessage.includes("SSL") || errorMessage.includes("TLS")) {
      return {
        success: false,
        error: "SSL certificate error. The website may be using an invalid certificate.",
      }
    }

    return {
      success: false,
      error: `Failed to extract metadata: ${errorMessage.substring(0, 200)}`,
    }
  }
}

