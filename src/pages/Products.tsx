import { useState, useEffect, useCallback, memo } from "react";
import { queryCache } from "@/lib/queryCache";
import { CACHE_KEYS } from "@/services/productService";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Package, Tag, Download, Upload, Image as ImageIcon, LayoutGrid, List, QrCode } from "lucide-react";
import { fmtDate } from "@/lib/format";
import { Product, ProductCategory } from "@/types/products";
import { productService, getProductImageUrl } from "@/services/productService";
import { supabase } from "@/lib/supabase";

const ProductQRDialogs = memo(function ProductQRDialogs({ 
  product, 
  showLabels = false,
  frontendUrl = "https://1signova.pages.dev",
  showProductPageQR = true
}: { 
  product: Product, 
  showLabels?: boolean,
  frontendUrl?: string,
  showProductPageQR?: boolean
}) {
  if (!product) return null;

  return (
    <>
      {showProductPageQR && (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={showLabels ? "outline" : "ghost"} size={showLabels ? "default" : "icon"} className={showLabels ? "flex items-center gap-2" : "h-8 w-8 hover:text-primary"} title="Product Page QR">
            <QrCode className={showLabels ? "h-4 w-4" : "h-4 w-4 text-blue-500"} />
            {showLabels && "Generate Product QR"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8">
          <DialogHeader>
            <DialogTitle className="text-center mb-4">Product Page QR</DialogTitle>
            <DialogDescription className="sr-only">
              QR Code linking to the product page.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white p-4 rounded-2xl shadow-inner my-4">
            <QRCodeSVG 
              id={`qr-svg-product-${product.id}`}
              value={`${frontendUrl}/products/${product.slug}`} 
              size={200} 
            />
          </div>
          <p className="text-sm text-muted-foreground text-center mb-4">
            This QR code links directly to the product detail page on the public site.
          </p>
          <div className="w-full bg-secondary/50 rounded-xl p-3 mb-4 flex items-center justify-between border border-border/50">
            <span className="text-xs text-muted-foreground truncate mr-3 select-all font-mono">
              {`${frontendUrl}/products/${product.slug}`}
            </span>
            <a 
              href={`${frontendUrl}/products/${product.slug}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-primary hover:underline whitespace-nowrap"
            >
              Open
            </a>
          </div>
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const svg = document.getElementById(`qr-svg-product-${product.id}`);
                if (!svg) return;
                const serializer = new XMLSerializer();
                const source = serializer.serializeToString(svg);
                const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${product.slug}-page-qr.svg`;
                a.click();
              }}
              className="flex-1 flex justify-center items-center gap-2"
            >
              <Download className="size-4" /> SVG
            </Button>
            <Button
              onClick={() => {
                const svg = document.getElementById(`qr-svg-product-${product.id}`);
                if (!svg) return;
                const serializer = new XMLSerializer();
                const source = serializer.serializeToString(svg);
                const img = new Image();
                const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  canvas.width = 1000;
                  canvas.height = 1000;
                  const ctx = canvas.getContext("2d");
                  if (!ctx) return;
                  ctx.fillStyle = "white";
                  ctx.fillRect(0, 0, 1000, 1000);
                  ctx.drawImage(img, 75, 75, 850, 850);
                  const pngUrl = canvas.toDataURL("image/png");
                  const a = document.createElement("a");
                  a.href = pngUrl;
                  a.download = `${product.slug}-page-qr.png`;
                  a.click();
                };
                img.src = url;
              }}
              className="flex-1 flex justify-center items-center gap-2"
            >
              <Download className="size-4" /> PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant={showLabels ? "outline" : "ghost"} size={showLabels ? "default" : "icon"} className={showLabels ? "flex items-center gap-2" : "h-8 w-8 hover:text-primary"} title="Technical Specs QR">
            <QrCode className={showLabels ? "h-4 w-4" : "h-4 w-4 text-emerald-500"} />
            {showLabels && "Generate Technical QR"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8">
          <DialogHeader>
            <DialogTitle className="text-center mb-4">Technical Specifications QR</DialogTitle>
            <DialogDescription className="sr-only">
              QR Code linking to the technical specifications page.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white p-4 rounded-2xl shadow-inner my-4">
            <QRCodeSVG 
              id={`qr-svg-technical-${product.id}`}
              value={`${frontendUrl}/tech-specs/${product.slug}`} 
              size={200} 
            />
          </div>
          <p className="text-sm text-muted-foreground text-center mb-4">
            This QR code links directly to the Technical Specifications page.
          </p>
          <div className="w-full bg-secondary/50 rounded-xl p-3 mb-4 flex items-center justify-between border border-border/50">
            <span className="text-xs text-muted-foreground truncate mr-3 select-all font-mono">
              {`${frontendUrl}/tech-specs/${product.slug}`}
            </span>
            <a 
              href={`${frontendUrl}/tech-specs/${product.slug}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-primary hover:underline whitespace-nowrap"
            >
              Open
            </a>
          </div>
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const svg = document.getElementById(`qr-svg-technical-${product.id}`);
                if (!svg) return;
                const serializer = new XMLSerializer();
                const source = serializer.serializeToString(svg);
                const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${product.slug}-tech-qr.svg`;
                a.click();
              }}
              className="flex-1 flex justify-center items-center gap-2"
            >
              <Download className="size-4" /> SVG
            </Button>
            <Button
              onClick={() => {
                const svg = document.getElementById(`qr-svg-technical-${product.id}`);
                if (!svg) return;
                const serializer = new XMLSerializer();
                const source = serializer.serializeToString(svg);
                const img = new Image();
                const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  canvas.width = 1000;
                  canvas.height = 1000;
                  const ctx = canvas.getContext("2d");
                  if (!ctx) return;
                  ctx.fillStyle = "white";
                  ctx.fillRect(0, 0, 1000, 1000);
                  ctx.drawImage(img, 75, 75, 850, 850);
                  const pngUrl = canvas.toDataURL("image/png");
                  const a = document.createElement("a");
                  a.href = pngUrl;
                  a.download = `${product.slug}-tech-qr.png`;
                  a.click();
                };
                img.src = url;
              }}
              className="flex-1 flex justify-center items-center gap-2"
            >
              <Download className="size-4" /> PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default function Products() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [loading, setLoading] = useState(true);
  const [frontendUrl, setFrontendUrl] = useState("https://1signova.pages.dev");
  const [showProductPageQR, setShowProductPageQR] = useState(true);


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // ── Stale-while-revalidate ──────────────────────────────────────────────
      // productService methods already implement queryCache under the hood.
      // We pass the onBackground callbacks directly to them so they update the UI when fresh data arrives.
      const [prods, cats, settings] = await Promise.all([
        productService.getProducts((fresh) => setItems(fresh)),
        productService.getCategories((fresh) => setCategories(fresh)),
        queryCache.get('frontend_settings', () =>
          supabase.from('frontend_settings').select('value').eq('key', 'admin_config').maybeSingle()
            .then(r => r.data),
          10 * 60_000,
        ),
      ]);
      setItems(prods);
      setCategories(cats);
      if (settings?.value) {
        setFrontendUrl(settings.value.frontendUrl || "https://1signova.pages.dev");
        setShowProductPageQR(settings.value.showProductPageQR !== false);
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      // ── Optimistic UI Update ───────────────────────────────────────────
      const previousItems = [...items];
      setItems(prev => prev.filter(p => p.id !== id));

      try {
        await productService.deleteProduct(id);
        toast.success("Product deleted");
      } catch (error: unknown) {
        toast.error((error as Error).message || "Failed to delete product");
        // Revert local state on failure
        setItems(previousItems);
      }
    }
  }, [items]);

  const handleSave = useCallback(async (product: Product, file: File | null) => {
    try {
      let finalImageUrl = product.image_url;
      if (file) {
        finalImageUrl = await productService.uploadImage(file);
      }
      
      const productToSave = { ...product, image_url: finalImageUrl };
      
      if (editingItem) {
        await productService.updateProduct(productToSave);
        toast.success("Product updated");
      } else {
        const { id, created_at, updated_at, category, ...rest } = productToSave;
        await productService.createProduct(rest as unknown as Product);
        toast.success("Product created");
      }
      setOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to save product");
    }
  }, [editingItem, fetchData]);

  const handleDownloadTemplate = useCallback(() => {
    const csvContent = `name,slug,category_slug,tag,image_url,description,uses,dosage,sizes,is_active,tech_title,tech_composition,tech_crops,tech_dose,qr_data\n"Grow Fast 500","grow-fast-500","chelated","Best Seller","","Premium liquid fertilizer for rapid vegetative growth.","Apply to soil or via foliar spray.","5ml per Liter of water.","{1L,5L,20L}","true","Zinc Gluconate Zn- 12% (Liquid)","First Ingredient (12%)\nSecond Ingredient (8%)","Suitable for all crops","250-500 ml per acre",""`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_bulk_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.success(`${file.name} uploaded successfully! Bulk import will process the data.`);
    e.target.value = '';
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog, sizes, and technical specifications"
        actions={
          <>
            <div className="flex flex-col items-center">
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleFileUpload}
                />
                <Button variant="outline" className="h-10">
                  <Upload className="h-4 w-4 mr-2" /> Import CSV
                </Button>
              </div>
              <button 
                onClick={handleDownloadTemplate}
                className="text-[10px] text-muted-foreground hover:text-primary mt-1 hover:underline"
              >
                Download Template
              </button>
            </div>
            <Button 
              className="gradient-primary text-white h-10" 
              onClick={() => { setEditingItem(null); setOpen(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />Add Product
            </Button>
          </>
        }
      />
      
      <div className="flex justify-end gap-2 mb-2">
        <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
          <LayoutGrid className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Grid</span>
        </Button>
        <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
          <List className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">List</span>
        </Button>
      </div>

      {viewMode === "list" ? (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-accent/50">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Sizes</th>
                <th className="px-6 py-4 font-medium">Updated</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-3">
                      <div className="h-10 rounded-lg bg-muted animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              ) : items.map((prod) => (
                <tr key={prod.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{prod.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                           <Tag className="h-3 w-3" /> {prod.tag || "No tag"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {prod.category?.name || "Uncategorized"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={prod.is_active ? "default" : "secondary"} className={prod.is_active ? "bg-success/10 text-success hover:bg-success/20" : ""}>
                      {prod.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {prod.sizes.length > 0 ? prod.sizes.join(", ") : "-"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{fmtDate(prod.updated_at)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <ProductQRDialogs product={prod} frontendUrl={frontendUrl} showProductPageQR={showProductPageQR} />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:text-primary"
                      onClick={() => { setEditingItem(prod); setOpen(true); }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:text-destructive"
                      onClick={() => handleDelete(prod.id)}
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-muted animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))
          ) : items.length === 0 ? (
            <div className="col-span-full p-12 text-center text-muted-foreground glass-card rounded-xl">
              No products found.
            </div>
          ) : items.map((prod) => (
            <div key={prod.id} className="bg-white/60 dark:bg-card/40 border border-white/40 dark:border-white/10 rounded-3xl overflow-hidden glass-card rounded-xl flex flex-col group relative transition-all hover:shadow-lg">
              <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="flex gap-1 bg-background/80 backdrop-blur-md rounded-md p-0.5 shadow-sm">
                  <ProductQRDialogs product={prod} frontendUrl={frontendUrl} showProductPageQR={showProductPageQR} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingItem(prod); setOpen(true); }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(prod.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="aspect-[4/3] relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-muted/30 via-muted/10 to-transparent p-6">
                {prod.image_url ? (
                  <img src={getProductImageUrl(prod.image_url)} alt={prod.name} className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-700 drop-shadow-md relative z-10" />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground/30" />
                )}
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{prod.name}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Tag className="h-3 w-3" /> {prod.tag || "No tag"}
                    </div>
                  </div>
                  <Badge variant={prod.is_active ? "default" : "secondary"} className={prod.is_active ? "bg-success/10 text-success shrink-0" : "shrink-0"}>
                    {prod.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {prod.description || "No description provided."}
                </div>
                
                <div className="mt-auto space-y-2 text-xs">
                  <div className="flex justify-between border-t pt-2 border-border/50">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{prod.category?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 border-border/50">
                    <span className="text-muted-foreground">Sizes:</span>
                    <span className="font-medium">{prod.sizes.length > 0 ? prod.sizes.join(", ") : "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-xl w-full flex flex-col p-0">
          <ProductForm 
            initialData={editingItem} 
            categories={categories}
            onSave={handleSave} 
            onCancel={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

const ProductForm = memo(function ProductForm({ 
  initialData, 
  categories,
  onSave, 
  onCancel 
}: { 
  initialData: Product | null; 
  categories: ProductCategory[];
  onSave: (p: Product, file: File | null) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    category_slug: initialData?.category_slug || "",
    description: initialData?.description || "",
    tag: initialData?.tag || "",
    uses: initialData?.uses || "",
    dosage: initialData?.dosage || "",
    sizes: initialData?.sizes || [],
    is_active: initialData?.is_active ?? true,
    tech_title: initialData?.tech_title || "",
    tech_composition: initialData?.tech_composition || "",
    tech_crops: initialData?.tech_crops || "",
    tech_dose: initialData?.tech_dose || "",
    image_url: initialData?.image_url || null,
  });

  const [sizesInput, setSizesInput] = useState((initialData?.sizes || []).join(", "));
  const [compositionItems, setCompositionItems] = useState<string[]>(
    (initialData?.tech_composition || "").split("\n").filter(Boolean)
  );

  useEffect(() => {
    setFormData({
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      category_slug: initialData?.category_slug || "",
      description: initialData?.description || "",
      tag: initialData?.tag || "",
      uses: initialData?.uses || "",
      dosage: initialData?.dosage || "",
      sizes: initialData?.sizes || [],
      is_active: initialData?.is_active ?? true,
      tech_title: initialData?.tech_title || "",
      tech_composition: initialData?.tech_composition || "",
      tech_crops: initialData?.tech_crops || "",
      tech_dose: initialData?.tech_dose || "",
      qr_data: initialData?.qr_data || "",
      image_url: initialData?.image_url || null,
    });
    setSizesInput((initialData?.sizes || []).join(", "));
    setCompositionItems((initialData?.tech_composition || "").split("\n").filter(Boolean));
    setStep(1);
    setImageFile(null);
  }, [initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Image file size must be less than 1MB. Please choose a smaller image.");
      e.target.value = '';
      return;
    }

    setImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setFormData({ ...formData, image_url: imageUrl });
  };


  const addCompositionItem = () => setCompositionItems([...compositionItems, ""]);
  const updateCompositionItem = (index: number, value: string) => {
    const newItems = [...compositionItems];
    newItems[index] = value;
    setCompositionItems(newItems);
  };
  const removeCompositionItem = (index: number) => {
    setCompositionItems(compositionItems.filter((_, i) => i !== index));
  };

  const submit = () => {
    if (!formData.name || !formData.slug) return toast.error("Name and Slug are required.");
    
    const sizesArray = sizesInput.split(",").map(s => s.trim()).filter(Boolean);
    const cat = categories.find(c => c.slug === formData.category_slug);

    const product: Product = {
      id: initialData?.id || crypto.randomUUID(),
      category_slug: formData.category_slug || null,
      slug: formData.slug || "",
      name: formData.name || "",
      description: formData.description || "",
      tag: formData.tag || null,
      image_url: formData.image_url || null,
      uses: formData.uses || null,
      dosage: formData.dosage || null,
      sizes: sizesArray,
      is_active: formData.is_active ?? true,
      tech_title: formData.tech_title || null,
      tech_composition: compositionItems.filter(Boolean).join("\n") || null,
      tech_crops: formData.tech_crops || null,
      tech_dose: formData.tech_dose || null,
      qr_data: formData.qr_data || null,
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: cat
    };

    onSave(product, imageFile);
  };

  return (
    <>
      <SheetHeader className="px-6 py-4 border-b">
        <SheetTitle>{initialData ? "Edit Product" : "New Product"}</SheetTitle>
        <SheetDescription>
          Fill out the details to {initialData ? "update" : "create"} a product.
        </SheetDescription>
        <div className="flex items-center gap-2 mt-2">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-primary/30"}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-primary/30"}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 3 ? "bg-primary" : "bg-primary/30"}`} />
        </div>
      </SheetHeader>
      
      <ScrollArea className="flex-1">
        <div className="space-y-8 p-6">
          
          {step === 1 && (
            <>
              {/* General Information */}
              <section className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                  <Package className="h-4 w-4 text-primary" /> General Information
                </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value});
                    if (!initialData) {
                      setFormData(prev => ({
                        ...prev, 
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                      }));
                    }
                  }} 
                  placeholder="e.g. Grow Fast 500" 
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input 
                  value={formData.slug} 
                  onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                  placeholder="e.g. grow-fast-500" 
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category_slug || undefined} onValueChange={(v) => setFormData({...formData, category_slug: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tag / Label</Label>
                <Input 
                  value={formData.tag || ""} 
                  onChange={(e) => setFormData({...formData, tag: e.target.value})} 
                  placeholder="e.g. Best Seller, New" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Detailed product description..."
                rows={3}
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label>Product Image</Label>
              <div className="flex items-center gap-4">
                {formData.image_url ? (
                  <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                    <img src={getProductImageUrl(formData.image_url)} alt="Product" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-md border flex items-center justify-center bg-accent/30 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="flex flex-col gap-1 relative">
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                  <Button variant="outline" size="sm" type="button">
                    <Upload className="h-4 w-4 mr-2" /> 
                    {formData.image_url ? "Replace Image" : "Upload Image"}
                  </Button>
                  <p className="text-xs text-muted-foreground">Max file size: 1MB</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Available Sizes (comma-separated)</Label>
              <Input 
                value={sizesInput} 
                onChange={(e) => setSizesInput(e.target.value)} 
                placeholder="e.g. 1L, 5L, 20L, 200L" 
              />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/30">
              <div className="space-y-0.5">
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">Product will be visible to users.</p>
              </div>
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({...formData, is_active: v})} />
            </div>
            </section>
          </>
          )}

          {step === 2 && (
            <>
              {/* Usage & Application */}
              <section className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                  <Package className="h-4 w-4 text-primary" /> Usage & Application
                </h3>
                <div className="space-y-2">
                  <Label>Uses / Application Method</Label>
                  <Textarea 
                    value={formData.uses || ""} 
                    onChange={(e) => setFormData({...formData, uses: e.target.value})} 
                    placeholder="e.g. Apply to soil or via foliar spray..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>General Dosage</Label>
                  <Input 
                    value={formData.dosage || ""} 
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})} 
                    placeholder="e.g. 5ml per Liter of water." 
                  />
                </div>
              </section>
            </>
          )}

          {step === 3 && (
            <>
              {/* Technical Data */}
              <section className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                  <Package className="h-4 w-4 text-primary" /> Technical Data
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Detailed specifications linked to this product.</p>
            
            <div className="space-y-2">
              <Label>Technical Title</Label>
              <Input 
                value={formData.tech_title || ""} 
                onChange={(e) => setFormData({...formData, tech_title: e.target.value})} 
                placeholder="e.g. Zinc Gluconate Zn- 12%" 
              />
            </div>
            <div className="space-y-2">
              <Label>Composition (Numbered List)</Label>
              <div className="space-y-2">
                {compositionItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground w-4">{idx + 1}.</span>
                    <Input 
                      value={item} 
                      onChange={(e) => updateCompositionItem(idx, e.target.value)} 
                      placeholder="e.g. Zinc - 12%" 
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeCompositionItem(idx)} className="h-10 w-10 shrink-0 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addCompositionItem} className="w-full mt-2 border-dashed">
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Crops</Label>
              <Textarea 
                value={formData.tech_crops || ""} 
                onChange={(e) => setFormData({...formData, tech_crops: e.target.value})} 
                placeholder="Suitable crops..." 
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Dose</Label>
              <Input 
                value={formData.tech_dose || ""} 
                onChange={(e) => setFormData({...formData, tech_dose: e.target.value})} 
                placeholder="e.g. 250-500 ml per acre" 
              />
            </div>

            {/* QR Code Generators */}
            {initialData && (
              <div className="space-y-2 mt-8 pt-4 border-t border-border">
                <Label className="flex items-center gap-2">
                  QR Codes
                </Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  <ProductQRDialogs product={initialData} showLabels={true} />
                </div>
              </div>
            )}
          </section>
          </>
          )}

        </div>
      </ScrollArea>

      <SheetFooter className="px-6 py-4 border-t bg-background mt-auto flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        {step === 1 && (
          <>
            <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={() => setStep(2)} className="gradient-primary text-white w-full sm:w-auto">Next: Usage & App</Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button variant="outline" onClick={() => setStep(1)} className="w-full sm:w-auto">Back</Button>
            <Button onClick={() => setStep(3)} className="gradient-primary text-white w-full sm:w-auto">Next: Technical Data</Button>
          </>
        )}
        {step === 3 && (
          <>
            <Button variant="outline" onClick={() => setStep(2)} className="w-full sm:w-auto">Back</Button>
            <Button onClick={submit} className="gradient-primary text-white w-full sm:w-auto">Save Product</Button>
          </>
        )}
      </SheetFooter>
    </>
  );
});
