const express = require("express");
const router = express.Router();

const { getInboxEmails, getEmailById ,pinEmail} = require("../controllers/emailcontroller");
const verifyJWT = require("../middleware/authMiddelware");

router.get("/inbox", verifyJWT, getInboxEmails);
router.get("/:id",verifyJWT,getEmailById)
router.get("/pin/:id",verifyJWT,pinEmail)

module.exports = router;