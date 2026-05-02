import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiRefreshCw, FiTarget, FiChevronRight, FiTrendingUp, FiEdit2,
} from "react-icons/fi";
import { metaApi } from "../../api/meta";
import { FieldGrid, InsightsCard, money, prettyJson } from "./detailHelpers";
import EditMetaModal from "./EditMetaModal";
import MetaDetailSkeleton from "../components/MetaDetailSkeleton";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [adsets, setAdsets]     = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState("");
  const [editing, setEditing]   = useState(false);

  async function load() {
    setLoading(true); setErr("");
    try {
      const [c, a] = await Promise.all([
        metaApi.campaign(id),
        metaApi.campaignAdsets(id),
      ]);
      setCampaign(c.campaign || null);
      setAdsets(a.adsets?.data || []);
      // Insights are paid feature on some accounts — don't break if it fails.
      try { const i = await metaApi.entityInsights(id); setInsights(i.insights); } catch {}
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading) return <MetaDetailSkeleton label="campaign" />;
  if (err)     return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{err}</div>;
  if (!campaign) return null;

  const fields = [
    ["ID",                 campaign.id, true],
    ["Name",               campaign.name],
    ["Objective",          (campaign.objective || "").replace("OUTCOME_", "")],
    ["Status",             campaign.status],
    ["Effective status",   campaign.effective_status],
    ["Configured status",  campaign.configured_status],
    ["Buying type",        campaign.buying_type],
    ["Bid strategy",       campaign.bid_strategy],
    ["Daily budget",       money(campaign.daily_budget)],
    ["Lifetime budget",    money(campaign.lifetime_budget)],
    ["Budget remaining",   money(campaign.budget_remaining)],
    ["Spend cap",          money(campaign.spend_cap)],
    ["Special categories", (campaign.special_ad_categories || []).join(", ") || "—"],
    ["Country",            campaign.special_ad_category_country?.join(", ") || "—"],
    ["Pacing type",        (campaign.pacing_type || []).join(", ")],
    ["Account ID",         campaign.account_id, true],
    ["Source campaign ID", campaign.source_campaign_id, true],
    ["Smart promotion",    campaign.smart_promotion_type],
    ["Created",            campaign.created_time ? new Date(campaign.created_time).toLocaleString("en-IN") : "—"],
    ["Updated",            campaign.updated_time ? new Date(campaign.updated_time).toLocaleString("en-IN") : "—"],
    ["Start",              campaign.start_time   ? new Date(campaign.start_time).toLocaleString("en-IN")   : "—"],
    ["Stop",               campaign.stop_time    ? new Date(campaign.stop_time).toLocaleString("en-IN")    : "—"],
  ];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <button className="btn btn-ghost" onClick={() => navigate("/meta/campaigns")}><FiArrowLeft /> Back</button>
        <h1 className="page-title" style={{ margin: 0, fontSize: 22 }}>{campaign.name}</h1>
        <span className={`badge ${campaign.status === "ACTIVE" ? "qualified" : "contacted"}`}>{campaign.status}</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setEditing(true)}><FiEdit2 /> Edit</button>
          <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        </span>
      </div>

      {editing && (
        <EditMetaModal
          kind="campaign"
          entity={campaign}
          onClose={() => setEditing(false)}
          onSave={async (patch) => { await metaApi.updateCampaign(id, patch); await load(); }}
        />
      )}

      <InsightsCard insights={insights} title="Campaign performance (lifetime)" />

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><div className="card-title"><FiTarget /> Campaign details</div></div>
        <FieldGrid fields={fields} />
        {campaign.promoted_object && (
          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)" }}>Promoted object (raw)</summary>
            {prettyJson(campaign.promoted_object)}
          </details>
        )}
      </div>

      {/* Ad sets */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }} className="card-title">
          <FiTarget /> Ad sets ({adsets.length}) <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>Click a row to open</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Ad set</th><th>Goal</th><th>Budget</th><th>Status</th><th>Effective</th><th>Created</th>
              <th style={{ width: 40 }}></th>
            </tr></thead>
            <tbody>
              {adsets.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No ad sets in this campaign.</td></tr>
              ) : adsets.map((a) => {
                const budget = a.daily_budget ? `${money(a.daily_budget)} / day`
                              : a.lifetime_budget ? `${money(a.lifetime_budget)} total` : "—";
                return (
                  <tr key={a.id} onClick={() => navigate(`/meta/adsets/${a.id}`)} style={{ cursor: "pointer" }}>
                    <td>
                      <strong>{a.name}</strong>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{a.id}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{a.optimization_goal || "—"}</td>
                    <td style={{ fontSize: 12 }}>{budget}</td>
                    <td><span className={`badge ${a.status === "ACTIVE" ? "qualified" : "contacted"}`}>{a.status}</span></td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.effective_status}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {a.created_time ? new Date(a.created_time).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                    </td>
                    <td><FiChevronRight style={{ color: "var(--text-muted)" }} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
