import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  notes: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
}

export interface SiteSettings {
  institutionName: string;
  institutionDescription: string;
  institutionLogo: string;
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  fontFamily: string;
  homeCardText: string;
  homeCardSubtitle: string;
  navLabels: {
    home: string;
    courses: string;
    admin: string;
  };
  courses: Course[];
}

const defaultSettings: SiteSettings = {
  institutionName: "ABD\"I",
  institutionDescription: "Unlock the universe of learning. Access premium educational resources and master your subjects with our comprehensive courses.",
  institutionLogo: "🎓",
  primaryColor: "262 83% 58%",
  backgroundColor: "240 10% 4%",
  cardColor: "240 6% 10%",
  fontFamily: "Space Grotesk",
  homeCardText: "Enter ABD\"I",
  homeCardSubtitle: "Premium Learning Hub",
  navLabels: {
    home: "Home",
    courses: "Courses",
    admin: "Admin",
  },
  courses: [
    {
      id: "1",
      title: "Physics Fundamentals",
      description: "Master the basics of physics with comprehensive lessons covering mechanics, thermodynamics, and more.",
      thumbnail: "⚛️",
      lessons: [
        { id: "1-1", title: "Introduction to Mechanics", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", notes: "Key concepts: Force, Mass, Acceleration" },
        { id: "1-2", title: "Newton's Laws of Motion", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", notes: "Three fundamental laws that govern motion" },
      ],
    },
    {
      id: "2",
      title: "Chemistry Essentials",
      description: "Learn chemistry from atoms to reactions with hands-on examples and clear explanations.",
      thumbnail: "🧪",
      lessons: [
        { id: "2-1", title: "Atomic Structure", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", notes: "Protons, neutrons, electrons" },
        { id: "2-2", title: "Chemical Bonding", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", notes: "Ionic vs Covalent bonds" },
      ],
    },
    {
      id: "3",
      title: "Mathematics Mastery",
      description: "Build strong mathematical foundations with step-by-step problem solving techniques.",
      thumbnail: "📐",
      lessons: [
        { id: "3-1", title: "Algebra Basics", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", notes: "Variables, equations, functions" },
      ],
    },
  ],
};

interface SiteContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  addCourse: (course: Omit<Course, "id">) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addLesson: (courseId: string, lesson: Omit<Lesson, "id">) => void;
  updateLesson: (courseId: string, lessonId: string, lesson: Partial<Lesson>) => void;
  deleteLesson: (courseId: string, lessonId: string) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem("abdi-settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("abdi-settings", JSON.stringify(settings));
    // Apply CSS variables
    document.documentElement.style.setProperty("--primary", settings.primaryColor);
    document.documentElement.style.setProperty("--background", settings.backgroundColor);
    document.documentElement.style.setProperty("--card", settings.cardColor);
  }, [settings]);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addCourse = (course: Omit<Course, "id">) => {
    const newCourse = { ...course, id: Date.now().toString() };
    setSettings((prev) => ({ ...prev, courses: [...prev.courses, newCourse] }));
  };

  const updateCourse = (id: string, course: Partial<Course>) => {
    setSettings((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.id === id ? { ...c, ...course } : c)),
    }));
  };

  const deleteCourse = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== id),
    }));
  };

  const addLesson = (courseId: string, lesson: Omit<Lesson, "id">) => {
    const newLesson = { ...lesson, id: `${courseId}-${Date.now()}` };
    setSettings((prev) => ({
      ...prev,
      courses: prev.courses.map((c) =>
        c.id === courseId ? { ...c, lessons: [...c.lessons, newLesson] } : c
      ),
    }));
  };

  const updateLesson = (courseId: string, lessonId: string, lesson: Partial<Lesson>) => {
    setSettings((prev) => ({
      ...prev,
      courses: prev.courses.map((c) =>
        c.id === courseId
          ? { ...c, lessons: c.lessons.map((l) => (l.id === lessonId ? { ...l, ...lesson } : l)) }
          : c
      ),
    }));
  };

  const deleteLesson = (courseId: string, lessonId: string) => {
    setSettings((prev) => ({
      ...prev,
      courses: prev.courses.map((c) =>
        c.id === courseId ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) } : c
      ),
    }));
  };

  return (
    <SiteContext.Provider
      value={{
        settings,
        updateSettings,
        addCourse,
        updateCourse,
        deleteCourse,
        addLesson,
        updateLesson,
        deleteLesson,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used within SiteProvider");
  return context;
};
