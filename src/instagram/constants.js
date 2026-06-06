// Instagram Business Login — OAuth authorize URL (Meta / Instagram API).
// Override via VITE_INSTAGRAM_OAUTH_URL in frontend/.env for other environments.
export const INSTAGRAM_OAUTH_URL =
  import.meta.env.VITE_INSTAGRAM_OAUTH_URL
  || "https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1973429443277994&redirect_uri=https://leadnator.vercel.app/&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights";
