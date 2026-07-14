import api from "../../config/axios";

const unwrap = (res) => res.data;

export const getMessages = (params) =>
  api.get("/messages", { params }).then(unwrap);

export const getMessageById = (id) => api.get(`/messages/${id}`).then(unwrap);

export const createMessage = (data) => api.post("/messages", data).then(unwrap);

export const updateMessage = (id, data) =>
  api.put(`/messages/${id}`, data).then(unwrap);

export const deleteMessage = (id) => api.delete(`/messages/${id}`).then(unwrap);
