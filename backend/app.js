import "dotenv/config";
import express from "express";
import passport from "passport";
import cors from "cors";
import connectDB from "./config/mongoose-connection.js";
import authRouter from "./routes/auth.js";
import emailRoutes from "./routes/emailRoute.js";

const app = express();

import "./config/passport.js";

app.use(express.json());
app.use(passport.initialize());



// Parse FRONTEND_URL environment variable into an array of allowed origins.
// Expected format: "http://localhost:5173,https://zerobox-ashy.vercel.app"
const rawFrontendUrls = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = rawFrontendUrls
  .split(",")
  .map((u) => u && u.trim())
  .filter(Boolean);
  console.log("Allowed CORS origins:", allowedOrigins);

// CORS configuration: validate incoming request origin against allowedOrigins.
// - Allow requests with no origin (Postman, curl, server-to-server).
// - Keep credentials enabled so cookies / auth headers can be used.
app.use(
  cors({
    origin: function (origin, callback) {
      // Accept requests without an origin (server tools, curl, Postman)
      if (!origin) return callback(null, true);

      // Accept exact origin matches only (prevents open CORS)
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Reject other origins
      return callback(new Error("CORS blocked: origin not allowed"));
    },
    credentials: true,
  })
);



app.use("/api/auth", authRouter);
app.use("/api/emails", emailRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});







