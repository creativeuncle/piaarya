export interface ProductMedia {
  url: string;
  type?: 'image' | 'video';
  altText?: string;
}

export interface ProductVariant {
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  stock?: number;
  image?: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  description?: string;
  seoTitle?: string;
  metaDescription?: string;
  media?: ProductMedia[];
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
  category?: { _id: string; name?: string };
  tags?: string[];
  [key: string]: unknown;
}
