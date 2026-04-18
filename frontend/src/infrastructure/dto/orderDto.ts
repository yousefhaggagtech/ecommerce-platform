// Data Transfer Objects for Order API
// These match exactly what the backend sends and receives

import { OrderStatus } from "@/domain/entities/orderEntity";

export interface PlaceOrderRequest {
  items: {
    productId: string;
    size: string;
    quantity: number;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    governorate: string;
  };
}

export interface OrderApiResponse {
  status: string;
  data: {
    order: {
      _id: string;
      user: string;
      items: {
        product: { _id: string; name: string; images: string[] };
        size: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        finalPrice: number;
      }[];
      shippingAddress: {
        firstName: string;
        lastName: string;
        phone: string;
        street: string;
        city: string;
        governorate: string;
      };
      totalPrice: number;
      status: OrderStatus;
      stripePaymentId: string | null;
      createdAt: string;
    };
  };
}

export interface OrdersApiResponse {
  status: string;
  results: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
  };
  data: {
    orders: OrderApiResponse["data"]["order"][];
  };
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}