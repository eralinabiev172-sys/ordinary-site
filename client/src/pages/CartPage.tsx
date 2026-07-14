import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../api/api';
import {
  getCart,
  removeCartItem,
  updateCartItem,
} from '../services/cart.service';
import type { Product } from '../types/product';

type CartItem = {
  id: string;
  quantity: number;
  subtotal: number;
  product: Product;
};

type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
  itemsCount: number;
  total: number;
};

function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState('');

  useEffect(() => {
    void loadCart();
  }, []);

  async function loadCart() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setIsLoading(false);
      setError('Сначала войдите в аккаунт');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const data = await getCart(token);
      setCart(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Не удалось загрузить корзину',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleQuantityChange(
    item: CartItem,
    nextQuantity: number,
  ) {
    const token = localStorage.getItem('accessToken');

    if (!token || nextQuantity < 1) {
      return;
    }

    try {
      setUpdatingItemId(item.id);
      setError('');

      const updatedCart = await updateCartItem(
        token,
        item.id,
        nextQuantity,
      );

      setCart(updatedCart);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Не удалось изменить количество',
      );
    } finally {
      setUpdatingItemId('');
    }
  }

  async function handleRemove(itemId: string) {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return;
    }

    try {
      setUpdatingItemId(itemId);
      setError('');

      const updatedCart = await removeCartItem(token, itemId);
      setCart(updatedCart);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Не удалось удалить товар',
      );
    } finally {
      setUpdatingItemId('');
    }
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <div className="container">
          <h1>Корзина</h1>
          <p>Загрузка корзины...</p>
        </div>
      </section>
    );
  }

  if (!localStorage.getItem('accessToken')) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="cart-empty">
            <h1>Сначала войдите в аккаунт</h1>
            <p>
              Корзина доступна только авторизованным пользователям.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={() => navigate('/login')}
            >
              Перейти ко входу
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (error && !cart) {
    return (
      <section className="page-section">
        <div className="container">
          <h1>Корзина</h1>
          <p className="catalog-error">{error}</p>
        </div>
      </section>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="cart-empty">
            <h1>Корзина пока пустая</h1>
            <p>Добавьте товары из каталога.</p>

            <Link className="primary-button" to="/catalog">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container">
        <div className="cart-heading">
          <div>
            <p className="catalog-label">Ваш заказ</p>
            <h1>Корзина</h1>
          </div>

          <p>
            Товаров: <strong>{cart.itemsCount}</strong>
          </p>
        </div>

        {error && <p className="catalog-error">{error}</p>}

        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => {
              const primaryImage =
                item.product.images.find(
                  (image) => image.isPrimary,
                ) ?? item.product.images[0];

              const imageUrl = primaryImage
                ? `${API_URL.replace('/api', '')}${primaryImage.url}`
                : null;

              const isUpdating = updatingItemId === item.id;

              return (
                <article className="cart-item" key={item.id}>
                  <Link
                    className="cart-item__image"
                    to={`/products/${item.product.id}`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                      />
                    ) : (
                      <div className="cart-item__placeholder">
                        Нет фото
                      </div>
                    )}
                  </Link>

                  <div className="cart-item__content">
                    <div>
                      <p className="cart-item__category">
                        {item.product.category.name}
                      </p>

                      <Link to={`/products/${item.product.id}`}>
                        <h2>{item.product.name}</h2>
                      </Link>

                      <p className="cart-item__price">
                        {item.product.price} сом за единицу
                      </p>
                    </div>

                    <div className="cart-item__bottom">
                      <div className="quantity-control">
                        <button
                          type="button"
                          disabled={
                            isUpdating || item.quantity <= 1
                          }
                          onClick={() =>
                            handleQuantityChange(
                              item,
                              item.quantity - 1,
                            )
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            item.quantity >=
                              item.product.quantity
                          }
                          onClick={() =>
                            handleQuantityChange(
                              item,
                              item.quantity + 1,
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      <strong className="cart-item__subtotal">
                        {item.subtotal} сом
                      </strong>

                      <button
                        className="cart-item__remove"
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleRemove(item.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2>Итого</h2>

            <div className="cart-summary__row">
              <span>Количество товаров</span>
              <strong>{cart.itemsCount}</strong>
            </div>

            <div className="cart-summary__row">
              <span>Стоимость товаров</span>
              <strong>{cart.total} сом</strong>
            </div>

            <div className="cart-summary__total">
              <span>К оплате</span>
              <strong>{cart.total} сом</strong>
            </div>

            <Link
              className="primary-button cart-summary__button"
              to="/checkout"
            >
              Оформить заказ
            </Link>

            <Link
              className="cart-summary__continue"
              to="/catalog"
            >
              Продолжить покупки
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default CartPage;