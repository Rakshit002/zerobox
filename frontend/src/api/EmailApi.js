import api from "./axios";

export const getInboxEmails = async () => {
  const res = await api.get("/emails/inbox");
  return res.data;
};

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