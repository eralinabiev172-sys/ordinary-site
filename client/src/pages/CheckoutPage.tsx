import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart } from '../services/cart.service';
import {
  createOrder,
  type CreateOrderPayload,
} from '../services/orders.service';

type CartSummary = {
  itemsCount: number;
  total: number;
};

type StoredUser = {
  name?: string;
  phone?: string | null;
};

function CheckoutPage() {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCheckout() {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const storedUserValue = localStorage.getItem('user');

      if (storedUserValue) {
        try {
          const storedUser = JSON.parse(
            storedUserValue,
          ) as StoredUser;

          setCustomerName(storedUser.name ?? '');
          setCustomerPhone(storedUser.phone ?? '');
        } catch {
          localStorage.removeItem('user');
        }
      }

      try {
        setIsLoading(true);
        setError('');

        const cartData = await getCart(token);

        if (!cartData.items || cartData.items.length === 0) {
          navigate('/cart');
          return;
        }

        setCart({
          itemsCount: cartData.itemsCount,
          total: cartData.total,
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить данные заказа',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCheckout();
  }, [navigate]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    const payload: CreateOrderPayload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      address: address.trim(),
      comment: comment.trim() || undefined,
    };

    try {
      setIsSubmitting(true);
      setError('');

      const result = await createOrder(token, payload);

      navigate(`/order-success/${result.order.id}`, {
        state: {
          order: result.order,
        },
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось оформить заказ',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <div className="container">
          <p>Загрузка оформления заказа...</p>
        </div>
      </section>
    );
  }

  if (!cart) {
    return (
      <section className="page-section">
        <div className="container">
          <p className="catalog-error">
            {error || 'Корзина пуста'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container">
        <div className="checkout-heading">
          <div>
            <p className="catalog-label">Последний шаг</p>
            <h1>Оформление заказа</h1>
          </div>

          <Link to="/cart">← Вернуться в корзину</Link>
        </div>

        <div className="checkout-layout">
          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >
            {error && <p className="auth-error">{error}</p>}

            <label>
              Имя получателя
              <input
                type="text"
                value={customerName}
                minLength={2}
                required
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
              />
            </label>

            <label>
              Телефон
              <input
                type="tel"
                value={customerPhone}
                minLength={6}
                required
                onChange={(event) =>
                  setCustomerPhone(event.target.value)
                }
              />
            </label>

            <label>
              Адрес доставки
              <textarea
                value={address}
                minLength={5}
                required
                rows={4}
                placeholder="Город, улица, дом, квартира"
                onChange={(event) =>
                  setAddress(event.target.value)
                }
              />
            </label>

            <label>
              Комментарий
              <textarea
                value={comment}
                rows={4}
                placeholder="Дополнительная информация"
                onChange={(event) =>
                  setComment(event.target.value)
                }
              />
            </label>

            <button
              className="primary-button checkout-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Оформляем...'
                : 'Оформить заказ'}
            </button>
          </form>

          <aside className="checkout-summary">
            <h2>Ваш заказ</h2>

            <div className="cart-summary__row">
              <span>Количество товаров</span>
              <strong>{cart.itemsCount}</strong>
            </div>

            <div className="cart-summary__total">
              <span>К оплате</span>
              <strong>{cart.total} сом</strong>
            </div>

            <p>
              После оформления заказ появится в вашем личном
              кабинете.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default CheckoutPage;