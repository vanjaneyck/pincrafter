# PostCrafter

A professional Visual Content Planner for Pinterest. Plan, preview, and publish your pins safely before going live.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **NextAuth.js** (Authentication)
- **Lucide React** (Icons)

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Pinterest API Credentials
# Get these from Pinterest Developer Portal: https://developers.pinterest.com/apps/
PINTEREST_CLIENT_ID=your_pinterest_client_id_here
PINTEREST_CLIENT_SECRET=your_pinterest_client_secret_here

# Pinterest API Environment
# Set to "sandbox" for testing or "production" for live API access
# Default: "sandbox"
PINTEREST_API_ENV=sandbox

# NextAuth Secret
# Generate a secure random string (e.g., using: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret_here

# NextAuth URL (use your domain in production)
NEXTAUTH_URL=http://localhost:3000
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Design Guidelines

- Minimalist, clean SaaS design (Stripe/Vercel style)
- Color palette: `slate-50` background, `white` cards, `slate-900` text
- Accent color: Pinterest red (`#E60023`) for primary buttons only
- Font: Inter (Google Fonts)

## Authentication

PostCrafter uses NextAuth.js with Pinterest OAuth 2.0 (API v5) for authentication. The authentication flow:

1. User clicks "Giriş Yap" or "Start for Free" button
2. Redirects to Pinterest OAuth authorization page
3. User grants permissions (boards:read, pins:write, user_accounts:read)
4. Redirects back to `/dashboard` with access token stored in session

The access token is available in the session and can be used for Pinterest API v5 requests.

## Project Structure

```
pinterest-api/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts    # NextAuth API route
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard page (protected)
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                # Landing page
│   ├── providers.tsx            # SessionProvider wrapper
│   └── globals.css              # Global styles
├── public/                      # Static assets
├── types/
│   └── next-auth.d.ts          # TypeScript type definitions
└── ...config files
```

