import { NavLink, Outlet, useNavigate } from 'react-router-dom';

function AdminLayout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Ordinary</h2>

        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/users">
            Пользователи
          </NavLink>

          <NavLink to="/categories">
            Категории
          </NavLink>

          <NavLink to="/products">
            Товары
          </NavLink>

          <NavLink to="/orders">
            Заказы
          </NavLink>

          <NavLink to="/settings">
            Настройки
          </NavLink>
        </nav>

        <button type="button" onClick={logout}>
          Выйти
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;