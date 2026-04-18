// Data Transfer Objects for Product API
// These match exactly what the backend sends and receives

export interface ProductApiResponse {
  status: string;
  data: {
    product: {
      _id: string;
      name: string;
      slug: string;
      description: string;
      price: number;
      compareAtPrice: number | null;
      category: string;
      gender: "men" | "women" | "unisex";
      images: string[];
      variants: { size: string; stock: number }[];
      isActive: boolean;
      createdAt: string;
    };
  };
}

export interface ProductsApiResponse {
  status: string;
  results: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
  };
  data: {
    products: ProductApiResponse["data"]["product"][];
  };
}

export interface CreateProductRequest {
  name: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  gender: "men" | "women" | "unisex";
  description?: string;
  images: string[];
  variants: { size: string; stock: number }[];
}

export type UpdateProductRequest = Partial<CreateProductRequest>;