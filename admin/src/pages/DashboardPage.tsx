import { useEffect, useState } from 'react';
import {
  Boxes,
  FolderTree,
  ShoppingBag,
  Users,
  WalletCards,
} from 'lucide-react';
import {
  getDashboardStatistics,
  type DashboardStatistics,
} from '../services/dashboard.service';

function DashboardPage() {
  const [statistics, setStatistics] =
    useState<DashboardStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem('adminAccessToken');

      if (!token) {
        setError('Токен администратора не найден');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const data = await getDashboardStatistics(token);
        setStatistics(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить Dashboard',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <section>
        <h1>Dashboard</h1>
        <p>Загрузка статистики...</p>
      </section>
    );
  }

  if (error || !statistics) {
    return (
      <section>
        <h1>Dashboard</h1>
        <div className="admin-error">
          {error || 'Статистика не найдена'}
        </div>
      </section>
    );
  }

  const cards = [
    {
      label: 'Пользователи',
      value: statistics.users,
      icon: Users,
    },
    {
      label: 'Товары',
      value: statistics.products,
      icon: Boxes,
    },
    {
      label: 'Категории',
      value: statistics.categories,
      icon: FolderTree,
    },
    {
      label: 'Заказы',
      value: statistics.orders,
      icon: ShoppingBag,
    },
    {
      label: 'Выручка',
      value: `${statistics.revenue} сом`,
      icon: WalletCards,
    },
  ];

  return (
    <section className="dashboard-page">
      <div className="admin-page-heading">
        <div>
          <p>Обзор магазина</p>
          <h1>Dashboard</h1>
        </div>

        <span>
          {new Date().toLocaleDateString('ru-RU')}
        </span>
      </div>

      <div className="dashboard-stats">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article className="dashboard-stat-card" key={card.label}>
              <div className="dashboard-stat-card__icon">
                <Icon size={22} />
              </div>

              <div>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </div>
            </article>
          );
        })}
      </div>

      <section className="dashboard-orders">
        <div className="dashboard-orders__heading">
          <div>
            <p>Последние события</p>
            <h2>Последние заказы</h2>
          </div>
        </div>

        {statistics.latestOrders.length === 0 ? (
          <div className="dashboard-empty">
            Заказов пока нет.
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Заказ</th>
                  <th>Покупатель</th>
                  <th>Email</th>
                  <th>Статус</th>
                  <th>Сумма</th>
                  <th>Дата</th>
                </tr>
              </thead>

              <tbody>
                {statistics.latestOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0, 8)}</td>
                    <td>{order.user.name}</td>
                    <td>{order.user.email}</td>
                    <td>{order.status}</td>
                    <td>{order.total} сом</td>
                    <td>
                      {new Date(order.createdAt).toLocaleString(
                        'ru-RU',
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default DashboardPage;