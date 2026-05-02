import { useEffect, useState } from "react";
import { FiRefreshCw, FiLogOut, FiCheckCircle } from "react-icons/fi";
import { loginWithFacebook, metaApi, loadFbSdk } from "../../api/meta";
import { refreshMetaStatus } from "../useMetaStatus";

export default function Accounts() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [sdkReady, setSdkReady] = useState(false);

  async function loadStatus() {
    setLoading(true);
    setError("");
    try {
      const res = await metaApi.status();
      setStatus(res);
    } catch (err) {
      setError(err.message || "Failed to load connection status.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFbSdk().then(() => setSdkReady(true)).catch((e) => setError(e.message));
    loadStatus();
  }, []);

  async function handleConnect() {
    setConnecting(true); setError("");
    try {
      const auth = await loginWithFacebook();
      const res = await metaApi.connect(auth.accessToken);
      setStatus({
        connected: true,
        fbUser: res.fbUser,
        accounts: res.accounts,
        selectedAdAccountId: res.selectedAdAccountId,
        connectedAt: new Date().toISOString(),
      });
      refreshMetaStatus(); // wake the shared cache so the sidebar + gates update
    } catch (err) {
      setError(err.message || "Connection failed.");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect your Meta account? You'll need to reconnect to run campaigns.")) return;
    await metaApi.disconnect();
    setStatus({ connected: false, accounts: [], selectedAdAccountId: "" });
    refreshMetaStatus(); // sidebar auto-hides immediately
  }

  async function handleSelect(id) {
    await metaApi.selectAccount(id);
    setStatus((s) => ({ ...s, selectedAdAccountId: id }));
  }

  if (loading) {
    return (
      <>
        <h1 className="page-title">Ad accounts</h1>
        <p className="page-subtitle">Select which Meta ad account to manage.</p>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
            <span className="skel skel-line" style={{ width: 180, height: 16 }} />
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Account</th><th>Currency</th><th>Balance</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <span className="skel skel-circle" />
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span className="skel skel-line" style={{ width: 180 }} />
                          <span className="skel skel-line skel-line-sm" style={{ width: 110 }} />
                        </div>
                      </div>
                    </td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 40 }} /></td>
                    <td><span className="skel skel-line skel-line-sm" style={{ width: 70 }} /></td>
                    <td><span className="skel skel-pill" style={{ width: 70 }} /></td>
                    <td><span className="skel" style={{ width: 80, height: 28, borderRadius: 6 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  if (!status?.connected) {
    return (
      <>
        <h1 className="page-title">Ad accounts</h1>
        <p className="page-subtitle">Connect your Facebook account to manage Meta Ads.</p>

        <div className="card" style={{ maxWidth: 560, margin: "24px auto", padding: 40, textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#e7f0ff", color: "#c6cad0",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, marginBottom: 16,
          }}>f</div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Connect your Meta account</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
            Login with Facebook to fetch your ad accounts, create campaigns, and pull live analytics.
          </p>

          {error && (
            <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            disabled={!sdkReady || connecting}
            onClick={handleConnect}
            style={{ background: "#1877f2", padding: "12px 24px", fontSize: 15 }}
          >
            {connecting ? "Connecting…" : sdkReady ? "Login with Facebook" : "Loading Facebook SDK…"}
          </button>

          <ul style={{ marginTop: 24, textAlign: "left", fontSize: 13, color: "var(--text-muted)", listStyle: "none", padding: 0 }}>
            <li style={{ margin: "6px 0" }}><FiCheckCircle style={{ color: "#10b981", marginRight: 8 }} />Create & manage campaigns</li>
            <li style={{ margin: "6px 0" }}><FiCheckCircle style={{ color: "#10b981", marginRight: 8 }} />Real-time ad insights</li>
            <li style={{ margin: "6px 0" }}><FiCheckCircle style={{ color: "#10b981", marginRight: 8 }} />Read leads from Meta forms</li>
          </ul>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">Ad accounts</h1>
      <p className="page-subtitle">
        Connected as <strong>{status.fbUser?.name}</strong>
        {status.connectedAt && ` · since ${new Date(status.connectedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={loadStatus}><FiRefreshCw /> Refresh</button>
        <button className="btn btn-outline" style={{ color: "#b91c1c" }} onClick={handleDisconnect}>
          <FiLogOut /> Disconnect
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ad account</th>
                <th>Account ID</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(status.accounts || []).map((a) => {
                const selected = a.id === status.selectedAdAccountId;
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{a.id}</td>
                    <td>{a.currency || "—"}</td>
                    <td>
                      <span className={`badge ${a.account_status === 1 ? "qualified" : "lost"}`}>
                        {a.account_status === 1 ? "Active" : `Status ${a.account_status}`}
                      </span>
                    </td>
                    <td>
                      {selected
                        ? <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>✓ Selected</span>
                        : <button className="btn btn-outline" onClick={() => handleSelect(a.id)}>Select</button>}
                    </td>
                  </tr>
                );
              })}
              {(status.accounts || []).length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
                  No ad accounts found. Create one in Meta Business Manager first.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
