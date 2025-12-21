import { useState } from "react";
import { useParams } from "react-router-dom";
import { Play, FileText, BookOpen, ChevronRight } from "lucide-react";
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
    if (url.includes('youtube.com/watch')) { const videoId = url.split('v=')[1]?.split('&')[0]; return `https://www.youtube.com/embed/${videoId}`; }
    if (url.includes('youtu.be')) { const videoId = url.split('youtu.be/')[1]?.split('?')[0]; return `https://www.youtube.com/embed/${videoId}`; }
    return url;
  };

  if (coursesLoading) return <Layout showBack><div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div></Layout>;
  if (!course) return <Layout showBack><div className="container mx-auto px-4 py-16 text-center"><BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h1 className="font-display text-2xl font-bold mb-2">Course Not Found</h1></div></Layout>;

  return (
    <Layout showBack>
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4"><span className="gradient-text">{course.title}</span></h1>
          <p className="text-muted-foreground text-lg">{course.description}</p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentLesson?.video_url ? (
              <div className="glass-card overflow-hidden">
                <div className="aspect-video"><iframe src={getEmbedUrl(currentLesson.video_url) || ''} className="w-full h-full" allowFullScreen /></div>
                <div className="p-6"><h2 className="font-display text-xl font-bold mb-2">{currentLesson.title}</h2>
                  {currentLesson.notes && <div className="mt-4 p-4 bg-muted/30 rounded-xl"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><FileText className="w-4 h-4" />Notes</div><p className="text-foreground whitespace-pre-wrap">{currentLesson.notes}</p></div>}
                </div>
              </div>
            ) : <div className="glass-card p-12 text-center"><Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Select a lesson</p></div>}
          </div>
          <div className="lg:col-span-1">
            <div className="glass-card p-4">
              <h3 className="font-display font-bold text-lg px-2 pb-4 border-b border-border/30">Lessons ({lessons.length})</h3>
              <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto">
                {lessons.map((lesson, index) => (
                  <button key={lesson.id} onClick={() => setActiveLesson(lesson.id)} className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${currentLesson?.id === lesson.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-muted/30'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${currentLesson?.id === lesson.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{index + 1}</div>
                    <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{lesson.title}</div></div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
