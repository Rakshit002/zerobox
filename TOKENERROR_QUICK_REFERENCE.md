# TokenError: Bad Request - Quick Reference Card

## The Problem
```
TokenError: Bad Request
  at OAuth2Strategy.parseErrorResponse
  at OAuth2Strategy._createOAuthError
```
**Means:** Google rejected your token exchange request

---

## The Root Causes (Check In This Order)

### 1️⃣ Callback URL Mismatch (MOST COMMON - 80% of cases)

**In Render logs you should see:**
```
[PASSPORT] CONFIG: OAuth Callback URL configured
   callbackURL: https://zerobox.onrender.com/api/auth/google/callback
```

**In Google Cloud Console, Authorized Redirect URIs must contain:**
```
https://zerobox.onrender.com/api/auth/google/callback
```

**If they don't match exactly:**
```
✗ https://zerobox.onrender.com/api/auth/google/callback/  (extra slash)
✗ http://zerobox.onrender.com/api/auth/google/callback   (missing https)
✗ https://zerobox-ashy.vercel.app/api/auth/google/callback (wrong domain)
```

**Fix:**
1. Go to Google Cloud Console
2. OAuth 2.0 Client IDs → Your app
3. Edit → Authorized Redirect URIs
4. Add/Update to: `https://zerobox.onrender.com/api/auth/google/callback`
5. Save
6. Wait 5 minutes
7. Try login again

---

### 2️⃣ Invalid Client ID or Secret (15% of cases)

**In Render logs you should see:**
```
✓ GOOGLE_CLIENT_ID: 123456789012-abcdefghijklmnopqrst...
✓ GOOGLE_CLIENT_SECRET: GOCSPX-abcdefghijklmnopqrst...
```

**If you see:**
```
❌ MISSING: GOOGLE_CLIENT_ID
❌ MISSING: GOOGLE_CLIENT_SECRET
✓ GOOGLE_CLIENT_ID: undefined
✓ GOOGLE_CLIENT_SECRET: undefined
```

**Fix:**
1. Go to Google Cloud Console → Credentials
2. OAuth 2.0 Client IDs → Your app
3. Copy the Client ID and Client Secret
4. Go to Render dashboard → Environment
5. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
6. Save (triggers redeploy)
7. Try login again

**CRITICAL:** Make sure they're from the **SAME** OAuth 2.0 client
```
Wrong:
  GOOGLE_CLIENT_ID from "MyApp"
  GOOGLE_CLIENT_SECRET from "TestApp"  ← Different clients!

Right:
  GOOGLE_CLIENT_ID from "MyApp"
  GOOGLE_CLIENT_SECRET from "MyApp"    ← Same client!
```

---

### 3️⃣ Environment Variables Not Set (5% of cases)

**In Render logs, startup section:**
```
============================================================
ENVIRONMENT VARIABLE VERIFICATION
============================================================
❌ MISSING: GOOGLE_CLIENT_ID
❌ MISSING: GOOGLE_CLIENT_SECRET
❌ MISSING: BACKEND_URL
```

**Fix:**
1. Render dashboard → Environment
2. Set all missing variables
3. Save (triggers redeploy)
4. Try login again

---

## Debugging Steps

### Step 1: Start Backend and Watch Startup Logs
```bash
# In Render dashboard, go to Logs
# Should see:
[PASSPORT] ... CONFIG: OAuth Callback URL configured
   callbackURL: https://zerobox.onrender.com/api/auth/google/callback

# If you see:
❌ MISSING: (variable name)
→ Set it in Render Environment Variables
```

---

### Step 2: Initiate Google Login
1. Go to https://zerobox-ashy.vercel.app/login
2. Click "Login with Google"
3. Complete Google authentication

---

### Step 3: Watch for TokenError in Logs
**Success logs:**
```
[PASSPORT] TOKEN_EXCHANGE_START: Exchanging authorization code
[PASSPORT] TOKEN_EXCHANGE_SUCCESS: Authorization code exchanged ✓
[AUTH_BACKEND] PASSPORT_SUCCESS: User authenticated ✓
```

**Error logs:**
```
[PASSPORT] TOKEN_EXCHANGE_START: Exchanging authorization code
❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
PASSPORT AUTHENTICATION FAILED - Token Exchange Error
❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
Error Message: Bad Request
Error Status: 401

Possible causes:
1. Callback URL mismatch ← START HERE
2. Invalid Client ID or Secret
3. Authorization code expired or invalid
4. HTTPS mismatch
```

---

### Step 4: Fix Based on Error Type

| Error | Cause | Fix |
|-------|-------|-----|
| `Bad Request` (401) | Callback URL mismatch or invalid credentials | Check cause #1 or #2 |
| `Invalid Client` | Wrong Client ID/Secret | Check cause #2 |
| `Redirect URI Mismatch` | Callback URL doesn't match | Check cause #1 |
| `❌ MISSING: GOOGLE_CLIENT_SECRET` | Environment variable not set | Check cause #3 |

---

## Verification Checklist

### In Render Environment Variables
```
✓ GOOGLE_CLIENT_ID           (check first 20 chars match Google Cloud)
✓ GOOGLE_CLIENT_SECRET       (should be present and not empty)
✓ BACKEND_URL                https://zerobox.onrender.com
✓ FRONTEND_URL               https://zerobox-ashy.vercel.app
✓ JWT_SECRET                 (long random string)
✓ MONGODB_URI                (database connection)
✓ PORT                       3000
✓ NODE_ENV                   production
```

### In Google Cloud Console
```
✓ OAuth 2.0 Client exists
✓ Client ID present
✓ Client Secret present
✓ Authorized Redirect URIs includes:
  https://zerobox.onrender.com/api/auth/google/callback
✓ (Also http://localhost:3000/api/auth/google/callback for testing)
```

### In Backend Code (Already Done)
```
✓ passport.js       - Callback URL configured, errors logged
✓ auth.js          - Token exchange logged, errors caught
✓ app.js           - Environment variables verified
```

---

## Most Common Fix (80% of cases)

**Callback URL Mismatch:**
1. Render logs show: `https://zerobox.onrender.com/api/auth/google/callback`
2. Google Cloud: Add same URL to Authorized Redirect URIs
3. Save and wait 5 minutes
4. Try login again ✓

---

## Most Common Second Fix (15% of cases)

**Invalid Credentials:**
1. Google Cloud Console → Credentials
2. Get Client ID and Secret
3. Render dashboard → Environment
4. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
5. Save (redeploy)
6. Try login again ✓

---

## Getting Help

1. **Check Render logs** - Exact error is there
2. **Search for [PASSPORT]** - All OAuth logs start with this
3. **Look for TOKEN_EXCHANGE_ERROR** - This is where Bad Request appears
4. **Check Authorized Redirect URIs** - Google Cloud Console
5. **Verify environment variables** - Render dashboard

---

## Testing Locally

**Add to Google Cloud Console:**
```
http://localhost:3000/api/auth/google/callback
```

**.env file:**
```
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

**Run:**
```bash
npm start
```

**Test:** http://localhost:5173/login → "Login with Google"

---

## Summary

✅ **Callback URL Mismatch** - Check Google Cloud Console  
✅ **Invalid Credentials** - Check Client ID/Secret match  
✅ **Environment Variables** - Set in Render dashboard  
✅ **All logged now** - Check [PASSPORT] and [AUTH_BACKEND] logs  

**The error message now tells you exactly what's wrong.** Read the logs carefully.

