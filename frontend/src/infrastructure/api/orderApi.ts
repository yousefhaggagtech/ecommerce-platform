import axiosInstance from "@/infrastructure/http/axiosIstance";
import {
  OrderApiResponse,
  OrdersApiResponse,
  UpdateOrderStatusRequest,
} from "@/infrastructure/dto/orderDto";
import { IOrderRepository, IPlaceOrderPayload } from "@/domain/repositories/orderRepository";
import {
  IOrder,
  IOrdersResponse,
  OrderStatus,
} from "@/domain/entities/orderEntity";

// ─── Helper: map API order to domain entity ───────────────────────────────────

const mapToOrder = (raw: OrderApiResponse["data"]["order"]): IOrder => ({
  id: raw._id,
  user: raw.user,
  items: raw.items.map((item) => ({
    product: {
      id: item.product._id,
      name: item.product.name,
      images: item.product.images,
    },
    size: item.size,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount,
    finalPrice: item.finalPrice,
  })),
  shippingAddress: raw.shippingAddress,
  totalPrice: raw.totalPrice,
  status: raw.status,
  stripePaymentId: raw.stripePaymentId,
  createdAt: raw.createdAt,
});

// ─── Order API Implementation ─────────────────────────────────────────────────

export const orderApi: IOrderRepository = {
  place: async (payload: IPlaceOrderPayload): Promise<IOrder> => {
    const { data } = await axiosInstance.post<OrderApiResponse>(
      "/orders",
      payload
    );
    return mapToOrder(data.data.order);
  },

  getMyOrders: async (): Promise<IOrdersResponse> => {
    const { data } = await axiosInstance.get<OrdersApiResponse>(
      "/orders/my-orders"
    );
    return {
      orders: data.data.orders.map(mapToOrder),
    };
  },

  getById: async (id: string): Promise<IOrder> => {
    const { data } = await axiosInstance.get<OrderApiResponse>(
      `/orders/${id}`
    );
    return mapToOrder(data.data.order);
  },

  getAll: async (filters?: {
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }): Promise<IOrdersResponse> => {
    const { data } = await axiosInstance.get<OrdersApiResponse>("/orders", {
      params: filters,
    });
    return {
      orders: data.data.orders.map(mapToOrder),
      pagination: data.pagination,
    };
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<IOrder> => {
    const { data } = await axiosInstance.put<OrderApiResponse>(
      `/orders/${id}/status`,
      { status } as UpdateOrderStatusRequest
    );
    return mapToOrder(data.data.order);
  },
};