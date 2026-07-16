import api from "../../config/axios";

const unwrap = (res) => res.data;

export const getShippingCosts = (params) =>
  api.get("/shipping-costs", { params }).then(unwrap);

export const getShippingCostById = (id) =>
  api.get(`/shipping-costs/${id}`).then(unwrap);

export const createShippingCost = (data) =>
  api.post("/shipping-costs", data).then(unwrap);

export const updateShippingCost = (id, data) =>
  api.put(`/shipping-costs/${id}`, data).then(unwrap);

export const updateShippingCostStatus = (id, data) =>
  api.patch(`/shipping-costs/${id}/status`, data).then(unwrap);

export const deleteShippingCost = (id) =>
  api.delete(`/shipping-costs/${id}`).then(unwrap);