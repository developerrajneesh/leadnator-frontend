import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./globalComponents/Layout/Layout";
import AdminLayout from "./admin/AdminLayout";
import PermissionGate from "./globalComponents/PermissionGate/PermissionGate";
import OrgLoginGuard from "./globalComponents/OrgLoginGuard";

// Admin pages
import AdminOverview from "./admin/pages/Overview";
import AdminUsers from "./admin/pages/Users";
import AdminUserDetail from "./admin/pages/UserDetail";
import AdminPlans from "./admin/pages/Plans";
import AdminRevenue from "./admin/pages/Revenue";
import AdminSupport from "./admin/pages/Support";
import AdminLogs from "./admin/pages/Logs";
import AdminSettings from "./admin/pages/Settings";
import AdminEmailTemplates from "./admin/pages/EmailTemplates";

// Public pages
import PublicForm from "./pages/PublicForm/PublicForm";
import PublicBooking from "./pages/PublicBooking/PublicBooking";

// Dashboard
import Overview from "./dashboard/overview/Overview";
import Activity from "./dashboard/activity/Activity";
import Analytics from "./dashboard/analytics/Analytics";
import Reports from "./dashboard/reports/Reports";
import Exports from "./dashboard/exports/Exports";

// Leads
import LeadsOverview from "./leads/overview/Overview";
import AllLeads from "./leads/all-leads/AllLeads";
import LeadDetail from "./leads/all-leads/LeadDetail";
import LeadsConversations from "./leads/conversations/Conversations";
import Pipeline from "./leads/pipeline/Pipeline";
import Funnel from "./leads/funnel/Funnel";
import Hot from "./leads/hot/Hot";
import MetaForms from "./leads/meta-forms/MetaForms";
import LeadsAutomation from "./leads/automation/Automation";
import LeadsFlowBuilder from "./leads/automation/FlowBuilder";
import Import from "./leads/import/Import";
import Sources from "./leads/sources/Sources";
import Tags from "./leads/tags/Tags";
import LeadSettings from "./leads/settings/Settings";

// Meta Ads
import MetaCampaigns from "./meta/campaigns/Campaigns";
import MetaCampaignDetail from "./meta/campaigns/CampaignDetail";
import MetaAdsetDetail from "./meta/campaigns/AdsetDetail";
import MetaAdDetail from "./meta/campaigns/AdDetail";
import MetaLeadForms from "./meta/forms/Forms";
import MetaFormCreate from "./meta/forms/FormCreate";
import MetaFormViewer from "./meta/forms/FormViewer";
import MetaWebhook from "./meta/webhook/Webhook";
import MetaAnalytics from "./meta/analytics/Analytics";
import MetaCreate from "./meta/create/Create";
import MetaAdsScope from "./meta/create/MetaAdsScope";
// Meta Ads goal-flow wizards (ported LCM: Click to WhatsApp/Call/Website/Lead Form)
import CallCampaign from "./meta/create/metaManagement/CallCampaign";
import CallAdSet from "./meta/create/metaManagement/CallAdSet";
import CallAdCreative from "./meta/create/metaManagement/CallAdCreative";
import CallLaunch from "./meta/create/metaManagement/CallLaunch";
import WhatsAppCampaign from "./meta/create/metaManagement/WhatsAppCampaign";
import WhatsAppAdSet from "./meta/create/metaManagement/WhatsAppAdSet";
import WhatsAppAdCreative from "./meta/create/metaManagement/WhatsAppAdCreative";
import WhatsAppLaunch from "./meta/create/metaManagement/WhatsAppLaunch";
import LinkCampaign from "./meta/create/metaManagement/LinkCampaign";
import LinkAdSet from "./meta/create/metaManagement/LinkAdSet";
import LinkAdCreative from "./meta/create/metaManagement/LinkAdCreative";
import LinkLaunch from "./meta/create/metaManagement/LinkLaunch";
import LeadFormCampaign from "./meta/create/metaManagement/LeadFormCampaign";
import LeadFormForm from "./meta/create/metaManagement/LeadFormForm";
import LeadFormBuilder from "./meta/create/metaManagement/LeadFormBuilder";
import LeadFormAdSet from "./meta/create/metaManagement/LeadFormAdSet";
import LeadFormAdCreative from "./meta/create/metaManagement/LeadFormAdCreative";
import LeadFormLaunch from "./meta/create/metaManagement/LeadFormLaunch";
import LeadFormSubscribeWebhooks from "./meta/create/metaManagement/SubscribePageWebhooks";
import MetaOverview from "./meta/overview/Overview";
import MetaAccountInfo from "./meta/overview/AccountInfo";
import AllNotifications from "./notifications/AllNotifications";
import MetaAccounts from "./meta/accounts/Accounts";
import MetaAudiences from "./meta/audiences/Audiences";

// WhatsApp
import WaOverview from "./whatsapp/overview/Overview";
import WaBroadcasts from "./whatsapp/broadcasts/Broadcasts";
import WaTemplates from "./whatsapp/templates/Templates";
import WaInbox from "./whatsapp/inbox/Inbox";
import WaAutomation from "./whatsapp/automation/Automation";
import WaFlowBuilder from "./whatsapp/automation/FlowBuilder";
import WaContacts from "./whatsapp/contacts/Contacts";
import WaSettings from "./whatsapp/settings/Settings";
import WaChatbot from "./whatsapp/chatbot/Chatbot";
import WaChatbotBuilder from "./whatsapp/chatbot/ChatbotBuilder";
import WaAiChatbotBuilder from "./whatsapp/chatbot/AiChatbotBuilder";
import WaWebhook from "./whatsapp/webhook/Webhook";
import WaAnalytics from "./whatsapp/analytics/Analytics";
import WaReports   from "./whatsapp/reports/Reports";
import WaForms from "./whatsapp/forms/Forms";

// Autopilot
import AutopilotOverview from "./autopilot/Overview";
import AutopilotList from "./autopilot/AutopilotList";
import AutopilotFlows from "./autopilot/Flows";
import AutopilotWebhooks from "./autopilot/Webhooks";

// Instagram
import IgOverview from "./instagram/overview/Overview";
import IgInbox from "./instagram/inbox/Inbox";
import IgComments from "./instagram/comments/Comments";
import IgAutomation from "./instagram/automation/Automation";
import IgFlowBuilder from "./instagram/automation/FlowBuilder";
import IgContent from "./instagram/content/Content";
import IgContentDetail from "./instagram/content/ContentDetail";
import IgAnalytics from "./instagram/analytics/Analytics";
import IgWebhook from "./instagram/webhook/Webhook";
import IgSettings from "./instagram/settings/Settings";
import WaFormBuilder from "./whatsapp/forms/FormBuilder";
import WhatsAppGate from "./whatsapp/components/WhatsAppGate";
import InstagramGate from "./instagram/components/InstagramGate";
import IgConnect from "./instagram/components/ConnectPage";
import MetaGate     from "./meta/components/MetaGate";
import MetaConnect  from "./meta/components/ConnectPage";
import EmailGate    from "./email/components/EmailGate";
import EmailConnect  from "./email/components/ConnectPage";
import PlanGate from "./plan/PlanGate";

const WA_PERKS = ["Unlimited WhatsApp broadcasts", "Shared team inbox", "Automations & flows", "Templates & analytics"];
const AI_PERKS = ["AI ad copy, emails & rewriting", "AI translator & hashtags", "AI lead scoring", "Powered by the latest models"];

// Plan-access gate: shows an upgrade screen when the plan doesn't include it.
const waPlan = (el) => <PlanGate feature="whatsapp" title="WhatsApp marketing" perks={WA_PERKS}>{el}</PlanGate>;
const aiPlan = (el) => <PlanGate feature="aiTools" title="AI tools" perks={AI_PERKS}>{el}</PlanGate>;
const waBotPlan = (el) => <PlanGate feature="whatsappChatbot" title="The WhatsApp chatbot" perks={["Build automated reply flows", "Buttons & quick replies", "Keyword triggers"]}>{el}</PlanGate>;
const waAiBotPlan = (el) => <PlanGate feature="aiChatbot" title="The WhatsApp AI chatbot" perks={["AI answers from your knowledge base", "Natural, human-like replies", "Smart CTAs & handover"]}>{el}</PlanGate>;

// Shorthand — wraps any WhatsApp feature page in the plan gate (WhatsApp is a
// Growth+ feature) then the connection gate. Not connected → Embedded Signup.
const gated      = (el) => waPlan(<WhatsAppGate>{el}</WhatsAppGate>);
const igGated    = (el) => <InstagramGate>{el}</InstagramGate>;
const metaGated  = (el) => <MetaGate>{el}</MetaGate>;
const emailGated = (el) => <EmailGate>{el}</EmailGate>;

// Wrap a route element in the TeamMember permission gate. Owners pass
// straight through; members get redirected/blocked per their permissions
// map. `g(module, route, element)` keeps the route table readable.
const g = (moduleKey, subRouteKey, element) => (
  <PermissionGate moduleKey={moduleKey} subRouteKey={subRouteKey}>
    {element}
  </PermissionGate>
);

// Email
import EmailOverview from "./email/overview/Overview";
import EmailInbox from "./email/inbox/Inbox";
import EmailCampaigns from "./email/campaigns/Campaigns";
import EmailCampaignDetail from "./email/campaigns/CampaignDetail";
import EmailCreate from "./email/create/Create";
import EmailTemplates from "./email/templates/Templates";
import EmailAutomation from "./email/automation/Automation";
import EmailFlowEditor from "./email/automation/EmailFlowEditor";
import EmailSubscribers from "./email/subscribers/Subscribers";
import EmailAnalytics from "./email/analytics/Analytics";
import EmailConfig from "./email/config/Config";
import EmailSignature from "./email/signature/Signature";

// Integrations
import IntOverview from "./integrations/overview/Overview";
import IntBrowse from "./integrations/browse/Browse";
import IntConnected from "./integrations/connected/Connected";
import IntWebhooks from "./integrations/webhooks/Webhooks";
import IntZapier from "./integrations/zapier/Zapier";
import IntCustom from "./integrations/custom/Custom";

// File Storage
import StorageOverview from "./storage/overview/Overview";
import StorageBrowse from "./storage/browse/Browse";
import StorageRecent from "./storage/recent/Recent";
import StorageShared from "./storage/shared/Shared";
import StorageTrash  from "./storage/trash/Trash";
import StorageUpload from "./storage/upload/Upload";
import StorageSettings from "./storage/settings/Settings";
import StorageGate from "./storage/components/StorageGate";
const storageGated = (el) => <StorageGate>{el}</StorageGate>;

// Tools
import ToolsOverview from "./tools/overview/Overview";
import ToolForm from "./tools/form/Form";
import ToolAiAdCopy     from "./tools/ai/AdCopy";
import ToolAiEmail      from "./tools/ai/EmailWriter";
import ToolAiRewriter   from "./tools/ai/Rewriter";
import ToolAiTranslator from "./tools/ai/Translator";
import ToolAiHashtags   from "./tools/ai/Hashtags";
import ToolAiLeadScore  from "./tools/ai/LeadScorer";
import ToolInvoice from "./tools/invoice/Invoice";
import ToolUtm from "./tools/utm/Utm";
import ToolShortener from "./tools/shortener/Shortener";
import ToolQr from "./tools/qr/Qr";
import ToolSignature from "./tools/signature/Signature";
import ToolSignatureCreator from "./tools/signature-creator/SignatureCreator";
import ToolStampCreator from "./tools/stamp-creator/StampCreator";
import ToolSubject from "./tools/subject/Subject";
import ToolValidator from "./tools/validator/Validator";
import ToolCounter from "./tools/counter/Counter";
import ToolPassword from "./tools/password/Password";
import ToolAbTest from "./tools/abtest/AbTest";
import ToolRoi from "./tools/roi/Roi";
import ToolSlug from "./tools/slug/Slug";
import ToolOg from "./tools/og/Og";

// Calendar
import CalOverview from "./calendar/overview/Overview";
import CalMonth from "./calendar/month/Month";
import CalWeek from "./calendar/week/Week";
import CalAgenda from "./calendar/agenda/Agenda";
import CalUpcoming from "./calendar/upcoming/Upcoming";
import CalCreate from "./calendar/create/Create";
import CalAvailability from "./calendar/availability/Availability";
import CalBooking from "./calendar/booking/Booking";

// Pricing
import PricingOverview from "./pricing/overview/Overview";
import Plans from "./pricing/plans/Plans";
import Current from "./pricing/current/Current";
import Invoices from "./pricing/invoices/Invoices";
import Payment from "./pricing/payment/Payment";
import History from "./pricing/history/History";

// Support
import SupportOverview from "./support/overview/Overview";
import Tickets from "./support/tickets/Tickets";
import TicketDetail from "./support/tickets/TicketDetail";
import NewTicket from "./support/new/New";
import Faq from "./support/faq/Faq";
import Docs from "./support/docs/Docs";
import Chat from "./support/chat/Chat";

// Profile / Settings
import SettingsOverview from "./profile/overview/Overview";
import Info from "./profile/info/Info";
import Account from "./profile/account/Account";
import PasswordPage from "./profile/password/Password";
import Notifications from "./profile/notifications/Notifications";
import Api from "./profile/api/Api";
import Team from "./profile/team/Team";
import TeamDetail from "./profile/team/TeamDetail";
import AddMember from "./profile/team/AddMember";
import Sms from "./profile/sms/Sms";
export function buildRouter(onLogout, role = "user") {
  const homeRedirect = role === "admin" ? "/admin/overview" : "/dashboard/overview";

  return createBrowserRouter([
    { path: "/form/:formId",    element: <PublicForm /> },
    { path: "/book/:bookingId", element: <PublicBooking /> },

    {
      path: "/admin",
      element: <AdminLayout onLogout={onLogout} />,
      children: [
        { index: true,          element: <Navigate to="/admin/overview" replace /> },
        { path: "overview",     element: <AdminOverview /> },
        { path: "users",        element: <AdminUsers /> },
        { path: "users/:id",    element: <AdminUserDetail /> },
        { path: "plans",        element: <AdminPlans /> },
        { path: "revenue",      element: <AdminRevenue /> },
        { path: "support",      element: <AdminSupport /> },
        { path: "logs",         element: <AdminLogs /> },
        { path: "email-templates", element: <AdminEmailTemplates /> },
        { path: "settings",     element: <AdminSettings /> },
      ],
    },

    {
      path: "/",
      element: <Layout onLogout={onLogout} />,
      children: [
        { index: true, element: <Navigate to={homeRedirect} replace /> },

        { path: "notifications",       element: <AllNotifications /> },

        { path: "dashboard",           element: <Navigate to="/dashboard/overview" replace /> },
        { path: "dashboard/overview",  element: g("dashboard", "overview",  <Overview />) },
        { path: "dashboard/activity",  element: g("dashboard", "activity",  <Activity />) },
        { path: "dashboard/analytics", element: g("dashboard", "analytics", <Analytics />) },
        { path: "dashboard/reports",   element: g("dashboard", "reports",   <Reports />) },
        { path: "dashboard/exports",   element: g("dashboard", "exports",   <Exports />) },

        { path: "leads",                  element: <Navigate to="/leads/overview" replace /> },
        { path: "leads/overview",         element: g("leads", "overview",   <LeadsOverview />) },
        { path: "leads/all",              element: g("leads", "all",        <AllLeads />) },
        { path: "leads/all/:id",          element: g("leads", "all",        <LeadDetail />) },
        { path: "leads/conversations",    element: g("leads", "conversations", <LeadsConversations />) },
        { path: "leads/pipeline",         element: g("leads", "pipeline",   <Pipeline />) },
        { path: "leads/funnel",           element: g("leads", "funnel",     <Funnel />) },
        { path: "leads/hot",              element: g("leads", "hot",        <Hot />) },
        { path: "leads/meta-forms",       element: g("leads", "meta-forms", <MetaForms />) },
        { path: "leads/automation",       element: g("leads", "automation", <LeadsAutomation />) },
        { path: "leads/automation/:id",   element: g("leads", "automation", <LeadsFlowBuilder />) },
        { path: "leads/import",           element: g("leads", "import",     <Import />) },
        { path: "leads/sources",          element: g("leads", "sources",    <Sources />) },
        { path: "leads/tags",             element: g("leads", "tags",       <Tags />) },
        { path: "leads/settings",         element: g("leads", "settings",   <LeadSettings />) },

        { path: "meta",                    element: <Navigate to="/meta/overview" replace /> },
        { path: "meta/connect",            element: g("meta", "overview",     <MetaConnect />) },
        { path: "meta/overview",           element: g("meta", "overview",     <MetaOverview />) },
        { path: "meta/account-info",       element: g("meta", "account-info", metaGated(<MetaAccountInfo />)) },
        { path: "meta/campaigns",          element: g("meta", "campaigns", metaGated(<MetaCampaigns />)) },
        { path: "meta/campaigns/:id",      element: g("meta", "campaigns", metaGated(<MetaCampaignDetail />)) },
        { path: "meta/adsets/:id",         element: g("meta", "campaigns", metaGated(<MetaAdsetDetail />)) },
        { path: "meta/ads/:id",            element: g("meta", "campaigns", metaGated(<MetaAdDetail />)) },
        { path: "meta/forms",              element: g("meta", "forms",     metaGated(<MetaLeadForms />)) },
        { path: "meta/forms/new",          element: g("meta", "forms",     metaGated(<MetaFormCreate />)) },
        { path: "meta/forms/:id",          element: g("meta", "forms",     metaGated(<MetaFormViewer />)) },
        { path: "meta/webhook",            element: g("meta", "webhook",   metaGated(<MetaWebhook />)) },
        { path: "meta/analytics",          element: g("meta", "analytics", metaGated(<MetaAnalytics />)) },
        { path: "meta/create", element: g("meta", "create", metaGated(<MetaAdsScope />)), children: [
          { index: true,                      element: <MetaCreate /> },
          { path: "call/campaign",            element: <CallCampaign /> },
          { path: "call/adset",               element: <CallAdSet /> },
          { path: "call/creative",            element: <CallAdCreative /> },
          { path: "call/launch",              element: <CallLaunch /> },
          { path: "whatsapp/campaign",        element: <WhatsAppCampaign /> },
          { path: "whatsapp/adset",           element: <WhatsAppAdSet /> },
          { path: "whatsapp/creative",        element: <WhatsAppAdCreative /> },
          { path: "whatsapp/launch",          element: <WhatsAppLaunch /> },
          { path: "link/campaign",            element: <LinkCampaign /> },
          { path: "link/adset",               element: <LinkAdSet /> },
          { path: "link/creative",            element: <LinkAdCreative /> },
          { path: "link/launch",              element: <LinkLaunch /> },
          { path: "lead-form/campaign",       element: <LeadFormCampaign /> },
          { path: "lead-form/form",           element: <LeadFormForm /> },
          { path: "lead-form/builder",        element: <LeadFormBuilder /> },
          { path: "lead-form/adset",          element: <LeadFormAdSet /> },
          { path: "lead-form/creative",       element: <LeadFormAdCreative /> },
          { path: "lead-form/launch",         element: <LeadFormLaunch /> },
          { path: "lead-form/subscribe-webhooks", element: <LeadFormSubscribeWebhooks /> },
        ] },
        { path: "meta/accounts",           element: g("meta", "accounts",  metaGated(<MetaAccounts />)) },
        { path: "meta/audiences",          element: g("meta", "audiences", metaGated(<MetaAudiences />)) },

        { path: "instagram",                  element: <Navigate to="/instagram/overview" replace /> },
        { path: "instagram/connect",          element: g("instagram", "overview",   <IgConnect />) },
        { path: "instagram/overview",         element: g("instagram", "overview",   <IgOverview />) },
        { path: "instagram/inbox",            element: g("instagram", "inbox",      igGated(<IgInbox />)) },
        { path: "instagram/comments",         element: g("instagram", "comments",   igGated(<IgComments />)) },
        { path: "instagram/automation",       element: g("instagram", "automation", igGated(<IgAutomation />)) },
        { path: "instagram/automation/:id",   element: g("instagram", "automation", igGated(<IgFlowBuilder />)) },
        { path: "instagram/content",          element: g("instagram", "content",    igGated(<IgContent />)) },
        { path: "instagram/content/:mediaId", element: g("instagram", "content",    igGated(<IgContentDetail />)) },
        { path: "instagram/analytics",        element: g("instagram", "analytics",  igGated(<IgAnalytics />)) },
        { path: "instagram/webhook",          element: g("instagram", "webhook",    igGated(<IgWebhook />)) },
        { path: "instagram/settings",         element: g("instagram", "settings",   igGated(<IgSettings />)) },

        { path: "whatsapp",                  element: <Navigate to="/whatsapp/overview" replace /> },
        { path: "whatsapp/overview",         element: g("whatsapp", "overview",   waPlan(<WaOverview />)) },
        { path: "whatsapp/broadcasts",       element: g("whatsapp", "broadcasts", gated(<WaBroadcasts />)) },
        { path: "whatsapp/templates",        element: g("whatsapp", "templates",  gated(<WaTemplates />)) },
        { path: "whatsapp/inbox",            element: g("whatsapp", "inbox",      gated(<WaInbox />)) },
        { path: "whatsapp/automation",       element: g("whatsapp", "automation", gated(<WaAutomation />)) },
        { path: "whatsapp/automation/:id",   element: g("whatsapp", "automation", gated(<WaFlowBuilder />)) },
        { path: "whatsapp/contacts",         element: g("whatsapp", "contacts",   gated(<WaContacts />)) },
        { path: "whatsapp/chatbot",          element: g("whatsapp", "chatbot",    gated(waBotPlan(<WaChatbot />))) },
        { path: "whatsapp/chatbot/ai/:id",   element: g("whatsapp", "chatbot",    gated(waAiBotPlan(<WaAiChatbotBuilder />))) },
        { path: "whatsapp/chatbot/:id",      element: g("whatsapp", "chatbot",    gated(waBotPlan(<WaChatbotBuilder />))) },
        { path: "whatsapp/webhook",          element: g("whatsapp", "webhook",    gated(<WaWebhook />)) },
        { path: "whatsapp/analytics",        element: g("whatsapp", "analytics",  gated(<WaAnalytics />)) },
        { path: "whatsapp/reports",          element: g("whatsapp", "analytics",  gated(<WaReports />)) },
        { path: "whatsapp/forms",            element: g("whatsapp", "forms",      gated(<WaForms />)) },
        { path: "whatsapp/forms/:id",        element: g("whatsapp", "forms",      gated(<WaFormBuilder />)) },
        { path: "whatsapp/settings",         element: g("whatsapp", "settings",   waPlan(<WaSettings />)) },

        { path: "email",              element: <Navigate to="/email/overview" replace /> },
        { path: "email/connect",      element: g("email", "config",      <EmailConnect />) },
        { path: "email/overview",     element: g("email", "overview",    <EmailOverview />) },
        { path: "email/inbox",        element: g("email", "inbox",       emailGated(<EmailInbox />)) },
        { path: "email/campaigns",    element: g("email", "campaigns",   emailGated(<EmailCampaigns />)) },
        { path: "email/campaigns/:id", element: g("email", "campaigns",  emailGated(<EmailCampaignDetail />)) },
        { path: "email/create",       element: g("email", "create",      emailGated(<EmailCreate />)) },
        { path: "email/templates",    element: g("email", "templates",   emailGated(<EmailTemplates />)) },
        { path: "email/automation",   element: g("email", "automation",  emailGated(<EmailAutomation />)) },
        { path: "email/automation/:id", element: g("email", "automation", emailGated(<EmailFlowEditor />)) },
        { path: "email/subscribers",  element: g("email", "subscribers", emailGated(<EmailSubscribers />)) },
        { path: "email/analytics",    element: g("email", "analytics",   emailGated(<EmailAnalytics />)) },
        { path: "email/config",       element: g("email", "config",      emailGated(<EmailConfig />)) },
        { path: "email/signature",    element: g("email", "signature",   emailGated(<EmailSignature />)) },

        { path: "integrations",            element: <Navigate to="/integrations/overview" replace /> },
        { path: "integrations/overview",   element: g("integrations", "overview",  <IntOverview />) },
        { path: "integrations/browse",     element: g("integrations", "browse",    <IntBrowse />) },
        { path: "integrations/connected",  element: g("integrations", "connected", <IntConnected />) },
        { path: "integrations/webhooks",   element: g("integrations", "webhooks",  <IntWebhooks />) },
        { path: "integrations/zapier",     element: g("integrations", "zapier",    <IntZapier />) },
        { path: "integrations/custom",     element: g("integrations", "custom",    <IntCustom />) },

        { path: "storage",                 element: <Navigate to="/storage/overview" replace /> },
        { path: "storage/overview",        element: g("storage", "overview", <StorageOverview />) },
        { path: "storage/browse",          element: g("storage", "browse",   storageGated(<StorageBrowse />)) },
        { path: "storage/recent",          element: g("storage", "recent",   storageGated(<StorageRecent />)) },
        { path: "storage/shared",          element: g("storage", "shared",   storageGated(<StorageShared />)) },
        { path: "storage/trash",           element: g("storage", "trash",    storageGated(<StorageTrash />)) },
        { path: "storage/upload",          element: g("storage", "upload",   storageGated(<StorageUpload />)) },
        { path: "storage/settings",        element: g("storage", "settings", <StorageSettings />) },

        { path: "autopilot",            element: <Navigate to="/autopilot/overview" replace /> },
        { path: "autopilot/overview",   element: g("autopilot", "overview", <AutopilotOverview />) },
        { path: "autopilot/flows",      element: g("autopilot", "flows", <AutopilotList />) },
        { path: "autopilot/flows/:id",  element: g("autopilot", "flows", <AutopilotFlows />) },
        { path: "autopilot/webhooks",   element: g("autopilot", "webhooks", <AutopilotWebhooks />) },

        { path: "tools",               element: <Navigate to="/tools/overview" replace /> },
        { path: "tools/overview",      element: g("tools", "overview",      <ToolsOverview />) },
        { path: "tools/ai-ad-copy",    element: g("tools", "ai-ad-copy",    aiPlan(<ToolAiAdCopy />)) },
        { path: "tools/ai-email",      element: g("tools", "ai-email",      aiPlan(<ToolAiEmail />)) },
        { path: "tools/ai-rewriter",   element: g("tools", "ai-rewriter",   aiPlan(<ToolAiRewriter />)) },
        { path: "tools/ai-translator", element: g("tools", "ai-translator", aiPlan(<ToolAiTranslator />)) },
        { path: "tools/ai-hashtags",   element: g("tools", "ai-hashtags",   aiPlan(<ToolAiHashtags />)) },
        { path: "tools/ai-lead-score", element: g("tools", "ai-lead-score", aiPlan(<ToolAiLeadScore />)) },
        { path: "tools/form",          element: g("tools", "form",          <ToolForm />) },
        { path: "tools/invoice",       element: g("tools", "invoice",       <ToolInvoice />) },
        { path: "tools/utm",           element: g("tools", "utm",           <ToolUtm />) },
        { path: "tools/shortener",     element: g("tools", "shortener",     <ToolShortener />) },
        { path: "tools/qr",            element: g("tools", "qr",            <ToolQr />) },
        { path: "tools/signature",     element: g("tools", "signature",     <ToolSignature />) },
        { path: "tools/signature-creator", element: g("tools", "signature-creator", <ToolSignatureCreator />) },
        { path: "tools/stamp-creator", element: g("tools", "stamp-creator", <ToolStampCreator />) },
        { path: "tools/subject",       element: g("tools", "subject",       <ToolSubject />) },
        { path: "tools/validator",     element: g("tools", "validator",     <ToolValidator />) },
        { path: "tools/counter",       element: g("tools", "counter",       <ToolCounter />) },
        { path: "tools/password",      element: g("tools", "password",      <ToolPassword />) },
        { path: "tools/abtest",        element: g("tools", "abtest",        <ToolAbTest />) },
        { path: "tools/roi",           element: g("tools", "roi",           <ToolRoi />) },
        { path: "tools/slug",          element: g("tools", "slug",          <ToolSlug />) },
        { path: "tools/og",            element: g("tools", "og",            <ToolOg />) },

        { path: "calendar",               element: <Navigate to="/calendar/overview" replace /> },
        { path: "calendar/overview",      element: g("calendar", "overview",     <CalOverview />) },
        { path: "calendar/month",         element: g("calendar", "month",        <CalMonth />) },
        { path: "calendar/week",          element: g("calendar", "week",         <CalWeek />) },
        { path: "calendar/agenda",        element: g("calendar", "agenda",       <CalAgenda />) },
        { path: "calendar/upcoming",      element: g("calendar", "upcoming",     <CalUpcoming />) },
        { path: "calendar/create",        element: g("calendar", "create",       <CalCreate />) },
        { path: "calendar/availability",  element: g("calendar", "availability", <CalAvailability />) },
        { path: "calendar/booking",       element: g("calendar", "booking",      <CalBooking />) },

        { path: "pricing",           element: <OrgLoginGuard><Navigate to="/pricing/overview" replace /></OrgLoginGuard> },
        { path: "pricing/overview",  element: <OrgLoginGuard>{g("pricing", "overview", <PricingOverview />)}</OrgLoginGuard> },
        { path: "pricing/plans",     element: <OrgLoginGuard>{g("pricing", "plans",    <Plans />)}</OrgLoginGuard> },
        { path: "pricing/current",   element: <OrgLoginGuard>{g("pricing", "current",  <Current />)}</OrgLoginGuard> },
        { path: "pricing/invoices",  element: <OrgLoginGuard>{g("pricing", "invoices", <Invoices />)}</OrgLoginGuard> },
        { path: "pricing/payment",   element: <OrgLoginGuard>{g("pricing", "payment",  <Payment />)}</OrgLoginGuard> },
        { path: "pricing/history",   element: <OrgLoginGuard>{g("pricing", "history",  <History />)}</OrgLoginGuard> },

        { path: "support",            element: <Navigate to="/support/overview" replace /> },
        { path: "support/overview",   element: g("support", "overview", <SupportOverview />) },
        { path: "support/tickets",    element: g("support", "tickets",  <Tickets />) },
        { path: "support/tickets/:id",element: g("support", "tickets",  <TicketDetail />) },
        { path: "support/new",        element: g("support", "new",      <NewTicket />) },
        { path: "support/faq",        element: g("support", "faq",      <Faq />) },
        { path: "support/docs",       element: g("support", "docs",     <Docs />) },
        { path: "support/chat",       element: g("support", "chat",     <Chat />) },

        { path: "settings",                element: <Navigate to="/settings/overview" replace /> },
        { path: "settings/overview",       element: g("settings", "overview",      <SettingsOverview />) },
        { path: "settings/info",           element: g("settings", "info",          <Info />) },
        { path: "settings/account",        element: g("settings", "account",       <Account />) },
        { path: "settings/password",       element: g("settings", "password",      <PasswordPage />) },
        { path: "settings/notifications",  element: g("settings", "notifications", <Notifications />) },
        { path: "settings/sms",            element: g("settings", "sms",           <Sms />) },
        { path: "settings/api",            element: g("settings", "api",           <Api />) },
        { path: "settings/team",                 element: g("settings", "team",    <Team />) },
        { path: "settings/team/:teamId",         element: g("settings", "team",    <TeamDetail />) },
        { path: "settings/team/:teamId/add",     element: g("settings", "team",    <AddMember />) },

        // Legacy /profile/* → /settings/* (kept so old bookmarks still work).
        { path: "profile",                element: <Navigate to="/settings/info" replace /> },
        { path: "profile/info",           element: <Navigate to="/settings/info" replace /> },
        { path: "profile/account",        element: <Navigate to="/settings/account" replace /> },
        { path: "profile/password",       element: <Navigate to="/settings/password" replace /> },
        { path: "profile/notifications",  element: <Navigate to="/settings/notifications" replace /> },
        { path: "profile/sms",            element: <Navigate to="/settings/sms" replace /> },
        { path: "profile/api",            element: <Navigate to="/settings/api" replace /> },
        { path: "profile/team",           element: <Navigate to="/settings/team" replace /> },

        { path: "*", element: <Navigate to={homeRedirect} replace /> },
      ],
    },
  ]);
}
