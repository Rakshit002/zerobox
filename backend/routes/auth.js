import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();
import User from "../models/usermodel.js";

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
    

    // Redirect to frontend dashboard
    res.redirect(`http://localhost:5173/inbox?token=${token}`);

   
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
