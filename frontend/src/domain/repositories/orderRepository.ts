import {
  IOrder,
  IOrdersResponse,
  IShippingAddress,
  OrderStatus,
} from "@/domain/entities/orderEntity";

// Defines the contract for all order operations
// Infrastructure layer must implement this interface

export interface IPlaceOrderPayload {
  items: {
    productId: string;
    size: string;
    quantity: number;
  }[];
  shippingAddress: IShippingAddress;
}

export interface IOrderRepository {
  place(payload: IPlaceOrderPayload): Promise<IOrder>;
  getMyOrders(): Promise<IOrdersResponse>;
  getById(id: string): Promise<IOrder>;
  getAll(filters?: {
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }): Promise<IOrdersResponse>;
  updateStatus(id: string, status: OrderStatus): Promise<IOrder>;
}