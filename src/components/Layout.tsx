import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { 
  ArrowLeft, 
  Home, 
  BookOpen, 
  FileText, 
  Mail, 
  Shield, 
  Search, 
  Bell, 
  Menu, 
  X,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
  Command
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
  const [searchOpen, setSearchOpen] = useState(false);

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  const navLinks = [
    { to: "/", label: settings.nav_home_label, icon: Home },
    { to: "/courses", label: settings.nav_courses_label, icon: BookOpen },
    { to: "/blog", label: settings.nav_blog_label, icon: FileText },
    { to: "/contact", label: settings.nav_contact_label, icon: Mail },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="floating-orb orb-primary w-[800px] h-[800px] -top-[400px] -left-[200px] animate-float-slow" />
        <div className="floating-orb orb-secondary w-[600px] h-[600px] top-[30%] -right-[200px] animate-float-slow delay-300" />
        <div className="floating-orb orb-accent w-[500px] h-[500px] -bottom-[200px] left-[30%] animate-float-slow delay-500" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        {/* Hero glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] hero-pattern" />
      </div>
      
      {/* Navigation */}
      {showNav && (
        <nav className="relative z-50 glass-card border-x-0 border-t-0 rounded-none backdrop-blur-2xl">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            {/* Logo & Back */}
            <div className="flex items-center gap-4">
              {showBack && (
                <Link 
                  to="/"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              )}
              <Link to="/" className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-secondary blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                </div>
                <span className="font-display text-xl font-bold gradient-text hidden sm:block">
                  ABD"I
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link flex items-center gap-2 ${isActive(link.to) ? 'active' : ''}`}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-300"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              {user && (
                <button className="relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-300">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                </button>
              )}

              {/* User Menu or Auth */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-muted/30 transition-all duration-300">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-border/50">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
                    <div className="px-3 py-2 border-b border-border/30">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {isAdmin ? 'Administrator' : 'Member'}
                      </p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border/30" />
                    <DropdownMenuItem 
                      onClick={() => signOut()}
                      className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link 
                  to="/auth"
                  className="btn-gradient text-sm px-4 py-2"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar (Expandable) */}
          {searchOpen && (
            <div className="container mx-auto px-4 pb-4 animate-fade-in">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses, blog posts, and more..."
                  className="input-glass pl-12 pr-4"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border/30 animate-fade-in">
              <div className="container mx-auto px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive(link.to) 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      )}

      {/* Main content */}
      <main className="relative z-10">
        {title && (
          <div className="container mx-auto px-4 pt-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              <span className="gradient-text">{title}</span>
            </h1>
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-24 border-t border-border/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold gradient-text">ABD"I</span>
            </Link>

            {/* Footer Nav */}
            <div className="flex items-center gap-6 text-sm">
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

            {/* Copyright */}
            <p className="text-muted-foreground text-sm text-center md:text-right">
              {settings.footer_text}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
