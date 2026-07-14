export type ProductImage = {
  id: string;
  url: string;
  filename: string;
  alt: string | null;
  position: number;
  isPrimary: boolean;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: string;
  oldPrice: string | null;
  quantity: number;
  unit: 'PIECE' | 'KG' | 'GRAM' | 'PACK' | 'BOX';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
  categoryId: string;
  category: ProductCategory;
  images: ProductImage[];
};