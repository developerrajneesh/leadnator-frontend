import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiRefreshCw, FiTarget, FiImage, FiVideo, FiExternalLink, FiEdit2,
} from "react-icons/fi";
import { metaApi } from "../../api/meta";
import { FieldGrid, InsightsCard, money, prettyJson } from "./detailHelpers";
import EditMetaModal from "./EditMetaModal";
import MetaDetailSkeleton from "../components/MetaDetailSkeleton";

export default function AdsetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [adset, setAdset]       = useState(null);
  const [ads, setAds]           = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState("");
  const [editing, setEditing]   = useState(false);

  async function load() {
    setLoading(true); setErr("");
    try {
      const [a, list] = await Promise.all([
        metaApi.adset(id),
        metaApi.adsetAds(id),
      ]);
      setAdset(a.adset || null);
      setAds(list.ads?.data || []);
      try { const i = await metaApi.entityInsights(id); setInsights(i.insights); } catch {}
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading) return <MetaDetailSkeleton label="adset" />;
  if (err)     return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{err}</div>;
  if (!adset)  return null;

  const fields = [
    ["ID",                adset.id, true],
    ["Name",              adset.name],
    ["Campaign ID",       adset.campaign_id, true],
    ["Account ID",        adset.account_id, true],
    ["Status",            adset.status],
    ["Effective status",  adset.effective_status],
    ["Configured status", adset.configured_status],
    ["Optimization goal", adset.optimization_goal],
    ["Billing event",     adset.billing_event],
    ["Bid amount",        money(adset.bid_amount)],
    ["Bid strategy",      adset.bid_strategy],
    ["Daily budget",      money(adset.daily_budget)],
    ["Lifetime budget",   money(adset.lifetime_budget)],
    ["Budget remaining",  money(adset.budget_remaining)],
    ["Pacing type",       (adset.pacing_type || []).join(", ")],
    ["Destination type",  adset.destination_type],
    ["Dynamic creative",  String(adset.is_dynamic_creative ?? "—")],
    ["Source ad set",     adset.source_adset_id, true],
    ["Created",           adset.created_time ? new Date(adset.created_time).toLocaleString("en-IN") : "—"],
    ["Updated",           adset.updated_time ? new Date(adset.updated_time).toLocaleString("en-IN") : "—"],
    ["Start",             adset.start_time   ? new Date(adset.start_time).toLocaleString("en-IN")   : "—"],
    ["End",               adset.end_time     ? new Date(adset.end_time).toLocaleString("en-IN")     : "—"],
  ];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>
        <h1 className="page-title" style={{ margin: 0, fontSize: 22 }}>{adset.name}</h1>
        <span className={`badge ${adset.status === "ACTIVE" ? "qualified" : "contacted"}`}>{adset.status}</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setEditing(true)}><FiEdit2 /> Edit</button>
          <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        </span>
      </div>

      {editing && (
        <EditMetaModal
          kind="adset"
          entity={adset}
          onClose={() => setEditing(false)}
          onSave={async (patch) => { await metaApi.updateAdset(id, patch); await load(); }}
        />
      )}

      <InsightsCard insights={insights} title="Ad set performance (lifetime)" />

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><div className="card-title"><FiTarget /> Ad set details</div></div>
        <FieldGrid fields={fields} />

        {(adset.targeting || adset.promoted_object || adset.attribution_spec || adset.frequency_control_specs || adset.learning_stage_info) && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {adset.targeting && (
              <details>
                <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Targeting (raw)</summary>
                {prettyJson(adset.targeting)}
              </details>
            )}
            {adset.promoted_object && (
              <details>
                <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Promoted object</summary>
                {prettyJson(adset.promoted_object)}
              </details>
            )}
            {adset.attribution_spec && (
              <details>
                <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Attribution spec</summary>
                {prettyJson(adset.attribution_spec)}
              </details>
            )}
            {adset.frequency_control_specs && (
              <details>
                <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Frequency caps</summary>
                {prettyJson(adset.frequency_control_specs)}
              </details>
            )}
            {adset.learning_stage_info && (
              <details>
                <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Learning stage</summary>
                {prettyJson(adset.learning_stage_info)}
              </details>
            )}
          </div>
        )}
      </div>

      {/* Ads grid */}
      <div className="card" style={{ padding: 14 }}>
        <div className="card-header" style={{ marginBottom: 10 }}>
          <div className="card-title"><FiImage /> Ads & creatives ({ads.length}) <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>Click a card to open</span></div>
        </div>
        {ads.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No ads in this ad set.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {ads.map((ad) => <AdCard key={ad.id} ad={ad} onOpen={() => navigate(`/meta/ads/${ad.id}`)} />)}
          </div>
        )}
      </div>
    </>
  );
}

function AdCard({ ad, onOpen }) {
  const cr = ad.creative || {};
  const story = cr.object_story_spec || {};
  const link = story.link_data || story.video_data || {};
  const title = cr.title || link.name || link.title || "(untitled)";
  const body  = cr.body  || link.message || link.description || "";
  const thumb = cr.thumbnail_url || cr.image_url || link.picture;
  const isVideo = !!cr.video_id || !!story.video_data;

  return (
    <div
      onClick={onOpen}
      style={{
        border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
        background: "white", display: "flex", flexDirection: "column", cursor: "pointer",
        transition: "0.12s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 18px rgba(124, 58, 237, 0.12)"; e.currentTarget.style.borderColor = "#7c3aed"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <div style={{
        height: 140, background: "#f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        {thumb ? (
          <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <div style={{ color: "#9ca3af" }}>{isVideo ? <FiVideo size={32} /> : <FiImage size={32} />}</div>
        )}
        {isVideo && thumb && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 28, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>▶</div>
        )}
      </div>
      <div style={{ padding: 10, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <strong style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ad.name}</strong>
          <span className={`badge ${ad.status === "ACTIVE" ? "qualified" : "contacted"}`} style={{ fontSize: 10 }}>{ad.status}</span>
        </div>
        {title && <div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div>}
        {body && <div style={{ fontSize: 11, color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{body}</div>}
        {cr.call_to_action_type && (
          <div style={{ marginTop: 6, padding: "4px 8px", borderRadius: 4, background: "#eef2ff", color: "#4338ca", fontSize: 10, fontWeight: 700, alignSelf: "flex-start", textTransform: "uppercase" }}>
            {cr.call_to_action_type.replace(/_/g, " ")}
          </div>
        )}
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace", marginTop: "auto", display: "flex", justifyContent: "space-between" }}>
          <span>{ad.id}</span>
          {ad.preview_shareable_link && (
            <a onClick={(e) => e.stopPropagation()} href={ad.preview_shareable_link} target="_blank" rel="noreferrer" style={{ color: "#7c3aed" }}>
              <FiExternalLink /> preview
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
