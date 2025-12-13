import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  showBack?: boolean;
  showAdmin?: boolean;
  title?: string;
}

const Layout = ({ children, showBack = false, showAdmin = false, title }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-4">
          {showBack && (
            <Link 
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          )}
          {title && (
            <h1 className="font-display text-xl font-bold gradient-text">{title}</h1>
          )}
        </div>
        
        {showAdmin && (
          <Link 
            to="/admin"
            className="flex items-center gap-2 btn-glass text-sm"
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {/* Main content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
