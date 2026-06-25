import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { api } from "../../api/client";

export default function Auth({ mode = "login", onAuth, onSwitch }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Local-only "forgot password" view — no route change needed. When a user
  // clicks Forgot password we flip `localMode` to "forgot", and inside that
  // view they can submit their email and then return to login.
  const [localMode, setLocalMode] = useState(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState(null); // null | "sending" | "sent"

  const activeMode = localMode || mode;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = mode === "login"
        ? await api.auth.login(form.email.trim(), form.password)
        : await api.auth.signup(form.name.trim() || "User", form.email.trim(), form.password, form.phone.trim());
      onAuth(res);
    } catch (err) {
      setError(err.message || "Authentication failed. Is the backend running on :8080?");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError("");
    setForgotStatus("sending");
    try {
      await api.auth.forgotPassword(forgotEmail.trim());
      setForgotStatus("sent");
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
      setForgotStatus(null);
    }
  }

  function backToLogin() {
    setLocalMode(null);
    setForgotStatus(null);
    setForgotEmail("");
    setError("");
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo" style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <div className="brand-name" style={{ marginLeft: 0, alignItems: "center" }}>
            <div className="brand-name-row" style={{ fontSize: 40, lineHeight: 1, letterSpacing: "-1px" }}>
              <span className="brand-name-lead">Lead</span><span className="brand-name-nator">nator</span>
            </div>
            <div className="brand-name-tag" style={{ marginTop: 6, fontSize: 9, letterSpacing: "1.8px" }}>
              <span className="brand-name-tag-line" /> AI-POWERED GROWTH PLATFORM <span className="brand-name-tag-line" />
            </div>
          </div>
        </div>

        {activeMode === "forgot" ? (
          <>
            <h1>Forgot your password?</h1>
            <p className="sub">
              {forgotStatus === "sent"
                ? "If that email is registered, we just sent a link to reset your password. Check your inbox (and spam folder)."
                : "Enter your email and we'll send you a link to reset it."}
            </p>

            {forgotStatus !== "sent" ? (
              <form onSubmit={handleForgot}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email" required autoFocus
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                {error && (
                  <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 10, padding: "8px 12px", background: "#fee2e2", borderRadius: 8 }}>
                    {error}
                  </div>
                )}
                <button type="submit" className="auth-submit" disabled={forgotStatus === "sending"}>
                  {forgotStatus === "sending" ? "Sending…" : "Send reset link"}
                </button>
              </form>
            ) : (
              <div style={{ padding: 14, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 10, fontSize: 13, lineHeight: 1.5 }}>
                📨 Reset link sent to <strong>{forgotEmail}</strong>. The link expires in 1 hour.
              </div>
            )}

            <div className="auth-switch">
              <button onClick={backToLogin}>← Back to sign in</button>
            </div>
          </>
        ) : (
          <>
            {activeMode === "signup" && (
              <>
                <h1>Create your account</h1>
                <p className="sub">Start your 14-day trial — no credit card needed.</p>
              </>
            )}
            <form onSubmit={handleSubmit}>
              {activeMode === "signup" && (
                <div className="form-group">
                  <label>Full name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
              )}
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              {activeMode === "signup" && (
                <div className="form-group">
                  <label>Phone number</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" required />
                </div>
              )}
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    style={{ paddingRight: 42, width: "100%" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8",
                      display: "grid", placeItems: "center", padding: 4,
                    }}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              {error && (
                <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 10, padding: "8px 12px", background: "#fee2e2", borderRadius: 8 }}>
                  {error}
                </div>
              )}
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Signing in…" : (activeMode === "login" ? "Sign in" : "Create account")}
              </button>
            </form>

            <div className="auth-switch">
              {activeMode === "login"
                ? <>Don't have an account? <button onClick={() => onSwitch("signup")}>Sign up</button></>
                : <>Already registered? <button onClick={() => onSwitch("login")}>Sign in</button></>}
            </div>

            {activeMode === "login" && (
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setLocalMode("forgot")}
                  style={{ background: "transparent", border: "none", color: "var(--primary)", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}
                >Forgot password?</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
