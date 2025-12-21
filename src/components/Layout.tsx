import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { ArrowLeft, Home, BookOpen, FileText, Mail, Shield } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
  showBack?: boolean;
  showNav?: boolean;
  title?: string;
}

const Layout = ({ children, showBack = false, showNav = true, title }: LayoutProps) => {
  const { settings } = useSiteSettings();
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>
      
      {/* Navigation */}
      {showNav && (
        <nav className="relative z-10 glass-card border-x-0 border-t-0 rounded-none">
          <div className="container mx-auto flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center gap-6">
              {showBack && (
                <Link 
                  to="/"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back</span>
                </Link>
              )}
              <Link to="/" className="font-display text-xl font-bold gradient-text">
                ABD"I
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Home className="w-4 h-4" />
                {settings.nav_home_label}
              </Link>
              <Link to="/courses" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <BookOpen className="w-4 h-4" />
                {settings.nav_courses_label}
              </Link>
              <Link to="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <FileText className="w-4 h-4" />
                {settings.nav_blog_label}
              </Link>
              <Link to="/contact" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" />
                {settings.nav_contact_label}
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link 
                  to="/dashboard"
                  className="flex items-center gap-2 btn-glass text-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              {!user && (
                <Link 
                  to="/auth"
                  className="btn-gradient text-sm px-4 py-2"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden flex items-center justify-around p-2 border-t border-border/30">
            <Link to="/" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-2">
              <Home className="w-5 h-5" />
              <span className="text-xs">{settings.nav_home_label}</span>
            </Link>
            <Link to="/courses" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">{settings.nav_courses_label}</span>
            </Link>
            <Link to="/blog" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-2">
              <FileText className="w-5 h-5" />
              <span className="text-xs">{settings.nav_blog_label}</span>
            </Link>
            <Link to="/contact" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-2">
              <Mail className="w-5 h-5" />
              <span className="text-xs">{settings.nav_contact_label}</span>
            </Link>
          </div>
        </nav>
      )}

      {/* Main content */}
      <main className="relative z-10">
        {title && (
          <div className="container mx-auto px-4 pt-6">
            <h1 className="font-display text-2xl font-bold gradient-text">{title}</h1>
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 border-t border-border/30 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{settings.footer_text}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
