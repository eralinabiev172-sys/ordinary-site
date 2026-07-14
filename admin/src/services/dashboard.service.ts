import { API_URL } from '../api/api';

export type DashboardOrder = {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

export type DashboardStatistics = {
  users: number;
  products: number;
  categories: number;
  orders: number;
  revenue: number;
  latestOrders: DashboardOrder[];
};

export async function getDashboardStatistics(
  token: string,
): Promise<DashboardStatistics> {
  const response = await fetch(`${API_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Не удалось загрузить статистику');
  }

  return data as DashboardStatistics;
}