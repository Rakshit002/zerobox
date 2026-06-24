import "dotenv/config";
import express from "express";
import passport from "passport";
import cors from "cors";
import connectDB from "./config/mongoose-connection.js";
import authRouter from "./routes/auth.js";
import emailRoutes from "./routes/emailRoute.js";

const app = express();

// ============================================================
// CRITICAL: Verify environment variables BEFORE importing passport
// ============================================================
console.log("\n" + "=".repeat(70));
console.log("ENVIRONMENT VARIABLE VERIFICATION");
console.log("=".repeat(70));

const requiredVars = {
  "GOOGLE_CLIENT_ID": process.env.GOOGLE_CLIENT_ID,
  "GOOGLE_CLIENT_SECRET": process.env.GOOGLE_CLIENT_SECRET,
  "JWT_SECRET": process.env.JWT_SECRET,
  "MONGO_URI": process.env.MONGO_URI,
  "PORT": process.env.PORT
};

let missingVars = [];

Object.entries(requiredVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`❌ MISSING: ${key}`);
    missingVars.push(key);
  } else {
    const displayValue = key.includes("SECRET") || key.includes("CLIENT")
      ? (typeof value === "string" ? value.substring(0, 20) + "..." : "SET")
      : value;
    console.log(`✓ ${key}: ${displayValue}`);
  }
});

console.log("=".repeat(70));

if (missingVars.length > 0) {
  console.error("\n❌ CRITICAL: Missing environment variables:");
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error("\nPlease set these variables in Render dashboard or .env file\n");
  process.exit(1);
}

console.log("✓ All required environment variables set\n");

// ============================================================
// IMPORT PASSPORT CONFIGURATION
// This is where GoogleStrategy is configured and token exchange
// error interception is set up
// ============================================================
await import("./config/passport.js");

app.use(express.json());
app.use(passport.initialize());

console.log("[APP] Passport initialized\n");

// Expected format: Single URL without trailing slash
const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? "https://zerobox-ashy.vercel.app" : "http://localhost:5173");
const allowedOrigins = [FRONTEND_URL];

console.log("[CORS] Allowed origins:", allowedOrigins);

// CORS configuration: validate incoming request origin against allowedOrigins.
// - Allow requests with no origin (Postman, curl, server-to-server).
// - Keep credentials enabled so cookies / auth headers can be used.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);

console.log("[CORS] CORS configured with credentials enabled\n");

app.use("/api/auth", authRouter);
app.use("/api/emails", emailRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`\n✓ Server running on port ${process.env.PORT}`);
    console.log(`✓ Backend URL: http://localhost:3000`);
    console.log(`✓ Frontend URL: http://localhost:5173`);
    console.log(`✓ Node Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("✓ Ready to accept OAuth requests\n");
  });
});




