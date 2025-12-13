import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import { Rocket, Atom, BookOpen, Key, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <Layout showAdmin>
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 opacity-0 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Premium Learning Hub</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">ABD"I</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Unlock the universe of learning. Access premium educational resources 
            from top institutes, all in one place.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Active Learners", value: "10K+" },
            { label: "Courses", value: "500+" },
            { label: "Institutes", value: "15+" },
            { label: "Success Rate", value: "95%" },
          ].map((stat, index) => (
            <div 
              key={index}
              className="glass-card p-4 text-center opacity-0 animate-fade-in"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <div className="font-display text-2xl md:text-3xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Cards Grid */}
        <div className="mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
            Premier Learning Partners
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard
              title="Next Toppers"
              subtitle="Excellence in Education"
              icon={Rocket}
              to="/nexttoppers"
              delay={500}
            />
            <GlassCard
              title="Physics Wallah"
              subtitle="Master Physics & Chemistry"
              icon={Atom}
              to="/physicswallah"
              delay={600}
            />
            <GlassCard
              title="Padhle Akshay"
              subtitle="Learn Smart, Score High"
              icon={BookOpen}
              to="/padhleakshay"
              delay={700}
            />
            <GlassCard
              title="Key Access"
              subtitle="Unlock Premium Content"
              icon={Key}
              to="/key-access"
              delay={800}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border/50 text-center opacity-0 animate-fade-in" style={{ animationDelay: "900ms" }}>
          <p className="text-muted-foreground text-sm">
            © 2024 ABD"I. Premium Educational Platform.
          </p>
        </footer>
      </div>
    </Layout>
  );
};

export default Index;
