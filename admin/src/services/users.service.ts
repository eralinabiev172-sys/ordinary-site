import { API_URL } from '../api/api';

export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
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

export async function getUsers(
  token: string,
): Promise<AdminUser[]> {
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return readResponse(response) as Promise<AdminUser[]>;
}

export async function updateUser(
  token: string,
  userId: string,
  payload: UpdateUserPayload,
): Promise<AdminUser> {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return readResponse(response) as Promise<AdminUser>;
}

export async function deleteUser(
  token: string,
  userId: string,
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return readResponse(response) as Promise<{ message: string }>;
}