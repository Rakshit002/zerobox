const { fetchInboxEmails,fetchEmailById } = require("../services/gmailService");
const PinnedEmail=require("../models/pinnedEmails")
const getInboxEmails = async (req, res) => {

  try {
     
    const accessToken = req.user.googleAccessToken;
     
    const emails = await fetchInboxEmails(accessToken);
      
    res.json({
      success: true,
      emails
    });

  } catch (error) {

    console.error("Email fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch emails"
    });
  }
};
const getEmailById = async (req, res) => {
  try {

    const accessToken = req.user.googleAccessToken;
    const emailId = req.params.id;

    const email = await fetchEmailById(accessToken, emailId);

    res.json({
      success: true,
      email
    });

  } catch (error) {
    console.error("Fetch email error:", error);

    res.status(500).json({
      message: "Failed to fetch email"
    });
  }
};

const pinEmail = async (req, res) => {

  try {

    const userId = req.user._id;
    const emailId = req.params.id;

    const existing = await PinnedEmail.findOne({
      userId,
      emailId
    });

    if (existing) {
      return res.json({
        success: true,
        message: "Already pinned"
      });
    }

    const pinned = await PinnedEmail.create({
      userId,
      emailId
    });

    res.json({
      success: true,
      pinned
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to pin email"
    });

  }
};
module.exports = { getInboxEmails ,getEmailById ,pinEmail};