# Render Deployment Troubleshooting

## Common Issues and Solutions

### 1. Build Fails

**Symptoms:** Build command fails in Render logs

**Solutions:**
- Check Node.js version: Ensure `engines.node` in `package.json` is set to `>=18.0.0`
- Verify all dependencies are in `package.json` (not just devDependencies)
- Check for TypeScript errors: Run `npm run build` locally first

### 2. Runtime Error: "NEXTAUTH_URL is not set"

**Symptoms:** App crashes on startup with NextAuth error

**Solutions:**
- In Render Dashboard → Environment Variables, add:
  ```
  NEXTAUTH_URL=https://your-service-name.onrender.com
  ```
- Replace `your-service-name` with your actual Render service name
- After adding, trigger a manual deploy

### 3. OAuth Redirect URI Mismatch

**Symptoms:** Pinterest OAuth fails with "redirect_uri_mismatch"

**Solutions:**
- Update Pinterest Developer Portal → App Settings → Redirect URIs:
  ```
  https://your-service-name.onrender.com/api/auth/callback/pinterest
  ```
- Make sure there's no trailing slash
- Wait a few minutes for Pinterest to update

### 4. Environment Variables Not Loading

**Symptoms:** API calls fail with "Unauthorized" or missing credentials

**Solutions:**
- Verify all required env vars are set in Render Dashboard:
  - `PINTEREST_CLIENT_ID`
  - `PINTEREST_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `PINTEREST_API_ENV` (should be `sandbox` for testing)
- Check for typos in variable names (case-sensitive!)
- After adding/updating env vars, redeploy the service

### 5. Port Binding Error

**Symptoms:** "Port already in use" or service won't start

**Solutions:**
- Next.js automatically uses `PORT` environment variable (Render sets this)
- No manual port configuration needed
- If issue persists, check Render service logs

### 6. Build Succeeds but App Shows Error Page

**Symptoms:** Build completes but app shows 500 error or blank page

**Solutions:**
- Check Render service logs (not build logs)
- Verify `NEXTAUTH_SECRET` is set and is a secure random string
- Check that all environment variables are properly set
- Look for runtime errors in the logs

### 7. Static Assets Not Loading

**Symptoms:** Images, CSS, or other assets return 404

**Solutions:**
- Verify `public/` folder is committed to Git
- Check `next.config.js` for image domain configuration
- Ensure `logo.svg` exists in `public/` folder

## Quick Checklist

Before deploying to Render, ensure:

- [ ] All environment variables are set in Render Dashboard
- [ ] `NEXTAUTH_URL` matches your Render service URL exactly
- [ ] Pinterest redirect URI is updated in Pinterest Developer Portal
- [ ] `package.json` has `engines.node` specified
- [ ] Build command works locally (`npm run build`)
- [ ] All files are committed to Git
- [ ] `.env.local` is NOT committed (it's in `.gitignore`)

## Getting Help

1. Check Render service logs: Dashboard → Your Service → Logs
2. Check build logs: Dashboard → Your Service → Events
3. Test locally first: `npm run build && npm start`
4. Verify environment variables: Render Dashboard → Environment

## Testing Locally with Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

This helps catch production-specific issues before deploying to Render.

