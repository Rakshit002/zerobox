const { google } = require("googleapis");

const extractDomain = (from) => {

  const match = from.match(/@([^>]+)/);

  return match ? match[1] : "unknown";

};
const fetchInboxEmails = async (accessToken) => {

  const auth = new google.auth.OAuth2();

  auth.setCredentials({
    access_token: accessToken
  });

  const gmail = google.gmail({
    version: "v1",
    auth
  });

  // get message ids
  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 20,
    labelIds: ["INBOX"]
  });

  const messages = response.data.messages || [];

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


)

  return emails;
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


module.exports = { fetchInboxEmails ,fetchEmailById };