import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();
import User from "../models/usermodel.js";

const DEBUG = process.env.NODE_ENV !== "production";
const log = (stage, message, data = null) => {
  const timestamp = new Date().toISOString();
  if (DEBUG || stage === "ERROR") {
    console.log(`[AUTH_BACKEND] ${timestamp} ${stage}: ${message}`, data || "");
  }
};

const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? "https://zerobox-ashy.vercel.app" : "http://localhost:5173");
const FRONTEND_URLS = [FRONTEND_URL];

const encodeOAuthState = (state) =>
  Buffer.from(JSON.stringify(state)).toString("base64url");

const decodeOAuthState = (state) => {
  if (!state || typeof state !== "string") {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
  } catch (error) {
    log("ERROR", "Unable to decode OAuth state", { message: error.message });
    return null;
  }
};

const normalizeUrl = (url) => url?.trim().replace(/\/$/, "");

const isAllowedFrontendUrl = (url) => {
  const normalizedUrl = normalizeUrl(url);

  if (!normalizedUrl) {
    return false;
  }

  if (FRONTEND_URLS.includes(normalizedUrl)) {
    return true;
  }

  return process.env.NODE_ENV !== "production" && /^http:\/\/localhost:\d+$/.test(normalizedUrl);
};

const getCallbackFrontendUrl = (req) => {
  const state = decodeOAuthState(req.query.state);
  const redirectOrigin = normalizeUrl(state?.redirectOrigin);

  return isAllowedFrontendUrl(redirectOrigin) ? redirectOrigin : FRONTEND_URL;
};
log("CONFIG", "Backend Auth Routes Initialized", { 
  FRONTEND_URL,
  FRONTEND_URLS,
  NODE_ENV: process.env.NODE_ENV 
});

/**
 * STEP 1: Start Google Login
 * URL: /api/auth/google
 * Redirects user to Google OAuth consent screen
 */
router.get(
  "/google",
  (req, res, next) => {
    const redirectOrigin = normalizeUrl(req.query.redirect_origin);
    const state = isAllowedFrontendUrl(redirectOrigin)
      ? encodeOAuthState({ redirectOrigin })
      : undefined;

    log("OAUTH_INIT", "Google OAuth flow started", {
      userAgent: req.get("user-agent")?.substring(0, 50),
      clientIP: req.ip,
      referer: req.get("referer"),
      redirectOrigin,
      hasState: !!state
    });

    passport.authenticate("google", {
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/gmail.readonly"
      ],
      state
    })(req, res, next);
  }
);

/**
 * STEP 2: Google Callback
 * URL: /api/auth/google/callback
 * Called by Google after user authenticates
 * Generates JWT and redirects to frontend with token
 */
router.get(
  "/google/callback",
  (req, res, next) => {
    const callbackFrontendUrl = getCallbackFrontendUrl(req);

    // ============================================================
    // PRE-AUTH LOGGING: Log the callback request BEFORE passport auth
    // ============================================================
    log("CALLBACK_RECEIVED", "Google callback request received", {
      url: req.originalUrl.substring(0, 100),
      hasCode: !!req.query.code,
      hasState: !!req.query.state,
      hasError: !!req.query.error,
      queryParams: Object.keys(req.query)
    });

    // Check for OAuth errors from Google
    if (req.query.error) {
      log("ERROR", "Google returned error in callback", {
        error: req.query.error,
        errorDescription: req.query.error_description,
        errorUri: req.query.error_uri
      });
      console.error("❌ GOOGLE OAUTH ERROR:");
      console.error("   Error:", req.query.error);
      console.error("   Description:", req.query.error_description);
      return res.redirect(`${callbackFrontendUrl}/login?error=${req.query.error}`);
    }

    // Check for authorization code
    if (!req.query.code) {
      log("ERROR", "Callback received without authorization code", {
        query: req.query
      });
      console.error("❌ NO AUTHORIZATION CODE IN CALLBACK");
      return res.redirect(`${callbackFrontendUrl}/login?error=no_code`);
    }

    log("CALLBACK_VALID", "Callback has valid authorization code", {
      codeLength: req.query.code.length,
      statePresent: !!req.query.state
    });

    next();
  },
  // ============================================================
  // PASSPORT AUTHENTICATION WITH CUSTOM CALLBACK
  // This is where token exchange happens and errors are caught
  // ============================================================
  (req, res, next) => {
    const callbackFrontendUrl = getCallbackFrontendUrl(req);

    log("PASSPORT_AUTH_START", "Starting Passport authentication");

    passport.authenticate("google", { session: false }, (err, user, info) => {
      try {
        // ============================================================
        // Handle Passport Authentication Errors
        // THIS IS WHERE "TokenError: Bad Request" OCCURS
        // ============================================================
        if (err) {
          log("ERROR", "Passport authentication error (TokenError occurs here)", {
            errorType: err.constructor.name,
            errorMessage: err.message,
            errorCode: err.code,
            errorStatus: err.status
          });

          console.error("\n" + "❌".repeat(40));
          console.error("PASSPORT AUTHENTICATION FAILED - Token Exchange Error");
          console.error("❌".repeat(40));
          console.error("Error Constructor:", err.constructor.name);
          console.error("Error Message:", err.message);
          console.error("Error Code:", err.code);
          console.error("Error Status:", err.status);
          console.error("Full Error:", err);
          console.error("\nThis error indicates:");
          console.error("1. Google rejected the token exchange request");
          console.error("2. Possible causes:");
          console.error("   - Callback URL mismatch");
          console.error("   - Invalid Client ID or Secret");
          console.error("   - Authorization code expired or invalid");
          console.error("   - HTTPS mismatch");
          console.error("❌".repeat(40) + "\n");

          return res.redirect(
            `${callbackFrontendUrl}/login?error=auth_failed&details=${encodeURIComponent(err.message)}`
          );
        }

        // ============================================================
        // Handle case where user is not returned
        // ============================================================
        if (!user) {
          log("ERROR", "Passport authentication returned no user", {
            info: info
          });

          console.error("❌ NO USER FROM PASSPORT");
          console.error("   Info:", info);

          return res.redirect(`${callbackFrontendUrl}/login?error=no_user`);
        }

        // ============================================================
        // PASSPORT SUCCESS: User authenticated by Google
        // ============================================================
        log("PASSPORT_SUCCESS", "User authenticated by Passport", {
          userId: user._id,
          email: user.email,
          name: user.name
        });

        // Store user in request and proceed to JWT generation
        req.user = user;
        next();
      } catch (error) {
        log("ERROR", "Exception in passport authenticate callback", {
          message: error.message
        });
        console.error("❌ EXCEPTION IN PASSPORT CALLBACK:", error);
        res.redirect(`${callbackFrontendUrl}/login?error=callback_error`);
      }
    })(req, res, next);
  },
  // ============================================================
  // FINAL HANDLER: Generate JWT and redirect to frontend
  // ============================================================
  (req, res) => {
    try {
      if (!req.user) {
        log("ERROR", "Google callback: No user returned from Passport");
        return res.redirect(`${FRONTEND_URL}/login?error=no_user`);
      }

      log("GOOGLE_CALLBACK", "User authenticated by Google", {
        userId: req.user._id,
        email: req.user.email,
        name: req.user.name
      });

      // ============================================================
      // Generate JWT Token
      // ============================================================
      if (!process.env.JWT_SECRET) {
        log("ERROR", "JWT_SECRET not configured");
        return res.redirect(`${FRONTEND_URL}/login?error=config_error`);
      }

      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      log("TOKEN_GENERATED", "JWT token created", {
        userId: req.user._id,
        expiresIn: "7d",
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 30) + "..."
      });

      // ============================================================
      // Redirect to Frontend with Token
      // ============================================================
      const redirectUrl = `${FRONTEND_URL}/inbox?token=${token}`;
      console.log("redirectUrl", redirectUrl);
      log("REDIRECT", "Redirecting to frontend with token", {
        redirectUrl: redirectUrl.substring(0, 80) + "...",
        frontend: FRONTEND_URL
      });

      res.redirect(redirectUrl);
    } catch (err) {
      log("ERROR", "Exception in Google callback handler", {
        message: err.message,
        stack: err.stack.substring(0, 200)
      });

      console.error("❌ EXCEPTION IN CALLBACK HANDLER:", err);
      res.redirect(`${FRONTEND_URL}/login?error=callback_error`);
    }
  }
);

 router.get("/me", async (req, res) => {
  console.log("=== /api/auth/me HIT ===");
  try {
    const authHeader = req.headers.authorization;
    console.log("DEBUG: Authorization header:", authHeader ? authHeader.substring(0, 20) + "..." : "MISSING");

    if (!authHeader) {
      console.log("DEBUG: No auth header, returning loggedIn: false");
      return res.json({ loggedIn: false });
    }

    const token = authHeader.split(" ")[1];
    
    if (!process.env.JWT_SECRET) {
      console.error("DEBUG: JWT_SECRET is not defined!");
      return res.status(500).json({ error: "Server configuration error" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("DEBUG: JWT verification result:", decoded);
    } catch (verifyErr) {
      console.error("DEBUG: JWT verification failed:", verifyErr.message);
      return res.json({ loggedIn: false });
    }

    const user = await User.findById(decoded.id).select(
      "name email avatar _id"
    );

    if (!user) {
      console.log("DEBUG: User not found in DB for ID:", decoded.id);
      return res.json({ loggedIn: false });
    }

    const responseData = {
      loggedIn: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
    };
    console.log("DEBUG: /api/auth/me response:", responseData);
    res.json(responseData);
  } catch (err) {
    console.error("DEBUG: Unexpected JWT /me error:", err);
    res.status(500).json({ loggedIn: false, error: "Internal Server Error" });
  }
});

export default router;
