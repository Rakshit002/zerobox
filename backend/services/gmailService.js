import { google } from "googleapis";

const extractDomain = (from) => {

  const match = from.match(/@([^>]+)/);

  return match ? match[1] : "unknown";

};
/**
 * Fetch inbox message list from Gmail with optional pageToken for pagination.
 * Returns same email objects as before plus nextPageToken for infinite scroll.
 */
const fetchInboxEmails = async (accessToken, pageToken) => {

  const auth = new google.auth.OAuth2();

  auth.setCredentials({
    access_token: accessToken
  });

  const gmail = google.gmail({
    version: "v1",
    auth
  });

  // Gmail list API: maxResults fixed at 20; pageToken loads next page when provided
  const listParams = {
    userId: "me",
    maxResults: 20,
    labelIds: ["INBOX"]
  };
  if (pageToken) {
    listParams.pageToken = pageToken;
  }

  const response = await gmail.users.messages.list(listParams);

  const messages = response.data.messages || [];
  const nextPageToken = response.data.nextPageToken ?? null;

  const emails = await Promise.all(

  messages.map(async (message) => {

    const msg = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"]
    });

    const headers = msg.data.payload.headers;

    const getHeader = (name) =>
      headers.find(h => h.name === name)?.value || "";

    const from = getHeader("From");

    return {
      id: msg.data.id,
      from,
      subject: getHeader("Subject"),
      snippet: msg.data.snippet,
      date: getHeader("Date"),
      unread: msg.data.labelIds.includes("UNREAD"),
      domain: extractDomain(from)
    };

  })


);

  return { emails, nextPageToken };
};
const fetchEmailById = async (accessToken, emailId) => {

  const auth = new google.auth.OAuth2();

  auth.setCredentials({
    access_token: accessToken
  });

  const gmail = google.gmail({
    version: "v1",
    auth
  });

  const response = await gmail.users.messages.get({
    userId: "me",
    id: emailId,
    format: "full"
  });

  const message = response.data;

  const headers = message.payload.headers;

  const getHeader = (name) =>
    headers.find(h => h.name === name)?.value || "";

  // extract email body
  let body = "";

  if (message.payload.parts) {

    const part = message.payload.parts.find(
      p => p.mimeType === "text/html" || p.mimeType === "text/plain"
    );

    if (part && part.body.data) {
      body = Buffer.from(part.body.data, "base64").toString("utf8");
    }

  } else if (message.payload.body?.data) {

    body = Buffer.from(message.payload.body.data, "base64").toString("utf8");

  }

  

  return {
    id: message.id,
    from: getHeader("From"),
    subject: getHeader("Subject"),
    date: getHeader("Date"),
    snippet: message.snippet,
    body
  };
};

const getEmailAnalyticsService = async (accessToken) => {
  // Reuse first page of inbox only (same as before pagination; analytics stays first 20).
  const { emails } = await fetchInboxEmails(accessToken);

  const unreadCount = emails.filter((email) => email.unread).length;

  const senderCount = {};
  const domainCount = {};

  emails.forEach((email) => {
    senderCount[email.from] = (senderCount[email.from] || 0) + 1;
    domainCount[email.domain] = (domainCount[email.domain] || 0) + 1;
  });

  const topSender = Object.keys(senderCount).reduce(
    (max, sender) => senderCount[sender] > (senderCount[max] || 0) ? sender : max,
    ""
  );

  const topDomain = Object.keys(domainCount).reduce(
    (max, domain) => domainCount[domain] > (domainCount[max] || 0) ? domain : max,
    ""
  );

  // Basic rule-based "important email" detection.
  // Rule 1: subject contains priority keyword.
  // Rule 2: sender domain looks like a real company/domain (not noreply/no-reply).
  const importantKeywords = ["urgent", "important", "interview", "deadline", "action required"];

  let importantEmail = null;

  for (const email of emails) {
    const subject = (email.subject || "").toLowerCase();
    const sender = (email.from || "").toLowerCase();
    const senderDomain = (email.domain || "").toLowerCase();

    const matchedKeyword = importantKeywords.find((keyword) => subject.includes(keyword));
    if (matchedKeyword) {
      importantEmail = {
        id: email.id,
        subject: email.subject,
        sender: email.from,
        reason: `contains keyword '${matchedKeyword}'`
      };
      break;
    }

    const isNoReply = sender.includes("noreply") || sender.includes("no-reply");
    if (!isNoReply && senderDomain && senderDomain !== "unknown") {
      importantEmail = {
        id: email.id,
        subject: email.subject,
        sender: email.from,
        reason: `sender domain '${senderDomain}' is treated as important`
      };
      break;
    }
  }

  return {
    unreadCount,
    topSender,
    topDomain,
    importantEmail
  };
};

export { fetchInboxEmails, fetchEmailById, getEmailAnalyticsService };