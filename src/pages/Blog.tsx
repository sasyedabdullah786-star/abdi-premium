import { Link } from "react-router-dom";
import { FileText, Calendar, ArrowRight, Sparkles } from "lucide-react";
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-shimmer">
                <div className="h-48 bg-muted/30 rounded-xl mb-4" />
                <div className="h-6 bg-muted/30 rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted/30 rounded w-full" />
              </div>
            ))}
          </div>
        ) : publishedPosts.length === 0 ? (
          <div className="glass-card p-16 text-center max-w-md mx-auto animate-fade-in">
            <div className="icon-glow w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">No Posts Yet</h2>
            <p className="text-muted-foreground">Check back soon for updates and announcements!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedPosts.map((post, index) => (
              <Link 
                key={post.id}
                to={`/blog/${post.id}`}
                className="glass-card-hover overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                      <FileText className="w-16 h-16 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.created_at)}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {post.content?.substring(0, 150) || 'Read more...'}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
