import { supabase } from '@/lib/supabase';
import { Product, ProductCategory } from '@/types/products';

export const getProductImageUrl = (filename?: string | null) => {
  if (!filename) return undefined;
  if (filename.startsWith('http')) return filename;
  const { data } = supabase.storage.from('products').getPublicUrl(filename);
  return data.publicUrl;
};

export const productService = {
  // Categories
  async getCategories(): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data as ProductCategory[];
  },

  async createCategory(category: Omit<ProductCategory, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('product_categories')
      .insert([category]);
    if (error) throw error;
  },

  async updateCategory(category: ProductCategory): Promise<void> {
    const { error } = await supabase
      .from('product_categories')
      .update(category)
      .eq('id', category.id);
    if (error) throw error;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    // Fetch products and categories to map them
    const [{ data: products, error: prodError }, { data: categories, error: catError }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('product_categories').select('*')
    ]);

    if (prodError) throw prodError;
    if (catError) throw catError;

    return (products || []).map(p => ({
      ...p,
      category: categories?.find(c => c.slug === p.category_slug)
    })) as Product[];
  },

  async createProduct(product: Product): Promise<void> {
    const { category, ...productBase } = product;

    const { error: productError } = await supabase
      .from('products')
      .insert([productBase]);

    if (productError) throw productError;
  },

  async updateProduct(product: Product): Promise<void> {
    const { category, ...productBase } = product;
    console.log("Updating product:", productBase.id, "with payload:", productBase);

    const { error: productError, data } = await supabase
      .from('products')
      .update(productBase)
      .eq('id', productBase.id)
      .select();

    console.log("Update response data:", data, "error:", productError);
    if (productError) throw productError;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  
  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
