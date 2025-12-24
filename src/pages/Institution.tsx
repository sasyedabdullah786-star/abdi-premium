import { Link } from "react-router-dom";
import { BookOpen, Target, Award, ArrowRight, Users, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import { useInstitution } from "@/hooks/useInstitution";
import { useCourses } from "@/hooks/useCourses";

const Institution = () => {
  const { institution, loading: institutionLoading } = useInstitution();
  const { courses, loading: coursesLoading } = useCourses();
  const publishedCourses = courses.filter(c => c.is_published);

  if (institutionLoading) {
    return (
      <Layout showBack>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="icon-glow w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            <Award className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">{institution?.name || 'ABD"I'}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {institution?.description}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      {institution?.mission && (
        <section className="container mx-auto px-4 py-12">
          <div className="glass-card p-8 md:p-12 max-w-3xl mx-auto animate-fade-in-up delay-100">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="icon-glow shrink-0">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {institution.mission}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Courses Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Our <span className="gradient-text">Courses</span>
          </h2>
          <p className="text-muted-foreground">Explore our curated learning experiences</p>
        </div>

        {coursesLoading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : publishedCourses.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {publishedCourses.map((course, index) => (
              <Link 
                key={course.id} 
                to={`/course/${course.id}`} 
                className="glass-card-hover overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="h-40 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-primary/50 group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <span>View Course</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

export default Institution;
