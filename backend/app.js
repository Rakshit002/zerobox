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



const allowedOrigins = process.env.FRONTEND_URL?.split(",") || [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  }
}));



app.use("/api/auth", authRouter);
app.use("/api/emails", emailRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});







