import axiosInstance from "@/infrastructure/http/axiosIstance";
import {
  ProductApiResponse,
  ProductsApiResponse,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/infrastructure/dto/productDto";
import { IProductRepository } from "@/domain/repositories/productRepository";
import {
  IProduct,
  IProductFilters,
  IProductsResponse,
} from "@/domain/entities/productEntity";

// ─── Helper: map API product to domain entity ─────────────────────────────────

const mapToProduct = (
  raw: ProductApiResponse["data"]["product"]
): IProduct => ({
  id: raw._id,
  name: raw.name,
  slug: raw.slug,
  description: raw.description,
  price: raw.price,
  compareAtPrice: raw.compareAtPrice,
  category: raw.category,
  gender: raw.gender,
  images: raw.images,
  variants: raw.variants,
  isActive: raw.isActive,
  createdAt: raw.createdAt,
});

// ─── Product API Implementation ───────────────────────────────────────────────

export const productApi: IProductRepository = {
  getAll: async (filters?: IProductFilters): Promise<IProductsResponse> => {
    const { data } = await axiosInstance.get<ProductsApiResponse>(
      "/products",
      { params: filters }
    );
    return {
      products: data.data.products.map(mapToProduct),
      pagination: data.pagination,
    };
  },

  getById: async (id: string): Promise<IProduct> => {
    const { data } = await axiosInstance.get<ProductApiResponse>(
      `/products/${id}`
    );
    return mapToProduct(data.data.product);
  },

  create: async (payload: CreateProductRequest): Promise<IProduct> => {
    const { data } = await axiosInstance.post<ProductApiResponse>(
      "/products",
      payload
    );
    return mapToProduct(data.data.product);
  },

  update: async (
    id: string,
    payload: UpdateProductRequest
  ): Promise<IProduct> => {
    const { data } = await axiosInstance.patch<ProductApiResponse>(
      `/products/${id}`,
      payload
    );
    return mapToProduct(data.data.product);
  },

  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },
};