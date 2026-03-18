import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, FileText, Calendar, ArrowRight, Star, HelpCircle, Mail } from 'lucide-react';
import {PlusIcon as Plus} from 'lucide-react';
import styles from './HomePage.module.scss';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'AI-диагностика',
      description: 'Загрузите фото и получите предварительный анализ состояния здоровья',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Анкета здоровья',
      description: 'Пройдите краткий опрос для более точной диагностики',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Запись к врачу',
      description: 'Выберите поликлинику и запишитесь на прием онлайн',
    },
  ];

  const accordionItems = [
    {
      id: 'faq1',
      icon: <Star className="w-4 h-4" />,
      title: 'Почему мы?',
      text: 'Мы используем передовые алгоритмы ИИ для предварительной оценки состояния здоровья. Наш сервис удобен, быстр и доступен 24/7 — без очередей и лишних звонков.',
    },
    {
      id: 'faq2',
      icon: <HelpCircle className="w-4 h-4" />,
      title: 'FAQ',
      text: 'MedAi можетзаменить врача? -Данный сервис предоставляет только предварительную оценку и не заменяет профессиональную медицинскую консультацию. Мы не несем ответственности за решения, принятые на основе результатов диагностики. Для получения точного диагноза обратитесь к квалифицированному врачу!',
    },
    {
      id: 'faq3',
      icon: <Mail className="w-4 h-4" />,
      title: 'Контакты и обратная связь',
      text: 'Если у вас возникли вопросы или предложения — напишите нам на support@medai.by или ищите нас в Instagram @medai.by. Мы всегда рады обратной связи!',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.hero}>
          <div className={styles.iconWrapper}>
            <Activity className={styles.mainIcon} />
          </div>

          <h1 className={styles.title}>
            Медицинская диагностика онлайн
            <span className={styles.titleAccent}></span>
          </h1>

          <p className={styles.subtitle}>
            Получите предварительную оценку вашего состояния здоровья
            с помощью технологий искусственного интеллекта
          </p>

          <Link to={'/main'}>
            <button className={styles.ctaButton}>
              Начать диагностику
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </Link>
        </div>

        <div className={styles.features}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={styles.featureCard}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* <div className={styles.disclaimer}>
          <div className={styles.featureIcon}>
            <Shield className="w-6 h-6" />
          </div>
          <div className={styles.disclaimerContent}>
            <div className={styles.disclaimerTitle}>
              <span className={styles.exclBadge}>!</span>
              Важная информация
            </div>
            <p className={styles.disclaimerText}>
              Данный сервис предоставляет только предварительную оценку и не заменяет
              профессиональную медицинскую консультацию. Мы не несем ответственности за
              решения, принятые на основе результатов диагностики.{' '}
              <strong>Для получения точного диагноза обратитесь к квалифицированному врачу!</strong>
            </p>
          </div>
        </div> */}

        <div className={styles.accordionList}>
          {accordionItems.map(({ id, icon, title, text }) => (
            <div
              key={id}
              className={`${styles.accordionItem} ${openAccordion === id ? styles.open : ''}`}
            >
              <div
                className={styles.accordionHeader}
                onClick={() => setOpenAccordion(openAccordion === id ? null : id)}
              >
                <div className={styles.accordionHeaderLeft}>
                  <div className={styles.accordionIcon}>{icon}</div>
                  <span className={styles.accordionTitle}>{title}</span>
                </div>
                <div className={styles.accordionPlus}><Plus className="w-4 h-4" /></div>
              </div>
              <div className={styles.accordionBody}>
                <div className={styles.accordionBodyInner}>{text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;