import type { ReactNode } from 'react';
import { useAuth } from '../../../hooks/useAuth'
import Authorization from '../Authorization';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return <Authorization onAuthSuccess={() => {}} />;
  }

  return <>{children}</>;
}