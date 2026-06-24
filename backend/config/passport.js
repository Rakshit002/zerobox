import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/usermodel.js";

// ============================================================
// DETAILED LOGGING FOR OAUTH DEBUGGING
// ============================================================
const log = (stage, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[PASSPORT] ${timestamp} ${stage}: ${message}`, data || "");
};

const normalizeUrl = (url) => url?.trim().replace(/\/$/, "");

// Verify environment variables at startup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || (process.env.NODE_ENV === "production" ? "https://zerobox.onrender.com" : "http://localhost:3000");

log("INIT", "Passport Configuration Starting");

if (!GOOGLE_CLIENT_ID) {
  log("ERROR", "GOOGLE_CLIENT_ID not set in environment variables");
  console.error("❌ MISSING: GOOGLE_CLIENT_ID environment variable");
}

if (!GOOGLE_CLIENT_SECRET) {
  log("ERROR", "GOOGLE_CLIENT_SECRET not set in environment variables");
  console.error("❌ MISSING: GOOGLE_CLIENT_SECRET environment variable");
}


// ============================================================
// CONSTRUCT CALLBACK URL (CRITICAL FOR TOKEN EXCHANGE)
// ============================================================
const CALLBACK_URL = `${BACKEND_URL}/api/auth/google/callback`;

log("CONFIG", "OAuth Callback URL configured", {
  callbackURL: CALLBACK_URL,
  clientIDPrefix: GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + "..." : "NOT SET",
  clientSecretSet: !!GOOGLE_CLIENT_SECRET,
  backendURL: BACKEND_URL
});

// ============================================================
// CRITICAL: Log the exact configuration sent to Google
// ============================================================
console.log("\n" + "=".repeat(60));
console.log("GOOGLE OAUTH CONFIGURATION");
console.log("=".repeat(60));
console.log(`✓ Callback URL: ${CALLBACK_URL}`);
console.log(`✓ Client ID (first 20 chars): ${GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + "..." : "NOT SET"}`);
console.log(`✓ Client Secret Set: ${!!GOOGLE_CLIENT_SECRET}`);
console.log(`✓ Backend URL: ${BACKEND_URL}`);
console.log("\n⚠️  VERIFY IN GOOGLE CLOUD CONSOLE:");
console.log(`   - Authorized Redirect URIs must include:`);
console.log(`     → ${CALLBACK_URL}`);
console.log("\n" + "=".repeat(60) + "\n");

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      // ============================================================
      // ADDITIONAL OPTIONS FOR DEBUGGING
      // ============================================================
      passReqToCallback: true, // Pass req to verify callback for logging
    },
    // ============================================================
    // VERIFY CALLBACK - Called after token exchange succeeds
    // ============================================================
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        log("VERIFY_START", "Google profile verification starting", {
          profileID: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value || "NO EMAIL"
        });

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          log("USER_CREATE", "Creating new user from Google profile", {
            googleId: profile.id,
            email: profile.emails[0].value
          });

          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            googleAccessToken: accessToken,
          });

          log("USER_CREATED", "New user created successfully", {
            userId: user._id,
            email: user.email
          });
        } else {
          log("USER_EXISTS", "User already exists, updating access token", {
            userId: user._id,
            email: user.email
          });

          // update token if user logs in again
          user.googleAccessToken = accessToken;
          await user.save();

          log("USER_UPDATED", "User access token updated", {
            userId: user._id
          });
        }

        done(null, user);
      } catch (err) {
        log("VERIFY_ERROR", "Exception in verify callback", {
          message: err.message,
          stack: err.stack.substring(0, 200)
        });
        console.error("❌ VERIFY CALLBACK ERROR:", err);
        done(err, null);
      }
    }
  )
);

// ============================================================
// CAPTURE STRATEGY ERRORS (Token Exchange Failures)
// This is where "TokenError: Bad Request" occurs
// ============================================================
const strategy = passport.strategies.google;

if (strategy && strategy._oauth2) {
  const originalGetOAuthAccessToken = strategy._oauth2.getOAuthAccessToken;

  strategy._oauth2.getOAuthAccessToken = function(code, params, callback) {
    log("TOKEN_EXCHANGE_START", "Exchanging authorization code for access token", {
      code: code.substring(0, 20) + "...",
      redirectUri: params.redirect_uri || "NOT SET",
      grantType: params.grant_type || "authorization_code"
    });

    return originalGetOAuthAccessToken.call(
      this,
      code,
      params,
      (err, accessToken, refreshToken, results) => {
        if (err) {
          log("TOKEN_EXCHANGE_ERROR", "Failed to exchange authorization code", {
            errorType: err.constructor.name,
            errorMessage: err.message,
            errorCode: err.code,
            errorStatus: err.status,
            errorData: err.data ? err.data.substring(0, 200) : "NO DATA"
          });

          console.error("\n" + "❌".repeat(30));
          console.error("TOKEN EXCHANGE ERROR DETAILS:");
          console.error("❌".repeat(30));
          console.error("Error Type:", err.constructor.name);
          console.error("Error Message:", err.message);
          console.error("Error Code:", err.code);
          console.error("Error Status:", err.status);
          if (err.data) console.error("Error Data:", err.data);
          console.error("\n⚠️  TROUBLESHOOTING:");
          console.error("1. Verify callback URL in Passport matches Google Cloud Console");
          console.error("2. Verify Client ID and Secret are correct");
          console.error("3. Verify Client ID and Secret belong to SAME OAuth 2.0 credential");
          console.error("4. Check that redirect URI is HTTPS in production");
          console.error("❌".repeat(30) + "\n");
        } else {
          log("TOKEN_EXCHANGE_SUCCESS", "Authorization code exchanged successfully", {
            accessTokenLength: accessToken.length,
            refreshTokenPresent: !!refreshToken
          });
        }

        callback(err, accessToken, refreshToken, results);
      }
    );
  };
}
