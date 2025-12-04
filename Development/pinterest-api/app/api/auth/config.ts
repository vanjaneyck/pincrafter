import { NextAuthOptions } from "next-auth"

// Pinterest API base URL helper for OAuth endpoints
function getPinterestOAuthBaseUrl(): string {
  const env = process.env.PINTEREST_API_ENV || "sandbox"
  return env === "production" 
    ? "https://api.pinterest.com/v5"
    : "https://api-sandbox.pinterest.com/v5"
}

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "pinterest",
      name: "Pinterest",
      type: "oauth",
      authorization: {
        url: "https://www.pinterest.com/oauth/",
        params: { 
          scope: "boards:read,boards:write,pins:read,pins:write,user_accounts:read",
          response_type: "code",
        },
      },
      token: `${getPinterestOAuthBaseUrl()}/oauth/token`,
      userinfo: `${getPinterestOAuthBaseUrl()}/user_account`,
      clientId: process.env.PINTEREST_CLIENT_ID || (() => {
        if (process.env.NODE_ENV === 'production') {
          console.error('PINTEREST_CLIENT_ID is missing')
        }
        return ''
      })(),
      clientSecret: process.env.PINTEREST_CLIENT_SECRET || (() => {
        if (process.env.NODE_ENV === 'production') {
          console.error('PINTEREST_CLIENT_SECRET is missing')
        }
        return ''
      })(),
      profile(profile: any) {
        return {
          id: profile.username || profile.id,
          name: profile.username,
          image: profile.profile_image,
          email: null,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // İlk girişte account bilgisini token'a ekle
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }
      
      // Token refresh logic - Token expire olmadan önce yenile
      if (token.expiresAt && typeof token.expiresAt === 'number') {
        const now = Math.floor(Date.now() / 1000)
        const expiresIn = token.expiresAt - now
        
        // Token 5 dakika içinde expire olacaksa yenile
        if (expiresIn < 300 && token.refreshToken) {
          try {
            const oauthBaseUrl = getPinterestOAuthBaseUrl()
            const response = await fetch(`${oauthBaseUrl}/oauth/token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken as string,
                client_id: process.env.PINTEREST_CLIENT_ID || "",
                client_secret: process.env.PINTEREST_CLIENT_SECRET || "",
              }),
            })
            
            if (response.ok) {
              const refreshedTokens = await response.json()
              token.accessToken = refreshedTokens.access_token
              token.expiresAt = Math.floor(Date.now() / 1000) + (refreshedTokens.expires_in || 3600)
              if (refreshedTokens.refresh_token) {
                token.refreshToken = refreshedTokens.refresh_token
              }
            }
          } catch (error) {
            console.error("Error refreshing token:", error)
            // Token refresh başarısız olursa, mevcut token'ı kullanmaya devam et
          }
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // Session'a access token'ı ekle
      if (session.user) {
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
        session.expiresAt = token.expiresAt
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXTAUTH_SECRET is required in production')
    }
    return 'development-secret-change-in-production'
  })(),
  debug: process.env.NODE_ENV === 'development',
}

