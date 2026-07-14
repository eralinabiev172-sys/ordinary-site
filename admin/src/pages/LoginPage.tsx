import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/auth.service';

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');

      const data = await loginAdmin(email.trim(), password);

      localStorage.setItem(
        'adminAccessToken',
        data.accessToken,
      );
      localStorage.setItem(
        'adminUser',
        JSON.stringify(data.user),
      );

      navigate('/');
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Не удалось выполнить вход',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <form
        className="admin-login-card"
        onSubmit={handleSubmit}
      >
        <p className="admin-login-label">Ordinary Admin</p>

        <h1>Вход в админ-панель</h1>

        <p>
          Используйте аккаунт с ролью администратора.
        </p>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <label>
          Email

          <input
            type="email"
            value={email}
            placeholder="admin@example.com"
            autoComplete="email"
            required
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Пароль

          <input
            type="password"
            value={password}
            placeholder="Введите пароль"
            autoComplete="current-password"
            minLength={6}
            required
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </main>
  );
}

export default LoginPage;