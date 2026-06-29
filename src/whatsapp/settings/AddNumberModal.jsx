import { useState } from "react";
import { FiX, FiPhone, FiCheckCircle } from "react-icons/fi";
import { waApi } from "../../api/whatsapp";

const inputStyle = { width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, fontFamily: "inherit" };

/**
 * Add a WhatsApp number to the WABA via the raw Graph API:
 *   form → request OTP → verify OTP → register (PIN) → done.
 */
export default function AddNumberModal({ onClose, onAdded }) {
  const [step, setStep] = useState("form"); // form | otp | pin | done
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [cc, setCc] = useState("91");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [codeMethod, setCodeMethod] = useState("SMS");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");

  async function run(fn) {
    setBusy(true); setError("");
    try { await fn(); }
    catch (e) { setError(e.message || "Something went wrong"); }
    finally { setBusy(false); }
  }

  const addAndSendCode = () => run(async () => {
    if (!cc || !phone || !name) { setError("Country code, number and display name are required."); return; }
    const r = await waApi.addPhoneNumber({ cc, phoneNumber: phone, verifiedName: name });
    if (!r.id) throw new Error("Could not add the number.");
    setPhoneNumberId(r.id);
    await waApi.requestPhoneCode(r.id, { method: codeMethod });
    setStep("otp");
  });

  const verify = () => run(async () => {
    if (!otp.trim()) { setError("Enter the code you received."); return; }
    await waApi.verifyPhoneCode(phoneNumberId, { code: otp.trim() });
    setStep("pin");
  });

  const register = () => run(async () => {
    if (!/^\d{6}$/.test(pin)) { setError("PIN must be 6 digits."); return; }
    await waApi.registerPhoneNumber(phoneNumberId, { pin });
    setStep("done");
  });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 480, maxWidth: "100%" }}>
        <div className="card-header">
          <div className="card-title"><FiPhone /> Add WhatsApp number</div>
          <button type="button" className="btn btn-ghost" onClick={onClose}><FiX /></button>
        </div>

        {/* progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {["form", "otp", "pin", "done"].map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: ["form", "otp", "pin", "done"].indexOf(step) >= i ? "var(--primary)" : "var(--border)" }} />
          ))}
        </div>

        {error && <div style={{ padding: 10, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

        {step === "form" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 10 }}>
              <div className="form-group"><label>Country code</label><input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="91" /></div>
              <div className="form-group"><label>Phone number</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98xxxxxxxx" /></div>
            </div>
            <div className="form-group"><label>Display name (shown to customers)</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Business Name" /></div>
            <div className="form-group">
              <label>Verification method</label>
              <select value={codeMethod} onChange={(e) => setCodeMethod(e.target.value)} style={inputStyle}>
                <option value="SMS">SMS</option>
                <option value="VOICE">Voice call</option>
              </select>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: -4 }}>
              A code will be sent to this number. The display name is then reviewed & approved by Meta before sending is enabled.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={addAndSendCode} disabled={busy}>{busy ? "Sending code…" : "Add & send code"}</button>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <p style={{ fontSize: 13, marginTop: 0 }}>Enter the verification code sent to <strong>+{cc} {phone}</strong>.</p>
            <div className="form-group"><label>Verification code</label><input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" /></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 12 }}>
              <button className="btn btn-ghost" onClick={() => run(() => waApi.requestPhoneCode(phoneNumberId, { method: codeMethod }))} disabled={busy}>Resend code</button>
              <button className="btn btn-primary" onClick={verify} disabled={busy}>{busy ? "Verifying…" : "Verify"}</button>
            </div>
          </>
        )}

        {step === "pin" && (
          <>
            <p style={{ fontSize: 13, marginTop: 0 }}>Set a <strong>6-digit PIN</strong> (two-step verification) to register this number for the Cloud API. Keep it safe.</p>
            <div className="form-group"><label>6-digit PIN</label><input value={pin} maxLength={6} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="000000" /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary" onClick={register} disabled={busy}>{busy ? "Registering…" : "Register number"}</button>
            </div>
          </>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <FiCheckCircle style={{ fontSize: 40, color: "#16a34a", marginBottom: 10 }} />
            <h3 style={{ margin: "0 0 6px" }}>Number added!</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 16px" }}>
              <strong>+{cc} {phone}</strong> is registered. Meta will review the display name “{name}”; once approved, you can send from it.
            </p>
            <button className="btn btn-primary" onClick={() => { onAdded?.(); onClose(); }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
