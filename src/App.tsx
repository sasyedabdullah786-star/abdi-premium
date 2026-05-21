import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import CommandPalette from "@/components/CommandPalette";
import AIAssistant, { AIAssistantButton } from "@/components/AIAssistant";
import ParticleBackground from "@/components/ParticleBackground";
import AnimatedCursor from "@/components/AnimatedCursor";
import PageLoader from "@/components/PageLoader";
import Index from "./pages/Index";
import Institution from "./pages/Institution";
import Courses from "./pages/Courses";
import Course from "./pages/Course";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import StudentProfile from "./pages/StudentProfile";
import Leaderboard from "./pages/Leaderboard";
import AITools from "./pages/AITools";
import HolographicHub from "./pages/HolographicHub";
import StudyCompanion from "./pages/StudyCompanion";
import Nexus from "./pages/Nexus";
import NexusPublic from "./pages/NexusPublic";
import VoiceButton from "./components/VoiceButton";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-in">
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/institution" element={<Institution />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<Course />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:postId" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/ai-tools" element={<AITools />} />
        <Route path="/hub" element={<HolographicHub />} />
        <Route path="/companion" element={<StudyCompanion />} />
        <Route path="/nexus" element={<Nexus />} />
        <Route path="/nexus/p/:slug" element={<NexusPublic />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const AppShell = () => {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();
  // Hide global chat on the embedded Nexus workspace AND on the public viewer
  const onNexus = location.pathname === "/nexus" || location.pathname.startsWith("/nexus/p/");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    const onOpenChat = () => setChatOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("abdi-open-assistant", onOpenChat);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("abdi-open-assistant", onOpenChat);
    };
  }, []);

  return (
    <>
      <ParticleBackground />
      <PageLoader />
      <AnimatedCursor />
      <AnimatedRoutes />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onOpenChat={() => setChatOpen(true)} />
      {!onNexus && <AIAssistant open={chatOpen} onOpenChange={setChatOpen} />}
      {!onNexus && !chatOpen && <AIAssistantButton onClick={() => setChatOpen(true)} />}
      <VoiceButton />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
