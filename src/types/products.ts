export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  category_slug?: string | null;
  slug: string;
  name: string;
  description: string;
  tag?: string | null;
  image_url?: string | null;
  uses?: string | null;
  dosage?: string | null;
  sizes: string[];
  tech_title?: string | null;
  tech_composition?: string | null;
  tech_crops?: string | null;
  tech_dose?: string | null;
  qr_data?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: ProductCategory;
}
