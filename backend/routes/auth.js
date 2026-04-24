import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();
import User from "../models/usermodel.js";

// Parse FRONTEND_URL into an array of allowed frontend origins.
// Example: "http://localhost:5173,https://zerobox-ashy.vercel.app"
const FRONTEND_URLS = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((u) => u && u.trim())
  .filter(Boolean);

console.log("Using FRONTEND_URLS:", FRONTEND_URLS);
/**
 * STEP 1: Start Google Login
 * URL: /api/auth/google
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"
      ,"https://www.googleapis.com/auth/gmail.readonly"
    ],
  })
);

/**
 * STEP 2: Google Callback
 * URL: /api/auth/google/callback
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Choose redirect base dynamically:
    // 1) If the request includes an Origin header and it matches allowed frontends, use it.
    // 2) Otherwise, prefer a production HTTPS URL from FRONTEND_URLS.
    // 3) Fallback to the first configured URL (usually localhost in dev).
    const reqOrigin = (req.headers.origin || req.headers.referer || "").split("?")[0];
    let redirectBase = null;

    if (reqOrigin && FRONTEND_URLS.includes(reqOrigin)) {
      redirectBase = reqOrigin;
    } else {
      // Prefer a secure https frontend when available
      redirectBase = FRONTEND_URLS.find(u => u.startsWith("https://")) || FRONTEND_URLS[0];
    }

    const redirectUrl = `${redirectBase.replace(/\/$/, "")}/inbox?token=${token}`;
    console.log("Login successful, redirecting to:", redirectUrl);
    res.redirect(redirectUrl);

   
  }
);

 router.get("/me", async (req, res) => {

  try {
    const authHeader = req.headers.authorization;
    

    if (!authHeader) {
      return res.json({ loggedIn: false });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "name email avatar"
    );

    if (!user) {
      return res.json({ loggedIn: false });
    }

    res.json({
      loggedIn: true,
      user,
    });
  } catch (err) {
    console.error("JWT /me error", err);
    res.json({ loggedIn: false });
  }
});


export default router;
