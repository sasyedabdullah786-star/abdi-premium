import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Sparkles, Clock, CheckCircle2, Lock, Tag } from "lucide-react";
import Layout from "@/components/Layout";
import ComingSoon from "@/components/ComingSoon";
import { useCourses } from "@/hooks/useCourses";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";
import { listTransactions, formatCurrency } from "@/lib/paymentConfig";
import { Badge } from "@/components/ui/badge";

const Courses = () => {
  const { user } = useAuth();
  const { courses, loading } = useCourses();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const publishedCourses = courses.filter(c => c.is_published);

  const localTxs = listTransactions();
  const purchasedCourseIds = new Set(
    localTxs
      .filter(t => t.status === 'paid' && (user ? (t.userId === user.id || t.userEmail === user.email) : false))
      .map(t => t.courseId)
  );

  const pageSettings = settings.page_settings?.courses;
  
  if (!settingsLoading && pageSettings?.coming_soon) {
    return <ComingSoon pageName="Courses" />;
  }

  return (
    <Layout title="All Courses">
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-shimmer">
                <div className="h-48 bg-muted/30 rounded-xl mb-4" />
                <div className="h-6 bg-muted/30 rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted/30 rounded w-full" />
              </div>
            ))}
          </div>
        ) : publishedCourses.length === 0 ? (
          <div className="glass-card p-16 text-center max-w-md mx-auto animate-fade-in">
            <div className="icon-glow w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">No Courses Yet</h2>
            <p className="text-muted-foreground">Check back soon for exciting new courses!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.map((course, index) => {
              const isPurchased = purchasedCourseIds.has(course.id);
              const isPaid = course.is_paid;
              const priceDisplay = isPaid 
                ? formatCurrency(Number(course.price_amount) || 0, course.currency || 'INR')
                : 'Free';

              return (
                <Link 
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="glass-card-hover overflow-hidden group animate-fade-in-up flex flex-col justify-between"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div>
                    <div className="relative h-48 overflow-hidden">
                      {course.thumbnail_url ? (
                        <img 
                          src={course.thumbnail_url} 
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                      
                      {/* Price / Access Badges */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {isPurchased ? (
                          <Badge className="bg-emerald-500 text-white font-medium gap-1 shadow-md">
                            <CheckCircle2 className="w-3 h-3" /> Unlocked
                          </Badge>
                        ) : isPaid ? (
                          <Badge className="bg-primary/95 text-primary-foreground font-bold shadow-md border-0">
                            {priceDisplay}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold border-emerald-500/30">
                            Free
                          </Badge>
                        )}
                      </div>

                      {course.category && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="outline" className="bg-card/70 backdrop-blur-md text-[11px]">
                            {course.category}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-6 pb-2">
                      <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {course.description || 'Explore this comprehensive course'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-border/20 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.duration || 'Flexible'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-primary text-sm font-semibold">
                      <span>{isPurchased ? 'Continue' : isPaid ? 'Enroll Now' : 'Start Learning'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Courses;

