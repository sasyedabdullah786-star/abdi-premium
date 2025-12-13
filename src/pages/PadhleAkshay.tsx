import Layout from "@/components/Layout";
import InstituteCard from "@/components/InstituteCard";
import { BookOpen, Book, Video, FileText, Target } from "lucide-react";

const PadhleAkshay = () => {
  return (
    <Layout showBack title="ABD&quot;I">
      <div className="container mx-auto px-4 py-8">
        <InstituteCard
          title="Padhle Akshay"
          subtitle="Learn Smart, Score High"
          icon={BookOpen}
          description="Padhle Akshay is your ultimate companion for board exam preparation. With structured modules, exam-oriented content, and smart study techniques, we help you achieve your target scores efficiently."
          crashCourse="#crash-course"
          resources={[
            { title: "Board Exam Preparation", url: "#boards", icon: Target },
            { title: "Subject-wise Notes", url: "#notes", icon: Book },
            { title: "Quick Revision Videos", url: "#revision", icon: Video },
            { title: "Sample Papers", url: "#papers", icon: FileText },
          ]}
          connectedInstitutes={[
            { name: "Next Toppers", to: "/nexttoppers" },
            { name: "Physics Wallah", to: "/physicswallah" },
          ]}
          delay={100}
        />

        {/* Study Modules */}
        <div className="mt-8 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h3 className="font-display text-2xl font-bold mb-6 gradient-text">
            Study Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                title: "Class 10 CBSE", 
                subjects: ["Maths", "Science", "Social Science", "English"],
                chapters: 45
              },
              { 
                title: "Class 12 CBSE", 
                subjects: ["Physics", "Chemistry", "Maths", "Biology"],
                chapters: 60
              },
              { 
                title: "Quick Revision", 
                subjects: ["All Subjects", "Formula Sheets", "Key Points"],
                chapters: 30
              },
            ].map((module, index) => (
              <div 
                key={index}
                className="glass-card-hover p-6"
              >
                <h4 className="font-display text-xl font-semibold text-foreground mb-3">
                  {module.title}
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {module.subjects.map((subject, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  {module.chapters} Chapters
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PadhleAkshay;
