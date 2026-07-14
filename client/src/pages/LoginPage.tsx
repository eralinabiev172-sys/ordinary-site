import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/auth.service';

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');

      const data = await loginUser(email.trim(), password);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/profile');
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
    <main className="auth-page">
      <div className="auth-card">
        <h1>Вход</h1>
        <p>Введите данные своего аккаунта.</p>

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Электронная почта

            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              autoComplete="email"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Пароль

            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              autoComplete="current-password"
              minLength={6}
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p>
          Нет аккаунта?{' '}
          <Link to="/register">
            Зарегистрироваться
          </Link>
        </p>

        <Link className="auth-back-link" to="/">
          ← Вернуться на главную
        </Link>
      </div>
    </main>
  );
}

export default LoginPage;