import { useState } from "react";
import { Plus, Trash2, Save, Edit3, X, Megaphone, Eye, EyeOff } from "lucide-react";
import { useAnnouncements, Announcement } from "@/hooks/useAnnouncements";
import { useToast } from "@/hooks/use-toast";

const AnnouncementsTab = () => {
  const { announcements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const { toast } = useToast();

  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", priority: 0 });
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null);
  const [editAnnouncementData, setEditAnnouncementData] = useState<Partial<Announcement>>({});

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title) {
      toast({ title: "Please enter announcement title", variant: "destructive" });
      return;
    }
    const result = await createAnnouncement({ ...newAnnouncement, is_active: true });
    if (result.success) {
      setNewAnnouncement({ title: "", content: "", priority: 0 });
      toast({ title: "Announcement added!" });
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement.id);
    setEditAnnouncementData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority
    });
  };

  const handleSaveAnnouncement = async (id: string) => {
    const result = await updateAnnouncement(id, editAnnouncementData);
    if (result.success) {
      setEditingAnnouncement(null);
      toast({ title: "Announcement updated!" });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm("Delete this announcement?")) {
      const result = await deleteAnnouncement(id);
      if (result.success) toast({ title: "Announcement deleted" });
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    const result = await updateAnnouncement(announcement.id, { is_active: !announcement.is_active });
    if (result.success) {
      toast({ title: announcement.is_active ? "Announcement hidden" : "Announcement shown" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Manage Announcements</h2>
        <p className="text-muted-foreground">Create and manage homepage announcements</p>
      </div>

      {/* Add New Announcement */}
      <div className="glass-card p-6">
        <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Announcement</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              placeholder="Announcement Title *" 
              value={newAnnouncement.title} 
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} 
              className="input-glass md:col-span-2" 
            />
            <input 
              type="number"
              placeholder="Priority (higher = first)" 
              value={newAnnouncement.priority} 
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: parseInt(e.target.value) || 0 })} 
              className="input-glass" 
            />
          </div>
          <textarea 
            placeholder="Announcement content (optional)" 
            value={newAnnouncement.content} 
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} 
            className="input-glass min-h-[80px] w-full" 
          />
          <button onClick={handleAddAnnouncement} className="btn-gradient">Add Announcement</button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">No announcements yet. Add your first announcement above.</div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className={`glass-card p-4 transition-all ${!announcement.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${announcement.is_active ? 'bg-primary/20' : 'bg-muted/20'}`}>
                  <Megaphone className={`w-5 h-5 ${announcement.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>

                {editingAnnouncement === announcement.id ? (
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input 
                        value={editAnnouncementData.title || ""} 
                        onChange={(e) => setEditAnnouncementData({ ...editAnnouncementData, title: e.target.value })} 
                        className="input-glass md:col-span-2" 
                      />
                      <input 
                        type="number"
                        value={editAnnouncementData.priority || 0} 
                        onChange={(e) => setEditAnnouncementData({ ...editAnnouncementData, priority: parseInt(e.target.value) || 0 })} 
                        className="input-glass" 
                      />
                    </div>
                    <textarea 
                      value={editAnnouncementData.content || ""} 
                      onChange={(e) => setEditAnnouncementData({ ...editAnnouncementData, content: e.target.value })} 
                      className="input-glass min-h-[60px] w-full" 
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveAnnouncement(announcement.id)} className="btn-gradient text-sm flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                      <button onClick={() => setEditingAnnouncement(null)} className="btn-outline text-sm flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{announcement.title}</h3>
                      {announcement.is_active ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-muted/20 text-muted-foreground">Hidden</span>
                      )}
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">Priority: {announcement.priority}</span>
                    </div>
                    {announcement.content && (
                      <p className="text-muted-foreground text-sm">{announcement.content}</p>
                    )}
                  </div>
                )}

                {editingAnnouncement !== announcement.id && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleActive(announcement)} 
                      className={`p-2 rounded-lg transition-colors ${announcement.is_active ? 'bg-success/20 text-success hover:bg-success/30' : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'}`}
                      title={announcement.is_active ? "Hide" : "Show"}
                    >
                      {announcement.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleEditAnnouncement(announcement)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteAnnouncement(announcement.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsTab;
