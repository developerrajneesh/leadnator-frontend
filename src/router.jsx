import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./globalComponents/Layout/Layout";
import AdminLayout from "./admin/AdminLayout";

// Admin pages
import AdminOverview from "./admin/pages/Overview";
import AdminUsers from "./admin/pages/Users";
import AdminPlans from "./admin/pages/Plans";
import AdminRevenue from "./admin/pages/Revenue";
import AdminCampaigns from "./admin/pages/Campaigns";
import AdminSupport from "./admin/pages/Support";
import AdminSettings from "./admin/pages/Settings";

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
import AllLeads from "./leads/all-leads/AllLeads";
import LeadDetail from "./leads/all-leads/LeadDetail";
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
import MetaCreateWizard from "./meta/create/Wizard";
import MetaOverview from "./meta/overview/Overview";
import MetaAccounts from "./meta/accounts/Accounts";
import MetaAudiences from "./meta/audiences/Audiences";

// WhatsApp
import WaBroadcasts from "./whatsapp/broadcasts/Broadcasts";
import WaTemplates from "./whatsapp/templates/Templates";
import WaInbox from "./whatsapp/inbox/Inbox";
import WaAutomation from "./whatsapp/automation/Automation";
import WaFlowBuilder from "./whatsapp/automation/FlowBuilder";
import WaContacts from "./whatsapp/contacts/Contacts";
import WaSettings from "./whatsapp/settings/Settings";
import WaChatbot from "./whatsapp/chatbot/Chatbot";
import WaChatbotBuilder from "./whatsapp/chatbot/ChatbotBuilder";
import WaWebhook from "./whatsapp/webhook/Webhook";
import WaAnalytics from "./whatsapp/analytics/Analytics";
import WaReports   from "./whatsapp/reports/Reports";
import WaForms from "./whatsapp/forms/Forms";
import WaFormBuilder from "./whatsapp/forms/FormBuilder";
import WhatsAppGate from "./whatsapp/components/WhatsAppGate";
import MetaGate     from "./meta/components/MetaGate";
import EmailGate    from "./email/components/EmailGate";

// Shorthand — wraps any WhatsApp feature page in the connection gate. When
// not connected the gate shows only the "Login with Facebook" Embedded Signup.
const gated      = (el) => <WhatsAppGate>{el}</WhatsAppGate>;
const metaGated  = (el) => <MetaGate>{el}</MetaGate>;
const emailGated = (el) => <EmailGate>{el}</EmailGate>;

// Email
import EmailCampaigns from "./email/campaigns/Campaigns";
import EmailCreate from "./email/create/Create";
import EmailTemplates from "./email/templates/Templates";
import EmailAutomation from "./email/automation/Automation";
import EmailSubscribers from "./email/subscribers/Subscribers";
import EmailAnalytics from "./email/analytics/Analytics";
import EmailConfig from "./email/config/Config";
import EmailSignature from "./email/signature/Signature";

// Integrations
import IntBrowse from "./integrations/browse/Browse";
import IntConnected from "./integrations/connected/Connected";
import IntWebhooks from "./integrations/webhooks/Webhooks";
import IntZapier from "./integrations/zapier/Zapier";
import IntCustom from "./integrations/custom/Custom";

// File Storage
import StorageBrowse from "./storage/browse/Browse";
import StorageRecent from "./storage/recent/Recent";
import StorageShared from "./storage/shared/Shared";
import StorageTrash  from "./storage/trash/Trash";
import StorageUpload from "./storage/upload/Upload";
import StorageSettings from "./storage/settings/Settings";
import StorageGate from "./storage/components/StorageGate";
const storageGated = (el) => <StorageGate>{el}</StorageGate>;

// Tools
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
import ToolSubject from "./tools/subject/Subject";
import ToolValidator from "./tools/validator/Validator";
import ToolCounter from "./tools/counter/Counter";
import ToolPassword from "./tools/password/Password";
import ToolAbTest from "./tools/abtest/AbTest";
import ToolRoi from "./tools/roi/Roi";
import ToolSlug from "./tools/slug/Slug";
import ToolOg from "./tools/og/Og";

// Calendar
import CalMonth from "./calendar/month/Month";
import CalWeek from "./calendar/week/Week";
import CalAgenda from "./calendar/agenda/Agenda";
import CalUpcoming from "./calendar/upcoming/Upcoming";
import CalCreate from "./calendar/create/Create";
import CalAvailability from "./calendar/availability/Availability";
import CalBooking from "./calendar/booking/Booking";

// Pricing
import Plans from "./pricing/plans/Plans";
import Current from "./pricing/current/Current";
import Invoices from "./pricing/invoices/Invoices";
import Payment from "./pricing/payment/Payment";
import History from "./pricing/history/History";

// Support
import Tickets from "./support/tickets/Tickets";
import TicketDetail from "./support/tickets/TicketDetail";
import NewTicket from "./support/new/New";
import Faq from "./support/faq/Faq";
import Docs from "./support/docs/Docs";
import Chat from "./support/chat/Chat";

// Profile
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
        { path: "plans",        element: <AdminPlans /> },
        { path: "revenue",      element: <AdminRevenue /> },
        { path: "campaigns",    element: <AdminCampaigns /> },
        { path: "support",      element: <AdminSupport /> },
        { path: "settings",     element: <AdminSettings /> },
      ],
    },

    {
      path: "/",
      element: <Layout onLogout={onLogout} />,
      children: [
        { index: true, element: <Navigate to={homeRedirect} replace /> },

        { path: "dashboard",           element: <Navigate to="/dashboard/overview" replace /> },
        { path: "dashboard/overview",  element: <Overview /> },
        { path: "dashboard/activity",  element: <Activity /> },
        { path: "dashboard/analytics", element: <Analytics /> },
        { path: "dashboard/reports",   element: <Reports /> },
        { path: "dashboard/exports",   element: <Exports /> },

        { path: "leads",             element: <Navigate to="/leads/all" replace /> },
        { path: "leads/all",         element: <AllLeads /> },
        { path: "leads/all/:id",     element: <LeadDetail /> },
        { path: "leads/pipeline",    element: <Pipeline /> },
        { path: "leads/funnel",      element: <Funnel /> },
        { path: "leads/hot",         element: <Hot /> },
        { path: "leads/meta-forms",  element: <MetaForms /> },
        { path: "leads/automation",       element: <LeadsAutomation /> },
        { path: "leads/automation/:id",   element: <LeadsFlowBuilder /> },
        { path: "leads/import",      element: <Import /> },
        { path: "leads/sources",     element: <Sources /> },
        { path: "leads/tags",        element: <Tags /> },
        { path: "leads/settings",    element: <LeadSettings /> },

        { path: "meta",                    element: <Navigate to="/meta/overview" replace /> },
        { path: "meta/overview",           element: metaGated(<MetaOverview />) },
        { path: "meta/campaigns",          element: metaGated(<MetaCampaigns />) },
        { path: "meta/campaigns/:id",      element: metaGated(<MetaCampaignDetail />) },
        { path: "meta/adsets/:id",         element: metaGated(<MetaAdsetDetail />) },
        { path: "meta/ads/:id",            element: metaGated(<MetaAdDetail />) },
        { path: "meta/forms",              element: metaGated(<MetaLeadForms />) },
        { path: "meta/forms/new",          element: metaGated(<MetaFormCreate />) },
        { path: "meta/forms/:id",          element: metaGated(<MetaFormViewer />) },
        { path: "meta/webhook",            element: metaGated(<MetaWebhook />) },
        { path: "meta/analytics",          element: metaGated(<MetaAnalytics />) },
        { path: "meta/create",             element: metaGated(<MetaCreate />) },
        { path: "meta/create/:type",       element: metaGated(<MetaCreateWizard />) },
        { path: "meta/create/:type/:step", element: metaGated(<MetaCreateWizard />) },
        { path: "meta/accounts",   element: <MetaAccounts /> },
        { path: "meta/audiences",  element: metaGated(<MetaAudiences />) },

        { path: "whatsapp",             element: <Navigate to="/whatsapp/broadcasts" replace /> },
        { path: "whatsapp/broadcasts",       element: gated(<WaBroadcasts />) },
        { path: "whatsapp/templates",        element: gated(<WaTemplates />) },
        { path: "whatsapp/inbox",            element: gated(<WaInbox />) },
        { path: "whatsapp/automation",       element: gated(<WaAutomation />) },
        { path: "whatsapp/automation/:id",   element: gated(<WaFlowBuilder />) },
        { path: "whatsapp/contacts",         element: gated(<WaContacts />) },
        { path: "whatsapp/chatbot",          element: gated(<WaChatbot />) },
        { path: "whatsapp/chatbot/:id",      element: gated(<WaChatbotBuilder />) },
        { path: "whatsapp/webhook",          element: gated(<WaWebhook />) },
        { path: "whatsapp/analytics",        element: gated(<WaAnalytics />) },
        { path: "whatsapp/reports",          element: gated(<WaReports />) },
        { path: "whatsapp/forms",            element: gated(<WaForms />) },
        { path: "whatsapp/forms/:id",        element: gated(<WaFormBuilder />) },
        { path: "whatsapp/settings",    element: <WaSettings /> },

        { path: "email",              element: <Navigate to="/email/campaigns" replace /> },
        { path: "email/campaigns",    element: emailGated(<EmailCampaigns />) },
        { path: "email/create",       element: emailGated(<EmailCreate />) },
        { path: "email/templates",    element: emailGated(<EmailTemplates />) },
        { path: "email/automation",   element: emailGated(<EmailAutomation />) },
        { path: "email/subscribers",  element: emailGated(<EmailSubscribers />) },
        { path: "email/analytics",    element: emailGated(<EmailAnalytics />) },
        { path: "email/config",       element: <EmailConfig /> },
        { path: "email/signature",    element: emailGated(<EmailSignature />) },

        { path: "integrations",            element: <Navigate to="/integrations/browse" replace /> },
        { path: "integrations/browse",     element: <IntBrowse /> },
        { path: "integrations/connected",  element: <IntConnected /> },
        { path: "integrations/webhooks",   element: <IntWebhooks /> },
        { path: "integrations/zapier",     element: <IntZapier /> },
        { path: "integrations/custom",     element: <IntCustom /> },

        { path: "storage",                 element: <Navigate to="/storage/browse" replace /> },
        { path: "storage/browse",          element: storageGated(<StorageBrowse />) },
        { path: "storage/recent",          element: storageGated(<StorageRecent />) },
        { path: "storage/shared",          element: storageGated(<StorageShared />) },
        { path: "storage/trash",           element: storageGated(<StorageTrash />) },
        { path: "storage/upload",          element: storageGated(<StorageUpload />) },
        { path: "storage/settings",        element: <StorageSettings /> },

        { path: "tools",            element: <Navigate to="/tools/ai-ad-copy" replace /> },
        { path: "tools/ai-ad-copy",   element: <ToolAiAdCopy /> },
        { path: "tools/ai-email",     element: <ToolAiEmail /> },
        { path: "tools/ai-rewriter",  element: <ToolAiRewriter /> },
        { path: "tools/ai-translator", element: <ToolAiTranslator /> },
        { path: "tools/ai-hashtags",  element: <ToolAiHashtags /> },
        { path: "tools/ai-lead-score", element: <ToolAiLeadScore /> },
        { path: "tools/form",       element: <ToolForm /> },
        { path: "tools/invoice",    element: <ToolInvoice /> },
        { path: "tools/utm",        element: <ToolUtm /> },
        { path: "tools/shortener",  element: <ToolShortener /> },
        { path: "tools/qr",         element: <ToolQr /> },
        { path: "tools/signature",  element: <ToolSignature /> },
        { path: "tools/subject",    element: <ToolSubject /> },
        { path: "tools/validator",  element: <ToolValidator /> },
        { path: "tools/counter",    element: <ToolCounter /> },
        { path: "tools/password",   element: <ToolPassword /> },
        { path: "tools/abtest",     element: <ToolAbTest /> },
        { path: "tools/roi",        element: <ToolRoi /> },
        { path: "tools/slug",       element: <ToolSlug /> },
        { path: "tools/og",         element: <ToolOg /> },

        { path: "calendar",               element: <Navigate to="/calendar/month" replace /> },
        { path: "calendar/month",         element: <CalMonth /> },
        { path: "calendar/week",          element: <CalWeek /> },
        { path: "calendar/agenda",        element: <CalAgenda /> },
        { path: "calendar/upcoming",      element: <CalUpcoming /> },
        { path: "calendar/create",        element: <CalCreate /> },
        { path: "calendar/availability",  element: <CalAvailability /> },
        { path: "calendar/booking",       element: <CalBooking /> },

        { path: "pricing",           element: <Navigate to="/pricing/plans" replace /> },
        { path: "pricing/plans",     element: <Plans /> },
        { path: "pricing/current",   element: <Current /> },
        { path: "pricing/invoices",  element: <Invoices /> },
        { path: "pricing/payment",   element: <Payment /> },
        { path: "pricing/history",   element: <History /> },

        { path: "support",            element: <Navigate to="/support/tickets" replace /> },
        { path: "support/tickets",    element: <Tickets /> },
        { path: "support/tickets/:id",element: <TicketDetail /> },
        { path: "support/new",        element: <NewTicket /> },
        { path: "support/faq",        element: <Faq /> },
        { path: "support/docs",       element: <Docs /> },
        { path: "support/chat",       element: <Chat /> },

        { path: "settings",                element: <Navigate to="/settings/info" replace /> },
        { path: "settings/info",           element: <Info /> },
        { path: "settings/account",        element: <Account /> },
        { path: "settings/password",       element: <PasswordPage /> },
        { path: "settings/notifications",  element: <Notifications /> },
        { path: "settings/sms",            element: <Sms /> },
        { path: "settings/api",            element: <Api /> },
        { path: "settings/team",                 element: <Team /> },
        { path: "settings/team/:teamId",         element: <TeamDetail /> },
        { path: "settings/team/:teamId/add",     element: <AddMember /> },

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
