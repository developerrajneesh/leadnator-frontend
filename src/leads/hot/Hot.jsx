import { FiStar } from "react-icons/fi";
import { useLeads } from "../../api/hooks";
import LeadTable from "../all-leads/components/LeadTable";
import LeadTableSkeleton from "../all-leads/components/LeadTableSkeleton";

export default function Hot() {
  const { leads, loading } = useLeads();

  if (loading && leads.length === 0) {
    return (
      <>
        <h1 className="page-title">Hot leads</h1>
        <p className="page-subtitle">
          <FiStar style={{ verticalAlign: "middle" }} />{" "}
          <span className="skel skel-line" style={{ width: 180, verticalAlign: "middle" }} />
        </p>
        <LeadTableSkeleton rows={6} />
      </>
    );
  }

  const hot = leads.filter((l) => l.status === "hot");
  return (
    <>
      <h1 className="page-title">Hot leads</h1>
      <p className="page-subtitle"><FiStar style={{ verticalAlign: "middle" }} /> {hot.length} hot leads — prioritize these.</p>
      <LeadTable leads={hot} />
    </>
  );
}
