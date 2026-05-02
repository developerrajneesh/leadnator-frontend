import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiStar, FiAward, FiCheck } from "react-icons/fi";
import { pricingApi, loadRazorpay } from "../../api/pricing";
import { useCurrentUser } from "../../api/hooks";

export default function Plans() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [plans, setPlans] = useState([]);
  const [durations, setDurations] = useState([]);
  const [durId, setDurId] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await pricingApi.plans();
      setPlans(res.plans || []);
      setDurations(res.durations || []);
    } catch (err) { setError(err.message || "Failed to load plans."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); loadRazorpay().catch(() => {}); }, []);

  const duration = durations.find((d) => d.id === durId);

  function priceFor(plan) {
    if (!duration) return { base: plan.price, after: plan.price };
    const base = plan.price * duration.multiplier;
    const after = Math.round(base * (1 - duration.discount));
    return { base, after };
  }

  async function handleSubscribe(plan) {
    setError("");
    setPaying(plan.key);
    try {
      const Razorpay = await loadRazorpay();
      const orderRes = await pricingApi.createOrder({ planKey: plan.key, durationId: durId });
      if (!orderRes.keyId) throw new Error("Razorpay not configured on the server.");

      const rzp = new Razorpay({
        key: orderRes.keyId,
        amount: orderRes.order.amount,
        currency: orderRes.order.currency,
        name: "Leadnator",
        description: `${plan.name} · ${duration.label}`,
        order_id: orderRes.order.id,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#7c3aed" },
        handler: async (response) => {
          try {
            await pricingApi.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            navigate("/pricing/current");
          } catch (err) {
            alert(err.message || "Verification failed.");
          }
        },
        modal: {
          ondismiss: () => setPaying(""),
        },
      });
      rzp.on("payment.failed", (resp) => {
        alert("Payment failed: " + (resp?.error?.description || "Unknown"));
        setPaying("");
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Could not start payment.");
      setPaying("");
    }
  }

  if (loading) {
    return <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading plans…</div>;
  }

  return (
    <>
      <div className="pricing-hero">
        <h1 className="page-title">Simple, transparent pricing</h1>
        <p className="page-subtitle">Pick a plan that fits your growth.</p>
        <div className="duration-toggle">
          {durations.map((d) => (
            <button key={d.id} className={durId === d.id ? "active" : ""} onClick={() => setDurId(d.id)}>
              {d.label}
              {d.discount > 0 && <span className="save-pill">SAVE {Math.round(d.discount * 100)}%</span>}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 12, fontSize: 13, maxWidth: 720, margin: "0 auto 16px" }}>{error}</div>}

      <div className="pricing-grid">
        {plans.map((p) => {
          const { base, after } = priceFor(p);
          const perMonth = duration ? Math.round(after / duration.multiplier) : p.price;
          const isCurrent = user.plan === p.name;
          return (
            <div key={p.id || p.key} className={`price-card ${p.popular ? "popular" : ""}`}>
              {p.popular && <div className="popular-badge"><FiStar style={{ verticalAlign: "middle" }} /> MOST POPULAR</div>}
              {duration?.bestValue && <div className="best-value-badge"><FiAward style={{ verticalAlign: "middle" }} /> BEST VALUE</div>}
              <h3>{p.name}</h3>
              <p className="price-tagline">{p.tagline}</p>
              <div>
                <span className="price-amount">₹{perMonth}<small>/mo</small></span>
                {duration?.discount > 0 && <span className="price-old">₹{Math.round(base / duration.multiplier)}</span>}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                Billed ₹{after.toLocaleString()} for {duration?.months} {duration?.months === 1 ? "month" : "months"}
              </div>
              <ul className="feature-list">
                {(p.features || []).map((f) => <li key={f}>{f}</li>)}
                {(p.disabled || []).map((f) => <li key={f} className="disabled">{f}</li>)}
              </ul>
              {isCurrent ? (
                <button className="price-cta outline" disabled style={{ opacity: 0.7, cursor: "default" }}>
                  <FiCheck /> Current plan
                </button>
              ) : (
                <button
                  className={`price-cta ${p.popular ? "primary" : "outline"}`}
                  disabled={paying === p.key}
                  onClick={() => handleSubscribe(p)}
                >
                  {paying === p.key ? "Opening checkout…" : (p.popular ? "Get started" : "Choose plan")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
