import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Global toast host — render once near the app root. All calls to `notify.*`
// from anywhere in the app will surface here.
export function ToastHost() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      pauseOnHover
      draggable
      theme="light"
      toastStyle={{
        borderRadius: 12,
        fontSize: 13,
        fontFamily: "inherit",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
      }}
    />
  );
}

// Thin wrapper so callers don't import react-toastify directly. Keeps the
// surface tight and lets us swap libraries or theme later in one place.
export const notify = {
  success: (msg, opts) => toast.success(msg, opts),
  error:   (msg, opts) => toast.error(msg,   opts),
  info:    (msg, opts) => toast.info(msg,    opts),
  warn:    (msg, opts) => toast.warn(msg,    opts),
  loading: (msg, opts) => toast.loading(msg, opts),
  update:  (id, opts)  => toast.update(id, opts),
  dismiss: (id)        => toast.dismiss(id),
};

export default ToastHost;
