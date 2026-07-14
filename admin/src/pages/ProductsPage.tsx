import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ImageOff,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { API_URL } from '../api/api';
import {
  getCategories,
  type AdminCategory,
} from '../services/categories.service';
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  getProducts,
  updateProduct,
  uploadProductImage,
  type AdminProduct,
  type CreateProductPayload,
} from '../services/products.service';

const statusLabels: Record<AdminProduct['status'], string> = {
  DRAFT: 'Черновик',
  PUBLISHED: 'Опубликован',
  ARCHIVED: 'Архив',
};

const initialForm: CreateProductPayload = {
  name: '',
  slug: '',
  sku: '',
  description: '',
  price: 0,
  oldPrice: undefined,
  quantity: 0,
  unit: 'KG',
  status: 'DRAFT',
  isFeatured: false,
  categoryId: '',
};

function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [form, setForm] =
    useState<CreateProductPayload>(initialForm);
  const [editingProduct, setEditingProduct] =
    useState<AdminProduct | null>(null);
  const [selectedImageFile, setSelectedImageFile] =
    useState<File | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError('');

      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);

      if (categoriesData.length > 0) {
        setForm((current) => ({
          ...current,
          categoryId:
            current.categoryId || categoriesData[0].id,
        }));
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Не удалось загрузить данные',
      );
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setError('');
    setMessage('');
    setEditingProduct(null);
    setSelectedImageFile(null);

    setForm({
      ...initialForm,
      categoryId: categories[0]?.id ?? '',
    });

    setIsModalOpen(true);
  }

  function openEditModal(product: AdminProduct) {
    setError('');
    setMessage('');
    setEditingProduct(product);
    setSelectedImageFile(null);

    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description ?? '',
      price: Number(product.price),
      oldPrice: product.oldPrice
        ? Number(product.oldPrice)
        : undefined,
      quantity: product.quantity,
      unit: product.unit,
      status: product.status,
      isFeatured: product.isFeatured,
      categoryId: product.categoryId,
    });

    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting || isUploadingImage) {
      return;
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    setSelectedImageFile(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const token = localStorage.getItem('adminAccessToken');

    if (!token) {
      setError('Токен администратора не найден');
      return;
    }

    if (!form.categoryId) {
      setError('Выберите категорию');
      return;
    }

    const payload: CreateProductPayload = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      sku: form.sku.trim().toUpperCase(),
      description: form.description?.trim() || undefined,
      oldPrice:
        form.oldPrice && form.oldPrice > 0
          ? form.oldPrice
          : undefined,
    };

    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');

      let savedProduct: AdminProduct;

      if (editingProduct) {
        savedProduct = await updateProduct(
          token,
          editingProduct.id,
          payload,
        );
      } else {
        savedProduct = await createProduct(token, payload);
      }

      if (selectedImageFile) {
        setIsUploadingImage(true);

        await uploadProductImage(
          token,
          savedProduct.id,
          selectedImageFile,
        );
      }

      const refreshedProducts = await getProducts();
      setProducts(refreshedProducts);

      setMessage(
        editingProduct
          ? 'Товар успешно обновлён'
          : 'Товар успешно создан',
      );

      setIsModalOpen(false);
      setEditingProduct(null);
      setSelectedImageFile(null);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : editingProduct
            ? 'Не удалось обновить товар'
            : 'Не удалось создать товар',
      );
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  }

  async function handleDelete(product: AdminProduct) {
    const confirmed = window.confirm(
      `Удалить товар «${product.name}»?`,
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem('adminAccessToken');

    if (!token) {
      setError('Токен администратора не найден');
      return;
    }

    try {
      setDeletingId(product.id);
      setError('');
      setMessage('');

      const result = await deleteProduct(token, product.id);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (currentProduct) =>
            currentProduct.id !== product.id,
        ),
      );

      setMessage(result.message);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Не удалось удалить товар',
      );
    } finally {
      setDeletingId('');
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!editingProduct) {
      return;
    }

    const token = localStorage.getItem('adminAccessToken');

    if (!token) {
      setError('Токен администратора не найден');
      return;
    }

    const confirmed = window.confirm(
      'Удалить это изображение?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setMessage('');

      await deleteProductImage(
        token,
        editingProduct.id,
        imageId,
      );

      const refreshedProducts = await getProducts();

      setProducts(refreshedProducts);

      const refreshedEditingProduct = refreshedProducts.find(
        (product) => product.id === editingProduct.id,
      );

      if (refreshedEditingProduct) {
        setEditingProduct(refreshedEditingProduct);
      }

      setMessage('Изображение успешно удалено');
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Не удалось удалить изображение',
      );
    }
  }

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.sku
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.category.name
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [products, search]);

  return (
    <section className="admin-products-page">
      <div className="admin-page-heading">
        <div>
          <p>Управление каталогом</p>
          <h1>Товары</h1>
        </div>

        <button
          className="admin-primary-button"
          type="button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Добавить товар
        </button>
      </div>

      <div className="admin-products-toolbar">
        <label className="admin-search">
          <Search size={19} />

          <input
            type="search"
            value={search}
            placeholder="Поиск по названию, SKU или категории"
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </label>

        <span>
          Найдено товаров:{' '}
          <strong>{filteredProducts.length}</strong>
        </span>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {message && (
        <div className="admin-success-message">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="admin-panel-card">
          Загрузка товаров...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-panel-card admin-empty-state">
          <h2>Товары не найдены</h2>
          <p>Создайте первый товар или измените поиск.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper admin-products-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Категория</th>
                <th>Артикул</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const primaryImage =
                  product.images.find(
                    (image) => image.isPrimary,
                  ) ?? product.images[0];

                const imageUrl = primaryImage
                  ? `${API_URL.replace('/api', '')}${primaryImage.url}`
                  : null;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        <div className="admin-product-cell__image">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                            />
                          ) : (
                            <ImageOff size={22} />
                          )}
                        </div>

                        <div>
                          <strong>{product.name}</strong>
                          <span>{product.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td>{product.category.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.price} сом</td>
                    <td>{product.quantity}</td>

                    <td>
                      <span
                        className={`admin-status admin-status--${product.status.toLowerCase()}`}
                      >
                        {statusLabels[product.status]}
                      </span>
                    </td>

                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          title="Редактировать"
                          onClick={() =>
                            openEditModal(product)
                          }
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="admin-danger-button"
                          type="button"
                          title="Удалить"
                          disabled={
                            deletingId === product.id
                          }
                          onClick={() =>
                            handleDelete(product)
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={closeModal}
        >
          <div
            className="admin-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-modal__header">
              <div>
                <p>
                  {editingProduct
                    ? 'Редактирование'
                    : 'Новый товар'}
                </p>

                <h2>
                  {editingProduct
                    ? 'Редактировать товар'
                    : 'Добавить товар'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-product-form"
              onSubmit={handleSubmit}
            >
              <label>
                Название

                <input
                  value={form.name}
                  minLength={2}
                  required
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Slug

                <input
                  value={form.slug}
                  minLength={2}
                  required
                  placeholder="mindal"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      slug: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Артикул

                <input
                  value={form.sku}
                  required
                  placeholder="ALM-002"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      sku: event.target.value,
                    })
                  }
                />
              </label>

              <label className="admin-form-wide">
                Описание

                <textarea
                  rows={4}
                  value={form.description ?? ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                />
              </label>

              <label className="admin-form-wide admin-image-upload">
                Фотография товара

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setSelectedImageFile(
                      event.target.files?.[0] ?? null,
                    )
                  }
                />

                <span>
                  Разрешены JPG, PNG и WEBP. Максимальный
                  размер — 5 МБ.
                </span>

                {selectedImageFile && (
                  <strong>
                    Выбрано: {selectedImageFile.name}
                  </strong>
                )}
              </label>

              {editingProduct &&
                editingProduct.images.length > 0 && (
                  <div className="admin-form-wide admin-product-images">
                    <p>Текущие фотографии</p>

                    <div className="admin-product-images__grid">
                      {editingProduct.images.map((image) => (
                        <div
                          className="admin-product-image"
                          key={image.id}
                        >
                          <img
                            src={`${API_URL.replace('/api', '')}${image.url}`}
                            alt={
                              image.alt ??
                              editingProduct.name
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteImage(image.id)
                            }
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <label>
                Цена

                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  required
                  onChange={(event) =>
                    setForm({
                      ...form,
                      price: Number(event.target.value),
                    })
                  }
                />
              </label>

              <label>
                Старая цена

                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.oldPrice ?? ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      oldPrice: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                />
              </label>

              <label>
                Количество

                <input
                  type="number"
                  min={0}
                  value={form.quantity}
                  required
                  onChange={(event) =>
                    setForm({
                      ...form,
                      quantity: Number(event.target.value),
                    })
                  }
                />
              </label>

              <label>
                Категория

                <select
                  value={form.categoryId}
                  required
                  onChange={(event) =>
                    setForm({
                      ...form,
                      categoryId: event.target.value,
                    })
                  }
                >
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Единица

                <select
                  value={form.unit}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      unit: event.target
                        .value as AdminProduct['unit'],
                    })
                  }
                >
                  <option value="PIECE">Штука</option>
                  <option value="KG">Килограмм</option>
                  <option value="GRAM">Грамм</option>
                  <option value="PACK">Упаковка</option>
                  <option value="BOX">Коробка</option>
                </select>
              </label>

              <label>
                Статус

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target
                        .value as AdminProduct['status'],
                    })
                  }
                >
                  <option value="DRAFT">
                    Черновик
                  </option>
                  <option value="PUBLISHED">
                    Опубликован
                  </option>
                  <option value="ARCHIVED">
                    Архив
                  </option>
                </select>
              </label>

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      isFeatured: event.target.checked,
                    })
                  }
                />

                Рекомендуемый товар
              </label>

              <div className="admin-modal__actions admin-form-wide">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={closeModal}
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={
                    isSubmitting || isUploadingImage
                  }
                >
                  {isUploadingImage
                    ? 'Загружаем фото...'
                    : isSubmitting
                      ? editingProduct
                        ? 'Сохраняем...'
                        : 'Создаём...'
                      : editingProduct
                        ? 'Сохранить изменения'
                        : 'Создать товар'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductsPage;