import { API_URL } from '../api/api';
import type { Product } from '../types/product';

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error('Не удалось загрузить товары');
  }

  return response.json() as Promise<Product[]>;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error('Товар не найден');
  }

  return response.json() as Promise<Product>;
}