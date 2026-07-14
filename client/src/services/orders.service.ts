import { API_URL } from '../api/api';

export type CreateOrderPayload = {
  customerName: string;
  customerPhone: string;
  address: string;
  comment?: string;
};

export async function createOrder(
  token: string,
  payload: CreateOrderPayload,
) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Не удалось оформить заказ');
  }

  return data;
}
export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  price: string;
  quantity: number;
  subtotal: string;
};

export type Order = {
  id: string;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'SHIPPED'
    | 'COMPLETED'
    | 'CANCELLED';
  customerName: string;
  customerPhone: string;
  address: string;
  comment: string | null;
  total: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export async function getMyOrders(
  token: string,
): Promise<Order[]> {
  const response = await fetch(`${API_URL}/orders/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Не удалось загрузить заказы');
  }

  return data as Order[];
}