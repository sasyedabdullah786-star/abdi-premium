import { Link } from "react-router-dom";
import { FileText, Calendar, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const Blog = () => {
  const { posts, loading } = useBlogPosts();
  const publishedPosts = posts.filter(p => p.is_published);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout title="Blog & Announcements">
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading posts...</div>
        ) : publishedPosts.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-md mx-auto">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">No Posts Yet</h2>
            <p className="text-muted-foreground">Check back soon for updates!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedPosts.map((post, index) => (
              <Link 
                key={post.id}
                to={`/blog/${post.id}`}
                className="glass-card-hover overflow-hidden animate-fade-in"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                {post.image_url ? (
                  <div 
                    className="h-48 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${post.image_url})` }} 
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <FileText className="w-16 h-16 text-primary/50" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.created_at)}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {post.content?.substring(0, 150) || 'Read more...'}
                  </p>
                  <div className="flex items-center gap-2 text-primary">
                    <span className="text-sm font-medium">Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Blog;
