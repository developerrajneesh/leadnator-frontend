import { useNavigate } from "react-router-dom";
import { FiCreditCard, FiShield, FiExternalLink } from "react-icons/fi";

export default function Payment() {
  const navigate = useNavigate();
  return (
    <>
      <h1 className="page-title">Payment methods</h1>
      <p className="page-subtitle">Card / UPI / netbanking are handled securely by Razorpay during checkout.</p>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header"><div className="card-title"><FiCreditCard /> How payments work</div></div>

        <div style={{ padding: 16, background: "#f9fafb", borderRadius: 10, marginBottom: 14, fontSize: 13, lineHeight: 1.6 }}>
          <FiShield style={{ verticalAlign: "middle", color: "var(--accent)", marginRight: 6 }} />
          Leadnator never stores your card details. When you subscribe, you're taken to a secure Razorpay checkout where you can pay with:
          <ul style={{ marginTop: 8, paddingLeft: 22, color: "var(--text)" }}>
            <li>Credit / Debit cards (Visa, Mastercard, Amex, RuPay)</li>
            <li>UPI (Google Pay, PhonePe, Paytm, BHIM)</li>
            <li>Net banking (all major Indian banks)</li>
            <li>Wallets (Paytm, Mobikwik, Freecharge)</li>
            <li>EMI on eligible cards</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={() => navigate("/pricing/plans")}>Subscribe to a plan</button>
          <a className="btn btn-outline" href="https://razorpay.com" target="_blank" rel="noopener noreferrer">
            <FiExternalLink /> About Razorpay
          </a>
        </div>
      </div>
    </>
  );
}
