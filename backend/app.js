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



app.use(cors({
  origin: 'http://localhost:5173' // Allow requests from your frontend origin
}));




app.use("/api/auth", authRouter);
app.use("/api/emails", emailRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});







