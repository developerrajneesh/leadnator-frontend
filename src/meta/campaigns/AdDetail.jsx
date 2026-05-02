import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiRefreshCw, FiImage, FiVideo, FiExternalLink, FiCode, FiEdit2 } from "react-icons/fi";
import { metaApi } from "../../api/meta";
import { FieldGrid, InsightsCard, prettyJson } from "./detailHelpers";
import EditMetaModal from "./EditMetaModal";
import MetaDetailSkeleton from "../components/MetaDetailSkeleton";

export default function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ad, setAd]             = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState("");
  const [editing, setEditing]   = useState(false);

  async function load() {
    setLoading(true); setErr("");
    try {
      const r = await metaApi.ad(id);
      setAd(r.ad || null);
      try { const i = await metaApi.entityInsights(id); setInsights(i.insights); } catch {}
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading) return <MetaDetailSkeleton label="ad" />;
  if (err)     return <div className="card" style={{ padding: 20, color: "#b91c1c" }}>{err}</div>;
  if (!ad)     return null;

  const cr = ad.creative || {};
  const story = cr.object_story_spec || {};
  const link = story.link_data || story.video_data || {};
  const headline = cr.title || link.name || link.title || "(untitled)";
  const body     = cr.body  || link.message || link.description || "";
  const thumb    = cr.thumbnail_url || cr.image_url || link.picture;
  const isVideo  = !!cr.video_id || !!story.video_data;

  const adFields = [
    ["ID",                ad.id, true],
    ["Name",              ad.name],
    ["Ad set ID",         ad.adset_id, true],
    ["Campaign ID",       ad.campaign_id, true],
    ["Account ID",        ad.account_id, true],
    ["Status",            ad.status],
    ["Effective status",  ad.effective_status],
    ["Configured status", ad.configured_status],
    ["Source ad",         ad.source_ad_id, true],
    ["Created",           ad.created_time ? new Date(ad.created_time).toLocaleString("en-IN") : "—"],
    ["Updated",           ad.updated_time ? new Date(ad.updated_time).toLocaleString("en-IN") : "—"],
  ];

  const creativeFields = [
    ["Creative ID",   cr.id, true],
    ["Creative name", cr.name],
    ["Headline",      cr.title || "—"],
    ["Body",          cr.body || "—"],
    ["CTA",           cr.call_to_action_type],
    ["Link URL",      cr.link_url || link.link],
    ["Image URL",     cr.image_url],
    ["Image hash",    cr.image_hash, true],
    ["Video ID",      cr.video_id, true],
    ["Object story ID", cr.object_story_id || cr.effective_object_story_id, true],
    ["Status",        cr.status],
  ];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>
        <h1 className="page-title" style={{ margin: 0, fontSize: 22 }}>{ad.name}</h1>
        <span className={`badge ${ad.status === "ACTIVE" ? "qualified" : "contacted"}`}>{ad.status}</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {ad.preview_shareable_link && (
            <a className="btn btn-outline" href={ad.preview_shareable_link} target="_blank" rel="noreferrer">
              <FiExternalLink /> Preview on Meta
            </a>
          )}
          <button className="btn btn-outline" onClick={() => setEditing(true)}><FiEdit2 /> Edit</button>
          <button className="btn btn-outline" onClick={load}><FiRefreshCw /> Refresh</button>
        </span>
      </div>

      {editing && (
        <EditMetaModal
          kind="ad"
          entity={ad}
          onClose={() => setEditing(false)}
          onSave={async (patch) => { await metaApi.updateAd(id, patch); await load(); }}
        />
      )}

      <InsightsCard insights={insights} title="Ad performance (lifetime)" />

      <div className="grid-2-equal" style={{ gap: 14, marginBottom: 14 }}>
        {/* Creative preview */}
        <div className="card">
          <div className="card-header"><div className="card-title">{isVideo ? <FiVideo /> : <FiImage />} Creative preview</div></div>
          <div style={{ background: "#0f172a", borderRadius: 8, overflow: "hidden", marginBottom: 10, position: "relative" }}>
            {thumb ? (
              <img src={thumb} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "contain", display: "block" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>No thumbnail</div>
            )}
            {isVideo && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 48, textShadow: "0 2px 8px rgba(0,0,0,0.5)", pointerEvents: "none" }}>▶</div>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{headline}</div>
          {body && <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{body}</div>}
          {cr.call_to_action_type && (
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 6, background: "#7c3aed", color: "white", textAlign: "center", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {cr.call_to_action_type.replace(/_/g, " ")}
            </div>
          )}
          {cr.instagram_permalink_url && (
            <a href={cr.instagram_permalink_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, marginTop: 10 }}>
              <FiExternalLink /> Instagram permalink
            </a>
          )}
        </div>

        {/* Creative fields */}
        <div className="card">
          <div className="card-header"><div className="card-title"><FiImage /> Creative fields</div></div>
          <FieldGrid fields={creativeFields} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><div className="card-title">Ad fields</div></div>
        <FieldGrid fields={adFields} />
      </div>

      {/* Raw extras */}
      <div className="card">
        <div className="card-header"><div className="card-title"><FiCode /> Raw payloads</div></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {story && Object.keys(story).length > 0 && (
            <details>
              <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>object_story_spec</summary>
              {prettyJson(story)}
            </details>
          )}
          {ad.tracking_specs && (
            <details>
              <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>tracking_specs</summary>
              {prettyJson(ad.tracking_specs)}
            </details>
          )}
          {ad.conversion_specs && (
            <details>
              <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>conversion_specs</summary>
              {prettyJson(ad.conversion_specs)}
            </details>
          )}
          {ad.issues_info && (
            <details>
              <summary style={{ cursor: "pointer", fontSize: 12, color: "#b91c1c", fontWeight: 600 }}>issues_info</summary>
              {prettyJson(ad.issues_info)}
            </details>
          )}
        </div>
      </div>
    </>
  );
}
