# Google OAuth 2.0 - TokenError: Bad Request - Debugging & Configuration Guide

**Status:** ✅ Deep debugging infrastructure deployed  
**Date:** June 3, 2026  
**Error:** `TokenError: Bad Request at OAuth2Strategy.parseErrorResponse`

---

## What This Error Means

The `TokenError: Bad Request` occurs **during token exchange** - when your backend tries to exchange Google's authorization code for an access token.

### Token Exchange Flow
```
1. User clicks "Login with Google"
2. Browser redirects to Google with callback URL
3. User approves permissions
4. Google redirects back to your callback URL with authorization code
5. **BACKEND ATTEMPTS TOKEN EXCHANGE** ← ERROR HAPPENS HERE
6. Google rejects the exchange request
7. TokenError: Bad Request is thrown
```

**The error means Google said "Bad Request" when you tried to exchange the code.**

---

## Root Cause Checklist

### ✅ Most Common Cause: Callback URL Mismatch

**In Passport Configuration:**
```javascript
callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
// Example: https://zerobox.onrender.com/api/auth/google/callback
```

**In Google Cloud Console:**
Authorized Redirect URIs must contain **EXACT MATCH**:
```
https://zerobox.onrender.com/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
```

**CRITICAL:** These must match EXACTLY including:
- ✅ Protocol (http vs https)
- ✅ Domain (zerobox.onrender.com vs zerobox-ashy.vercel.app)
- ✅ Port (if used in development)
- ✅ Path (/api/auth/google/callback)
- ✅ Trailing slash (or lack thereof)

### ✅ Second Most Common: Invalid Client Credentials

**Must Verify:**
- [ ] `GOOGLE_CLIENT_ID` is correct in Render environment
- [ ] `GOOGLE_CLIENT_SECRET` is correct in Render environment
- [ ] They belong to the **SAME** OAuth 2.0 client in Google Cloud

**Wrong:**
```
GOOGLE_CLIENT_ID from Client A
GOOGLE_CLIENT_SECRET from Client B  ← DIFFERENT CLIENTS = ERROR
```

**Right:**
```
GOOGLE_CLIENT_ID from Client A
GOOGLE_CLIENT_SECRET from Client A  ← SAME CLIENT = SUCCESS
```

### ✅ Third: HTTPS vs HTTP Mismatch

In production, Google enforces HTTPS:
```
✅ Correct: https://zerobox.onrender.com/api/auth/google/callback
❌ Wrong: http://zerobox.onrender.com/api/auth/google/callback
```

Render provides HTTPS by default, but verify in Google Cloud Console.

### ✅ Fourth: Environment Variables Not Set

**In Render Dashboard:**
Check Environment Variables section:
```
GOOGLE_CLIENT_ID      → Should be: ...
GOOGLE_CLIENT_SECRET  → Should be: ...
BACKEND_URL           → Should be: https://zerobox.onrender.com
FRONTEND_URL          → Should be: https://zerobox-ashy.vercel.app
```

If any are missing or wrong, OAuth will fail.

---

## Debugging Steps (Using New Logging)

### Step 1: Start Backend and Check Initialization

Run backend:
```bash
cd backend
npm start
```

**You should see:**
```
============================================================
ENVIRONMENT VARIABLE VERIFICATION
============================================================
✓ GOOGLE_CLIENT_ID: ...
✓ GOOGLE_CLIENT_SECRET: ...
✓ BACKEND_URL: https://zerobox.onrender.com
✓ FRONTEND_URL: https://zerobox-ashy.vercel.app
✓ JWT_SECRET: ...
✓ MONGODB_URI: ...
✓ PORT: 3000
✓ NODE_ENV: production
============================================================
✓ All required environment variables set

[PASSPORT] ... INIT: Passport Configuration Starting
[PASSPORT] ... CONFIG: OAuth Callback URL configured
...
GOOGLE OAUTH CONFIGURATION
================================================
✓ Callback URL: https://zerobox.onrender.com/api/auth/google/callback
✓ Client ID (first 20 chars): ...
✓ Client Secret Set: true
✓ Backend URL: https://zerobox.onrender.com
...
```

**If you see errors:**
- `❌ MISSING: GOOGLE_CLIENT_ID` → Set it in Render dashboard
- `❌ MISSING: GOOGLE_CLIENT_SECRET` → Set it in Render dashboard
- Any variable showing `undefined` → Fix in Render dashboard

---

### Step 2: Initiate Google Login and Watch Logs

1. Go to: https://zerobox-ashy.vercel.app/login (or your frontend)
2. Click "Login with Google"
3. **Watch Render logs in real-time** (Render dashboard → Logs)
4. Complete Google authentication

**Expected logs in order:**
```
[AUTH_BACKEND] ... OAUTH_INIT: Google OAuth flow started
[AUTH_BACKEND] ... CALLBACK_RECEIVED: Google callback request received
[AUTH_BACKEND] ... CALLBACK_VALID: Callback has valid authorization code
[PASSPORT] ... PASSPORT_AUTH_START: Starting Passport authentication
[PASSPORT] ... TOKEN_EXCHANGE_START: Exchanging authorization code...
```

**If you see TOKEN_EXCHANGE_ERROR:**
```
[PASSPORT] ... TOKEN_EXCHANGE_ERROR: Failed to exchange authorization code
   errorType: Error
   errorMessage: Bad Request
   errorCode: ...
   errorStatus: 400
```

This is the moment of failure. The reason is in the error message.

---

### Step 3: Check Google Cloud Console

Navigate to:
1. Google Cloud Console → OAuth 2.0 Client IDs
2. Find your OAuth 2.0 client credential
3. Click "Edit"
4. Scroll to "Authorized Redirect URIs"

**Verify these are present:**
```
https://zerobox.onrender.com/api/auth/google/callback
http://localhost:3000/api/auth/google/callback  (for local testing)
```

**If missing:**
1. Click "Add URI"
2. Enter: `https://zerobox.onrender.com/api/auth/google/callback`
3. Click "Save"
4. Wait ~5 minutes for propagation
5. Try login again

---

### Step 4: Verify Client Credentials

In Google Cloud Console:
1. OAuth 2.0 Client IDs → Select your app
2. Look at `Client ID` and `Client secret`
3. Copy them
4. Go to Render dashboard → Environment Variables
5. Paste them into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
6. Deploy
7. Try login again

---

## Common Error Messages & Solutions

### Error: "Bad Request"

**Cause:** Callback URL mismatch or invalid credentials  
**Solution:**
1. Check callback URL in Passport matches Google Cloud Console
2. Check Client ID and Secret are correct
3. Check they belong to same OAuth client

**Debug:**
- Check logs for exact callback URL being used
- Verify in Google Cloud Console

---

### Error: "Invalid Client"

**Cause:** Wrong Client ID or Client Secret  
**Solution:**
1. Go to Google Cloud Console
2. Get Client ID and Secret from the correct OAuth credential
3. Update Render environment variables
4. Redeploy

---

### Error: "Redirect URI Mismatch"

**Cause:** Callback URL doesn't match exactly in Google Cloud Console  
**Solution:**
1. In Google Cloud Console, check exact callback URL
2. In Render, verify `BACKEND_URL` is correct
3. Make sure protocol, domain, port, and path all match

---

## Configuration Files Overview

### 1. **backend/config/passport.js** - OAuth Setup
```javascript
// CRITICAL: This constructs the callback URL
const CALLBACK_URL = `${BACKEND_URL}/api/auth/google/callback`;

// NEW: Detailed logging and error interception
// - Logs callback URL on startup
// - Logs token exchange attempts
// - Captures and logs token exchange errors
// - Shows exact failure point
```

**Verify:**
- `BACKEND_URL` environment variable is set
- It's the correct production URL

### 2. **backend/routes/auth.js** - Callback Handler
```javascript
// NEW: Pre-auth logging
// - Logs when Google redirects back to you
// - Logs authorization code presence
// - Logs any errors from Google

// NEW: Passport custom callback
// - Logs token exchange attempt
// - Logs errors in detail
// - Shows exact error messages

// NEW: JWT generation
// - Creates token after successful auth
// - Redirects to frontend with token
```

**Verify:**
- Callback URL logic is correct
- Error handling is in place

### 3. **backend/app.js** - Initialization
```javascript
// NEW: Environment variable verification
// - Checks all required vars are set
// - Shows first 20 chars of secrets
// - Lists missing variables
// - Exits if critical vars missing
```

**Verify:**
- All environment variables are logged correctly
- No critical errors at startup

---

## Production Deployment Checklist

Before deploying to Render, verify:

### Render Environment Variables
```
✓ GOOGLE_CLIENT_ID        → (from Google Cloud)
✓ GOOGLE_CLIENT_SECRET    → (from Google Cloud)
✓ BACKEND_URL             → https://zerobox.onrender.com
✓ FRONTEND_URL            → https://zerobox-ashy.vercel.app
✓ JWT_SECRET              → (strong random string)
✓ MONGODB_URI             → (MongoDB connection)
✓ PORT                    → 3000
✓ NODE_ENV                → production
```

### Google Cloud Console
```
✓ OAuth 2.0 Client created
✓ Client ID and Secret obtained
✓ Authorized Redirect URIs contain:
  - https://zerobox.onrender.com/api/auth/google/callback
  - http://localhost:3000/api/auth/google/callback (for testing)
✓ Changes saved
```

---

## Testing Steps

### Local Testing (http://localhost:3000)

1. Backend running on localhost:3000
2. Frontend running on localhost:5173
3. Google Cloud Console has:
   - `http://localhost:3000/api/auth/google/callback` in Authorized Redirect URIs
4. `.env` file has:
   ```
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
   BACKEND_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:5173
   ```
5. Run backend with: `npm start`
6. Visit: http://localhost:5173/login
7. Click "Login with Google"
8. Check terminal logs for errors

### Production Testing (https://zerobox-ashy.vercel.app)

1. Frontend deployed on Vercel
2. Backend deployed on Render
3. Google Cloud Console has:
   - `https://zerobox.onrender.com/api/auth/google/callback` in Authorized Redirect URIs
4. Render environment variables set correctly
5. Visit: https://zerobox-ashy.vercel.app/login
6. Click "Login with Google"
7. Check Render logs for errors

---

## Log Output Examples

### Successful OAuth Flow

```
[PASSPORT] 2026-06-03T12:34:56.000Z CONFIG: OAuth Callback URL configured
   callbackURL: https://zerobox.onrender.com/api/auth/google/callback
   clientIDPrefix: 123456789012-abcdefgh...
   clientSecretSet: true

[AUTH_BACKEND] 2026-06-03T12:34:57.000Z OAUTH_INIT: Google OAuth flow started
[AUTH_BACKEND] 2026-06-03T12:34:58.000Z CALLBACK_RECEIVED: Google callback request received
   hasCode: true
   hasState: true
   hasError: false

[PASSPORT] 2026-06-03T12:34:58.100Z TOKEN_EXCHANGE_START: Exchanging authorization code
   code: 4/0AcvHHe6sYlRoY...
   redirectUri: https://zerobox.onrender.com/api/auth/google/callback

[PASSPORT] 2026-06-03T12:34:59.000Z TOKEN_EXCHANGE_SUCCESS: Authorization code exchanged
   accessTokenLength: 456
   refreshTokenPresent: true

[AUTH_BACKEND] 2026-06-03T12:34:59.100Z PASSPORT_SUCCESS: User authenticated by Passport
   userId: 507f1f77bcf86cd799439011
   email: user@gmail.com
   name: John Doe

[AUTH_BACKEND] 2026-06-03T12:34:59.200Z TOKEN_GENERATED: JWT token created
   userId: 507f1f77bcf86cd799439011
   expiresIn: 7d

[AUTH_BACKEND] 2026-06-03T12:34:59.300Z REDIRECT: Redirecting to frontend with token
   frontend: https://zerobox-ashy.vercel.app
```

### Failed OAuth Flow - Bad Request

```
[PASSPORT] 2026-06-03T12:34:58.100Z TOKEN_EXCHANGE_START: Exchanging authorization code
   code: 4/0AcvHHe6sYlRoY...
   redirectUri: https://zerobox.onrender.com/api/auth/google/callback

❌❌❌❌❌❌❌❌❌❌ ... (repeated 40 times)
PASSPORT AUTHENTICATION FAILED - Token Exchange Error
❌❌❌❌❌❌❌❌❌❌ ... (repeated 40 times)
Error Constructor: Error
Error Message: Bad Request
Error Code: 401
Error Status: 401

This error indicates:
1. Google rejected the token exchange request
2. Possible causes:
   - Callback URL mismatch ← MOST LIKELY
   - Invalid Client ID or Secret
   - Authorization code expired or invalid
   - HTTPS mismatch
```

---

## Quick Fixes

### Fix 1: Callback URL Mismatch

**In Render:**
```bash
# Check current BACKEND_URL
echo $BACKEND_URL
# Should output: https://zerobox.onrender.com
```

**In Google Cloud Console:**
1. Go to OAuth 2.0 Client IDs
2. Click "Edit"
3. Add (if not present): `https://zerobox.onrender.com/api/auth/google/callback`
4. Click "Save"
5. Wait 5 minutes
6. Try login again

---

### Fix 2: Client ID/Secret Mismatch

**In Google Cloud Console:**
1. Go to Credentials
2. Find your OAuth 2.0 Client
3. Copy Client ID
4. Copy Client Secret

**In Render:**
1. Go to Environment Variables
2. Update `GOOGLE_CLIENT_ID` with the copied ID
3. Update `GOOGLE_CLIENT_SECRET` with the copied Secret
4. Click "Save" (triggers redeploy)
5. Try login again

---

### Fix 3: Environment Variable Not Set

**In Render:**
1. Go to Service Dashboard
2. Scroll to Environment section
3. Click "Edit Variables"
4. Add missing variable (e.g., `GOOGLE_CLIENT_SECRET`)
5. Click "Save" (triggers redeploy)
6. Wait for deployment to complete
7. Try login again

---

## Next Steps

1. **Start backend** and verify no environment variable errors
2. **Check logs** for TOKEN_EXCHANGE_START and errors
3. **Verify callback URL** in Google Cloud Console
4. **Verify Client ID/Secret** in Render environment variables
5. **Test on production** by clicking "Login with Google"
6. **Watch Render logs** for detailed error messages
7. **Fix the root cause** based on error messages
8. **Redeploy and retest**

---

## Support

If you're still seeing `TokenError: Bad Request`:

1. **Check Render logs** - The exact error is logged there
2. **Verify callback URL** - Most common cause
3. **Verify Client ID/Secret** - Second most common
4. **Verify they're from same OAuth client** - Third most common
5. **Check Google Cloud Console** - Authorized Redirect URIs

The logs now tell you **exactly** what's wrong and where. Check the [TOKEN_EXCHANGE_ERROR] logs first.

