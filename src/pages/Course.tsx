import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, FileText, BookOpen, ChevronRight, Download, Clock, CheckCircle, File, FileSpreadsheet, Target, Calendar, History, Award, Zap, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import { useCourses } from "@/hooks/useCourses";
import { useLessons, RESOURCE_TYPES, ResourceType } from "@/hooks/useLessons";
import Discussions from "@/components/Discussions";
import DoubtSolver from "@/components/DoubtSolver";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import CoursePaywall from "@/components/CoursePaywall";
import { useAuth } from "@/hooks/useAuth";

const resourceIcons: Record<ResourceType, React.ReactNode> = {
  video: <Play className="w-4 h-4" />,
  worksheet: <FileSpreadsheet className="w-4 h-4" />,
  notes: <FileText className="w-4 h-4" />,
  pdf: <File className="w-4 h-4" />,
  homework: <BookOpen className="w-4 h-4" />,
  dpp: <Target className="w-4 h-4" />,
  timetable: <Calendar className="w-4 h-4" />,
  pyq: <History className="w-4 h-4" />,
};

const Course = () => {
  const { courseId } = useParams();
  const { courses, loading: coursesLoading } = useCourses();
  const { lessons, loading: lessonsLoading } = useLessons(courseId);
  const { user } = useAuth();
  const { enrollment, enroll, isEnrolled, markLessonViewed, xpPerLesson } = useEnrollment(courseId);
  const [activeTab, setActiveTab] = useState<ResourceType | 'overview'>('overview');
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  const course = courses.find(c => c.id === courseId);
  const { purchase, hasAccess, requestPurchase } = useCourseAccess(courseId, course?.is_paid);
  const [buying, setBuying] = useState(false);

  const handleBuy = async () => {
    if (!course) return;
    setBuying(true);
    await requestPurchase(Number(course.price_amount) || 0, course.currency || "INR");
    setBuying(false);
  };

  // Award XP the first time a video lesson is opened
  useEffect(() => {
    if (!activeLesson || !user) return;
    const lesson = lessons.find(l => l.id === activeLesson);
    if (lesson?.resource_type === 'video') {
      markLessonViewed(activeLesson);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLesson]);

  // Get unique resource types that exist in this course's lessons
  const availableTabs = useMemo(() => {
    const types = new Set(lessons.map(l => l.resource_type));
    return RESOURCE_TYPES.filter(rt => types.has(rt.value));
  }, [lessons]);

  // Get lessons filtered by current tab
  const filteredLessons = useMemo(() => {
    if (activeTab === 'overview') return [];
    return lessons.filter(l => l.resource_type === activeTab);
  }, [lessons, activeTab]);

  const currentLesson = lessons.find(l => l.id === activeLesson);

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
        <div className="max-w-6xl mx-auto animate-fade-in-up">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/courses" className="hover:text-foreground transition-colors">Courses</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{course.title}</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {course.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">{course.description}</p>
          
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>{lessons.length} items</span>
            </div>
            {user && hasAccess && (
              isEnrolled ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-success inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-success/15 text-success border border-success/30">
                    <CheckCircle className="w-3.5 h-3.5" /> Enrolled
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/30">
                    <Zap className="w-3.5 h-3.5" /> {enrollment?.xp_earned ?? 0} XP earned
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-muted/40 text-muted-foreground border border-border/40">
                    <Award className="w-3.5 h-3.5" /> {(enrollment?.viewed_lessons?.length ?? 0)} / {lessons.filter(l => l.resource_type === 'video').length || lessons.length} watched
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => enroll()}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-4 h-4" /> Enroll & track progress
                  <span className="text-[10px] opacity-80">+{xpPerLesson} XP / video</span>
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Course Banner */}
      {course.thumbnail_url && (
        <section className="container mx-auto px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="glass-card overflow-hidden rounded-2xl">
              <img 
                src={course.thumbnail_url} 
                alt={course.title} 
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Paywall for locked paid courses */}
      {course.is_paid && !hasAccess && (
        <section className="container mx-auto px-4 pb-16">
          <CoursePaywall
            title={course.title}
            amount={Number(course.price_amount) || 0}
            currency={course.currency || "INR"}
            purchase={purchase}
            onBuy={handleBuy}
            buying={buying}
          />
        </section>
      )}

      {/* Tab Navigation */}
      {hasAccess && (<>
      <section className="container mx-auto px-4 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 pb-4 border-b border-border/30 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              Course Overview
            </button>
            {availableTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {resourceIcons[tab.value]}
                {tab.label}
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-background/20">
                  {lessons.filter(l => l.resource_type === tab.value).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Area */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'overview' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {/* Course Stats */}
              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-lg mb-4">Course Content</h3>
                <div className="space-y-3">
                  {RESOURCE_TYPES.map(rt => {
                    const count = lessons.filter(l => l.resource_type === rt.value).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={rt.value}
                        onClick={() => setActiveTab(rt.value)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          {resourceIcons[rt.value]}
                          <span>{rt.label}</span>
                        </span>
                        <span className="text-primary font-medium">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Course Description */}
              <div className="glass-card p-6 lg:col-span-2">
                <h3 className="font-display font-bold text-lg mb-4">About this Course</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description || "This course contains various learning materials including videos, worksheets, notes, and more. Browse through the tabs above to access different types of content."}
                </p>
                {availableTabs.length > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab(availableTabs[0].value)}
                      className="btn-gradient"
                    >
                      Start Learning
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up">
              {/* Content Player/Viewer */}
              <div className="lg:col-span-2">
                {currentLesson ? (
                  <div className="glass-card overflow-hidden">
                    {/* Video Player for video type */}
                    {currentLesson.resource_type === 'video' && currentLesson.video_url && (
                      <div className="aspect-video bg-background">
                        <iframe
                          src={getEmbedUrl(currentLesson.video_url) || ''}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary capitalize">
                          {RESOURCE_TYPES.find(rt => rt.value === currentLesson.resource_type)?.label}
                        </span>
                      </div>
                      <h2 className="font-display text-xl font-bold mb-4">{currentLesson.title}</h2>
                      
                      {currentLesson.notes && (
                        <div className="p-4 bg-muted/20 rounded-xl border border-border/30 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">Notes</span>
                          </div>
                          <p className="text-foreground whitespace-pre-wrap">{currentLesson.notes}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {currentLesson.video_url && currentLesson.resource_type !== 'video' && (
                          <a
                            href={currentLesson.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-gradient inline-flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Open Link
                          </a>
                        )}
                        {currentLesson.pdf_url && (
                          <a
                            href={currentLesson.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-glass inline-flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-16 text-center">
                    <div className="icon-glow w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      {resourceIcons[activeTab as ResourceType] || <BookOpen className="w-10 h-10 text-primary" />}
                    </div>
                    <p className="text-muted-foreground">Select an item from the list to view</p>
                  </div>
                )}

                {/* AI Doubt Solver — only when watching a video */}
                {currentLesson && currentLesson.resource_type === 'video' && (
                  <div className="mt-6">
                    <DoubtSolver
                      courseTitle={course.title}
                      lessonTitle={currentLesson.title}
                      lessonNotes={currentLesson.notes}
                    />
                  </div>
                )}
              </div>

              {/* Content List */}
              <div className="lg:col-span-1">
                <div className="glass-card p-4 sticky top-4">
                  <h3 className="font-display font-bold text-lg px-2 pb-4 border-b border-border/30 flex items-center gap-2">
                    {resourceIcons[activeTab as ResourceType]}
                    {RESOURCE_TYPES.find(rt => rt.value === activeTab)?.label} ({filteredLessons.length})
                  </h3>
                  <div className="mt-4 space-y-2 max-h-[600px] overflow-y-auto">
                    {filteredLessons.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-8">No content available</p>
                    ) : (
                      filteredLessons.map((lesson, index) => (
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
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              {lesson.video_url && <span className="flex items-center gap-1"><Play className="w-3 h-3" /></span>}
                              {lesson.pdf_url && <span className="flex items-center gap-1"><File className="w-3 h-3" /></span>}
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            currentLesson?.id === lesson.id ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      </>)}

      {/* Discussion section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {hasAccess && <Discussions courseId={courseId} />}
        </div>
      </section>
    </Layout>
  );
};

export default Course;