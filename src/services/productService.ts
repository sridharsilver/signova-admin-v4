import { supabase } from '@/lib/supabase';
import { queryCache } from '@/lib/queryCache';
import { Product, ProductCategory } from '@/types/products';

export const getProductImageUrl = (filename?: string | null) => {
  if (!filename) return undefined;
  if (filename.startsWith('http')) return filename;
  const { data } = supabase.storage.from('products').getPublicUrl(filename);
  return data.publicUrl;
};

// ── Column projections ────────────────────────────────────────────────────────
// Selecting only needed columns reduces network payload and parse time.
const PRODUCT_COLS = [
  'id', 'name', 'slug', 'category_slug', 'tag', 'image_url', 'description',
  'uses', 'dosage', 'sizes', 'is_active', 'tech_title', 'tech_composition',
  'tech_crops', 'tech_dose', 'qr_data', 'created_at',
].join(',');

const CATEGORY_COLS = 'id,name,slug,description,created_at';

// ── Cache keys ────────────────────────────────────────────────────────────────
export const CACHE_KEYS = {
  products: 'products',
  categories: 'product_categories',
} as const;

export const productService = {
  // ── Categories ──────────────────────────────────────────────────────────────

  /** Returns categories from cache; refreshes in background if > 5 min old. */
  async getCategories(onBackground?: (fresh: ProductCategory[]) => void): Promise<ProductCategory[]> {
    return queryCache.get(
      CACHE_KEYS.categories,
      async () => {
        const { data, error } = await supabase
          .from('product_categories')
          .select(CATEGORY_COLS)
          .order('name');
        if (error) throw error;
        return (data ?? []) as ProductCategory[];
      },
      5 * 60_000, // 5-minute TTL — categories change infrequently
      onBackground
    );
  },

  async createCategory(category: Omit<ProductCategory, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase.from('product_categories').insert([category]);
    if (error) throw error;
    queryCache.invalidate(CACHE_KEYS.categories);
  },

  async updateCategory(category: ProductCategory): Promise<void> {
    const { error } = await supabase
      .from('product_categories')
      .update(category)
      .eq('id', category.id);
    if (error) throw error;
    queryCache.invalidate(CACHE_KEYS.categories, CACHE_KEYS.products);
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from('product_categories').delete().eq('id', id);
    if (error) throw error;
    queryCache.invalidate(CACHE_KEYS.categories, CACHE_KEYS.products);
  },

  // ── Products ─────────────────────────────────────────────────────────────────

  /**
   * Fetches products joined with their category in a single parallelised call.
   * Results are cached for 60 s; background refresh keeps data fresh without
   * showing a full loading state on repeat visits.
   */
  async getProducts(onBackground?: (fresh: Product[]) => void): Promise<Product[]> {
    return queryCache.get(
      CACHE_KEYS.products,
      async () => {
        // Fetch products and categories in parallel
        const [{ data: products, error: prodError }, { data: categories, error: catError }] =
          await Promise.all([
            supabase.from('products').select(PRODUCT_COLS).order('created_at', { ascending: false }),
            supabase.from('product_categories').select(CATEGORY_COLS),
          ]);

        if (prodError) throw prodError;
        if (catError) throw catError;

        return (products ?? []).map((p) => ({
          ...p,
          category: categories?.find((c) => c.slug === p.category_slug),
        })) as Product[];
      },
      60_000, // 60-second TTL
      onBackground
    );
  },

  async createProduct(product: Product): Promise<void> {
    const { category, ...productBase } = product;
    const { error } = await supabase.from('products').insert([productBase]);
    if (error) throw error;
    queryCache.invalidate(CACHE_KEYS.products);
  },

  async updateProduct(product: Product): Promise<void> {
    const { category, id, created_at, updated_at, ...productBase } = product as any;
    
    // Clean up undefined fields just in case
    Object.keys(productBase).forEach(key => {
      if (productBase[key] === undefined) delete productBase[key];
    });

    const { data, error } = await supabase
      .from('products')
      .update(productBase)
      .eq('id', product.id)
      .select();
      
    if (error) {
      console.error("Update error:", error);
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      throw new Error("Update failed: Row not found or blocked by database permissions (RLS).");
    }
    
    queryCache.invalidate(CACHE_KEYS.products);
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    queryCache.invalidate(CACHE_KEYS.products);
  },

  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('products').getPublicUrl(fileName);
    return data.publicUrl;
  },
};
