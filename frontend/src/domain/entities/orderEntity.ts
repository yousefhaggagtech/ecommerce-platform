// Represents the core Order entity across the entire application

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrderItem {
  product: {
    id: string;
    name: string;
    images: string[];
  };
  size: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  finalPrice: number;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  governorate: string;
}

export interface IOrder {
  id: string;
  user: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  totalPrice: number;
  status: OrderStatus;
  stripePaymentId: string | null;
  createdAt: string;
}

// Shape of the paginated orders API response
export interface IOrdersResponse {
  orders: IOrder[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
  };
}