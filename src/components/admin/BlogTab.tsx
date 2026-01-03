import { useState } from "react";
import { Plus, Trash2, Save, Edit3, X, FileText, Eye, EyeOff } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const BlogTab = () => {
  const { posts, createPost, updatePost, deletePost } = useBlogPosts();
  const { toast } = useToast();

  const [newPost, setNewPost] = useState({ title: "", content: "", image_url: "" });
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editPostData, setEditPostData] = useState<Partial<BlogPost>>({});

  const handleAddPost = async () => {
    if (!newPost.title) {
      toast({ title: "Please enter a post title", variant: "destructive" });
      return;
    }
    const result = await createPost({ ...newPost, is_published: true });
    if (result.success) {
      setNewPost({ title: "", content: "", image_url: "" });
      toast({ title: "Blog post added!" });
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post.id);
    setEditPostData({
      title: post.title,
      content: post.content,
      image_url: post.image_url
    });
  };

  const handleSavePost = async (id: string) => {
    const result = await updatePost(id, editPostData);
    if (result.success) {
      setEditingPost(null);
      toast({ title: "Blog post updated!" });
    }
  };

  const handleDeletePost = async (id: string) => {
    if (confirm("Delete this blog post?")) {
      const result = await deletePost(id);
      if (result.success) toast({ title: "Blog post deleted" });
    }
  };

  const handleTogglePublished = async (post: BlogPost) => {
    const result = await updatePost(post.id, { is_published: !post.is_published });
    if (result.success) {
      toast({ title: post.is_published ? "Post unpublished" : "Post published" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Manage Blog</h2>
        <p className="text-muted-foreground">Create and manage blog posts</p>
      </div>

      {/* Add New Post */}
      <div className="glass-card p-6">
        <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Post</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Post Title *" 
              value={newPost.title} 
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} 
              className="input-glass" 
            />
            <input 
              placeholder="Featured Image URL" 
              value={newPost.image_url} 
              onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })} 
              className="input-glass" 
            />
          </div>
          <textarea 
            placeholder="Post content (Markdown supported)" 
            value={newPost.content} 
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} 
            className="input-glass min-h-[150px] w-full font-mono text-sm" 
          />
          <button onClick={handleAddPost} className="btn-gradient">Add Post</button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">No blog posts yet. Add your first post above.</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={`glass-card overflow-hidden transition-all ${!post.is_published ? 'opacity-60' : ''}`}>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {post.image_url && (
                    <img src={post.image_url} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  )}
                  {!post.image_url && (
                    <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-8 h-8 text-primary/30" />
                    </div>
                  )}

                  {editingPost === post.id ? (
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input 
                          value={editPostData.title || ""} 
                          onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })} 
                          className="input-glass" 
                          placeholder="Title"
                        />
                        <input 
                          value={editPostData.image_url || ""} 
                          onChange={(e) => setEditPostData({ ...editPostData, image_url: e.target.value })} 
                          className="input-glass" 
                          placeholder="Image URL"
                        />
                      </div>
                      <textarea 
                        value={editPostData.content || ""} 
                        onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })} 
                        className="input-glass min-h-[100px] w-full font-mono text-sm" 
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSavePost(post.id)} className="btn-gradient text-sm flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                        <button onClick={() => setEditingPost(null)} className="btn-outline text-sm flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium truncate">{post.title}</h3>
                        {!post.is_published && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-muted/20 text-muted-foreground flex-shrink-0">Draft</span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">{post.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {editingPost !== post.id && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleTogglePublished(post)} 
                        className={`p-2 rounded-lg transition-colors ${post.is_published ? 'bg-success/20 text-success hover:bg-success/30' : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'}`}
                        title={post.is_published ? "Unpublish" : "Publish"}
                      >
                        {post.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleEditPost(post)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeletePost(post.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogTab;
