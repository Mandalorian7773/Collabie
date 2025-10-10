# Netlify Deployment Checklist

## Pre-deployment Verification

1. **Build locally first:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Check dist folder contents:**
   ```bash
   ls -la dist/
   ```

3. **Verify TypeScript compilation:**
   ```bash
   npx tsc --noEmit
   ```

## Netlify Configuration

Your site should be configured with:
- **Publish directory:** `dist`
- **Build command:** `npm run build`
- **Node version:** 18 or higher (set in Netlify dashboard)

## Common Issues & Solutions

### "Unexpected token '<'" Error
- **Cause:** Server returning HTML instead of JavaScript
- **Fix:** Ensure correct Content-Type headers and SPA redirects

### "404 for vite.svg"
- **Cause:** Missing static assets
- **Fix:** Verify `public/` folder contents are copied to `dist/`

### "Only shows 'frontend'"
- **Cause:** Missing SPA redirect rules
- **Fix:** Ensure `/*  /index.html  200` redirect is configured

## Deploy Steps

1. Commit all changes
2. Push to your Git repository
3. Netlify will auto-deploy from the connected branch
4. Check deployment logs for any build errors