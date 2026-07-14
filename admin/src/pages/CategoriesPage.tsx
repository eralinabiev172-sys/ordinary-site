import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  CheckCircle2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type AdminCategory,
  type CategoryPayload,
} from '../services/categories.service';

const initialForm: CategoryPayload = {
  name: '',
  slug: '',
  description: '',
  isActive: true,
};

function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>(
    [],
  );
  const [search, setSearch] = useState('');
  const [form, setForm] =
    useState<CategoryPayload>(initialForm);
  const [editingCategory, setEditingCategory] =
    useState<AdminCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingCategoryId, setUpdatingCategoryId] =
    useState('');
  const [deletingCategoryId, setDeletingCategoryId] =
    useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setIsLoading(true);
      setError('');

      const data = await getCategories();
      setCategories(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Не удалось загрузить категории',
      );
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setEditingCategory(null);
    setForm(initialForm);
    setError('');
    setMessage('');
    setIsModalOpen(true);
  }

  function openEditModal(category: AdminCategory) {
    setEditingCategory(category);

    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      isActive: category.isActive,
    });

    setError('');
    setMessage('');
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingCategory(null);
    setForm(initialForm);
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

    const payload: CategoryPayload = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      description: form.description?.trim() || undefined,
      isActive: form.isActive,
    };

    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');

      if (editingCategory) {
        const updatedCategory = await updateCategory(
          token,
          editingCategory.id,
          payload,
        );

        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === updatedCategory.id
              ? updatedCategory
              : category,
          ),
        );

        setMessage('Категория успешно обновлена');
      } else {
        const createdCategory = await createCategory(
          token,
          payload,
        );

        setCategories((currentCategories) => [
          createdCategory,
          ...currentCategories,
        ]);

        setMessage('Категория успешно создана');
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setForm(initialForm);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : editingCategory
            ? 'Не удалось обновить категорию'
            : 'Не удалось создать категорию',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(
    category: AdminCategory,
  ) {
    const token = localStorage.getItem('adminAccessToken');

    if (!token) {
      setError('Токен администратора не найден');
      return;
    }

    try {
      setUpdatingCategoryId(category.id);
      setError('');
      setMessage('');

      const updatedCategory = await updateCategory(
        token,
        category.id,
        {
          isActive: !category.isActive,
        },
      );

      setCategories((currentCategories) =>
        currentCategories.map((currentCategory) =>
          currentCategory.id === updatedCategory.id
            ? updatedCategory
            : currentCategory,
        ),
      );

      setMessage(
        updatedCategory.isActive
          ? 'Категория включена'
          : 'Категория отключена',
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Не удалось изменить состояние категории',
      );
    } finally {
      setUpdatingCategoryId('');
    }
  }

  async function handleDelete(category: AdminCategory) {
    const confirmed = window.confirm(
      `Удалить категорию «${category.name}»?`,
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
      setDeletingCategoryId(category.id);
      setError('');
      setMessage('');

      const result = await deleteCategory(
        token,
        category.id,
      );

      setCategories((currentCategories) =>
        currentCategories.filter(
          (currentCategory) =>
            currentCategory.id !== category.id,
        ),
      );

      setMessage(result.message);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Не удалось удалить категорию',
      );
    } finally {
      setDeletingCategoryId('');
    }
  }

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        category.slug
          .toLowerCase()
          .includes(normalizedSearch) ||
        (category.description ?? '')
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [categories, search]);

  return (
    <section className="admin-categories-page">
      <div className="admin-page-heading">
        <div>
          <p>Структура каталога</p>
          <h1>Категории</h1>
        </div>

        <button
          className="admin-primary-button"
          type="button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Добавить категорию
        </button>
      </div>

      <div className="admin-categories-toolbar">
        <label className="admin-search">
          <Search size={19} />

          <input
            type="search"
            value={search}
            placeholder="Поиск по названию, slug или описанию"
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </label>

        <span>
          Найдено категорий:{' '}
          <strong>{filteredCategories.length}</strong>
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
          Загрузка категорий...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="admin-panel-card admin-empty-state">
          <h2>Категории не найдены</h2>
          <p>
            Создайте первую категорию или измените поиск.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper admin-categories-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Категория</th>
                <th>Slug</th>
                <th>Описание</th>
                <th>Состояние</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((category) => {
                const isUpdating =
                  updatingCategoryId === category.id;
                const isDeleting =
                  deletingCategoryId === category.id;

                return (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                    </td>

                    <td>
                      <code>{category.slug}</code>
                    </td>

                    <td>
                      <span className="admin-category-description">
                        {category.description ??
                          'Описание не указано'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          category.isActive
                            ? 'admin-category-status admin-category-status--active'
                            : 'admin-category-status admin-category-status--inactive'
                        }
                      >
                        {category.isActive
                          ? 'Активна'
                          : 'Отключена'}
                      </span>
                    </td>

                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          title="Редактировать"
                          onClick={() =>
                            openEditModal(category)
                          }
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          title={
                            category.isActive
                              ? 'Отключить'
                              : 'Включить'
                          }
                          disabled={isUpdating}
                          onClick={() =>
                            handleToggleStatus(category)
                          }
                        >
                          {category.isActive ? (
                            <XCircle size={17} />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}
                        </button>

                        <button
                          className="admin-danger-button"
                          type="button"
                          title="Удалить"
                          disabled={isDeleting}
                          onClick={() =>
                            handleDelete(category)
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
            className="admin-modal admin-category-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-modal__header">
              <div>
                <p>
                  {editingCategory
                    ? 'Редактирование'
                    : 'Новая категория'}
                </p>

                <h2>
                  {editingCategory
                    ? 'Редактировать категорию'
                    : 'Добавить категорию'}
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
              className="admin-category-form"
              onSubmit={handleSubmit}
            >
              <label>
                Название

                <input
                  type="text"
                  value={form.name}
                  minLength={2}
                  required
                  placeholder="Сухофрукты"
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
                  type="text"
                  value={form.slug}
                  minLength={2}
                  required
                  placeholder="suhofrukty"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      slug: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Описание

                <textarea
                  rows={5}
                  value={form.description ?? ''}
                  placeholder="Краткое описание категории"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                />
              </label>

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      isActive: event.target.checked,
                    })
                  }
                />

                Категория активна
              </label>

              <div className="admin-modal__actions">
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
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Сохраняем...'
                    : editingCategory
                      ? 'Сохранить изменения'
                      : 'Создать категорию'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default CategoriesPage;