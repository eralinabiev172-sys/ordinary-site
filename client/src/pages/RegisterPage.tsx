import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/auth.service';

function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] =
    useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (password !== passwordConfirmation) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const data = await registerUser(
        name.trim(),
        email.trim(),
        phone.trim(),
        password,
      );

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/profile');
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : 'Не удалось зарегистрироваться',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Регистрация</h1>
        <p>Создайте новый аккаунт.</p>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Имя

            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              minLength={2}
              autoComplete="name"
              required
              onChange={(event) => setName(event.target.value)}
            />
          </label>

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
            Телефон

            <input
              type="tel"
              placeholder="+996700123456"
              value={phone}
              autoComplete="tel"
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>

          <label>
            Пароль

            <input
              type="password"
              placeholder="Минимум 6 символов"
              value={password}
              minLength={6}
              autoComplete="new-password"
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <label>
            Повторите пароль

            <input
              type="password"
              placeholder="Введите пароль ещё раз"
              value={passwordConfirmation}
              minLength={6}
              autoComplete="new-password"
              required
              onChange={(event) =>
                setPasswordConfirmation(event.target.value)
              }
            />
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Создаём аккаунт...'
              : 'Создать аккаунт'}
          </button>
        </form>

        <p>
          Уже есть аккаунт?{' '}
          <Link to="/login">Войти</Link>
        </p>

        <Link className="auth-back-link" to="/">
          ← Вернуться на главную
        </Link>
      </div>
    </main>
  );
}

export default RegisterPage;