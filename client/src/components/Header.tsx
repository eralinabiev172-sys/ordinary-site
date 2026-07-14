import { Link, NavLink } from 'react-router-dom';
import { Heart, ShoppingCart, User } from 'lucide-react';

function Header() {
  return (
    <header className="header">
      <div className="container header__content">
        <Link className="logo" to="/">
          Ordinary
        </Link>

        <nav className="navigation">
          <NavLink to="/">Главная</NavLink>
          <NavLink to="/catalog">Каталог</NavLink>
        </nav>

        <div className="header__actions">
          <button className="icon-button" type="button" aria-label="Избранное">
            <Heart size={20} />
          </button>

          <Link className="icon-button" to="/cart" aria-label="Корзина">
            <ShoppingCart size={20} />
          </Link>

          <Link className="icon-button" to="/profile" aria-label="Профиль">
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;