import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useCourses } from "@/hooks/useCourses";

const Courses = () => {
  const { courses, loading } = useCourses();
  const publishedCourses = courses.filter(c => c.is_published);

  return (
    <Layout title="All Courses">
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading courses...</div>
        ) : publishedCourses.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">No Courses Yet</h2>
            <p className="text-muted-foreground">Check back soon for new courses!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.map((course, index) => (
              <Link 
                key={course.id}
                to={`/course/${course.id}`}
                className="glass-card-hover overflow-hidden animate-fade-in"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                {course.thumbnail_url ? (
                  <div 
                    className="h-48 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${course.thumbnail_url})` }} 
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary/50" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {course.description || 'Explore this comprehensive course'}
                  </p>
                  <div className="flex items-center gap-2 text-primary">
                    <span className="text-sm font-medium">Start Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Courses;
