import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero__content">
          <div>
            <p className="hero__label">Новый интернет-магазин</p>

            <h1>Обычный сайт с удобной админ-панелью</h1>

            <p className="hero__description">
              Каталог товаров, личный кабинет, корзина и управление заказами.
            </p>

            <Link className="primary-button" to="/catalog">
              Смотреть каталог
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p>Возможности</p>
            <h2>Что будет на сайте</h2>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <h3>Каталог товаров</h3>
              <p>Поиск, категории, фильтры и карточки товаров.</p>
            </article>

            <article className="feature-card">
              <h3>Личный кабинет</h3>
              <p>Профиль, история заказов, избранное и уведомления.</p>
            </article>

            <article className="feature-card">
              <h3>Админ-панель</h3>
              <p>Управление товарами, пользователями и заказами.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;