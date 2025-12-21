import { Link } from "react-router-dom";
import { BookOpen, Target, Award, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useInstitution } from "@/hooks/useInstitution";
import { useCourses } from "@/hooks/useCourses";

const Institution = () => {
  const { institution, loading: institutionLoading } = useInstitution();
  const { courses, loading: coursesLoading } = useCourses();
  const publishedCourses = courses.filter(c => c.is_published);

  if (institutionLoading) {
    return <Layout showBack><div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div></Layout>;
  }

  return (
    <Layout showBack>
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="icon-gradient inline-flex mb-6"><Award className="w-12 h-12 text-primary" /></div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">{institution?.name || 'ABD"I'}</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{institution?.description}</p>
        </div>
      </section>
      {institution?.mission && (
        <section className="container mx-auto px-4 py-12">
          <div className="glass-card p-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="icon-gradient shrink-0"><Target className="w-6 h-6 text-primary" /></div>
              <div><h2 className="font-display text-xl font-bold mb-3">Our Mission</h2><p className="text-muted-foreground">{institution.mission}</p></div>
            </div>
          </div>
        </section>
      )}
      <section className="container mx-auto px-4 py-12">
        <h2 className="font-display text-2xl font-bold mb-8 text-center">Our Courses</h2>
        {coursesLoading ? <div className="text-center text-muted-foreground">Loading...</div> : publishedCourses.length === 0 ? (
          <div className="glass-card p-8 text-center max-w-md mx-auto"><BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No courses available yet.</p></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.map((course) => (
              <Link key={course.id} to={`/course/${course.id}`} className="glass-card-hover overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"><BookOpen className="w-12 h-12 text-primary/50" /></div>
                <div className="p-6"><h3 className="font-display text-lg font-bold mb-2">{course.title}</h3><p className="text-muted-foreground text-sm line-clamp-2 mb-4">{course.description}</p><div className="flex items-center gap-2 text-primary"><span className="text-sm font-medium">View Course</span><ArrowRight className="w-4 h-4" /></div></div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Institution;
