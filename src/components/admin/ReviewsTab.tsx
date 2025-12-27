import { Star, Check, X, Trash2 } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { useCourses } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";

const ReviewsTab = () => {
  const { allReviews, loading, approveReview, deleteReview, refetch } = useReviews();
  const { courses } = useCourses();
  const { toast } = useToast();

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  const handleApprove = async (reviewId: string) => {
    const result = await approveReview(reviewId);
    if (result.success) {
      toast({ title: 'Review approved' });
      refetch();
    }
  };

  const handleDelete = async (reviewId: string) => {
    const result = await deleteReview(reviewId);
    if (result.success) {
      toast({ title: 'Review deleted' });
    }
  };

  const pendingReviews = allReviews.filter(r => !r.is_approved);
  const approvedReviews = allReviews.filter(r => r.is_approved);

  if (loading) {
    return <div className="text-muted-foreground">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Manage Reviews</h2>
        <p className="text-muted-foreground">Approve or reject student course reviews</p>
      </div>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-warning flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            Pending Approval ({pendingReviews.length})
          </h3>
          {pendingReviews.map((review) => (
            <div key={review.id} className="glass-card p-4 border-warning/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{getCourseTitle(review.course_id)}</span>
                  </div>
                  <p className="text-sm">{review.review_text || 'No comment'}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(review.id)}
                    className="p-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors"
                    title="Approve"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approved Reviews */}
      <div className="space-y-4">
        <h3 className="font-medium text-success flex items-center gap-2">
          <Check className="w-4 h-4" />
          Approved Reviews ({approvedReviews.length})
        </h3>
        {approvedReviews.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            No approved reviews yet
          </div>
        ) : (
          approvedReviews.map((review) => (
            <div key={review.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{getCourseTitle(review.course_id)}</span>
                  </div>
                  <p className="text-sm">{review.review_text || 'No comment'}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;
