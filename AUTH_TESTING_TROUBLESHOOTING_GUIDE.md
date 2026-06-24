# Authentication Flow - Testing & Troubleshooting Guide

## Quick Start: Test the Authentication Flow

### Prerequisites
- Backend running on `http://localhost:3000` (or Render in production)
- Frontend running on `http://localhost:5173` (or Vercel in production)
- Google OAuth credentials configured
- DevTools available (F12)

---

## Test Procedure

### Step 1: Prepare Your Environment
```bash
# Terminal 1: Backend
cd backend
npm start  # or: nodemon app.js

# Terminal 2: Frontend
cd frontend
npm run dev

# Browser: Open DevTools (F12) and go to Console tab
```

### Step 2: Verify Debug Logging is Enabled
In Console, run:
```javascript
console.log('NODE_ENV:', process.env.NODE_ENV);
// Should show: "development" for debug logs
```

### Step 3: Clear Previous Session
In Console, run:
```javascript
localStorage.removeItem("token");
window.location.href = "/login";
```

### Step 4: Initiate Google Login
1. Navigate to `http://localhost:5173` (or your frontend URL)
2. Click "Login with Google"
3. Watch Console - you should see logs:
   ```
   [LOGIN_PAGE] OAUTH_START: Starting Google OAuth flow
   [LOGIN_PAGE] OAUTH_REDIRECT: Redirecting to Google
   ```

### Step 5: Complete Google Authentication
1. Sign in with your Google account
2. Approve permissions
3. Watch browser redirect back to frontend

### Step 6: Monitor Token Extraction
When redirected back, check Console for:
```
[AUTH] INIT: Starting authentication initialization
[AUTH] OAUTH_CALLBACK: Token found in URL {tokenLength: 180, url: "https://..."}
[AUTH] TOKEN_STORAGE: Token stored to localStorage
[AUTH] URL_CLEANUP: URL cleaned and replaceState applied
```

### Step 7: Verify Token Verification
Continue watching Console for:
```
[AUTH] TOKEN_CHECK: Token found in localStorage {tokenLength: 180, ...}
[AUTH] API_CALL: Calling /auth/me to verify token
[API] REQUEST: GET /auth/me {hasAuth: true, tokenLength: 180, ...}
[API] RESPONSE_SUCCESS: 200 {url: "/auth/me"}
[AUTH] API_RESPONSE: Response received from /auth/me {loggedIn: true, hasUser: true}
[AUTH] AUTH_SUCCESS: User authenticated {userId: "...", userName: "...", email: "..."}
```

### Step 8: Verify Access Granted
Finally, you should see:
```
[PROTECTED_ROUTE] ACCESS_GRANTED: User authenticated - allowing access {userId: "...", userName: "..."}
```

### Step 9: Verify URL Cleanup
Check the address bar - URL should be clean:
```
❌ WRONG: https://zerobox-ashy.vercel.app/inbox?token=eyJhbGciOiJ...
✅ CORRECT: https://zerobox-ashy.vercel.app/inbox
```

### Step 10: Verify Session Persistence
1. You should now see the Inbox page
2. Refresh the page (F5)
3. Check Console - should see:
   ```
   [AUTH] TOKEN_CHECK: Token found in localStorage {tokenLength: 180, ...}
   [AUTH] API_CALL: Calling /auth/me to verify token
   [API] REQUEST: GET /auth/me {hasAuth: true, ...}
   [AUTH] AUTH_SUCCESS: User authenticated
   ```
4. Should NOT redirect to login

---

## Troubleshooting Guide

### Problem 1: User Redirected to Login After OAuth

**Symptoms:**
- OAuth succeeds
- Redirect happens
- But user lands on login page

**Diagnosis Steps:**

1. **Check Console for [AUTH] logs:**
   ```
   ❌ Missing: [AUTH] OAUTH_CALLBACK
   ❌ Missing: [AUTH] TOKEN_STORAGE
   ❌ Missing: [AUTH] API_CALL
   ```

2. **If logs show token extraction failed:**
   - In Console: `new URLSearchParams(window.location.search).get("token")`
   - If returns `null`, token not in URL
   - **Solution:** Check backend redirect is correct
     - Backend logs should show: `[AUTH_BACKEND] REDIRECT: Redirecting to frontend...`
     - Verify FRONTEND_URL environment variable on backend

3. **If logs show token storage succeeded but API call failed:**
   - Check Console for: `[API] RESPONSE_ERROR`
   - Status codes indicate:
     - `401`: Token invalid or expired
     - `500`: Backend server error
     - `404`: /auth/me endpoint not found
   - **Solution:** 
     - Backend logs: Look for `[AUTH_BACKEND] TOKEN_GENERATED` or `[AUTH_BACKEND] ERROR`
     - Verify JWT_SECRET environment variable set correctly on backend
     - Verify /auth/me endpoint exists

4. **If logs show API succeeded but user still redirected:**
   - Check: `localStorage.getItem("token")`
   - In Console, check if user state updated:
     ```javascript
     // This won't work directly, but check if ProtectedRoute logs show ACCESS_GRANTED
     ```
   - **Solution:** Check ProtectedRoute logs

---

### Problem 2: "Loading..." Stuck on Login Page

**Symptoms:**
- Login page shows "Checking your session..."
- Stays stuck for several seconds
- Never completes

**Diagnosis Steps:**

1. **Check if /auth/me API is slow:**
   - Backend logs should show timing: `[AUTH_BACKEND] AUTH_SUCCESS`
   - If missing, backend is hanging

2. **Check browser network tab:**
   - Right-click page → Inspect → Network tab
   - Filter by "me" (the API call)
   - Check response time and status code

3. **Common causes:**
   - Backend not running
   - Database connection slow
   - MongoDB credentials wrong
   - Network timeout

**Solution:**
```bash
# Backend: Check if running
curl http://localhost:3000/api/auth/me
# Should return: {"loggedIn": false}

# Backend: Check MongoDB connection
# Look in backend logs for connection errors
# Verify MONGODB_URI environment variable
```

---

### Problem 3: "Token rejected by server" Error

**Symptoms:**
- See red error box on login page
- Error message: "Token rejected by server"

**Diagnosis Steps:**

1. **Check backend logs:**
   ```
   [AUTH_BACKEND] AUTH_ERROR: Invalid JWT
   ```

2. **Possible causes:**
   - JWT_SECRET changed between requests
   - Token corrupted during transmission
   - Token expired (unlikely immediately after login)

3. **In Console:**
   ```javascript
   // Check token in localStorage
   localStorage.getItem("token")
   // Should show a JWT (starts with "eyJ...")
   ```

**Solution:**
```bash
# Backend: Verify JWT_SECRET is set and consistent
echo $JWT_SECRET

# Frontend: Clear and retry
localStorage.removeItem("token");
window.location.href = "/login";
```

---

### Problem 4: Token in URL After Login

**Symptoms:**
- Successfully logged in
- But URL still shows: `https://zerobox-ashy.vercel.app/inbox?token=...`

**Diagnosis Steps:**

1. **Check Console for URL cleanup logs:**
   ```
   ✅ Should see: [AUTH] URL_CLEANUP: URL cleaned and replaceState applied
   ```

2. **If URL not cleaned:**
   - Check browser version (replaceState might not work)
   - Check for JavaScript errors in Console

**Solution:**
```javascript
// Manual URL cleanup
window.history.replaceState({}, document.title, window.location.pathname);
```

---

### Problem 5: Logout Not Working

**Symptoms:**
- Can't figure out how to logout
- User stuck in authenticated state

**Solution:**
```javascript
// In Console or in code:
localStorage.removeItem("token");
window.location.href = "/login";
```

This will clear the token and redirect to login page.

---

## Console Log Quick Reference

### Frontend Logs

| Log | Meaning | Severity |
|-----|---------|----------|
| `[AUTH] INIT: Starting...` | Auth check started | INFO |
| `[AUTH] OAUTH_CALLBACK: Token found` | Token extracted from URL | INFO |
| `[AUTH] TOKEN_STORAGE: Stored` | Token saved to localStorage | INFO |
| `[AUTH] URL_CLEANUP: URL cleaned` | URL history updated | INFO |
| `[AUTH] TOKEN_CHECK: Token found` | Token in localStorage | INFO |
| `[AUTH] API_CALL: Calling /auth/me` | Verification started | INFO |
| `[AUTH] API_RESPONSE: loggedIn=true` | API returned success | INFO |
| `[AUTH] AUTH_SUCCESS: User authenticated` | Auth complete | INFO |
| `[AUTH] ERROR: Exception during auth` | Exception caught | ERROR |
| `[API] REQUEST: GET /auth/me` | API call initiated | INFO |
| `[API] RESPONSE_SUCCESS: 200` | API succeeded | INFO |
| `[API] RESPONSE_ERROR: 401` | API returned error | ERROR |
| `[PROTECTED_ROUTE] ACCESS_GRANTED` | Route access allowed | INFO |
| `[PROTECTED_ROUTE] ACCESS_DENIED` | Route access denied | INFO |
| `[LOGIN_PAGE] OAUTH_START` | User clicked login | INFO |
| `[LOGIN_PAGE] REDIRECT: Already authenticated` | User redirected to inbox | INFO |

### Backend Logs

| Log | Meaning | Severity |
|-----|---------|----------|
| `[AUTH_BACKEND] OAUTH_INIT` | OAuth flow started | INFO |
| `[AUTH_BACKEND] GOOGLE_CALLBACK` | Google auth completed | INFO |
| `[AUTH_BACKEND] TOKEN_GENERATED` | JWT created | INFO |
| `[AUTH_BACKEND] REDIRECT` | Redirecting to frontend | INFO |
| `[AUTH_BACKEND] AUTH_CHECK` | Token verification started | INFO |
| `[AUTH_BACKEND] TOKEN_VERIFIED` | JWT is valid | INFO |
| `[AUTH_BACKEND] AUTH_SUCCESS` | User authenticated | INFO |
| `[AUTH_BACKEND] AUTH_ERROR: Invalid JWT` | Token corrupted/invalid | ERROR |
| `[AUTH_BACKEND] AUTH_ERROR: JWT expired` | Token too old | ERROR |
| `[AUTH_BACKEND] ERROR` | Unexpected error | CRITICAL |

---

## Performance Benchmarks

**Expected Timings (for reference):**
- Token extraction: < 1ms
- localStorage operations: < 1ms  
- /auth/me API call: 50-200ms
- Total auth initialization: 100-300ms
- Page load after auth: < 1s

If timings exceed these, investigate:
- Network latency
- Database query performance
- Backend load

---

## Production Considerations

### Before Deploying to Production

- [ ] Set `NODE_ENV=production` on frontend (disables logging)
- [ ] Set `NODE_ENV=production` on backend (disables logging except errors)
- [ ] Verify FRONTEND_URL environment variable on backend
- [ ] Verify BACKEND_URL environment variable on frontend
- [ ] Verify JWT_SECRET environment variable on backend
- [ ] Verify Google OAuth credentials are correct
- [ ] Test complete OAuth flow on staging
- [ ] Verify SSL/HTTPS certificate is valid
- [ ] Check CORS configuration
- [ ] Monitor error logs for first 24 hours

### Monitoring After Deployment

Watch for:
1. **401 Unauthorized errors** - Token validation failures
2. **500 errors** - Backend exceptions
3. **Redirect loops** - Users stuck in login loop
4. **Session timeouts** - Users logged out unexpectedly

---

## Additional Testing Scenarios

### Scenario 1: Token Expiry (After 7 Days)

```javascript
// Simulate expired token (for testing only)
const expiredToken = jwt.sign(
  { id: "test" },
  process.env.JWT_SECRET,
  { expiresIn: "-1d" }  // Already expired
);
localStorage.setItem("token", expiredToken);
// Refresh page - should redirect to login with error
```

### Scenario 2: Invalid Token

```javascript
// Manually set invalid token
localStorage.setItem("token", "invalid.token.here");
window.location.href = "/inbox";
// Should redirect to login with error
```

### Scenario 3: Multiple Logins

1. Login with Account A
2. Open incognito window
3. Login with Account B
4. Switch between windows
5. Both should work independently

### Scenario 4: Concurrent Requests

1. Login
2. Quickly navigate to multiple pages
3. All should work without race conditions

---

## Getting Help

If issues persist after troubleshooting:

1. **Collect Logs**
   - Frontend Console (F12)
   - Backend stdout
   - Browser Network tab
   - Screenshots of errors

2. **Check Configuration**
   - Environment variables set correctly
   - Backend/Frontend URLs match
   - Google OAuth credentials valid

3. **Test Minimal Case**
   - Fresh browser session (incognito)
   - Clear localStorage
   - Refresh page
   - Attempt login again

4. **Review Code Changes**
   - Check git diff for authentication files
   - Verify no merge conflicts
   - Confirm all files deployed

---

## Summary

✅ **With comprehensive logging:** Auth flow issues are immediately visible  
✅ **With error states:** Users know when something went wrong  
✅ **With detailed logs:** Root causes can be traced in seconds  

**Golden Rule:** If authentication isn't working, first check the Console logs. The answer is almost always there.

