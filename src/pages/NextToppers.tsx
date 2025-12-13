import Layout from "@/components/Layout";
import InstituteCard from "@/components/InstituteCard";
import { Rocket, Book, Video, FileText, Users } from "lucide-react";

const NextToppers = () => {
  return (
    <Layout showBack title="ABD&quot;I">
      <div className="container mx-auto px-4 py-8">
        <InstituteCard
          title="Next Toppers"
          subtitle="Excellence in Education"
          icon={Rocket}
          description="Next Toppers is a premier coaching institute dedicated to helping students achieve their academic dreams. With expert faculty, comprehensive study materials, and personalized attention, we ensure every student reaches their full potential."
          crashCourse="#crash-course"
          resources={[
            { title: "Complete Study Material", url: "#materials", icon: Book },
            { title: "Video Lectures Library", url: "#videos", icon: Video },
            { title: "Practice Papers & Tests", url: "#papers", icon: FileText },
            { title: "Doubt Resolution Sessions", url: "#doubts", icon: Users },
          ]}
          connectedInstitutes={[
            { name: "Physics Wallah", to: "/physicswallah" },
            { name: "Padhle Akshay", to: "/padhleakshay" },
          ]}
          delay={100}
        />

        {/* Course Modules */}
        <div className="mt-8 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h3 className="font-display text-2xl font-bold mb-6 gradient-text">
            Available Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "JEE Mains Preparation", lessons: 120, duration: "6 months" },
              { title: "JEE Advanced Course", lessons: 150, duration: "8 months" },
              { title: "NEET Complete Package", lessons: 180, duration: "12 months" },
              { title: "Foundation Course", lessons: 80, duration: "4 months" },
              { title: "Crash Course - Physics", lessons: 40, duration: "2 months" },
              { title: "Crash Course - Chemistry", lessons: 40, duration: "2 months" },
            ].map((module, index) => (
              <div 
                key={index}
                className="glass-card-hover p-5"
              >
                <h4 className="font-display font-semibold text-foreground mb-2">
                  {module.title}
                </h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{module.lessons} Lessons</span>
                  <span>•</span>
                  <span>{module.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NextToppers;
