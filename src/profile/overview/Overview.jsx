import {
  FiUser, FiSettings, FiLock, FiBell, FiMessageSquare,
  FiKey, FiShield,
} from "react-icons/fi";
import ModuleOverview from "../../globalComponents/ModuleOverview/ModuleOverview";

export default function SettingsOverview() {
  return (
    <ModuleOverview
      title="Settings"
      subtitle="Your profile, account and team — all configurable here"
      illustration="/New team members-rafiki-flat.png"
      accent="purple"
      intro="Manage everything that lives behind your login: edit your profile, change your password, choose how we notify you, manage API keys for developer access, and invite teammates with the right permissions."
      primary={{ label: "Edit profile info", to: "/settings/info" }}
      secondary={{ label: "Manage team", to: "/settings/team" }}
      features={[
        { icon: <FiUser />,          color: "purple", title: "Profile info",          desc: "Name, photo, contact details and the public profile your team sees.",                 to: "/settings/info" },
        { icon: <FiSettings />,      color: "pink",   title: "Account settings",      desc: "Email, language, timezone, default landing page and account-level prefs.",            to: "/settings/account" },
        { icon: <FiLock />,          color: "orange", title: "Password & security",   desc: "Change password, enable 2FA, view active sessions and recent login activity.",        to: "/settings/password" },
        { icon: <FiBell />,          color: "green",  title: "Notifications",         desc: "Choose which CRM events ping you by email, push, SMS or in-app — per channel.",      to: "/settings/notifications" },
        { icon: <FiMessageSquare />, color: "purple", title: "SMS settings",          desc: "Connect your SMS gateway and choose templates for OTPs and notifications.",          to: "/settings/sms" },
        { icon: <FiKey />,           color: "pink",   title: "API keys",              desc: "Generate, rotate and revoke API tokens for programmatic CRM access.",                  to: "/settings/api" },
        { icon: <FiShield />,        color: "orange", title: "Team members",          desc: "Invite teammates, set roles, assign leads automatically and audit team activity.",   to: "/settings/team" },
      ]}
    />
  );
}
