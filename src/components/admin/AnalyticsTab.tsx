import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Star, 
  MessageSquare, 
  Tag,
  TrendingUp,
  Clock,
  Megaphone
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const AnalyticsTab = () => {
  const { analytics, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  const statCards = [
    { 
      label: "Total Courses", 
      value: analytics.totalCourses, 
      icon: BookOpen, 
      color: "from-primary to-primary/50",
      subtitle: `${analytics.publishedCourses} published`
    },
    { 
      label: "Total Lessons", 
      value: analytics.totalLessons, 
      icon: GraduationCap, 
      color: "from-secondary to-secondary/50",
      subtitle: "Across all courses"
    },
    { 
      label: "Total Users", 
      value: analytics.totalUsers, 
      icon: Users, 
      color: "from-accent to-accent/50",
      subtitle: "Registered accounts"
    },
    { 
      label: "Enrollments", 
      value: analytics.totalEnrollments, 
      icon: TrendingUp, 
      color: "from-success to-success/50",
      subtitle: "Course enrollments"
    },
    { 
      label: "Reviews", 
      value: analytics.totalReviews, 
      icon: Star, 
      color: "from-warning to-warning/50",
      subtitle: `${analytics.pendingReviews} pending`
    },
    { 
      label: "Testimonials", 
      value: analytics.totalTestimonials, 
      icon: MessageSquare, 
      color: "from-primary to-secondary",
      subtitle: "Student feedback"
    },
    { 
      label: "Categories", 
      value: analytics.totalCategories, 
      icon: Tag, 
      color: "from-secondary to-accent",
      subtitle: "Course categories"
    },
    { 
      label: "Announcements", 
      value: analytics.totalAnnouncements, 
      icon: Megaphone, 
      color: "from-accent to-primary",
      subtitle: "Active notices"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Overview of your platform performance</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="btn-glass text-sm flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card p-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="font-display text-3xl font-bold gradient-text mb-1">
              {stat.value}
            </div>
            <div className="font-medium text-foreground">{stat.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Top Rated Courses */}
      {analytics.topRatedCourses.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Top Rated Courses
          </h3>
          <div className="space-y-3">
            {analytics.topRatedCourses.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="font-medium">{course.title}</span>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Star className="w-4 h-4 fill-primary" />
                  <span className="font-medium">{course.average_rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;
