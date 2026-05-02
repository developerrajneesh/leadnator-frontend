import { api } from "./client";

export const pricingApi = {
  plans:     ()       => api.get("/pricing/plans"),
  config:    ()       => api.get("/pricing/config"),
  createOrder: (body) => api.post("/pricing/order", body),
  verify:    (body)   => api.post("/pricing/verify", body),
  current:   ()       => api.get("/pricing/current"),
  invoices:  ()       => api.get("/pricing/invoices"),
  history:   ()       => api.get("/pricing/history"),
  cancel:    ()       => api.post("/pricing/cancel"),
};

let razorpayLoading = null;
export function loadRazorpay() {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve(window.Razorpay);
  if (razorpayLoading) return razorpayLoading;
  razorpayLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(window.Razorpay);
    s.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.head.appendChild(s);
  });
  return razorpayLoading;
}
