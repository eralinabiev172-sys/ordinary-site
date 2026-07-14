import { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  CheckCircle2,
  Search,
  Shield,
  Trash2,
  UserRound,
} from 'lucide-react';
import {
  deleteUser,
  getUsers,
  updateUser,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from '../services/users.service';

function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] =
    useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] =
    useState<UserStatus | 'ALL'>('ALL');
  const [updatingUserId, setUpdatingUserId] = useState('');
  const [deletingUserId, setDeletingUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    const token = localStorage.getItem('adminAccessToken');

    if (!token) {
      setError('Токен администратора не найден');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const data = await getUsers(token);
      setUsers(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Не удалось загрузить пользователей',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRoleChange(
    user: AdminUser,
    role: UserRole,
  ) {
    const token = localStorage.getItem('adminAccessToken');

    if (!token) {
      setError('Токен администратора не найден');
      return;
    }

    try {
      setUpdatingUserId(user.id);
      setError('');
      setMessage('');

      const updatedUser = await updateUser(
        token,
        user.id,
        { role },
      );

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id
            ? updatedUser
            : currentUser,
        ),
      );

      setMessage('Роль пользователя изменена');
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Не удалось изменить роль',
      );
    } finally {
      setUpdatingUserId('');
    }
  }

  async function handleStatusChange(
    user: AdminUser,
    status: UserStatus,
  ) {
    const token = localStorage.getItem('adminAccessToken');

    if (!token) {
      setError('Токен администратора не найден');
      return;
    }

    try {
      setUpdatingUserId(user.id);
      setError('');
      setMessage('');

      const updatedUser = await updateUser(
        token,
        user.id,
        { status },
      );

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id
            ? updatedUser
            : currentUser,
        ),
      );

      setMessage(
        status === 'BLOCKED'
          ? 'Пользователь заблокирован'
          : 'Пользователь разблокирован',
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Не удалось изменить статус',
      );
    } finally {
      setUpdatingUserId('');
    }
  }

  async function handleDelete(user: AdminUser) {
    const storedAdminValue =
      localStorage.getItem('adminUser');

    if (storedAdminValue) {
      try {
        const currentAdmin = JSON.parse(
          storedAdminValue,
        ) as { id?: string };

        if (currentAdmin.id === user.id) {
          setError(
            'Нельзя удалить собственный аккаунт из текущей сессии',
          );
          return;
        }
      } catch {
        // Проверка продолжится на backend.
      }
    }

    const confirmed = window.confirm(
      `Удалить пользователя «${user.name}»?`,
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
      setDeletingUserId(user.id);
      setError('');
      setMessage('');

      const result = await deleteUser(token, user.id);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) => currentUser.id !== user.id,
        ),
      );

      setMessage(result.message);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Не удалось удалить пользователя',
      );
    } finally {
      setDeletingUserId('');
    }
  }

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        roleFilter === 'ALL' || user.role === roleFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        user.status === statusFilter;

      const matchesSearch =
        !normalizedSearch ||
        user.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        user.email
          .toLowerCase()
          .includes(normalizedSearch) ||
        (user.phone ?? '')
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <section className="admin-users-page">
      <div className="admin-page-heading">
        <div>
          <p>Управление доступом</p>
          <h1>Пользователи</h1>
        </div>

        <span>
          Всего пользователей:{' '}
          <strong>{users.length}</strong>
        </span>
      </div>

      <div className="admin-users-toolbar">
        <label className="admin-search">
          <Search size={19} />

          <input
            type="search"
            value={search}
            placeholder="Поиск по имени, email или телефону"
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </label>

        <select
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(
              event.target.value as UserRole | 'ALL',
            )
          }
        >
          <option value="ALL">Все роли</option>
          <option value="USER">Пользователи</option>
          <option value="ADMIN">Администраторы</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as UserStatus | 'ALL',
            )
          }
        >
          <option value="ALL">Все статусы</option>
          <option value="ACTIVE">Активные</option>
          <option value="BLOCKED">Заблокированные</option>
        </select>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {message && (
        <div className="admin-success-message">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="admin-panel-card">
          Загрузка пользователей...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-panel-card admin-empty-state">
          <h2>Пользователи не найдены</h2>
          <p>Измените параметры поиска или фильтров.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper admin-users-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Телефон</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Регистрация</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const isUpdating =
                  updatingUserId === user.id;
                const isDeleting =
                  deletingUserId === user.id;

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {user.role === 'ADMIN' ? (
                            <Shield size={21} />
                          ) : (
                            <UserRound size={21} />
                          )}
                        </div>

                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{user.phone ?? 'Не указан'}</td>

                    <td>
                      <select
                        className={`admin-user-role admin-user-role--${user.role.toLowerCase()}`}
                        value={user.role}
                        disabled={isUpdating}
                        onChange={(event) =>
                          handleRoleChange(
                            user,
                            event.target.value as UserRole,
                          )
                        }
                      >
                        <option value="USER">
                          Пользователь
                        </option>
                        <option value="ADMIN">
                          Администратор
                        </option>
                      </select>
                    </td>

                    <td>
                      <span
                        className={`admin-user-status admin-user-status--${user.status.toLowerCase()}`}
                      >
                        {user.status === 'ACTIVE'
                          ? 'Активен'
                          : 'Заблокирован'}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        user.createdAt,
                      ).toLocaleDateString('ru-RU')}
                    </td>

                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          title={
                            user.status === 'ACTIVE'
                              ? 'Заблокировать'
                              : 'Разблокировать'
                          }
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusChange(
                              user,
                              user.status === 'ACTIVE'
                                ? 'BLOCKED'
                                : 'ACTIVE',
                            )
                          }
                        >
                          {user.status === 'ACTIVE' ? (
                            <Ban size={17} />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}
                        </button>

                        <button
                          className="admin-danger-button"
                          type="button"
                          title="Удалить"
                          disabled={isDeleting}
                          onClick={() => handleDelete(user)}
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
    </section>
  );
}

export default UsersPage;