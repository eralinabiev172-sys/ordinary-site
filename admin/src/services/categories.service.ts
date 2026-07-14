import { API_URL } from '../api/api';

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
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

export async function getCategories(): Promise<AdminCategory[]> {
  const response = await fetch(`${API_URL}/categories`);

  return readResponse(response) as Promise<AdminCategory[]>;
}

export async function createCategory(
  token: string,
  payload: CategoryPayload,
): Promise<AdminCategory> {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return readResponse(response) as Promise<AdminCategory>;
}

export async function updateCategory(
  token: string,
  categoryId: string,
  payload: Partial<CategoryPayload>,
): Promise<AdminCategory> {
  const response = await fetch(
    `${API_URL}/categories/${categoryId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  return readResponse(response) as Promise<AdminCategory>;
}

export async function deleteCategory(
  token: string,
  categoryId: string,
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/categories/${categoryId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return readResponse(response) as Promise<{
    message: string;
  }>;
}