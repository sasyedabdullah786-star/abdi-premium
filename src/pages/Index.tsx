import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Award } from "lucide-react";
import Layout from "@/components/Layout";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useInstitution } from "@/hooks/useInstitution";
import { useCourses } from "@/hooks/useCourses";

const Index = () => {
  const { settings } = useSiteSettings();
  const { institution } = useInstitution();
  const { courses } = useCourses();
  const publishedCourses = courses.filter(c => c.is_published);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="icon-gradient inline-flex mb-6">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">{settings.hero_title}</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{settings.hero_subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses" className="btn-gradient inline-flex items-center gap-2">Explore Courses <ArrowRight className="w-5 h-5" /></Link>
            <Link to="/institution" className="btn-glass inline-flex items-center gap-2">Learn About Us</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
          <div className="glass-card p-6 text-center"><div className="font-display text-3xl font-bold gradient-text">{publishedCourses.length}</div><div className="text-muted-foreground text-sm mt-1">Courses</div></div>
          <div className="glass-card p-6 text-center"><div className="font-display text-3xl font-bold gradient-text">1K+</div><div className="text-muted-foreground text-sm mt-1">Students</div></div>
          <div className="glass-card p-6 text-center"><div className="font-display text-3xl font-bold gradient-text">50+</div><div className="text-muted-foreground text-sm mt-1">Lessons</div></div>
          <div className="glass-card p-6 text-center"><div className="font-display text-3xl font-bold gradient-text">4.9</div><div className="text-muted-foreground text-sm mt-1">Rating</div></div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-12">
        <Link to="/institution" className="glass-card-hover block p-8 max-w-2xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="icon-gradient shrink-0"><BookOpen className="w-8 h-8 text-primary" /></div>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">{institution?.name || 'ABD"I'}</h2>
              <p className="text-muted-foreground mb-4">{institution?.description || 'Your premier learning destination'}</p>
              <div className="flex items-center gap-2 text-primary"><span className="text-sm font-medium">View Institution</span><ArrowRight className="w-4 h-4" /></div>
            </div>
          </div>
        </Link>
      </section>
    </Layout>
  );
};

export default Index;
