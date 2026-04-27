import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useReviews } from "@/hooks/useReviews";
import { useCourses } from "@/hooks/useCourses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookMarked, BookOpen, Star, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import WeeklyGoal from "@/components/WeeklyGoal";

const StudentProfile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const { courses } = useCourses();
  const { allProgress, loading: progressLoading } = useProgress();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();
  const { userReviews, loading: reviewsLoading } = useReviews();

  const courseById = useMemo(() => {
    return new Map(courses.map((c) => [c.id, c] as const));
  }, [courses]);

  const bookmarkedCourses = useMemo(() => {
    return bookmarks
      .map((b) => courseById.get(b.course_id))
      .filter(Boolean);
  }, [bookmarks, courseById]);

  useEffect(() => {
    document.title = "My Profile | ABD\"I";
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const isLoading = authLoading || progressLoading || bookmarksLoading || reviewsLoading;

  if (isLoading) {
    return (
      <Layout title="My Profile">
        <section className="container mx-auto px-4 py-12">
          <div className="glass-card p-8 text-center text-muted-foreground">Loading your profile...</div>
        </section>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="My Profile">
      <main className="container mx-auto px-4 py-10">
        <header className="glass-card p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                <span className="gradient-text">Student Profile</span>
              </h1>
              <p className="text-muted-foreground mt-1">Signed in as {user.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                {allProgress.length} tracked courses
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <BookMarked className="w-4 h-4" />
                {bookmarks.length} bookmarks
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <Star className="w-4 h-4" />
                {userReviews.length} reviews
              </Badge>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <WeeklyGoal />
          <ActivityHeatmap />
        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="glass-card">
            <TabsTrigger value="progress" className="gap-2">
              <TrendingUp className="w-4 h-4" /> Progress
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="gap-2">
              <BookMarked className="w-4 h-4" /> Bookmarks
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="w-4 h-4" /> Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-6">
            <section className="space-y-4">
              {allProgress.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">
                  No progress yet — start a course and your progress will appear here.
                </div>
              ) : (
                allProgress
                  .slice()
                  .sort((a, b) => (b.last_accessed_at || "").localeCompare(a.last_accessed_at || ""))
                  .map((p) => {
                    const course = courseById.get(p.course_id);
                    return (
                      <article key={p.id} className="glass-card p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="min-w-0">
                            <h2 className="font-display text-lg font-bold truncate">
                              {course?.title ?? "Course"}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last active{" "}
                              {p.last_accessed_at
                                ? formatDistanceToNow(new Date(p.last_accessed_at), { addSuffix: true })
                                : "—"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={p.is_completed ? "default" : "secondary"}>
                              {p.is_completed ? "Completed" : `${p.progress_percentage}%`}
                            </Badge>
                            <Link
                              to={`/course/${p.course_id}`}
                              className="btn-gradient text-sm inline-flex items-center gap-2"
                            >
                              <BookOpen className="w-4 h-4" />
                              Continue
                            </Link>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Progress value={p.progress_percentage} />
                        </div>
                      </article>
                    );
                  })
              )}
            </section>
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-6">
            <section className="space-y-4">
              {bookmarkedCourses.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">
                  No bookmarked courses yet.
                </div>
              ) : (
                bookmarkedCourses.map((c) => (
                  <article key={c!.id} className="glass-card p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="font-display text-lg font-bold truncate">{c!.title}</h2>
                        {c!.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {c!.description}
                          </p>
                        )}
                      </div>
                      <Link to={`/course/${c!.id}`} className="btn-gradient text-sm inline-flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Open
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </section>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <section className="space-y-4">
              {userReviews.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">
                  You haven’t written any reviews yet.
                </div>
              ) : (
                userReviews.map((r) => {
                  const course = courseById.get(r.course_id);
                  return (
                    <article key={r.id} className="glass-card p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="font-display text-lg font-bold truncate">
                            {course?.title ?? "Course"}
                          </h2>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="gap-1">
                              <Star className="w-3.5 h-3.5" /> {r.rating}/5
                            </Badge>
                            <Badge variant={r.is_approved ? "default" : "secondary"}>
                              {r.is_approved ? "Approved" : "Pending"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {r.created_at
                                ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true })
                                : ""}
                            </span>
                          </div>
                          {r.review_text && (
                            <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line">{r.review_text}</p>
                          )}
                        </div>
                        <Link
                          to={`/course/${r.course_id}`}
                          className="btn-gradient text-sm inline-flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          View
                        </Link>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </Layout>
  );
};

export default StudentProfile;
