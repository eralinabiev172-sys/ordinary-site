import { API_URL } from '../api/api';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export type AdminOrderItem = {
  id: string;
  productId: string;
  productName: string;
  price: string;
  quantity: number;
  subtotal: string;
  product?: {
    id: string;
    name: string;
  };
};

export type AdminOrder = {
  id: string;
  userId: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  address: string;
  comment: string | null;
  total: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  items: AdminOrderItem[];
};

async function readResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Ошибка запроса');
  }

  return data;
}

export async function getOrders(
  token: string,
): Promise<AdminOrder[]> {
  const response = await fetch(`${API_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return readResponse(response) as Promise<AdminOrder[]>;
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus,
): Promise<AdminOrder> {
  const response = await fetch(
    `${API_URL}/orders/${orderId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    },
  );

  return readResponse(response) as Promise<AdminOrder>;
}