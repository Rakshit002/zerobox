require("dotenv").config();
const express = require("express");
const passport = require("passport");
const cors=require("cors");
const connectDB = require("./config/mongoose-connection");
const authRouter=require("./routes/auth")

const app = express();

require("./config/passport");

app.use(express.json());
app.use(passport.initialize());



app.use(cors({
  origin: 'http://localhost:5173' // Allow requests from your frontend origin
}));




app.use("/api/auth", authRouter);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});







