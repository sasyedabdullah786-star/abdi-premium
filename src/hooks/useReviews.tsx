import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CourseReview {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
}

export const useReviews = (courseId?: string) => {
  const { user, isAdmin } = useAuth();
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [userReview, setUserReview] = useState<CourseReview | null>(null);
  const [allReviews, setAllReviews] = useState<CourseReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      if (courseId) {
        // Fetch approved reviews for a course
        const { data, error } = await supabase
          .from('course_reviews')
          .select('*')
          .eq('course_id', courseId)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);

        // Fetch user's own review
        if (user) {
          const { data: userReviewData } = await supabase
            .from('course_reviews')
            .select('*')
            .eq('course_id', courseId)
            .eq('user_id', user.id)
            .maybeSingle();

          setUserReview(userReviewData);
        }
      } else if (isAdmin) {
        // Admin: fetch all reviews
        const { data, error } = await supabase
          .from('course_reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAllReviews(data || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (courseId: string, rating: number, reviewText?: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .insert({
          user_id: user.id,
          course_id: courseId,
          rating,
          review_text: reviewText || null,
          is_approved: false
        })
        .select()
        .single();

      if (error) throw error;
      setUserReview(data);
      return { success: true, data };
    } catch (err) {
      console.error('Error creating review:', err);
      return { success: false, error: err };
    }
  };

  const updateReview = async (reviewId: string, updates: Partial<CourseReview>) => {
    try {
      const { error } = await supabase
        .from('course_reviews')
        .update(updates)
        .eq('id', reviewId);

      if (error) throw error;
      
      if (isAdmin) {
        setAllReviews(allReviews.map(r => r.id === reviewId ? { ...r, ...updates } : r));
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating review:', err);
      return { success: false, error: err };
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('course_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      setReviews(reviews.filter(r => r.id !== reviewId));
      setAllReviews(allReviews.filter(r => r.id !== reviewId));
      if (userReview?.id === reviewId) setUserReview(null);
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting review:', err);
      return { success: false, error: err };
    }
  };

  const approveReview = async (reviewId: string) => {
    return updateReview(reviewId, { is_approved: true });
  };

  useEffect(() => {
    fetchReviews();
  }, [user, courseId, isAdmin]);

  return { 
    reviews, 
    userReview,
    allReviews,
    loading, 
    createReview, 
    updateReview,
    deleteReview,
    approveReview,
    refetch: fetchReviews 
  };
};
