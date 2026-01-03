import { useState } from "react";
import { Plus, Trash2, Save, Edit3, X, Tag, ArrowUp, ArrowDown } from "lucide-react";
import { useCategories, Category } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";

const ICONS = [
  "BookOpen", "Code", "Palette", "Music", "Camera", "Globe", "Briefcase", "Heart", 
  "Star", "Zap", "Award", "TrendingUp", "Users", "Settings", "Database", "Cpu"
];

const COLORS = [
  { name: "Primary", value: "primary" },
  { name: "Secondary", value: "secondary" },
  { name: "Accent", value: "accent" },
  { name: "Success", value: "success" },
  { name: "Warning", value: "warning" },
  { name: "Destructive", value: "destructive" }
];

const CategoriesTab = () => {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { toast } = useToast();

  const [newCategory, setNewCategory] = useState({ name: "", icon: "BookOpen", color: "primary", sort_order: 0 });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryData, setEditCategoryData] = useState<Partial<Category>>({});

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({ title: "Please enter category name", variant: "destructive" });
      return;
    }
    const result = await createCategory({
      ...newCategory,
      sort_order: categories.length
    });
    if (result.success) {
      setNewCategory({ name: "", icon: "BookOpen", color: "primary", sort_order: 0 });
      toast({ title: "Category added!" });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditCategoryData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      sort_order: category.sort_order
    });
  };

  const handleSaveCategory = async (id: string) => {
    const result = await updateCategory(id, editCategoryData);
    if (result.success) {
      setEditingCategory(null);
      toast({ title: "Category updated!" });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Delete this category?")) {
      const result = await deleteCategory(id);
      if (result.success) toast({ title: "Category deleted" });
    }
  };

  const handleMoveCategory = async (category: Category, direction: 'up' | 'down') => {
    const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = sortedCategories.findIndex(c => c.id === category.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sortedCategories.length) return;
    
    const otherCategory = sortedCategories[newIndex];
    await updateCategory(category.id, { sort_order: otherCategory.sort_order });
    await updateCategory(otherCategory.id, { sort_order: category.sort_order });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Manage Categories</h2>
        <p className="text-muted-foreground">Organize your courses into categories</p>
      </div>

      {/* Add New Category */}
      <div className="glass-card p-6">
        <h3 className="font-medium mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            placeholder="Category Name *" 
            value={newCategory.name} 
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} 
            className="input-glass" 
          />
          <select 
            value={newCategory.icon} 
            onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })} 
            className="input-glass bg-card"
          >
            {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
          </select>
          <select 
            value={newCategory.color} 
            onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })} 
            className="input-glass bg-card"
          >
            {COLORS.map(color => <option key={color.value} value={color.value}>{color.name}</option>)}
          </select>
          <button onClick={handleAddCategory} className="btn-gradient">Add Category</button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">No categories yet. Add your first category above.</div>
        ) : (
          [...categories].sort((a, b) => a.sort_order - b.sort_order).map((category, index) => (
            <div key={category.id} className="glass-card p-4 flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => handleMoveCategory(category, 'up')} 
                  disabled={index === 0}
                  className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleMoveCategory(category, 'down')} 
                  disabled={index === categories.length - 1}
                  className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              <div className={`w-10 h-10 rounded-lg bg-${category.color}/20 flex items-center justify-center`}>
                <Tag className={`w-5 h-5 text-${category.color}`} />
              </div>

              {editingCategory === category.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input 
                    value={editCategoryData.name || ""} 
                    onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })} 
                    className="input-glass" 
                  />
                  <select 
                    value={editCategoryData.icon || "BookOpen"} 
                    onChange={(e) => setEditCategoryData({ ...editCategoryData, icon: e.target.value })} 
                    className="input-glass bg-card"
                  >
                    {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                  <select 
                    value={editCategoryData.color || "primary"} 
                    onChange={(e) => setEditCategoryData({ ...editCategoryData, color: e.target.value })} 
                    className="input-glass bg-card"
                  >
                    {COLORS.map(color => <option key={color.value} value={color.value}>{color.name}</option>)}
                  </select>
                </div>
              ) : (
                <div className="flex-1">
                  <h3 className="font-medium">{category.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>Icon: {category.icon}</span>
                    <span>Color: {category.color}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {editingCategory === category.id ? (
                  <>
                    <button onClick={() => handleSaveCategory(category.id)} className="btn-gradient text-sm flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                    <button onClick={() => setEditingCategory(null)} className="btn-outline text-sm flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditCategory(category)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoriesTab;
