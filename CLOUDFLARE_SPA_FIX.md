# Cloudflare Pages SPA Routing Fix Guide

## Problem

Getting 404 errors when accessing routes directly (e.g., `https://cryndol.feltech.org/login`) instead of only index working.

## Solutions (Use Dashboard Rule)

### Solution 1: Cloudflare Dashboard "Single Page App" Rule (PRIMARY FIX)

Since `_redirects` causes validation errors, the **Transform Rule** is the correct, permanent fix.

1. Log in to the **Cloudflare Dashboard** (go to your Zone/Domain dashboard, NOT just the Pages project settings).
2. Navigate to **Rules** > **Transform Rules**.
3. Click **Create Rewrite URL Rule**.
4. **Rule Name:** `SPA Routing`
5. **When incoming requests match:** Select **Custom filter expression** and use:
    * Field: `URI Path`
    * Operator: `does not start with`
    * Value: `/assets/`
    * **AND**
    * Field: `URI Path`
    * Operator: `does not equal`
    * Value: `/`
    * **AND**
    * Field: `URI Path`
    * Operator: `does not equal`
    * Value: `/index.html`
6. **Path Rewrite:**
    * Choose **Rewrite to...** -> **Static**
    * Value: `/index.html`
7. Click **Deploy**.

This essentially says: "If it's not an asset, and not the home page itself, serve the home page (which loads the app)."

### Solution 2: Manual Deployment Check

1. Ensure you have **DELETED** `public/_redirects` (checked).
2. Run `npm run build`.
3. Deploy the `dist` folder.

## How Vite Handles This

Vite's dev server automatically handles SPA routing, but production builds need configuration because you're deploying static files to Cloudflare Pages.

The `functions/_middleware.js` file runs on Cloudflare's edge and acts like a server, catching 404s and serving your `index.html`.

## Expected Behavior After Fix

✅ `https://cryndol.feltech.org/` → Shows homepage  
✅ `https://cryndol.feltech.org/login` → Shows login page  
✅ `https://cryndol.feltech.org/dashboard` → Shows dashboard  
✅ Refresh on any page → Stays on that page  
✅ Direct link access → Works correctly  
✅ Static assets (CSS, JS) → Load normally

## Next Steps

1. **Build:** `npm run build`
2. **Deploy:** Push to your git repo or upload `dist` manually to Cloudflare Pages
3. **Test:** Try accessing different routes directly
4. **If still broken:** Try Solution 3 (Transform Rules) in Cloudflare Dashboard
