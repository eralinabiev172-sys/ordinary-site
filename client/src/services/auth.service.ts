import { API_URL } from '../api/api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
};

type LoginResponse = {
  message: string;
  accessToken: string;
  user: AuthUser;
};

type RegisterResponse = {
  message: string;
  accessToken: string;
  user: AuthUser;
};

export async function loginUser(
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

  return data as LoginResponse;
}

export async function registerUser(
  name: string,
  email: string,
  phone: string,
  password: string,
): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      phone: phone.trim() || undefined,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Не удалось зарегистрироваться');
  }

  return data as RegisterResponse;
}
export async function getProfile(token: string): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Не удалось получить профиль');
  }

  return data as AuthUser;
}