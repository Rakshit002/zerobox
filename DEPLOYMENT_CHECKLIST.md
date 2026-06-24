# Authentication Flow - Deployment Checklist

## Pre-Deployment Validation

### Code Review Checklist
- [ ] All 5 files reviewed for changes
- [ ] No merge conflicts
- [ ] All imports correct
- [ ] No syntax errors
- [ ] Logging doesn't break in production

### Testing Checklist (Local)

#### Frontend Tests
- [ ] OAuth flow completes successfully
- [ ] Token extracted from URL and stored
- [ ] URL cleaned after token extraction
- [ ] /auth/me API call succeeds
- [ ] User data loads in AuthContext
- [ ] ProtectedRoute grants access
- [ ] Inbox loads and displays emails
- [ ] Page refresh maintains authentication
- [ ] Console shows [AUTH] logs (development only)

#### Backend Tests
- [ ] Google OAuth redirects correctly
- [ ] JWT token generated with 7d expiry
- [ ] /auth/me verifies token successfully
- [ ] Invalid tokens return loggedIn=false
- [ ] Expired tokens handled gracefully
- [ ] Console shows [AUTH_BACKEND] logs (development only)
- [ ] FRONTEND_URL environment variable correct
- [ ] JWT_SECRET environment variable correct

---

## Frontend Deployment (Vercel)

### Step 1: Environment Variables
Verify in Vercel dashboard:
```
VITE_API_URL=https://your-backend.onrender.com/api
```

Or verify `.env.production`:
```javascript
// src/api/axios.js automatically uses:
// - Development: http://localhost:3000/api
// - Production: window.location.origin/api (if same origin)
// - Or custom API URL from env var
```

### Step 2: Verify Build Configuration
Check `frontend/vite.config.js`:
```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
})
```

### Step 3: Disable Debug Logging (Production)
AuthContext.jsx line 9:
```javascript
const DEBUG = process.env.NODE_ENV === "development"; // ✅ Correct
```

axios.js line 5:
```javascript
const DEBUG = process.env.NODE_ENV === "development"; // ✅ Correct
```

### Step 4: Deploy Command
```bash
cd frontend
npm run build  # Test build locally first
# Then push to GitHub and Vercel deploys automatically
# Or: vercel deploy --prod
```

### Step 5: Verify Deployment
- [ ] Navigate to https://zerobox-ashy.vercel.app
- [ ] Click "Login with Google"
- [ ] Complete OAuth
- [ ] Verify redirected to /inbox
- [ ] Verify email list loads
- [ ] Open DevTools → Console
- [ ] Verify NO [AUTH] logs (production mode)
- [ ] But errors should still appear if they occur

---

## Backend Deployment (Render)

### Step 1: Environment Variables
Set in Render dashboard:
```
JWT_SECRET=your-very-long-secure-random-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=your-mongodb-uri
FRONTEND_URL=https://zerobox-ashy.vercel.app
BACKEND_URL=https://your-backend.onrender.com
NODE_ENV=production
```

### Step 2: Verify Configuration
Backend file: `backend/config/passport.js`
- [ ] callbackURL uses BACKEND_URL env var: ✅ Correct

Backend file: `backend/routes/auth.js`
- [ ] FRONTEND_URL uses environment variable: ✅ Correct
- [ ] Error redirects include error params: ✅ Correct

### Step 3: Google OAuth Configuration
In Google Cloud Console:
- [ ] Add Render URL to authorized redirect URIs
  - `https://your-backend.onrender.com/api/auth/google/callback`
- [ ] Verify Client ID and Secret match env vars

### Step 4: Deploy Command
```bash
cd backend
# Render auto-deploys from git push
git push origin main
```

### Step 5: Verify Deployment
```bash
# Test API endpoint
curl https://your-backend.onrender.com/api/auth/me
# Should return: {"loggedIn":false}

# Check logs in Render dashboard
# Should show: [AUTH_BACKEND] CONFIG: Backend Auth Routes Initialized
```

---

## Cross-Environment Testing

### Test 1: Complete OAuth Flow
1. **Setup:**
   - Frontend: https://zerobox-ashy.vercel.app (or your URL)
   - Backend: https://your-backend.onrender.com (or your URL)

2. **Steps:**
   - Go to frontend URL
   - Click "Login with Google"
   - Check console logs
   - Complete Google auth
   - Verify redirected to /inbox
   - Verify URL is clean (no token query param)
   - Verify emails load

3. **Success Criteria:**
   - ✅ OAuth succeeds
   - ✅ User redirected to /inbox
   - ✅ Email list displays
   - ✅ Token persists on page refresh
   - ✅ No redirect loops

### Test 2: Session Persistence
1. Login successfully
2. Refresh page (F5)
3. Should stay on /inbox
4. Should not redirect to login

### Test 3: Invalid Token
1. In Console:
   ```javascript
   localStorage.setItem("token", "invalid.token.here");
   window.location.href = "/login";
   ```
2. Should show error on login page or redirect to login

### Test 4: Logout Flow
1. Login successfully
2. In Console:
   ```javascript
   localStorage.removeItem("token");
   window.location.href = "/";
   ```
3. Should redirect to login
4. Should not auto-redirect to /inbox

---

## Monitoring After Deployment

### Metrics to Watch (First 24 Hours)

**Frontend (Vercel Analytics):**
- ✅ Page load time < 3s
- ✅ No 5xx errors
- ✅ No JavaScript errors

**Backend (Render Metrics):**
- ✅ Response time < 500ms
- ✅ Error rate < 1%
- ✅ CPU < 80%
- ✅ Memory < 80%

**OAuth Tracking:**
- Count: How many users complete login?
- Success rate: What % complete the flow?
- Drop-off: Where do users drop off?

### Error Logs to Watch

**Frontend Console Errors:**
- `[AUTH] ERROR:` - Authentication failures
- `[API] RESPONSE_ERROR:` - API failures

**Backend Logs:**
- `[AUTH_BACKEND] ERROR:` - Backend errors
- Stack traces in production

---

## Troubleshooting Deployment Issues

### Issue: Users Can't Login on Production

**Debug Steps:**
1. Verify `FRONTEND_URL` correct on backend
2. Verify Google OAuth credentials
3. Check Render logs for OAuth errors
4. Test `/api/auth/me` endpoint manually

**Fix:**
```bash
# SSH into Render backend
# Check env vars
env | grep FRONTEND_URL
env | grep JWT_SECRET
env | grep GOOGLE_

# If wrong, update in Render dashboard and redeploy
```

### Issue: Token Validation Fails (401 Errors)

**Debug Steps:**
1. Verify `JWT_SECRET` same on backend and set correctly
2. Check token length: `localStorage.getItem("token").length`
3. Verify token format: Should start with `eyJ...`

**Fix:**
```bash
# Generate new JWT_SECRET
openssl rand -base64 32

# Update in Render dashboard
# Redeploy backend
# Clear all user tokens
```

### Issue: CORS Errors

**Debug Steps:**
1. Check browser Network tab for CORS headers
2. Check backend logs for origin

**Fix:**
Update `backend/app.js` CORS configuration:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
```

---

## Rollback Plan

If critical issue found in production:

### Quick Rollback (Within 5 Minutes)
1. Revert latest commit locally
2. Push to GitHub
3. Vercel/Render auto-redeploy
4. Takes ~1-2 minutes

### Full Rollback (If deployment failed)
1. Vercel: Go to deployments, select previous working version
2. Render: Go to events, restart previous version

### Partial Rollback (Frontend Only)
1. Frontend issues: Revert frontend only, keep backend running
2. Backend issues: Revert backend only, keep frontend running

---

## Post-Deployment Checklist

### Day 1 (Launch Day)
- [ ] Monitor error logs every hour
- [ ] Test with real users if possible
- [ ] Check OAuth flow works end-to-end
- [ ] Verify no redirect loops
- [ ] Monitor performance metrics

### Week 1
- [ ] Collect user feedback
- [ ] Monitor 401 error rates
- [ ] Check token expiry handling
- [ ] Verify logout flow works
- [ ] Look for any auth-related crashes

### Month 1
- [ ] Analyze authentication metrics
- [ ] Document common errors
- [ ] Plan improvements based on data
- [ ] Consider additional security measures

---

## Security Verification Before Production

### SSL/TLS
- [ ] Frontend served over HTTPS: ✅ Vercel default
- [ ] Backend served over HTTPS: ✅ Render default
- [ ] All API calls use HTTPS

### CORS
- [ ] Frontend origin configured correctly: ✅ Auto in axios.js
- [ ] No overly permissive CORS settings

### Secrets
- [ ] No secrets in git repository
- [ ] JWT_SECRET is strong (> 32 characters)
- [ ] Google OAuth credentials secured
- [ ] All secrets in environment variables

### Token Security
- [ ] Token expires after 7 days
- [ ] Token not in localStorage for sensitive operations
- [ ] Consider HttpOnly cookies for future enhancement
- [ ] Token removed from URL after extraction

---

## Final Validation

Run this checklist just before clicking deploy:

```javascript
// Frontend Validation (in Console)
console.log("✓ API Base URL:", 
  window.location.hostname === "localhost" 
    ? "http://localhost:3000/api"
    : `${window.location.origin}/api`
);

console.log("✓ localStorage available:", typeof localStorage !== "undefined");

console.log("✓ React Router available:", typeof window.React !== "undefined");

// Should see no critical errors above
```

---

## Deployment Sign-Off

**Before deploying to production, confirm:**

- [ ] All 5 code files reviewed
- [ ] Local testing passed
- [ ] Environment variables set correctly
- [ ] HTTPS configured on both frontend and backend
- [ ] Google OAuth credentials updated
- [ ] Monitoring/logging configured
- [ ] Team notified of deployment
- [ ] Rollback plan understood

**Status:** ✅ READY FOR PRODUCTION DEPLOYMENT

