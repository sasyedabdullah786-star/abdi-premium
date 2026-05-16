import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Settings, Palette, BookOpen, FileText, Mail, ArrowLeft, 
  Megaphone, Star, Tag, BarChart3, Layout, Construction, 
  MessageSquare, FileCheck, Brain
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import SmartCenterTab from "@/components/admin/SmartCenterTab";
import SectionsTab from "@/components/admin/SectionsTab";
import MaintenanceTab from "@/components/admin/MaintenanceTab";
import ReviewsTab from "@/components/admin/ReviewsTab";
import CoursesTab from "@/components/admin/CoursesTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import AnnouncementsTab from "@/components/admin/AnnouncementsTab";
import TestimonialsTab from "@/components/admin/TestimonialsTab";
import PagesTab from "@/components/admin/PagesTab";
import GeneralTab from "@/components/admin/GeneralTab";
import AppearanceTab from "@/components/admin/AppearanceTab";
import BlogTab from "@/components/admin/BlogTab";
import ContactTab from "@/components/admin/ContactTab";

type TabId = "smart" | "analytics" | "general" | "appearance" | "sections" | "pages" | "maintenance" | "courses" | "categories" | "announcements" | "testimonials" | "reviews" | "blog" | "contact";

const Dashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabId>("smart");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  if (!isAdmin) return null;

  const tabs = [
    { id: "smart" as const, label: "Smart Center", icon: Brain },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "general" as const, label: "General", icon: Settings },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "sections" as const, label: "Sections", icon: Layout },
    { id: "pages" as const, label: "Pages", icon: FileCheck },
    { id: "maintenance" as const, label: "Maintenance", icon: Construction },
    { id: "courses" as const, label: "Courses", icon: BookOpen },
    { id: "categories" as const, label: "Categories", icon: Tag },
    { id: "announcements" as const, label: "Announcements", icon: Megaphone },
    { id: "testimonials" as const, label: "Testimonials", icon: Star },
    { id: "reviews" as const, label: "Reviews", icon: MessageSquare },
    { id: "blog" as const, label: "Blog", icon: FileText },
    { id: "contact" as const, label: "Contact", icon: Mail },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "smart": return <SmartCenterTab />;
      case "analytics": return <AnalyticsTab />;
      case "general": return <GeneralTab />;
      case "appearance": return <AppearanceTab />;
      case "sections": return <SectionsTab />;
      case "pages": return <PagesTab />;
      case "maintenance": return <MaintenanceTab />;
      case "courses": return <CoursesTab />;
      case "categories": return <CategoriesTab />;
      case "announcements": return <AnnouncementsTab />;
      case "testimonials": return <TestimonialsTab />;
      case "reviews": return <ReviewsTab />;
      case "blog": return <BlogTab />;
      case "contact": return <ContactTab />;
      default: return <SmartCenterTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-xl font-bold">
              <span className="gradient-text">Admin Dashboard</span>
            </h1>
          </div>
          <Link to="/" className="btn-gradient text-sm">View Site</Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] glass-card rounded-none border-y-0 border-l-0 p-4 sticky top-[73px] overflow-y-auto">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto min-h-[calc(100vh-73px)]">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
