import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useSiteSettings, PageSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";
import MaintenanceMode from "./MaintenanceMode";
import ComingSoon from "./ComingSoon";
import NotFound from "@/pages/NotFound";

// Routes that bypass gating (admin/auth/etc)
const BYPASS = ["/auth", "/reset-password", "/dashboard"];

// Map path prefix -> page_settings key + label
const ROUTE_MAP: Array<{ match: (p: string) => boolean; key: keyof PageSettings; label: string }> = [
  { match: (p) => p.startsWith("/courses") || p.startsWith("/course/"), key: "courses", label: "Courses" },
  { match: (p) => p.startsWith("/blog"), key: "blog", label: "Blog" },
  { match: (p) => p.startsWith("/contact"), key: "contact", label: "Contact" },
  { match: (p) => p.startsWith("/institution"), key: "institution", label: "About Us" },
  { match: (p) => p.startsWith("/hub"), key: "hub", label: "Holographic Hub" },
  { match: (p) => p.startsWith("/companion"), key: "companion", label: "Study Companion" },
  { match: (p) => p.startsWith("/nexus"), key: "nexus", label: "AB3D Nexus" },
  { match: (p) => p.startsWith("/ai-tools"), key: "ai_tools", label: "AI Tools" },
  { match: (p) => p.startsWith("/leaderboard"), key: "leaderboard", label: "Leaderboard" },
  { match: (p) => p.startsWith("/profile"), key: "profile", label: "Profile" },
];

const PageGate = ({ children }: { children: ReactNode }) => {
  const { settings, loading } = useSiteSettings();
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  if (loading) return <>{children}</>;

  const isBypass = BYPASS.some((p) => path.startsWith(p));

  // Maintenance mode (admins/dashboard still allowed)
  if (settings.is_maintenance_mode && !isBypass) {
    // Simple heuristic: allow authenticated users on /dashboard already bypassed.
    // Everyone else sees maintenance.
    return <MaintenanceMode message={settings.maintenance_message} />;
  }

  const route = ROUTE_MAP.find((r) => r.match(path));
  if (route) {
    const setting = settings.page_settings?.[route.key];
    if (setting && !setting.enabled) return <NotFound />;
    if (setting && setting.coming_soon) return <ComingSoon pageName={route.label} />;
  }

  return <>{children}</>;
};

export default PageGate;
