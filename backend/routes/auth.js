const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();
const User=require("../models/usermodel")

/**
 * STEP 1: Start Google Login
 * URL: /api/auth/google
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
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
      { expiresIn: "12hrs" }
    );
    

    // Redirect to frontend dashboard
    res.redirect(`http://localhost:5173/Dashboard?token=${token}`);

   
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


module.exports = router;
