// components/YandexMapModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin } from 'lucide-react';
import styles from './YandexMapModal.module.scss';

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: [number, number];
}

interface YandexMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinics: Clinic[];
  onClinicSelect: (clinicId: string) => void;
}

// Глобальный тип для Yandex Maps
declare global {
  interface Window {
    ymaps: any;
  }
}

const YandexMapModal: React.FC<YandexMapModalProps> = ({
  isOpen,
  onClose,
  clinics,
  onClinicSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка Яндекс Карт
  useEffect(() => {
    if (!isOpen) return;

    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=fb8afbb7-6365-4512-9935-36e74ccf2346&lang=ru_RU';
      script.onload = initializeMap;
      script.onerror = () => setError('Не удалось загрузить карты');
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [isOpen]);

  const initializeMap = () => {
    if (!window.ymaps || !mapRef.current) return;

    window.ymaps.ready(() => {
      try {
        // Центр карты - средние координаты всех клиник
        const center = clinics.length > 0 
          ? [
              clinics.reduce((sum, clinic) => sum + clinic.coordinates[0], 0) / clinics.length,
              clinics.reduce((sum, clinic) => sum + clinic.coordinates[1], 0) / clinics.length
            ]
          : [55.7558, 37.6173]; // Москва по умолчанию

        const newMap = new window.ymaps.Map(mapRef.current, {
          center: center,
          zoom: 10,
          controls: ['zoomControl', 'fullscreenControl']
        });

        // Добавляем метки для каждой клиники
        clinics.forEach((clinic) => {
          const placemark = new window.ymaps.Placemark(
            clinic.coordinates,
            {
              balloonContent: `
                <div class="${styles.balloon}">
                  <h3>${clinic.name}</h3>
                  <p>${clinic.address}</p>
                  <button 
                    class="${styles.selectButton}" 
                    onclick="window.selectClinicFromMap('${clinic.id}')"
                  >
                    Выбрать эту поликлинику
                  </button>
                </div>
              `,
              hintContent: clinic.name
            },
            {
              preset: 'islands#blueMedicalIcon',
            }
          );

          // Обработчик клика на метку
          placemark.events.add('click', () => {
            onClinicSelect(clinic.id);
            onClose();
          });

          newMap.geoObjects.add(placemark);
        });

        setMap(newMap);
        setIsLoading(false);
      } catch (err) {
        setError('Ошибка при инициализации карты');
        setIsLoading(false);
      }
    });
  };

  // Глобальная функция для выбора клиники из балуна
  useEffect(() => {
    (window as any).selectClinicFromMap = onClinicSelect;
    
    return () => {
      (window as any).selectClinicFromMap = null;
    };
  }, [onClinicSelect]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Выберите поликлинику на карте</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.mapContainer}>
          {error && (
            <div className={styles.errorMessage}>
              <p>{error}</p>
              <p>Пожалуйста, используйте список ниже для выбора поликлиники</p>
            </div>
          )}
          
          {isLoading && !error && (
            <div className={styles.loadingMessage}>
              <p>Загрузка карты...</p>
            </div>
          )}
          
          <div 
            ref={mapRef} 
            className={styles.map}
            style={{ 
              height: '400px', 
              display: error || isLoading ? 'none' : 'block' 
            }}
          />
        </div>

        <div className={styles.clinicsList}>
          <h3>Список поликлиник:</h3>
          {clinics.map((clinic) => (
            <div 
              key={clinic.id} 
              className={styles.clinicListItem}
              onClick={() => {
                onClinicSelect(clinic.id);
                onClose();
              }}
            >
              <div className={styles.clinicListInfo}>
                <MapPin size={16} className={styles.pinIcon} />
                <div>
                  <strong>{clinic.name}</strong>
                  <span>{clinic.address}</span>
                </div>
              </div>
              <button className={styles.selectListButton}>
                Выбрать
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YandexMapModal;