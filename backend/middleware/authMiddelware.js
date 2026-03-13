const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

const verifyJWT = async (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    req.user = user;

    next();

  } catch (error) {

    res.status(401).json({ message: "Invalid token" });

  }
};

module.exports = verifyJWT;