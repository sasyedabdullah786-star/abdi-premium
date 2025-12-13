import { Link } from "react-router-dom";
import { useSite } from "@/contexts/SiteContext";
import { ArrowLeft, BookOpen, Play } from "lucide-react";

const Institution = () => {
  const { settings } = useSite();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{settings.navLabels.home}</span>
        </Link>
        <Link
          to="/admin"
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          {settings.navLabels.admin}
        </Link>
      </nav>

      {/* Header */}
      <header className="relative z-10 text-center py-12 px-4">
        <div className="text-7xl mb-6 opacity-0 animate-fade-in">{settings.institutionLogo}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <span className="gradient-text">{settings.institutionName}</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          {settings.institutionDescription}
        </p>
      </header>

      {/* Courses Section */}
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl font-bold">{settings.navLabels.courses}</h2>
          </div>

          {settings.courses.length === 0 ? (
            <div className="glass-card p-12 text-center opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
              <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {settings.courses.map((course, index) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="group glass-card p-6 opacity-0 animate-fade-in hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <div className="text-5xl mb-4">{course.thumbnail}</div>
                  <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary text-sm">
                    <Play className="w-4 h-4" />
                    <span>{course.lessons.length} lessons</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-border/50 text-muted-foreground text-sm">
        © 2024 {settings.institutionName}. All rights reserved.
      </footer>
    </div>
  );
};

export default Institution;
