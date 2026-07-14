import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../api/api';
import { getProducts } from '../services/products.service';
import type { Product } from '../types/product';

function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        setError('');

        const data = await getProducts();

        setProducts(
          data.filter((product) => product.status === 'PUBLISHED'),
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Произошла неизвестная ошибка',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="page-section">
        <div className="container">
          <h1>Каталог товаров</h1>
          <p>Загрузка товаров...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-section">
        <div className="container">
          <h1>Каталог товаров</h1>
          <p className="catalog-error">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container">
        <div className="catalog-heading">
          <div>
            <p className="catalog-label">Наш ассортимент</p>
            <h1>Каталог товаров</h1>
          </div>

          <p className="catalog-count">
            Найдено товаров: {products.length}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="catalog-empty">
            <h2>Товаров пока нет</h2>
            <p>Опубликованные товары появятся здесь.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => {
              const primaryImage =
                product.images.find((image) => image.isPrimary) ??
                product.images[0];

              const imageUrl = primaryImage
                ? `${API_URL.replace('/api', '')}${primaryImage.url}`
                : null;

              return (
                <article className="product-card" key={product.id}>
                  <Link
                    className="product-card__image-wrapper"
                    to={`/products/${product.id}`}
                  >
                    {imageUrl ? (
                      <img
                        className="product-card__image"
                        src={imageUrl}
                        alt={primaryImage.alt ?? product.name}
                      />
                    ) : (
                      <div className="product-card__placeholder">
                        Нет фотографии
                      </div>
                    )}
                  </Link>

                  <div className="product-card__content">
                    <p className="product-card__category">
                      {product.category.name}
                    </p>

                    <Link to={`/products/${product.id}`}>
                      <h2>{product.name}</h2>
                    </Link>

                    <p className="product-card__description">
                      {product.description ?? 'Описание отсутствует'}
                    </p>

                    <div className="product-card__footer">
                      <div className="product-card__prices">
                        <strong>{product.price} сом</strong>

                        {product.oldPrice && (
                          <span>{product.oldPrice} сом</span>
                        )}
                      </div>

                      <Link
                        className="product-card__button"
                        to={`/products/${product.id}`}
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default CatalogPage;