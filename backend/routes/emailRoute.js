import express from "express";
const router = express.Router();

import { getInboxEmails, getEmailById, pinEmail, getPinnedEmails, unpinEmail, starEmail, getStarredEmails, unstarEmail, getEmailAnalytics } from "../controllers/emailcontroller.js";
import verifyJWT from "../middleware/authMiddelware.js";

router.get("/inbox", verifyJWT, getInboxEmails);
router.get("/pinned",verifyJWT,getPinnedEmails)
router.get("/starred",verifyJWT,getStarredEmails)
router.get("/analytics",verifyJWT,getEmailAnalytics);
router.get("/:id",verifyJWT,getEmailById)
router.post("/pin/:id",verifyJWT,pinEmail)
router.post("/star/:id",verifyJWT,starEmail)
router.delete("/pin/:id",verifyJWT,unpinEmail)
router.delete("/star/:id",verifyJWT,unstarEmail)


export default router;