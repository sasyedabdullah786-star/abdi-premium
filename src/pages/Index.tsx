import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Award, 
  Sparkles, 
  Play,
  Star,
  TrendingUp,
  Zap
} from "lucide-react";
import Layout from "@/components/Layout";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useInstitution } from "@/hooks/useInstitution";
import { useCourses } from "@/hooks/useCourses";

const Index = () => {
  const { settings } = useSiteSettings();
  const { institution } = useInstitution();
  const { courses } = useCourses();
  const publishedCourses = courses.filter(c => c.is_published);

  const stats = [
    { 
      value: publishedCourses.length.toString(), 
      label: "Courses", 
      icon: BookOpen,
      color: "from-primary to-primary/50"
    },
    { 
      value: "1K+", 
      label: "Students", 
      icon: Users,
      color: "from-secondary to-secondary/50"
    },
    { 
      value: "50+", 
      label: "Lessons", 
      icon: Play,
      color: "from-accent to-accent/50"
    },
    { 
      value: "4.9", 
      label: "Rating", 
      icon: Star,
      color: "from-success to-success/50"
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Access content instantly with our optimized platform"
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics"
    },
    {
      icon: Award,
      title: "Certifications",
      description: "Earn certificates upon course completion"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge-gradient mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4" />
              <span>Premium Learning Platform</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up delay-100">
              <span className="gradient-text">{settings.hero_title}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
              {settings.hero_subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link to="/courses" className="btn-gradient inline-flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" />
                Explore Courses
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/institution" className="btn-glass inline-flex items-center justify-center gap-2">
                Learn About Us
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-20 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="stat-card animate-fade-in-up"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="font-display text-3xl md:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">ABD"I</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience world-class education with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card-hover p-8 text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="icon-glow w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      {publishedCourses.length > 0 && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  Featured <span className="gradient-text">Courses</span>
                </h2>
                <p className="text-muted-foreground">
                  Start your learning journey with our top courses
                </p>
              </div>
              <Link to="/courses" className="btn-outline text-sm inline-flex items-center gap-2 self-start">
                View All Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedCourses.slice(0, 3).map((course, index) => (
                <Link 
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="glass-card-hover overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
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
                    <div className="absolute top-4 right-4">
                      <span className="badge-success">Available</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {course.description || 'Explore this comprehensive course'}
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <span>Start Learning</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Institution CTA */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <Link 
            to="/institution" 
            className="glass-card-hover block p-8 md:p-12 max-w-4xl mx-auto relative overflow-hidden group"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="icon-glow shrink-0">
                <Award className="w-12 h-12 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                  {institution?.name || 'ABD"I'}
                </h2>
                <p className="text-muted-foreground text-lg mb-4">
                  {institution?.description || 'Your premier learning destination'}
                </p>
                <div className="inline-flex items-center gap-2 text-primary font-medium">
                  <span>Learn More About Us</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
