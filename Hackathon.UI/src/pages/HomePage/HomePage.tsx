import { useState, useEffect } from 'react';
import { Activity, Shield, FileText, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import styles from './HomePage.module.scss';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'AI-диагностика',
      description: 'Загрузите фото и получите предварительный анализ состояния здоровья'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Анкета здоровья',
      description: 'Пройдите краткий опрос для более точной диагностики'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Запись к врачу',
      description: 'Выберите поликлинику и запишитесь на прием онлайн'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.backgroundPattern}></div>

      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.hero}>
          <div className={styles.iconWrapper}>
            <Activity className={styles.mainIcon} />
          </div>

          <h1 className={styles.title}>
            Медицинская диагностика
            <span className={styles.titleAccent}> онлайн</span>
          </h1>

          <p className={styles.subtitle}>
            Получите предварительную оценку вашего состояния здоровья
            с помощью технологий искусственного интеллекта
          </p>

          <button className={styles.ctaButton}>
            Начать диагностику
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        <div className={styles.features}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={styles.featureCard}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={styles.featureIcon}>
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.disclaimer}>
          <div className={styles.disclaimerIcon}>
            <Shield className="w-6 h-6" />
          </div>
          <div className={styles.disclaimerContent}>
            <h3 className={styles.disclaimerTitle}>
              <AlertCircle className="w-5 h-5 mr-2" />
              Важная информация
            </h3>
            <p className={styles.disclaimerText}>
              Данный сервис предоставляет только предварительную оценку и не заменяет
              профессиональную медицинскую консультацию. Мы не несем ответственности
              за решения, принятые на основе результатов диагностики.
              <strong> Для получения точного диагноза обратитесь к квалифицированному врачу.</strong>
            </p>
          </div>
        </div>

        <div className={styles.process}>
          <h2 className={styles.processTitle}>Как это работает</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h4 className={styles.stepTitle}>Регистрация</h4>
              <p className={styles.stepText}>Создайте аккаунт или войдите</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h4 className={styles.stepTitle}>Диагностика</h4>
              <p className={styles.stepText}>Загрузите фото и пройдите тест</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h4 className={styles.stepTitle}>Результаты</h4>
              <p className={styles.stepText}>Получите анализ состояния</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <h4 className={styles.stepTitle}>Запись</h4>
              <p className={styles.stepText}>Запишитесь к врачу онлайн</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
