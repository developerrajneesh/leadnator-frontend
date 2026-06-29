import { useEffect, useState } from "react";
import { api } from "../../api/client";

// Public page mounted at /reset-password/:token. Verifies the token on mount
// so users with bad/expired links never even see the form, then lets them
// enter a new password + confirmation.
export default function ResetPassword() {
  // `react-router` isn't in play when this is rendered via the public gate in
  // App.jsx, so read the token from window.location directly.
  const token = (() => {
    const m = window.location.pathname.match(/\/reset-password\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  })();

  const [status, setStatus] = useState("verifying"); // verifying | ready | invalid | done
  const [email, setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); setError("No reset token in the URL."); return; }
    api.auth.verifyResetToken(token)
      .then((r) => { setEmail(r.email); setStatus("ready"); })
      .catch((err) => { setStatus("invalid"); setError(err.message); });
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setSaving(true);
    try {
      await api.auth.resetPassword(token, password);
      setStatus("done");
    } catch (err) {
      setError(err.message || "Reset failed.");
    } finally { setSaving(false); }
  }

  // Contextual copy for the decorative left panel.
  const hero =
    status === "done"
      ? { title: "All set!", sub: "Your password has been updated — you're good to go." }
      : status === "invalid"
        ? { title: "Hmm, that link.", sub: "It's expired or already used. Request a fresh reset link to continue." }
        : status === "verifying"
          ? { title: "One moment…", sub: "We're just checking your reset link." }
          : { title: "Almost done.", sub: "Choose a strong new password to secure your account." };

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

            <svg className="auth-topo auth-topo-tl" viewBox="0 0 240 150" fill="none" preserveAspectRatio="none">
              {[0, 15, 30, 45, 60, 75, 90].map((y, i) => (
                <path key={i} d={`M-20 ${28 + y} C 35 ${8 + y}, 85 ${8 + y}, 140 ${28 + y} S 235 ${58 + y}, 275 ${38 + y}`} />
              ))}
            </svg>

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

        {status === "verifying" && (
          <>
            <h1>Checking your link…</h1>
            <p className="sub">Hang on a moment.</p>
          </>
        )}

        {status === "invalid" && (
          <>
            <h1>Link expired or invalid</h1>
            <p className="sub">{error || "This reset link is no longer valid. Request a fresh one from the sign-in page."}</p>
            <button className="auth-submit" onClick={() => { window.location.href = "/"; }}>
              Go to sign in
            </button>
          </>
        )}

        {status === "ready" && (
          <>
            <h1>Set a new password</h1>
            <p className="sub">
              Resetting password for <strong>{email}</strong>.
            </p>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>New password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required autoFocus placeholder="At least 6 characters" />
              </div>
              <div className="form-group">
                <label>Confirm password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6} required placeholder="Type it again" />
              </div>
              {error && (
                <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 10, padding: "8px 12px", background: "#fee2e2", borderRadius: 8 }}>
                  {error}
                </div>
              )}
              <button type="submit" className="auth-submit" disabled={saving}>
                {saving ? "Saving…" : "Reset password"}
              </button>
            </form>
          </>
        )}

        {status === "done" && (
          <>
            <h1>Password reset ✓</h1>
            <p className="sub">You can now sign in with your new password.</p>
            <button className="auth-submit" onClick={() => { window.location.href = "/"; }}>
              Go to sign in
            </button>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
