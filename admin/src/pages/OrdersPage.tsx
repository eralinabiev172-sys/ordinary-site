import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Search,
} from 'lucide-react';
import {
  getOrders,
  updateOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from '../services/orders.service';

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Ожидает подтверждения',
  CONFIRMED: 'Подтверждён',
  SHIPPED: 'Отправлен',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
};

function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<OrderStatus | 'ALL'>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadOrders();
  }, []);

  async function loadOrders() {
    const token = localStorage.getItem('adminAccessToken');

    if (!token) {
      setError('Токен администратора не найден');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const data = await getOrders(token);
      setOrders(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Не удалось загрузить заказы',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(
    order: AdminOrder,
    status: OrderStatus,
  ) {
    const token = localStorage.getItem('adminAccessToken');

    if (!token) {
      setError('Токен администратора не найден');
      return;
    }

    try {
      setUpdatingOrderId(order.id);
      setError('');
      setMessage('');

      const updatedOrder = await updateOrderStatus(
        token,
        order.id,
        status,
      );

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === updatedOrder.id
            ? updatedOrder
            : currentOrder,
        ),
      );

      setMessage('Статус заказа успешно изменён');
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Не удалось изменить статус',
      );
    } finally {
      setUpdatingOrderId('');
    }
  }

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        order.status === statusFilter;

      const matchesSearch =
        !normalizedSearch ||
        order.id.toLowerCase().includes(normalizedSearch) ||
        order.customerName
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.customerPhone
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.user.email
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  return (
    <section className="admin-orders-page">
      <div className="admin-page-heading">
        <div>
          <p>Управление продажами</p>
          <h1>Заказы</h1>
        </div>

        <span>
          Всего заказов: <strong>{orders.length}</strong>
        </span>
      </div>

      <div className="admin-orders-toolbar">
        <label className="admin-search">
          <Search size={19} />

          <input
            type="search"
            value={search}
            placeholder="Поиск по заказу, имени, телефону или email"
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </label>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as OrderStatus | 'ALL',
            )
          }
        >
          <option value="ALL">Все статусы</option>
          <option value="PENDING">Ожидает</option>
          <option value="CONFIRMED">Подтверждён</option>
          <option value="SHIPPED">Отправлен</option>
          <option value="COMPLETED">Завершён</option>
          <option value="CANCELLED">Отменён</option>
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
          Загрузка заказов...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-panel-card admin-empty-state">
          <h2>Заказы не найдены</h2>
          <p>Измените параметры поиска или фильтра.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filteredOrders.map((order) => {
            const isExpanded =
              expandedOrderId === order.id;

            const isUpdating =
              updatingOrderId === order.id;

            return (
              <article
                className="admin-order-card"
                key={order.id}
              >
                <div className="admin-order-card__main">
                  <button
                    className="admin-order-card__expand"
                    type="button"
                    onClick={() =>
                      setExpandedOrderId(
                        isExpanded ? '' : order.id,
                      )
                    }
                  >
                    {isExpanded ? (
                      <ChevronUp size={19} />
                    ) : (
                      <ChevronDown size={19} />
                    )}
                  </button>

                  <div className="admin-order-card__number">
                    <span>Заказ</span>
                    <strong>
                      #{order.id.slice(0, 8)}
                    </strong>
                  </div>

                  <div className="admin-order-card__customer">
                    <strong>{order.customerName}</strong>
                    <span>{order.user.email}</span>
                  </div>

                  <div>
                    <span className="admin-order-label">
                      Сумма
                    </span>
                    <strong>{order.total} сом</strong>
                  </div>

                  <div>
                    <span className="admin-order-label">
                      Дата
                    </span>
                    <strong>
                      {new Date(
                        order.createdAt,
                      ).toLocaleDateString('ru-RU')}
                    </strong>
                  </div>

                  <select
                    className={`admin-order-status-select admin-order-status-select--${order.status.toLowerCase()}`}
                    value={order.status}
                    disabled={isUpdating}
                    onChange={(event) =>
                      handleStatusChange(
                        order,
                        event.target.value as OrderStatus,
                      )
                    }
                  >
                    {Object.entries(statusLabels).map(
                      ([status, label]) => (
                        <option key={status} value={status}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {isExpanded && (
                  <div className="admin-order-details">
                    <div className="admin-order-details__info">
                      <div>
                        <Phone size={18} />
                        <span>Телефон</span>
                        <strong>
                          {order.customerPhone}
                        </strong>
                      </div>

                      <div>
                        <MapPin size={18} />
                        <span>Адрес</span>
                        <strong>{order.address}</strong>
                      </div>
                    </div>

                    {order.comment && (
                      <div className="admin-order-comment">
                        <span>Комментарий покупателя</span>
                        <p>{order.comment}</p>
                      </div>
                    )}

                    <div className="admin-order-items">
                      <div className="admin-order-items__heading">
                        <h3>Состав заказа</h3>
                        <span>
                          Позиций: {order.items.length}
                        </span>
                      </div>

                      {order.items.map((item) => (
                        <div
                          className="admin-order-item"
                          key={item.id}
                        >
                          <div>
                            <strong>
                              {item.productName ||
                                item.product?.name}
                            </strong>
                            <span>
                              ID: {item.productId.slice(0, 8)}
                            </span>
                          </div>

                          <span>
                            {item.quantity} × {item.price} сом
                          </span>

                          <strong>
                            {item.subtotal} сом
                          </strong>
                        </div>
                      ))}

                      <div className="admin-order-total">
                        <span>Итоговая сумма</span>
                        <strong>{order.total} сом</strong>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default OrdersPage;