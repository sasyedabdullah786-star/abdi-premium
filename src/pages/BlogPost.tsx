import { useParams } from "react-router-dom";
import { Calendar, ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const BlogPost = () => {
  const { postId } = useParams();
  const { posts, loading } = useBlogPosts();
  
  const post = posts.find(p => p.id === postId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout showBack>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout showBack>
        <div className="container mx-auto px-4 py-16 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">This post doesn't exist or has been removed.</p>
          <Link to="/blog" className="btn-gradient inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack>
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto animate-fade-in">
          {post.image_url && (
            <div 
              className="h-64 md:h-80 rounded-2xl bg-cover bg-center mb-8"
              style={{ backgroundImage: `url(${post.image_url})` }}
            />
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <Calendar className="w-4 h-4" />
            {formatDate(post.created_at)}
          </div>
          
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">
            <span className="gradient-text">{post.title}</span>
          </h1>
          
          <div className="prose prose-invert max-w-none">
            <div className="glass-card p-8 text-foreground whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          </div>
          
          <div className="mt-8">
            <Link to="/blog" className="btn-glass inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
