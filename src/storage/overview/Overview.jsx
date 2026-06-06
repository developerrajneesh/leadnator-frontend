import {
  FiFolder, FiClock, FiUsers, FiTrash, FiUpload, FiSettings,
} from "react-icons/fi";
import ModuleOverview from "../../globalComponents/ModuleOverview/ModuleOverview";

export default function StorageOverview() {
  return (
    <ModuleOverview
      title="File Storage"
      subtitle="Your own S3 bucket, mounted inside the CRM"
      illustration="/Coworking-amico-flat.png"
      accent="pink"
      intro="Attach proposals, contracts, invoices and media to leads — stored in your own S3-compatible bucket so you keep ownership of every file. Browse, share, restore from trash and bring your team along."
      primary={{ label: "Browse my files", to: "/storage/browse" }}
      secondary={{ label: "Upload files", to: "/storage/upload" }}
      features={[
        { icon: <FiFolder />,   color: "pink",   title: "My files",        desc: "Folder browser of everything in your bucket — preview, rename, move, share.",          to: "/storage/browse" },
        { icon: <FiClock />,    color: "orange", title: "Recent",          desc: "Quick access to files you opened or edited in the last seven days.",                  to: "/storage/recent" },
        { icon: <FiUsers />,    color: "purple", title: "Shared with me",  desc: "Files teammates have shared — open, comment or save a copy to your folder.",         to: "/storage/shared" },
        { icon: <FiTrash />,    color: "green",  title: "Trash",           desc: "Deleted items — restore within 30 days or empty to free up bucket space.",            to: "/storage/trash" },
        { icon: <FiUpload />,   color: "pink",   title: "Upload",          desc: "Drag-and-drop uploader with progress, resume on flaky networks and bulk import.",     to: "/storage/upload" },
        { icon: <FiSettings />, color: "orange", title: "Settings",        desc: "Connect a different bucket, rotate credentials and configure CDN / signed URLs.",    to: "/storage/settings" },
      ]}
    />
  );
}
