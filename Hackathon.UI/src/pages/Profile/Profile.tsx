import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, FileText, Download, Upload, Settings } from 'lucide-react';
import styles from './Profile.module.scss';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'medical' | 'tickets'>('medical');

  const handleFileUpload = (type: 'medical' | 'tickets') => {
    // TODO: Реализовать загрузку файлов
    console.log(`Загрузка ${type} файла`);
  };

  const handleFileDownload = (fileName: string) => {
    // TODO: Реализовать скачивание файлов
    console.log(`Скачивание ${fileName}`);
  };

  // Заглушки для данных
  const medicalReports = [
    { id: 1, name: 'Заключение_от_15_10_2024.pdf', date: '15.10.2024' },
    { id: 2, name: 'Анализы_результаты.pdf', date: '10.10.2024' },
  ];

  const tickets = [
    { id: 1, name: 'Талон_к_врачу_1.pdf', date: '20.10.2024' },
    { id: 2, name: 'Талон_к_врачу_2.pdf', date: '25.10.2024' },
  ];

  return (
    <div className={styles.container}>
      {/* Боковая панель */}
      <div className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <User size={40} />
          </div>
          <div className={styles.userDetails}>
            <h3 className={styles.userName}>
              {user?.email?.split('@')[0] || 'Пользователь'}
            </h3>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
        </div>

        <nav className={styles.navigation}>
          <button
            className={`${styles.navButton} ${activeTab === 'medical' ? styles.active : ''}`}
            onClick={() => setActiveTab('medical')}
          >
            <FileText size={20} />
            <span>Медицинские заключения</span>
          </button>
          <button
            className={styles.navButton}
            onClick={() => navigate('/ticket')}
          >
            <FileText size={20} />
            <span>Мои талоны</span>
          </button>
          <button className={styles.navButton}>
            <Settings size={20} />
            <span>Настройки</span>
          </button>
        </nav>

        <button className={styles.logoutButton} onClick={signOut}>
          <LogOut size={20} />
          <span>Выйти</span>
        </button>
      </div>

      {/* Основное содержимое */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {activeTab === 'medical' ? 'Медицинские заключения' : 'Талончики'}
          </h1>
          <button
            className={styles.uploadButton}
            onClick={() => handleFileUpload(activeTab)}
          >
            <Upload size={20} />
            Загрузить PDF
          </button>
        </div>

        <div className={styles.fileSection}>
          {(activeTab === 'medical' ? medicalReports : tickets).map((file) => (
            <div key={file.id} className={styles.fileCard}>
              <div className={styles.fileIcon}>
                <FileText size={32} />
              </div>
              <div className={styles.fileInfo}>
                <h4 className={styles.fileName}>{file.name}</h4>
                <p className={styles.fileDate}>Добавлено: {file.date}</p>
              </div>
              <button
                className={styles.downloadButton}
                onClick={() => handleFileDownload(file.name)}
              >
                <Download size={20} />
              </button>
            </div>
          ))}

          {(activeTab === 'medical' ? medicalReports : tickets).length === 0 && (
            <div className={styles.emptyState}>
              <FileText size={48} />
              <h3>Файлы не найдены</h3>
              <p>Загрузите ваш первый PDF-файл</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}