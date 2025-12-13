import { useParams, Link } from "react-router-dom";
import { useSite } from "@/contexts/SiteContext";
import { ArrowLeft, Play, FileText } from "lucide-react";
import { useState } from "react";

const Course = () => {
  const { courseId } = useParams();
  const { settings } = useSite();
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  const course = settings.courses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Link to="/institution" className="text-primary hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const currentLesson = course.lessons.find((l) => l.id === activeLesson) || course.lessons[0];

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
          to="/institution"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to {settings.navLabels.courses}</span>
        </Link>
      </nav>

      {/* Course Header */}
      <header className="relative z-10 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-6 opacity-0 animate-fade-in">
            <div className="text-6xl">{course.thumbnail}</div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                <span className="gradient-text">{course.title}</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl">{course.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-4">
              {currentLesson && (
                <>
                  <div className="glass-card overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
                    <div className="aspect-video">
                      <iframe
                        src={currentLesson.videoUrl}
                        title={currentLesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                  <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <h2 className="font-display text-xl font-bold mb-2">{currentLesson.title}</h2>
                    {currentLesson.notes && (
                      <div className="flex items-start gap-3 mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <FileText className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium text-sm text-primary mb-1">Lesson Notes</h3>
                          <p className="text-muted-foreground text-sm">{currentLesson.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Lesson List */}
            <div className="space-y-3 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Lessons ({course.lessons.length})
              </h3>
              {course.lessons.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  <p className="text-muted-foreground text-sm">No lessons yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson.id)}
                      className={`w-full text-left glass-card p-4 transition-all duration-200 hover:scale-[1.02] ${
                        currentLesson?.id === lesson.id
                          ? "border-primary/50 bg-primary/5"
                          : "hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-border/50 text-muted-foreground text-sm">
        © 2024 {settings.institutionName}. All rights reserved.
      </footer>
    </div>
  );
};

export default Course;
