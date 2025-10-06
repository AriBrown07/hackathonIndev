import { useState } from 'react';
import { supabase } from './lib/supabase';
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import styles from './Authorization.module.scss';

interface AuthorizationProps {
  onAuthSuccess: () => void;
}

export default function Authorization({ onAuthSuccess }: AuthorizationProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <div className={styles.iconWrapper}>
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h1 className={styles.title}>
            {isLogin ? 'Добро пожаловать' : 'Создать аккаунт'}
          </h1>
          <p className={styles.subtitle}>
            {isLogin
              ? 'Войдите в свой аккаунт для продолжения'
              : 'Зарегистрируйтесь для доступа к системе'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <Mail size={18} />
              <span>Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <Lock size={18} />
              <span>Пароль</span>
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <div className={styles.spinner}></div>
            ) : (
              <>
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </>
            )}
          </button>
        </form>

        <div className={styles.switchMode}>
          <span>
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className={styles.switchButton}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}
