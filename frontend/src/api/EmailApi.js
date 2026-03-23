import api from "./axios";

/**
 * Fetch inbox emails with optional Gmail pageToken for infinite scroll.
 * Response: { success, emails, nextPageToken }
 */
export const fetchEmails = async (pageToken, search) => {
  const params = {};
  if (pageToken) params.pageToken = pageToken;
  if (search) params.search = search;
  const res = await api.get("/emails/inbox", { params });
  return res.data;
};

export const getInboxEmails = (pageToken) => fetchEmails(pageToken);

export const getEmailById=async(id)=>{
  const res=await api.get(`/emails/${id}`);
  return res.data;
}

export const pinEmail = async (id) => {
  const res = await api.post(`/emails/pin/${id}`);
  return res.data;
};

export const starEmail = async (id) => {
  const res = await api.post(`/emails/star/${id}`);
  return res.data;
};
export const getStarredEmails = async () => {
  const res = await api.get("/emails/starred");
  return res.data.starredEmails;
};
export const getPinnedEmails = async (id) => {
  const res = await api.get("/emails/pinned");
  return res.data.pinnedEmails;
};

export const unpinEmail = async (id) => {
  const res = await api.delete(`/emails/pin/${id}`);
  return res.data;
};
export const unstarEmail = async (id) => {
  const res = await api.delete(`/emails/star/${id}`);
  return res.data;
};

export const getEmailAnalytics = async () => {
  // Fetch analytics payload that now includes importantEmail details.
  const res = await api.get("/emails/analytics");
  return res.data;
};