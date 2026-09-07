import { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { BookMarked, BookOpen, Star, TrendingUp, Receipt, FileText, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import WeeklyGoal from "@/components/WeeklyGoal";
import { listTransactions, PaymentTransaction, formatCurrency, PAYMENT_EVENT } from "@/lib/paymentConfig";
import { PaymentInvoice } from "@/components/payment/PaymentInvoice";

const StudentProfile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const { courses } = useCourses();
  const { allProgress, loading: progressLoading } = useProgress();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();
  const { userReviews, loading: reviewsLoading } = useReviews();

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    const loadTx = () => {
      const all = listTransactions();
      if (!user) {
        setTransactions([]);
        return;
      }
      const myTxs = all.filter(t => t.userId === user.id || t.userEmail === user.email);
      setTransactions(myTxs);
    };

    loadTx();
    window.addEventListener(PAYMENT_EVENT, loadTx);
    return () => window.removeEventListener(PAYMENT_EVENT, loadTx);
  }, [user]);

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
            <TabsTrigger value="purchases" className="gap-2">
              <Receipt className="w-4 h-4" /> Purchases ({transactions.length})
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

          <TabsContent value="purchases" className="mt-6">
            <section className="space-y-4">
              {transactions.length === 0 ? (
                <div className="glass-card p-12 text-center max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Receipt className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">No Purchases Yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enrolled premium courses and their verified tax invoices will appear here.
                    </p>
                  </div>
                  <Link to="/courses" className="btn-gradient inline-flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4" /> Browse Courses
                  </Link>
                </div>
              ) : (
                transactions.map((tx) => (
                  <article key={tx.id} className="glass-card p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={tx.status === 'paid' ? 'default' : 'secondary'}
                            className={tx.status === 'paid' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : ''}
                          >
                            {tx.status === 'paid' ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Paid & Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {tx.status}
                              </span>
                            )}
                          </Badge>
                          <span className="text-xs font-mono text-muted-foreground">
                            #{tx.invoiceNumber}
                          </span>
                        </div>
                        <h2 className="font-display text-lg font-bold truncate">
                          {tx.courseTitle}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>
                            Paid {formatCurrency(tx.amount, tx.currency)} via <strong className="capitalize text-foreground">{tx.paymentMethod}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(tx.createdAt).toLocaleDateString(undefined, { 
                              year: 'numeric', month: 'short', day: 'numeric' 
                            })}
                          </span>
                          {tx.couponCode && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400">Coupon: {tx.couponCode}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice(tx)}
                          className="gap-1.5 text-xs h-9"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" /> View Invoice
                        </Button>
                        <Link
                          to={`/course/${tx.courseId}`}
                          className="btn-gradient text-xs inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Go to Course
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </section>
          </TabsContent>
        </Tabs>
      </main>

      <PaymentInvoice
        transaction={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </Layout>
  );
};

export default StudentProfile;
