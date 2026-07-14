import { API_URL } from '../api/api';

export type ProductImage = {
  id: string;
  url: string;
  filename: string;
  alt: string | null;
  position: number;
  isPrimary: boolean;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: string;
  oldPrice: string | null;
  quantity: number;
  unit: 'PIECE' | 'KG' | 'GRAM' | 'PACK' | 'BOX';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
  categoryId: string;
  category: ProductCategory;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export async function getProducts(): Promise<AdminProduct[]> {
  const response = await fetch(`${API_URL}/products`);

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Не удалось загрузить товары');
  }

  return data as AdminProduct[];
}

export async function deleteProduct(
  token: string,
  productId: string,
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/products/${productId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Не удалось удалить товар');
  }

  return data as { message: string };
}
export type CreateProductPayload = {
  name: string;
  slug: string;
  sku: string;
  description?: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  unit: AdminProduct['unit'];
  status: AdminProduct['status'];
  isFeatured: boolean;
  categoryId: string;
};

export async function createProduct(
  token: string,
  payload: CreateProductPayload,
): Promise<AdminProduct> {
  const response = await fetch(`${API_URL}/products`, {
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

    throw new Error(message ?? 'Не удалось создать товар');
  }

  return data as AdminProduct;
}
export type UpdateProductPayload = Partial<CreateProductPayload>;

export async function updateProduct(
  token: string,
  productId: string,
  payload: UpdateProductPayload,
): Promise<AdminProduct> {
  const response = await fetch(
    `${API_URL}/products/${productId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Не удалось обновить товар');
  }

  return data as AdminProduct;
}
export async function uploadProductImage(
  token: string,
  productId: string,
  file: File,
): Promise<ProductImage> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(
    `${API_URL}/products/${productId}/images`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Не удалось загрузить изображение');
  }

  return data as ProductImage;
}

export async function deleteProductImage(
  token: string,
  productId: string,
  imageId: string,
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/products/${productId}/images/${imageId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(message ?? 'Не удалось удалить изображение');
  }

  return data as { message: string };
}