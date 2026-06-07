import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Search, QrCode, Download, Image as ImageIcon, LayoutGrid, List } from "lucide-react";
import { Product } from "@/types/products";
import { productService, getProductImageUrl } from "@/services/productService";
import { supabase } from "@/lib/supabase";
import { queryCache } from "@/lib/queryCache";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

function getLabeledQRSource(svgElement: HTMLElement, productName: string | null | undefined, productSku: string | null | undefined, type: 'product' | 'technical') {
  let qrSource = '';
  if (svgElement && (svgElement as unknown as Element).outerHTML) {
    qrSource = (svgElement as unknown as Element).outerHTML;
  } else {
    const serializer = new XMLSerializer();
    qrSource = serializer.serializeToString(svgElement);
  }
  // Ensure qrSource is a string before replace
  if (typeof qrSource === 'string') {
    qrSource = qrSource.replace(/xmlns="[^"]*"/g, ''); // strip xmlns so it inherits from parent
  }
  
  const escapeXml = (unsafe: string | null | undefined) => {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const name = escapeXml(productName);
  const sku = escapeXml(productSku);
  const label = type === 'product' ? 'Product Page' : 'Tech Specs';

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
  <rect width="1000" height="1000" fill="white" />
  <svg x="100" y="100" width="800" height="800">
    ${qrSource}
  </svg>
  <text x="500" y="60" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="black">${name}</text>
  <text x="500" y="940" font-family="monospace" font-size="35" text-anchor="middle" fill="#666">${sku}</text>
  <text x="500" y="980" font-family="sans-serif" font-size="25" text-anchor="middle" fill="#999">${label}</text>
</svg>`;
}

function ProductQRDialogs({ product, showLabels = false, frontendUrl, showProductPageQR = true }: { product: Product, showLabels?: boolean, frontendUrl: string, showProductPageQR?: boolean }) {
  if (!product) return null;

  return (
    <div className={`flex gap-2 ${showLabels ? 'flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center' : 'items-center'}`}>
      {showProductPageQR && (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={showLabels ? "outline" : "secondary"} size={showLabels ? "default" : "icon"} className={showLabels ? "flex items-center justify-center gap-2 w-full sm:w-auto" : "h-10 w-10 bg-blue-50 hover:bg-blue-100 hover:text-blue-600 text-blue-500"} title="Product Page QR">
            <QrCode className={showLabels ? "h-4 w-4" : "h-5 w-5"} />
            {showLabels && <span>Product Page</span>}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8">
          <DialogHeader>
            <DialogTitle className="text-center mb-2">Product Page QR</DialogTitle>
            <DialogDescription className="text-center">QR Code linking to the main product page.</DialogDescription>
          </DialogHeader>
          <div className="bg-white p-4 rounded-2xl shadow-inner my-4">
            <QRCodeSVG 
              id={`qr-svg-product-${product.id}`}
              value={`${frontendUrl}/products/${product.slug}`} 
              size={200} 
            />
          </div>
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
              onClick={(e) => {
                e.stopPropagation();
                const svg = document.getElementById(`qr-svg-product-${product.id}`);
                if (!svg) return;
                const source = getLabeledQRSource(svg, product.name, product.sku, 'product');
                const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${product.slug}-page-qr.svg`;
                a.click();
              }}
              className="flex-1 flex justify-center items-center gap-2"
            >
              <Download className="size-4" /> <span>SVG</span>
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                const svg = document.getElementById(`qr-svg-product-${product.id}`);
                if (!svg) return;
                const source = getLabeledQRSource(svg, product.name, product.sku, 'product');
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
                  ctx.drawImage(img, 0, 0, 1000, 1000);
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
              <Download className="size-4" /> <span>PNG</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant={showLabels ? "outline" : "secondary"} size={showLabels ? "default" : "icon"} className={showLabels ? "flex items-center justify-center gap-2 w-full sm:w-auto" : "h-10 w-10 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-600 text-emerald-500"} title="Technical Specs QR">
            <QrCode className={showLabels ? "h-4 w-4" : "h-5 w-5"} />
            {showLabels && <span>Tech Specs</span>}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8">
          <DialogHeader>
            <DialogTitle className="text-center mb-2">Technical Specifications QR</DialogTitle>
            <DialogDescription className="text-center">QR Code linking to the technical specifications page.</DialogDescription>
          </DialogHeader>
          <div className="bg-white p-4 rounded-2xl shadow-inner my-4">
            <QRCodeSVG 
              id={`qr-svg-technical-${product.id}`}
              value={`${frontendUrl}/tech-specs/${product.slug}`} 
              size={200} 
            />
          </div>
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
              onClick={(e) => {
                e.stopPropagation();
                const svg = document.getElementById(`qr-svg-technical-${product.id}`);
                if (!svg) return;
                const source = getLabeledQRSource(svg, product.name, product.sku, 'technical');
                const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${product.slug}-tech-qr.svg`;
                a.click();
              }}
              className="flex-1 flex justify-center items-center gap-2"
            >
              <Download className="size-4" /> <span>SVG</span>
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                const svg = document.getElementById(`qr-svg-technical-${product.id}`);
                if (!svg) return;
                const source = getLabeledQRSource(svg, product.name, product.sku, 'technical');
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
                  ctx.drawImage(img, 0, 0, 1000, 1000);
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
              <Download className="size-4" /> <span>PNG</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductDirectory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [frontendUrl, setFrontendUrl] = useState("https://1signova.pages.dev");
  const [showProductPageQR, setShowProductPageQR] = useState(true);
  const { isSuperAdmin } = useAuth();

  // Load global settings (including showProductPageQR)
  const loadSettings = async () => {
    try {
      const { data } = await supabase.from('frontend_settings').select('value').eq('key', 'admin_config').maybeSingle();
      if (data?.value) {
        setFrontendUrl(data.value.frontendUrl || "https://1signova.pages.dev");
        setShowProductPageQR(data.value.showProductPageQR !== false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleProductPageQR = async (checked: boolean) => {
    setShowProductPageQR(checked);
    const { error } = await supabase.from('frontend_settings').upsert({
      key: 'admin_config',
      value: { frontendUrl, showProductPageQR: checked }
    });
    if (error) {
      toast.error('Failed to save QR setting');
      setShowProductPageQR(!checked);
    } else {
      queryCache.invalidate('frontend_settings');
      toast.success(`Product Page QR ${checked ? 'enabled' : 'disabled'}`);
    }
  };

  useEffect(() => {
    loadSettings();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [data, settings] = await Promise.all([
        productService.getProducts((fresh) => {
          setProducts(fresh);
        }),
        queryCache.get('frontend_settings', () =>
          supabase.from('frontend_settings').select('value').eq('key', 'admin_config').maybeSingle()
            .then(r => r.data),
          10 * 60_000,
        )
      ]);
      setProducts(data);
      if (settings?.value) {
        setFrontendUrl(settings.value.frontendUrl || "https://1signova.pages.dev");
        setShowProductPageQR(settings.value.showProductPageQR !== false);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4 md:mt-0">
      <div className="flex flex-col gap-2 relative z-10 text-center sm:text-left">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -top-10 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">Product QR Directory</h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto sm:mx-0">Access and download high-quality QR codes for your product catalog in a beautifully designed directory.</p>
        {isSuperAdmin && (
          <div className="flex items-center gap-2 mt-2">
            <span className="font-medium">Show Product Page QR</span>
            <Switch checked={showProductPageQR} onCheckedChange={toggleProductPageQR} />
          </div>
        )}
      </div>

      <div className="glass-card rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/5 overflow-hidden bg-white/40 dark:bg-black/40 backdrop-blur-2xl relative z-10">
        <div className="p-5 border-b border-border/40 bg-white/50 dark:bg-black/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              placeholder="Search products by name or SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 bg-white/50 dark:bg-black/50 border-border/50 h-11 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-inner"
            />
          </div>
          <div className="flex bg-muted/40 p-1 rounded-2xl border border-border/40 shrink-0 shadow-inner">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-xl px-4 transition-all duration-300 ${viewMode === "grid" ? "bg-white dark:bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-xl px-4 transition-all duration-300 ${viewMode === "list" ? "bg-white dark:bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          {loading ? (
            <div key="loading" className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-md bg-primary/20 animate-pulse" />
                <QrCode className="h-10 w-10 text-primary animate-bounce relative z-10" />
              </div>
              <p className="font-medium animate-pulse">Loading directory...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div key="empty" className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-medium text-foreground">No products found</p>
              <p className="text-sm">Try adjusting your search terms.</p>
            </div>
          ) : viewMode === "list" ? (
            <div key="list" className="divide-y divide-border/30 bg-white/20 dark:bg-black/10">
              {filteredProducts.map((product, i) => (
                <div key={product.id} className="flex flex-col sm:flex-row sm:items-center p-5 hover:bg-white/60 dark:hover:bg-white/5 transition-all duration-300 gap-6 group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="h-20 w-20 rounded-2xl border border-white/40 dark:border-white/10 bg-gradient-to-br from-muted/50 to-muted/20 shadow-sm overflow-hidden shrink-0 flex items-center justify-center mr-5 group-hover:shadow-md transition-all duration-300 relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {product.image_url ? (
                        <img 
                          src={getProductImageUrl(product.image_url)} 
                          alt={product.name}
                          className="h-full w-full object-contain p-2 group-hover:scale-110 transition-transform duration-500 relative z-10"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/30 relative z-10" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-mono bg-white/60 dark:bg-black/40 px-2.5 py-1 rounded-lg border border-border/50 text-muted-foreground shadow-sm">
                          {product.sku}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 mt-4 sm:mt-0 opacity-100 sm:opacity-80 group-hover:opacity-100 transition-opacity w-full sm:w-auto">
                    <ProductQRDialogs product={product} showLabels={true} frontendUrl={frontendUrl} showProductPageQR={showProductPageQR} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div key="grid" className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 bg-muted/5">
              {filteredProducts.map((product, i) => (
                <div key={product.id} className="bg-white/60 dark:bg-card/40 border border-white/40 dark:border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 group flex flex-col animate-in fade-in zoom-in-95" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
                  <div className="aspect-[4/3] relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-muted/30 via-muted/10 to-transparent p-6">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    {product.image_url ? (
                      <img 
                        src={getProductImageUrl(product.image_url)} 
                        alt={product.name}
                        className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-700 drop-shadow-md relative z-10"
                      />
                    ) : (
                      <ImageIcon className="h-16 w-16 text-muted-foreground/20 relative z-10" />
                    )}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="text-[10px] font-mono bg-white/80 dark:bg-black/60 backdrop-blur-md text-foreground px-3 py-1.5 rounded-xl border border-white/20 dark:border-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105 inline-block">
                        {product.sku}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 md:p-6 flex-1 flex flex-col bg-white/40 dark:bg-black/20 backdrop-blur-sm border-t border-white/20 dark:border-white/5">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-6 flex-1 group-hover:text-primary transition-colors leading-tight" title={product.name}>
                      {product.name}
                    </h3>
                    
                    <div className="pt-5 border-t border-border/40 mt-auto flex justify-between items-center relative">
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="text-xs text-muted-foreground font-medium">QR Codes</span>
                      <ProductQRDialogs product={product} showLabels={false} frontendUrl={frontendUrl} showProductPageQR={showProductPageQR} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
