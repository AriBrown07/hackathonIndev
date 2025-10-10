import { Link } from 'react-router-dom';
import { Home, Heart, Stethoscope, Search, ArrowLeft } from 'lucide-react';
import styles from './NotFoundPage.module.scss';

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
        <div className={styles.pulse}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.medicalIcon}>
          <div className={styles.iconWrapper}>
            <Stethoscope size={48} />
            <Heart size={24} className={styles.heartBeat} />
          </div>
        </div>

        <div className={styles.errorCode}>404</div>
        
        <h1 className={styles.title}>Страница не найдена</h1>
        
        <p className={styles.subtitle}>
          К сожалению, запрашиваемая страница не существует. 
          Возможно, она была перемещена или удалена.
        </p>

        <div className={styles.suggestion}>
          <Search size={20} />
          <span>Проверьте правильность введенного адреса</span>
        </div>

        <div className={styles.actions}>
          <Link to="/" className={styles.primaryButton}>
            <Home size={20} />
            На главную страницу
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className={styles.secondaryButton}
          >
            <ArrowLeft size={20} />
            Вернуться назад
          </button>
        </div>

        <div className={styles.medicalInfo}>
          <div className={styles.infoCard}>
            <h3>FaceDiagnosis</h3>
            <p>Система медицинской диагностики по фото лица</p>
          </div>
        </div>
      </div>
    </div>
  );
}