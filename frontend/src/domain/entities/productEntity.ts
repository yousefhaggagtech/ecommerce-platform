// Represents the core Product entity across the entire application

export interface IVariant {
  size: string;
  stock: number;
}

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  gender: "men" | "women" | "unisex";
  images: string[];
  variants: IVariant[];
  isActive: boolean;
  createdAt: string;
}

// Shape of the paginated products API response
export interface IProductsResponse {
  products: IProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
  };
}

// Filters passed to the products query
export interface IProductFilters {
  category?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "price_asc" | "price_desc" | "newest";
  page?: number;
  limit?: number;
}