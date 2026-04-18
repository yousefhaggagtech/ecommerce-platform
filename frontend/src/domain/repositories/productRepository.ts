import {
  IProduct,
  IProductFilters,
  IProductsResponse,
} from "@/domain/entities/productEntity";

// Defines the contract for all product operations
// Infrastructure layer must implement this interface

export interface IProductRepository {
  getAll(filters?: IProductFilters): Promise<IProductsResponse>;
  getById(id: string): Promise<IProduct>;
  create(data: Partial<IProduct>): Promise<IProduct>;
  update(id: string, data: Partial<IProduct>): Promise<IProduct>;
  remove(id: string): Promise<void>;
}