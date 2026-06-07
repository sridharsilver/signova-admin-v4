import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ListTree } from "lucide-react";
import { fmtDate } from "@/lib/format";
import { ProductCategory } from "@/types/products";
import { productService } from "@/services/productService";

export default function ProductCategories() {
  const [items, setItems] = useState<ProductCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await productService.getCategories();
      setItems(data);
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await productService.deleteCategory(id);
        toast.success("Category deleted");
        fetchCategories();
      } catch (error: unknown) {
        toast.error((error as Error).message || "Failed to delete category");
      }
    }
  };

  const handleSave = async (cat: ProductCategory) => {
    try {
      if (editingCat) {
        await productService.updateCategory(cat);
        toast.success("Category updated");
      } else {
        const { id, created_at, ...rest } = cat;
        await productService.createCategory(rest as unknown as ProductCategory);
        toast.success("Category created");
      }
      setOpen(false);
      setEditingCat(null);
      fetchCategories();
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to save category");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Categories"
        description="Manage the categories for your product catalog"
        actions={
          <Button 
            className="gradient-primary text-white" 
            onClick={() => { setEditingCat(null); setOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />New Category
          </Button>
        }
      />
      
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-accent/50">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Icon</th>
                <th className="px-6 py-4 font-medium">Created At</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Loading categories...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No categories found.
                  </td>
                </tr>
              ) : items.map((cat) => (
                <tr key={cat.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <ListTree className="h-4 w-4" />
                    </div>
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{cat.slug}</td>
                  <td className="px-6 py-4 text-muted-foreground">{cat.icon || "-"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{fmtDate(cat.created_at)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:text-primary"
                      onClick={() => { setEditingCat(cat); setOpen(true); }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:text-destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <CategoryForm 
            initialData={editingCat} 
            onSave={handleSave} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryForm({ initialData, onSave }: { initialData: ProductCategory | null, onSave: (cat: ProductCategory) => void }) {
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [icon, setIcon] = useState(initialData?.icon || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const submit = () => {
    if (!name || !slug) return toast.error("Name and Slug are required.");
    onSave({
      id: initialData?.id || crypto.randomUUID(),
      name,
      slug,
      icon: icon || "",
      description: description || "",
      created_at: initialData?.created_at || new Date().toISOString(),
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{initialData ? "Edit Category" : "New Category"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input 
            value={name} 
            onChange={(e) => {
              setName(e.target.value);
              if (!initialData) {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
              }
            }} 
            placeholder="e.g. Fertilizers" 
          />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. fertilizers" />
        </div>
        <div className="space-y-2">
          <Label>Icon Name</Label>
          <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. leaf" />
          <p className="text-xs text-muted-foreground">Lucide icon name to display.</p>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Short description for the homepage..." 
            rows={3} 
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} className="gradient-primary text-white">Save</Button>
      </DialogFooter>
    </>
  );
}
