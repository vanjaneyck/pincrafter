"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Pinterest API base URL helper
function getPinterestApiBaseUrl(): string {
  const env = process.env.PINTEREST_API_ENV || "sandbox"
  return env === "production" 
    ? "https://api.pinterest.com/v5"
    : "https://api-sandbox.pinterest.com/v5"
}

// Rate limit helper - exponential backoff retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      
      // Rate limit kontrolü
      if (response.status === 429) {
        // Rate limit header'larını kontrol et
        const retryAfter = response.headers.get("Retry-After")
        const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining")
        const rateLimitReset = response.headers.get("X-RateLimit-Reset")
        
        // Son deneme değilse retry yap
        if (attempt < maxRetries) {
          // Retry-After header varsa onu kullan, yoksa exponential backoff
          const waitTime = retryAfter 
            ? parseInt(retryAfter) * 1000 
            : Math.min(1000 * Math.pow(2, attempt), 30000) // Max 30 saniye
          
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
        
        // Son deneme ve hala 429 hatası
        throw new Error(
          `Rate limit exceeded. ${rateLimitRemaining ? `Remaining: ${rateLimitRemaining}` : ''} ${rateLimitReset ? `Reset at: ${new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString()}` : ''}`
        )
      }
      
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Son deneme değilse ve network hatası ise retry yap
      if (attempt < maxRetries && error instanceof TypeError) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000) // Max 10 saniye
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      throw lastError
    }
  }
  
  throw lastError || new Error("Request failed after retries")
}

export interface Board {
  id: string
  name: string
}

export async function getBoards(): Promise<Board[]> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      throw new Error("Unauthorized: No access token found")
    }

    const apiBaseUrl = getPinterestApiBaseUrl()
    const response = await fetchWithRetry(`${apiBaseUrl}/boards`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    })

    // Sandbox'ta pano yoksa boş array döndür, hata fırlatma
    if (!response.ok) {
      // 404 veya boş liste durumunda boş array döndür
      if (response.status === 404 || response.status === 200) {
        return []
      }
      const errorText = await response.text()
      console.error(`Pinterest API error: ${response.status} - ${errorText}`)
      // Sandbox'ta genellikle boş liste olur, hata yerine boş array döndür
      return []
    }

    const data = await response.json()
    
    // Pinterest API v5 returns items array
    const boards: Board[] = (data.items || []).map((board: any) => ({
      id: board.id,
      name: board.name,
    }))

    return boards
  } catch (error) {
    console.error("Error fetching boards:", error)
    // Sandbox ortamında hata durumunda boş array döndür
    return []
  }
}

export interface CreatePinParams {
  board_id: string
  image_url: string
  title: string
  description?: string
  link?: string
}

export interface CreatePinResponse {
  success: boolean
  pin_id?: string
  message?: string
}

export async function createPin(params: CreatePinParams): Promise<CreatePinResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      throw new Error("Unauthorized: No access token found")
    }

    // Pinterest API v5 pin oluşturma isteği
    const requestBody: any = {
      board_id: params.board_id,
      title: params.title,
      media_source: {
        source_type: "image_url",
        url: params.image_url,
      },
    }

    // Opsiyonel alanlar
    if (params.description) {
      requestBody.description = params.description
    }

    if (params.link) {
      requestBody.link = params.link
    }

    const apiBaseUrl = getPinterestApiBaseUrl()
    const response = await fetchWithRetry(`${apiBaseUrl}/pins`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    // Başarılı yanıt kontrolü
    if (response.status !== 201) {
      let errorMessage = "Pin oluşturulurken bir hata oluştu."
      
      try {
        const errorData = await response.json()
        // Pinterest API hata mesajlarını kontrol et
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.code) {
          errorMessage = `Hata: ${errorData.code}`
        }
      } catch {
        // JSON parse edilemezse status text kullan
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()

    return {
      success: true,
      pin_id: data.id,
      message: "Pin başarıyla oluşturuldu!",
    }
  } catch (error) {
    console.error("Error creating pin:", error)
    
    // Hata mesajını kullanıcıya uygun şekilde döndür
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Bilinmeyen bir hata oluştu."
    
    throw new Error(errorMessage)
  }
}

export interface CreateBoardResponse {
  success: boolean
  board_id?: string
  message?: string
}

export async function createBoard(name: string): Promise<Board> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      throw new Error("Unauthorized: No access token found")
    }

    if (!name || name.trim().length === 0) {
      throw new Error("Pano adı boş olamaz")
    }

    // Pinterest API v5 board oluşturma isteği
    const requestBody = {
      name: name.trim(),
      privacy: "PUBLIC",
    }

    const apiBaseUrl = getPinterestApiBaseUrl()
    const response = await fetchWithRetry(`${apiBaseUrl}/boards`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    // Başarılı yanıt kontrolü
    if (response.status !== 201) {
      let errorMessage = "Pano oluşturulurken bir hata oluştu."
      
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.code) {
          errorMessage = `Hata: ${errorData.code}`
        }
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()

    return {
      id: data.id,
      name: data.name,
    }
  } catch (error) {
    console.error("Error creating board:", error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Bilinmeyen bir hata oluştu."
    
    throw new Error(errorMessage)
  }
}

export async function createSandboxBoard(): Promise<CreateBoardResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      throw new Error("Unauthorized: No access token found")
    }

    // Pinterest API v5 board oluşturma isteği
    const requestBody = {
      name: "PostCrafter Test Board",
      description: "Test board created by PostCrafter",
      privacy: "PUBLIC",
    }

    const apiBaseUrl = getPinterestApiBaseUrl()
    const response = await fetchWithRetry(`${apiBaseUrl}/boards`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    // Başarılı yanıt kontrolü
    if (response.status !== 201) {
      let errorMessage = "Pano oluşturulurken bir hata oluştu."
      
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.code) {
          errorMessage = `Hata: ${errorData.code}`
        }
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()

    return {
      success: true,
      board_id: data.id,
      message: "Test panosu başarıyla oluşturuldu!",
    }
  } catch (error) {
    console.error("Error creating board:", error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Bilinmeyen bir hata oluştu."
    
    throw new Error(errorMessage)
  }
}

