import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalCourses: number;
  publishedCourses: number;
  totalLessons: number;
  totalUsers: number;
  totalEnrollments: number;
  totalReviews: number;
  pendingReviews: number;
  totalTestimonials: number;
  totalAnnouncements: number;
  totalCategories: number;
  recentEnrollments: { course_id: string; count: number; title?: string }[];
  topRatedCourses: { id: string; title: string; average_rating: number }[];
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalCourses: 0,
    publishedCourses: 0,
    totalLessons: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    totalReviews: 0,
    pendingReviews: 0,
    totalTestimonials: 0,
    totalAnnouncements: 0,
    totalCategories: 0,
    recentEnrollments: [],
    topRatedCourses: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      // Fetch all counts in parallel
      const [
        coursesRes,
        lessonsRes,
        usersRes,
        enrollmentsRes,
        reviewsRes,
        pendingReviewsRes,
        testimonialsRes,
        announcementsRes,
        categoriesRes,
        topCoursesRes
      ] = await Promise.all([
        supabase.from('courses').select('id, is_published'),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('course_progress').select('id', { count: 'exact', head: true }),
        supabase.from('course_reviews').select('id', { count: 'exact', head: true }),
        supabase.from('course_reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id, title, average_rating').order('average_rating', { ascending: false }).limit(5)
      ]);

      const courses = coursesRes.data || [];
      
      setAnalytics({
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.is_published).length,
        totalLessons: lessonsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalEnrollments: enrollmentsRes.count || 0,
        totalReviews: reviewsRes.count || 0,
        pendingReviews: pendingReviewsRes.count || 0,
        totalTestimonials: testimonialsRes.count || 0,
        totalAnnouncements: announcementsRes.count || 0,
        totalCategories: categoriesRes.count || 0,
        recentEnrollments: [],
        topRatedCourses: (topCoursesRes.data || []).map(c => ({
          id: c.id,
          title: c.title,
          average_rating: Number(c.average_rating) || 0
        }))
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { analytics, loading, refetch: fetchAnalytics };
};
