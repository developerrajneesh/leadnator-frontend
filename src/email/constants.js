export const EMAIL_TEMPLATES = [
  { id: "tp1", name: "Welcome",         category: "Onboarding",  uses: 42, thumb: "linear-gradient(135deg,#7c3aed,#ec4899)" },
  { id: "tp2", name: "Product Launch",  category: "Marketing",   uses: 18, thumb: "linear-gradient(135deg,#10b981,#059669)" },
  { id: "tp3", name: "Re-engagement",   category: "Retention",   uses: 24, thumb: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { id: "tp4", name: "Newsletter",      category: "Content",     uses: 36, thumb: "linear-gradient(135deg,#3b82f6,#6366f1)" },
  { id: "tp5", name: "Abandoned Cart",  category: "E-commerce",  uses: 12, thumb: "linear-gradient(135deg,#ec4899,#8b5cf6)" },
  { id: "tp6", name: "Event Invite",    category: "Events",      uses: 8,  thumb: "linear-gradient(135deg,#06b6d4,#0891b2)" },
];

export const EMAIL_FLOWS = [
  { name: "Welcome series",     trigger: "New subscriber",   steps: 5, open: "62%", status: "active" },
  { name: "Lead nurture drip",  trigger: "Form submission",  steps: 7, open: "48%", status: "active" },
  { name: "Cart abandonment",   trigger: "Cart idle 3h",     steps: 3, open: "54%", status: "paused" },
  { name: "Re-engagement",      trigger: "Inactive 60 days", steps: 4, open: "22%", status: "active" },
];

export const SUBSCRIBERS = [
  { list: "All subscribers",       count: 4820, growth: "+124 this week" },
  { list: "Hot leads",             count: 340,  growth: "+18 this week"  },
  { list: "Newsletter",            count: 2100, growth: "+56 this week"  },
  { list: "Product updates",       count: 1260, growth: "+12 this week"  },
  { list: "Unsubscribed",          count: 86,   growth: "+3 this week"   },
];
