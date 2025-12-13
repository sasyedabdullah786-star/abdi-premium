import Layout from "@/components/Layout";
import InstituteCard from "@/components/InstituteCard";
import { Atom, Book, Video, FileText, Beaker } from "lucide-react";

const PhysicsWallah = () => {
  return (
    <Layout showBack title="ABD&quot;I">
      <div className="container mx-auto px-4 py-8">
        <InstituteCard
          title="Physics Wallah"
          subtitle="Master Physics & Chemistry"
          icon={Atom}
          description="Physics Wallah revolutionizes affordable education. With Alakh Pandey's unique teaching methodology, complex concepts become simple. Join millions of students who have transformed their understanding of Physics and Chemistry."
          crashCourse="#crash-course"
          resources={[
            { title: "Physics Complete Course", url: "#physics", icon: Atom },
            { title: "Chemistry Full Package", url: "#chemistry", icon: Beaker },
            { title: "PW Video Lectures", url: "#videos", icon: Video },
            { title: "Notes & Worksheets", url: "#notes", icon: FileText },
          ]}
          connectedInstitutes={[
            { name: "Next Toppers", to: "/nexttoppers" },
            { name: "Padhle Akshay", to: "/padhleakshay" },
          ]}
          delay={100}
        />

        {/* PW Batches */}
        <div className="mt-8 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h3 className="font-display text-2xl font-bold mb-6 gradient-text">
            Popular Batches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                title: "Lakshya JEE 2024", 
                description: "Complete JEE preparation with live classes",
                students: "50K+",
                rating: "4.9"
              },
              { 
                title: "Yakeen NEET 2024", 
                description: "Comprehensive NEET medical preparation",
                students: "80K+",
                rating: "4.8"
              },
              { 
                title: "Arjuna JEE", 
                description: "Advanced problem solving for JEE",
                students: "30K+",
                rating: "4.9"
              },
              { 
                title: "Prayas Foundation", 
                description: "Foundation course for Class 10 students",
                students: "45K+",
                rating: "4.7"
              },
            ].map((batch, index) => (
              <div 
                key={index}
                className="glass-card-hover p-6"
              >
                <h4 className="font-display text-xl font-semibold text-foreground mb-2">
                  {batch.title}
                </h4>
                <p className="text-muted-foreground text-sm mb-4">
                  {batch.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-primary font-semibold">{batch.students} Students</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-foreground">⭐ {batch.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PhysicsWallah;
