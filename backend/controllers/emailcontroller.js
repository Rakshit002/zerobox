import { fetchInboxEmails, fetchEmailById, getEmailAnalyticsService } from "../services/gmailService.js";
import PinnedEmail from "../models/pinnedEmails.js";
import StarredEmail from "../models/starredEmails.js";
import User from "../models/usermodel.js";

const getInboxEmails = async (req, res) => {

  try {
    console.log("Fetching inbox emails for user:", req.user.email); 
    const accessToken = req.user.googleAccessToken;
    // Optional Gmail pagination cursor (query: ?pageToken=...)
    const pageToken = req.query.pageToken;
    const search = req.query.search;

    const { emails, nextPageToken } = await fetchInboxEmails(accessToken, pageToken, search);
      
    res.json({
      success: true,
      emails,
      nextPageToken
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
  const getPinnedEmails=async(req,res)=>{
    try{
      
        const userId=req.user.id;
        console.log("userId",userId)
        const pinnedEmails=await PinnedEmail.find({userId});

        res.status(200).json({
          success:true,
          pinnedEmails
        })
    }catch(error){
      console.log("falid to fetch pinnedemails",error);

      res.status(500).json({
        success:false,
        message:"faild to fetch pinned emails"
      })


    }
  }

   const unpinEmail = async (req, res) => {

  try {

    const emailId = req.params.id;
    const userId = req.user._id;
         
    await PinnedEmail.findOneAndDelete({
      emailId,
      userId
    });

    res.json({
      success: true,
      message: "Email unpinned"
    });

  } catch (error) {
    console.error("Unpin error:", error);
    res.status(500).json({
      message: "Failed to unpin email"
    });
  }
};

const starEmail = async (req, res) => {

  try {

    const userId = req.user._id;
    const emailId = req.params.id;

    const existing = await StarredEmail.findOne({
      userId,
      emailId
    });

    if (existing) {
      return res.json({
        success: true,
        message: "Already starred"
      });
    }

    const starred = await StarredEmail.create({
      userId,
      emailId
    });

    res.json({
      success: true,
      starred
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to star email"
    });

  }
};

const getStarredEmails = async (req, res) => {
  try {

    const userId = req.user.id;
    const starredEmails = await StarredEmail.find({ userId });

    res.status(200).json({
      success: true,
      starredEmails
    });
  } catch (error) {
    console.log("falid to fetch starredemails", error);

    res.status(500).json({
      success: false,
      message: "faild to fetch starred emails"
    });
  }
};

const unstarEmail = async (req, res) => {

  try {

    const emailId = req.params.id;
    const userId = req.user._id;

    await StarredEmail.findOneAndDelete({
      emailId,
      userId
    });

    res.json({
      success: true,
      message: "Email unstarred"
    });

  } catch (error) {
    console.error("Unstar error:", error);
    res.status(500).json({
      message: "Failed to unstar email"
    });
  }
};

 const getEmailAnalytics = async (req, res) => {
  try {
    const accessToken = req.user.googleAccessToken;

    const analytics = await getEmailAnalyticsService(accessToken);

    // If rule-based detection did not find an important email,
    // treat user-pinned emails as important signals (starred emails are not used here).
    if (!analytics.importantEmail) {
      const userId = req.user._id;
      const [pinnedEmails, inboxPage] = await Promise.all([
        PinnedEmail.find({ userId }),
        fetchInboxEmails(accessToken)
      ]);

      const inboxEmails = inboxPage.emails;

      const pinnedIds = new Set((pinnedEmails || []).map((item) => item.emailId));
      const pinnedMatch = inboxEmails.find((email) => pinnedIds.has(email.id));

      if (pinnedMatch) {
        analytics.importantEmail = {
          id: pinnedMatch.id,
          subject: pinnedMatch.subject,
          sender: pinnedMatch.from,
          reason: "marked pinned by user"
        };
      }
    }

    res.json(analytics);

  } catch (error) {
    res.status(500).json({ message: "Analytics error" });
  }
};
export { getInboxEmails, getEmailById, pinEmail, getPinnedEmails, unpinEmail, starEmail, getStarredEmails, unstarEmail, getEmailAnalytics };