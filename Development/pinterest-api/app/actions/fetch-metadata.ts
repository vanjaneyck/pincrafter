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
  try {
    // URL validasyonu
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return {
        success: false,
        error: "Geçersiz URL formatı",
      }
    }

    // URL'den HTML çek
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      // Timeout için signal ekle
      signal: AbortSignal.timeout(10000), // 10 saniye timeout
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Sayfa yüklenemedi: ${response.status} ${response.statusText}`,
      }
    }

    const html = await response.text()
    const $ = cheerio.load(html)

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
    console.error("Error extracting metadata:", error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Bilinmeyen bir hata oluştu"

    // Timeout hatası kontrolü
    if (errorMessage.includes("timeout") || errorMessage.includes("aborted")) {
      return {
        success: false,
        error: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.",
      }
    }

    return {
      success: false,
      error: `Meta veriler çekilemedi: ${errorMessage}`,
    }
  }
}

