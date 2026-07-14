import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/auth.service';
import type { AuthUser } from '../services/auth.service';
import {
  getMyOrders,
  type Order,
} from '../services/orders.service';

function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const [profile, userOrders] = await Promise.all([
          getProfile(token),
          getMyOrders(token),
        ]);

        setUser(profile);
        setOrders(userOrders);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить личный кабинет',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, [navigate]);

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <div className="container">
          <h1>Личный кабинет</h1>
          <p>Загрузка...</p>
        </div>
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="page-section">
        <div className="container">
          <h1>Ошибка</h1>
          <p className="catalog-error">
            {error || 'Пользователь не найден'}
          </p>
        </div>
      </section>
    );
  }

  const statusLabels: Record<Order['status'], string> = {
    PENDING: 'Ожидает подтверждения',
    CONFIRMED: 'Подтверждён',
    SHIPPED: 'Отправлен',
    COMPLETED: 'Завершён',
    CANCELLED: 'Отменён',
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="profile-layout">
          <aside className="profile-card">
            <h1>Личный кабинет</h1>

            <div className="profile-row">
              <span>Имя</span>
              <strong>{user.name}</strong>
            </div>

            <div className="profile-row">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>

            <div className="profile-row">
              <span>Телефон</span>
              <strong>{user.phone ?? 'Не указан'}</strong>
            </div>

            <div className="profile-row">
              <span>Роль</span>
              <strong>{user.role}</strong>
            </div>

            <div className="profile-row">
              <span>Статус</span>
              <strong>{user.status}</strong>
            </div>

            <button
              className="primary-button"
              type="button"
              onClick={logout}
            >
              Выйти
            </button>
          </aside>

          <div className="orders-section">
            <div className="orders-section__heading">
              <div>
                <p className="catalog-label">Покупки</p>
                <h2>Мои заказы</h2>
              </div>

              <span>{orders.length}</span>
            </div>

            {orders.length === 0 ? (
              <div className="orders-empty">
                <h3>Заказов пока нет</h3>
                <p>
                  После оформления заказа он появится здесь.
                </p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <article className="order-card" key={order.id}>
                    <div className="order-card__header">
                      <div>
                        <p>Заказ</p>
                        <strong>#{order.id.slice(0, 8)}</strong>
                      </div>

                      <span
                        className={`order-status order-status--${order.status.toLowerCase()}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </div>

                    <div className="order-card__items">
                      {order.items.map((item) => (
                        <div
                          className="order-card__item"
                          key={item.id}
                        >
                          <span>{item.productName}</span>

                          <span>
                            {item.quantity} × {item.price} сом
                          </span>

                          <strong>{item.subtotal} сом</strong>
                        </div>
                      ))}
                    </div>

                    <div className="order-card__footer">
                      <span>
                        {new Date(
                          order.createdAt,
                        ).toLocaleString('ru-RU')}
                      </span>

                      <strong>Итого: {order.total} сом</strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;