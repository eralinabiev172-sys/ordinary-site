import { API_URL } from '../api/api';

export async function getCart(token: string) {
  const response = await fetch(`${API_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? 'Ошибка загрузки корзины');
  }

  return data;
}

export async function addToCart(
  token: string,
  productId: string,
  quantity = 1,
) {
  const response = await fetch(`${API_URL}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? 'Ошибка');
  }

  return data;
}

export async function removeCartItem(
  token: string,
  itemId: string,
) {
  const response = await fetch(
    `${API_URL}/cart/items/${itemId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.json();
}

export async function updateCartItem(
  token: string,
  itemId: string,
  quantity: number,
) {
  const response = await fetch(
    `${API_URL}/cart/items/${itemId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quantity,
      }),
    },
  );

  return response.json();
}