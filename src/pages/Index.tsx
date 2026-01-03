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
  Zap,
  Megaphone,
  Quote,
  Clock
} from "lucide-react";
import Layout from "@/components/Layout";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useInstitution } from "@/hooks/useInstitution";
import { useCourses } from "@/hooks/useCourses";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useCategories } from "@/hooks/useCategories";

const Index = () => {
  const { settings } = useSiteSettings();
  const { institution } = useInstitution();
  const { courses } = useCourses();
  const { announcements } = useAnnouncements();
  const { testimonials } = useTestimonials();
  const { categories } = useCategories();
  
  const publishedCourses = courses.filter(c => c.is_published);
  const trendingCourses = publishedCourses.filter(c => c.is_featured);
  const activeAnnouncements = announcements.filter(a => a.is_active);
  const featuredTestimonials = testimonials.filter(t => t.is_approved);

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
      {/* Announcements Banner */}
      {settings.homepage_sections.announcements && activeAnnouncements.length > 0 && (
        <div className="bg-primary/10 border-b border-primary/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-3 text-sm">
              <Megaphone className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">{activeAnnouncements[0].title}</span>
              {activeAnnouncements[0].content && (
                <span className="text-muted-foreground">— {activeAnnouncements[0].content}</span>
              )}
            </div>
          </div>
        </div>
      )}

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
          {settings.homepage_sections.stats && (
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
          )}
        </div>
      </section>

      {/* Trending Courses Section */}
      {settings.homepage_sections.trending && trendingCourses.length > 0 && (
        <section className="py-20 relative bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-primary font-medium">Hot & Trending</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  Trending <span className="gradient-text">Courses</span>
                </h2>
                <p className="text-muted-foreground">
                  Most popular courses loved by students
                </p>
              </div>
              <Link to="/courses" className="btn-outline text-sm inline-flex items-center gap-2 self-start">
                View All Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingCourses.slice(0, 3).map((course, index) => (
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
                    <div className="absolute top-4 left-4">
                      <span className="badge-gradient flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Trending
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="badge-success">{course.price || 'Free'}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-secondary/20 text-secondary">{course.category || 'General'}</span>
                      {course.certificates_enabled && (
                        <span className="px-2 py-0.5 text-xs rounded bg-success/20 text-success flex items-center gap-1">
                          <Award className="w-3 h-3" /> Certificate
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {course.description || 'Explore this comprehensive course'}
                    </p>
                    <div className="flex items-center justify-between">
                      {course.duration && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {course.duration}
                        </span>
                      )}
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <span>Start Learning</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Browse by <span className="gradient-text">Category</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Find the perfect course for your learning goals
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((cat, index) => (
                <Link 
                  key={cat.id}
                  to={`/courses?category=${cat.name}`}
                  className="glass-card-hover px-6 py-4 flex items-center gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">{institution?.name || 'ABD"I'}</span>?
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

      {/* Testimonials Section */}
      {featuredTestimonials.length > 0 && (
        <section className="py-20 relative bg-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                What Our <span className="gradient-text">Students Say</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Real feedback from real learners
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {featuredTestimonials.slice(0, 6).map((testimonial, index) => (
                <div 
                  key={testimonial.id}
                  className="glass-card p-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  <p className="text-muted-foreground mb-6 line-clamp-4">{testimonial.content}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {testimonial.student_image ? (
                        <img src={testimonial.student_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-primary">{testimonial.student_name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{testimonial.student_name}</h4>
                      {testimonial.course_name && (
                        <p className="text-xs text-muted-foreground">{testimonial.course_name}</p>
                      )}
                      <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
              {publishedCourses.slice(0, 6).map((course, index) => (
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
                    <div className="absolute top-4 right-4 flex gap-2">
                      {course.is_featured && (
                        <span className="badge-gradient flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                        </span>
                      )}
                      <span className="badge-success">{course.price || 'Free'}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-secondary/20 text-secondary">{course.category || 'General'}</span>
                      {course.certificates_enabled && (
                        <span className="px-2 py-0.5 text-xs rounded bg-success/20 text-success flex items-center gap-1">
                          <Award className="w-3 h-3" /> Certificate
                        </span>
                      )}
                    </div>
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
