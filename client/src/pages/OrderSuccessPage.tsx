import { Link, useLocation, useParams } from 'react-router-dom';

type OrderState = {
  order?: {
    id: string;
    total: string | number;
    status: string;
  };
};

function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const state = location.state as OrderState | null;
  const order = state?.order;

  return (
    <section className="page-section">
      <div className="container">
        <div className="order-success">
          <div className="order-success__icon">✓</div>

          <p className="catalog-label">Заказ принят</p>

          <h1>Спасибо за покупку</h1>

          <p>
            Номер заказа: <strong>{id}</strong>
          </p>

          {order && (
            <>
              <p>
                Сумма: <strong>{order.total} сом</strong>
              </p>

              <p>
                Статус: <strong>{order.status}</strong>
              </p>
            </>
          )}

          <div className="order-success__actions">
            <Link className="primary-button" to="/profile">
              Перейти в личный кабинет
            </Link>

            <Link to="/catalog">Продолжить покупки</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrderSuccessPage;