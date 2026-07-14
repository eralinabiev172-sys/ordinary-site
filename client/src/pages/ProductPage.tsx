import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_URL } from '../api/api';
import { getProduct } from '../services/products.service';
import { addToCart } from '../services/cart.service';
import type { Product } from '../types/product';

function ProductPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!id) {
        setError('ID товара не найден');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const data = await getProduct(id);

        setProduct(data);

        const primaryImage =
          data.images.find((image) => image.isPrimary) ??
          data.images[0];

        if (primaryImage) {
          setSelectedImage(
            `${API_URL.replace('/api', '')}${primaryImage.url}`,
          );
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить товар',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProduct();
  }, [id]);

  async function handleAddToCart() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setCartMessage('Сначала войдите в аккаунт');
      return;
    }

    if (!product) {
      return;
    }

    try {
      setIsAddingToCart(true);
      setCartMessage('');

      await addToCart(token, product.id, 1);

      setCartMessage('Товар добавлен в корзину');
    } catch (error) {
      setCartMessage(
        error instanceof Error
          ? error.message
          : 'Не удалось добавить товар в корзину',
      );
    } finally {
      setIsAddingToCart(false);
    }
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <div className="container">
          <p>Загрузка товара...</p>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="product-page-error">
            <h1>Товар не найден</h1>

            <p>{error || 'Не удалось получить данные товара.'}</p>

            <Link
              className="primary-button"
              to="/catalog"
            >
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const unitLabels: Record<Product['unit'], string> = {
    PIECE: 'шт.',
    KG: 'кг',
    GRAM: 'г',
    PACK: 'упаковка',
    BOX: 'коробка',
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="product-details">
          <div className="product-gallery">
            <div className="product-gallery__main">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                />
              ) : (
                <div className="product-gallery__placeholder">
                  Нет фотографии
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="product-gallery__thumbnails">
                {product.images.map((image) => {
                  const imageUrl =
                    `${API_URL.replace('/api', '')}${image.url}`;

                  return (
                    <button
                      key={image.id}
                      type="button"
                      className={
                        selectedImage === imageUrl
                          ? 'product-thumbnail product-thumbnail--active'
                          : 'product-thumbnail'
                      }
                      onClick={() =>
                        setSelectedImage(imageUrl)
                      }
                    >
                      <img
                        src={imageUrl}
                        alt={image.alt ?? product.name}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="product-details__content">
            <Link
              className="product-details__category"
              to="/catalog"
            >
              {product.category.name}
            </Link>

            <h1>{product.name}</h1>

            <p className="product-details__sku">
              Артикул: {product.sku}
            </p>

            <div className="product-details__prices">
              <strong>{product.price} сом</strong>

              {product.oldPrice && (
                <span>{product.oldPrice} сом</span>
              )}
            </div>

            <p className="product-details__description">
              {product.description ??
                'Описание товара отсутствует.'}
            </p>

            <div className="product-details__information">
              <div>
                <span>Единица продажи</span>

                <strong>{unitLabels[product.unit]}</strong>
              </div>

              <div>
                <span>На складе</span>

                <strong>
                  {product.quantity}{' '}
                  {unitLabels[product.unit]}
                </strong>
              </div>

              <div>
                <span>Статус</span>

                <strong>
                  {product.quantity > 0
                    ? 'Есть в наличии'
                    : 'Нет в наличии'}
                </strong>
              </div>
            </div>

            <button
              className="product-details__cart-button"
              type="button"
              disabled={
                product.quantity === 0 ||
                isAddingToCart
              }
              onClick={handleAddToCart}
            >
              {isAddingToCart
                ? 'Добавляем...'
                : product.quantity > 0
                  ? 'Добавить в корзину'
                  : 'Нет в наличии'}
            </button>

            {cartMessage && (
              <p className="product-details__cart-message">
                {cartMessage}
              </p>
            )}

            <Link
              className="product-details__back"
              to="/catalog"
            >
              ← Вернуться в каталог
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductPage;