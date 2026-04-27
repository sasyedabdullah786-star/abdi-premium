import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft, Home, BookOpen, FileText, Mail, Shield, Search,
  Bell, Menu, X, User, LogOut, ChevronDown, Sparkles, Sun, Moon,
  Trophy, Wand2,
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
  showBack?: boolean;
  showNav?: boolean;
  title?: string;
}

const Layout = ({ children, showBack = false, showNav = true, title }: LayoutProps) => {
  const { settings } = useSiteSettings();
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openCommandPalette = () =>
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));

  const navLinks = [
    { to: "/", label: settings.nav_home_label, icon: Home },
    { to: "/courses", label: settings.nav_courses_label, icon: BookOpen },
    { to: "/ai-tools", label: "AI Tools", icon: Wand2 },
    { to: "/blog", label: settings.nav_blog_label, icon: FileText },
    { to: "/contact", label: settings.nav_contact_label, icon: Mail },
  ];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background relative">
      {showNav && (
        <nav
          className={`sticky top-0 z-50 transition-all duration-200 ${
            scrolled
              ? "bg-background/80 backdrop-blur-xl border-b border-border/60"
              : "bg-transparent border-b border-transparent"
          }`}
        >
          <div className="container mx-auto flex items-center justify-between px-4 h-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {showBack && (
                <Link
                  to="/"
                  className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Back to home"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              )}
              <Link to="/" className="flex items-center gap-2 group">
                <div className="relative w-7 h-7 rounded-md bg-primary flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-[15px] tracking-tight hidden sm:block">
                  ABD<span className="text-muted-foreground">"</span>I
                </span>
              </Link>

              {/* Desktop nav (inline) */}
              <div className="hidden lg:flex items-center gap-0.5 ml-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`nav-link ${isActive(link.to) ? "active" : ""}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-1">
              <button
                onClick={openCommandPalette}
                title="Search (⌘K)"
                className="hidden md:flex items-center gap-2 h-8 px-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs border border-border/60"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="text-xs">Search</span>
                <kbd className="ml-1 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border/40">⌘K</kbd>
              </button>
              <button
                onClick={openCommandPalette}
                aria-label="Search"
                className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {user && (
                <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
                </button>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 h-8 px-1.5 pr-2 ml-1 rounded-md hover:bg-muted transition-colors">
                      <div className="w-6 h-6 rounded bg-primary/15 border border-primary/25 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 surface-elevated">
                    <div className="px-3 py-2 border-b border-border/40">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {isAdmin ? "Administrator" : "Member"}
                      </p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/leaderboard" className="flex items-center gap-2 cursor-pointer">
                        <Trophy className="w-4 h-4" /> Leaderboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/ai-tools" className="flex items-center gap-2 cursor-pointer">
                        <Wand2 className="w-4 h-4" /> AI Tools
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border/40" />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth" className="btn-primary text-xs h-8 px-3 ml-1">
                  Sign In
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-fade-in">
              <div className="container mx-auto px-3 py-3 space-y-0.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                      isActive(link.to)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      )}

      <main className="relative">
        {title && (
          <div className="container mx-auto px-4 pt-10">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {title}
            </h1>
          </div>
        )}
        {children}
      </main>

      <footer className="relative mt-24 border-t border-border/40">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm">ABD"I</span>
            </Link>
            <div className="flex items-center gap-5 text-xs">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">{settings.footer_text}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
