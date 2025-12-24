import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, FileText, BookOpen, ChevronRight, Download, Clock, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { useCourses } from "@/hooks/useCourses";
import { useLessons } from "@/hooks/useLessons";

const Course = () => {
  const { courseId } = useParams();
  const { courses, loading: coursesLoading } = useCourses();
  const { lessons, loading: lessonsLoading } = useLessons(courseId);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  const course = courses.find(c => c.id === courseId);
  const currentLesson = lessons.find(l => l.id === activeLesson) || lessons[0];

  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (coursesLoading) {
    return (
      <Layout showBack>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout showBack>
        <div className="container mx-auto px-4 py-16 text-center animate-fade-in">
          <div className="icon-glow w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="btn-gradient">Browse Courses</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack>
      {/* Course Header */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <span className="badge-gradient mb-4 inline-block">Course</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">{course.title}</span>
          </h1>
          <p className="text-muted-foreground text-lg">{course.description}</p>
          <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{lessons.length} lessons</span>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 animate-fade-in-up delay-100">
            {currentLesson?.video_url ? (
              <div className="glass-card overflow-hidden">
                <div className="aspect-video bg-background">
                  <iframe
                    src={getEmbedUrl(currentLesson.video_url) || ''}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-display text-xl font-bold mb-2">{currentLesson.title}</h2>
                  {currentLesson.notes && (
                    <div className="mt-4 p-4 bg-muted/20 rounded-xl border border-border/30">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">Lesson Notes</span>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{currentLesson.notes}</p>
                    </div>
                  )}
                  {currentLesson.pdf_url && (
                    <a
                      href={currentLesson.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline mt-4 inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card p-16 text-center">
                <div className="icon-glow w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Play className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground">Select a lesson to start learning</p>
              </div>
            )}
          </div>

          {/* Lesson List */}
          <div className="lg:col-span-1 animate-fade-in-up delay-200">
            <div className="glass-card p-4 sticky top-4">
              <h3 className="font-display font-bold text-lg px-2 pb-4 border-b border-border/30">
                Lessons ({lessons.length})
              </h3>
              <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson.id)}
                    className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                      currentLesson?.id === lesson.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted/30 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                      currentLesson?.id === lesson.id
                        ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{lesson.title}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      currentLesson?.id === lesson.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Course;
