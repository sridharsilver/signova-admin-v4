import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Search, QrCode, Download, Image as ImageIcon, LayoutGrid, List } from "lucide-react";
import { Product } from "@/types/products";
import { productService, getProductImageUrl } from "@/services/productService";

function getLabeledQRSource(svgElement: HTMLElement, productName: string, productSku: string, type: 'product' | 'technical') {
  const serializer = new XMLSerializer();
  let qrSource = serializer.serializeToString(svgElement);
  qrSource = qrSource.replace(/xmlns="[^"]*"/g, ""); // strip xmlns so it inherits from parent
  
  const escapeXml = (unsafe: string) => unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });

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

function ProductQRDialogs({ product, showLabels = false }: { product: Product, showLabels?: boolean }) {
  if (!product) return null;
  const frontendUrl = localStorage.getItem('frontendUrl') || "https://1signova.pages.dev";

  return (
    <div className="flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={showLabels ? "outline" : "secondary"} size={showLabels ? "default" : "icon"} className={showLabels ? "flex items-center gap-2" : "h-10 w-10 bg-blue-50 hover:bg-blue-100 hover:text-blue-600 text-blue-500"} title="Product Page QR">
            <QrCode className={showLabels ? "h-4 w-4" : "h-5 w-5"} />
            {showLabels && "Product Page"}
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
              onClick={() => {
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
              <Download className="size-4" /> SVG
            </Button>
            <Button
              onClick={() => {
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
              <Download className="size-4" /> PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant={showLabels ? "outline" : "secondary"} size={showLabels ? "default" : "icon"} className={showLabels ? "flex items-center gap-2" : "h-10 w-10 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-600 text-emerald-500"} title="Technical Specs QR">
            <QrCode className={showLabels ? "h-4 w-4" : "h-5 w-5"} />
            {showLabels && "Tech Specs"}
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
              onClick={() => {
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
              <Download className="size-4" /> SVG
            </Button>
            <Button
              onClick={() => {
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
              <Download className="size-4" /> PNG
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

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
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
    <div className="space-y-6">
      <PageHeader 
        title="Product QR Directory" 
        description="A read-only view of products and their QR codes for quick access." 
      />

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products by name or SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 shrink-0">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "shadow-sm bg-background" : ""}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "shadow-sm bg-background" : ""}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No products found matching your search.
          </div>
        ) : viewMode === "list" ? (
          <div className="divide-y divide-border">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex flex-col sm:flex-row sm:items-center p-4 hover:bg-muted/30 transition-colors gap-4">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="h-16 w-16 rounded-xl border border-border bg-muted/50 overflow-hidden shrink-0 flex items-center justify-center mr-4">
                    {product.image_url ? (
                      <img 
                        src={getProductImageUrl(product.image_url)} 
                        alt={product.name}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded-md border border-border/50">
                        {product.sku}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 mt-4 sm:mt-0">
                  <ProductQRDialogs product={product} showLabels={true} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-muted/5">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                <div className="aspect-square bg-muted/30 relative overflow-hidden flex items-center justify-center">
                  {product.image_url ? (
                    <img 
                      src={getProductImageUrl(product.image_url)} 
                      alt={product.name}
                      className="object-contain w-full h-full p-2 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-mono bg-background/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-md border border-border/50 shadow-sm">
                      {product.sku}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-4 flex-1" title={product.name}>
                    {product.name}
                  </h3>
                  
                  <div className="pt-4 border-t border-border/50 mt-auto flex justify-center">
                    <ProductQRDialogs product={product} showLabels={false} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
