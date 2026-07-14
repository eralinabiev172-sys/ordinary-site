import { API_URL } from '../api/api';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED';
};

type LoginResponse = {
  message: string;
  accessToken: string;
  user: AdminUser;
};

export async function loginAdmin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Не удалось выполнить вход');
  }

  if (data.user.role !== 'ADMIN') {
    throw new Error('У этого аккаунта нет прав администратора');
  }

  return data as LoginResponse;
}