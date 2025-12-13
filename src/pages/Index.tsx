import { Link } from "react-router-dom";
import { useSite } from "@/contexts/SiteContext";
import { Sparkles, ArrowRight } from "lucide-react";

const Index = () => {
  const { settings } = useSite();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <div className="font-display text-xl font-bold gradient-text">
          {settings.institutionName}
        </div>
        <Link
          to="/admin"
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          {settings.navLabels.admin}
        </Link>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 opacity-0 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Premium Learning Hub</span>
        </div>

        {/* Main Title */}
        <h1 className="font-display text-6xl md:text-8xl font-bold mb-6 text-center opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <span className="gradient-text">{settings.institutionName}</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center leading-relaxed mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          {settings.institutionDescription}
        </p>

        {/* Main Card */}
        <Link
          to="/institution"
          className="group glass-card p-8 md:p-12 max-w-md w-full text-center opacity-0 animate-fade-in hover:scale-[1.02] transition-all duration-300"
          style={{ animationDelay: "300ms" }}
        >
          <div className="text-6xl mb-6">{settings.institutionLogo}</div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {settings.homeCardText}
          </h2>
          <p className="text-muted-foreground mb-6">{settings.homeCardSubtitle}</p>
          <div className="inline-flex items-center gap-2 text-primary">
            <span>Explore Courses</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="text-center">
            <div className="font-display text-3xl font-bold gradient-text">{settings.courses.length}</div>
            <div className="text-sm text-muted-foreground">Courses</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-bold gradient-text">
              {settings.courses.reduce((acc, c) => acc + c.lessons.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Lessons</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-bold gradient-text">24/7</div>
            <div className="text-sm text-muted-foreground">Access</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-muted-foreground text-sm">
        © 2024 {settings.institutionName}. Premium Educational Platform.
      </footer>
    </div>
  );
};

export default Index;
