import { useState, useRef } from "react";
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
  // Email-OTP verification view. When set, we show the 6-digit code screen
  // instead of the login/signup form until the user verifies (or goes back).
  const [pendingEmail, setPendingEmail] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const otpRefs = useRef([]);

  // --- 6-box OTP input handlers -------------------------------------------
  function setOtpDigit(index, digit) {
    const next = otp.split("");
    next[index] = digit;
    setOtp(next.join("").replace(/\D/g, "").slice(0, 6));
  }
  function handleOtpChange(index, e) {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) { setOtpDigit(index, ""); return; }
    // Take the last typed digit, fill this box, advance focus.
    const chars = otp.split("");
    chars[index] = val[val.length - 1];
    setOtp(chars.join("").slice(0, 6));
    if (index < 5) otpRefs.current[index + 1]?.focus();
  }
  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace") {
      if (otp[index]) {
        setOtpDigit(index, "");
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
        setOtpDigit(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }
  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    setOtp(pasted);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  const activeMode = localMode || mode;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await api.auth.login(form.email.trim(), form.password);
        onAuth(res);
      } else {
        const res = await api.auth.signup(form.name.trim() || "User", form.email.trim(), form.password, form.phone.trim());
        // New signup → email not verified yet. Show the OTP screen.
        if (res?.pendingVerification) {
          setPendingEmail(res.email || form.email.trim());
          setOtp("");
        } else {
          // Backward-compatible path if the server returns a token directly.
          sessionStorage.setItem("ln_welcome", "1");
          onAuth(res);
        }
      }
    } catch (err) {
      // An unverified user trying to log in → route them to the OTP screen.
      if (err?.data?.needsVerification) {
        setPendingEmail(err.data.email || form.email.trim());
        setOtp("");
        setError("");
      } else {
        setError(err.message || "Authentication failed. Is the backend running on :8080?");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setOtpLoading(true);
    try {
      const res = await api.auth.verifyOtp(pendingEmail, otp.trim());
      sessionStorage.setItem("ln_welcome", "1");
      onAuth(res);
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    setResendMsg("");
    try {
      await api.auth.resendOtp(pendingEmail);
      setResendMsg("A new code has been sent to your email.");
    } catch (err) {
      setError(err.message || "Couldn't resend the code.");
    }
  }

  function cancelOtp() {
    setPendingEmail(null);
    setOtp("");
    setResendMsg("");
    setError("");
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

  // Contextual copy for the decorative left panel.
  const hero = pendingEmail
    ? { title: "Almost there!", sub: "Just verify your email and your workspace is ready to go." }
    : activeMode === "forgot"
      ? { title: "No worries.", sub: "We'll send you a secure link to get back into your account." }
      : activeMode === "signup"
        ? { title: "Grow with Leadnator.", sub: "Create your account and start your free trial — no credit card needed." }
        : { title: "Welcome back!", sub: "Sign in to access your leads, campaigns and analytics." };

  return (
    <div className="auth-wrap">
      {/* Faint shapes behind the card */}
      <div className="auth-bg" aria-hidden="true">
        <span className="auth-bg-circle auth-bg-circle-1" />
        <span className="auth-bg-circle auth-bg-circle-2" />
        <span className="auth-bg-circle auth-bg-circle-3" />
        <span className="auth-bg-square" />
      </div>

      <div className="auth-shell">
        <aside className="auth-aside">
          <div className="auth-aside-blobs" aria-hidden="true">
            <span className="auth-blob auth-blob-1" />
            <span className="auth-blob auth-blob-2" />

            {/* Topographic contour lines (top-left flowing lines) */}
            <svg className="auth-topo auth-topo-tl" viewBox="0 0 240 150" fill="none" preserveAspectRatio="none">
              {[0, 15, 30, 45, 60, 75, 90].map((y, i) => (
                <path key={i} d={`M-20 ${28 + y} C 35 ${8 + y}, 85 ${8 + y}, 140 ${28 + y} S 235 ${58 + y}, 275 ${38 + y}`} />
              ))}
            </svg>

            {/* Topographic contour lines (bottom-right fingerprint) */}
            <svg className="auth-topo auth-topo-br" viewBox="0 0 200 200" fill="none">
              {[1, 0.82, 0.64, 0.46, 0.28].map((s, i) => (
                <path
                  key={i}
                  d="M104 26 C 150 32, 172 80, 156 126 C 142 164, 82 178, 52 146 C 26 118, 44 50, 104 26 Z"
                  transform={`translate(100 105) scale(${s}) translate(-100 -105)`}
                />
              ))}
            </svg>

            <span className="auth-dotgrid" />
            <span className="auth-ring auth-ring-1" />
            <span className="auth-ring auth-ring-2" />
            <span className="auth-plus auth-plus-1">+</span>
            <span className="auth-plus auth-plus-2">+</span>
          </div>
          <div className="auth-aside-content">
            <h2>{hero.title}</h2>
            <p>{hero.sub}</p>
          </div>
        </aside>

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

        {pendingEmail ? (
          <>
            <h1>Verify your email</h1>
            <p className="sub">
              Enter the 6-digit code we sent to <strong>{pendingEmail}</strong>. The code expires in 10 minutes.
            </p>
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label>Verification code</label>
                <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }} onPaste={handleOtpPaste}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      autoFocus={i === 0}
                      value={otp[i] || ""}
                      onChange={(e) => handleOtpChange(i, e)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onFocus={(e) => e.target.select()}
                      style={{
                        width: "100%", height: 56, textAlign: "center",
                        fontSize: 24, fontWeight: 700, color: "#0f172a",
                        border: `2px solid ${otp[i] ? "var(--primary)" : "#e2e8f0"}`,
                        borderRadius: 12, outline: "none", background: "#f8fafc",
                        transition: "border-color .15s",
                      }}
                    />
                  ))}
                </div>
              </div>
              {error && (
                <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 10, padding: "8px 12px", background: "#fee2e2", borderRadius: 8 }}>
                  {error}
                </div>
              )}
              {resendMsg && (
                <div style={{ color: "#166534", fontSize: 13, marginBottom: 10, padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}>
                  {resendMsg}
                </div>
              )}
              <button type="submit" className="auth-submit" disabled={otpLoading || otp.length !== 6}>
                {otpLoading ? "Verifying…" : "Verify & continue"}
              </button>
            </form>
            <div style={{ textAlign: "center", marginTop: 12, fontSize: 13 }}>
              Didn't get it?{" "}
              <button type="button" onClick={handleResendOtp} style={{ background: "transparent", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                Resend code
              </button>
            </div>
            <div className="auth-switch">
              <button onClick={cancelOtp}>← Back</button>
            </div>
          </>
        ) : activeMode === "forgot" ? (
          <>
            <h1>Forgot your password?</h1>
            <p className="sub">
              {forgotStatus === "sent"
                ? "We just sent a link to reset your password. Check your inbox (and spam folder)."
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
                <p className="sub">Start your 2-day trial — no credit card needed.</p>
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
    </div>
  );
}
