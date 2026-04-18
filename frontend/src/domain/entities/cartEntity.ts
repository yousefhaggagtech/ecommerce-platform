// Represents the Cart entity — lives in client state (Zustand) only
export interface ICartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
}

export interface ICart {
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
}