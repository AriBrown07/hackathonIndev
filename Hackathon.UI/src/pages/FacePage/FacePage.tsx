import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertCircle } from 'lucide-react';
import Questionnaire from '../Questionnaire/Questionnaire';
import HealthAnalyzer from './components/HealthAnalyzer';
import type { HealthAnalysisResult } from './components/HealthAnalyzer';
import styles from './FacePage.module.scss';

import type { HealthQuestionnaire } from '../../types';

// Временный интерфейс для результата анализа лица
interface FaceDetectionResult {
  detected: boolean;
  landmarks?: any[];
  eyeAspectRatio: number;
  mouthOpenness: number;
  symmetry: number;
}

export default function FaceScanner() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [resultAnimation, setResultAnimation] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<HealthQuestionnaire | null>(null);
  const [analysisResult, setAnalysisResult] = useState<HealthAnalysisResult | null>(null);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<'checking' | 'success' | 'error' | null>(null);
  const [faceDetectionError, setFaceDetectionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    
    return () => {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    };
  }, []);  

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Не удалось получить доступ к камере');
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .catch((err) => console.warn('Video play interrupted:', err));
    }
  }, [isCameraActive, stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoData = canvas.toDataURL('image/png');
        setPhoto(photoData);
        stopCamera();
        checkFaceDetection(photoData);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsCameraActive(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = e.target?.result as string;
        setPhoto(photoData);
        checkFaceDetection(photoData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Функция для валидации обнаружения лица
  const validateFaceDetection = (faceResult: FaceDetectionResult): boolean => {
      // Проверяем, было ли обнаружено лицо
      if (!faceResult.detected) {
        return false;
      }
  
      // Проверяем качество обнаруженных landmarks
      if (!faceResult.landmarks || faceResult.landmarks.length < 10) {
        return false;
      }
  
      // Проверяем, что глаза и рот обнаружены (основные признаки лица)
      if (faceResult.eyeAspectRatio === 0 || faceResult.mouthOpenness === 0) {
        return false;
      }
  
      // Проверяем, что симметрия в разумных пределах (не 0 и не 100)
      if (faceResult.symmetry < 5 || faceResult.symmetry > 95) {
        return false;
      }
  
      return true;
    };


  
  const simulateFaceAnalysis = (image: HTMLImageElement): Promise<FaceDetectionResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Создаем canvas для анализа изображения
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            detected: false,
            landmarks: undefined,
            eyeAspectRatio: 0,
            mouthOpenness: 0,
            symmetry: 0
          });
          return;
        }

        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

       
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

 
        const hasFace = analyzeImageForFace(data, canvas.width, canvas.height);

        resolve({
          detected: hasFace,
          landmarks: hasFace ? Array(478).fill({}) : undefined, // MediaPipe Face Mesh имеет 478 landmarks
          eyeAspectRatio: hasFace ? 0.25 + Math.random() * 0.1 : 0,
          mouthOpenness: hasFace ? 0.05 + Math.random() * 0.1 : 0,
          symmetry: hasFace ? 70 + Math.random() * 25 : 0
        });
      }, 1500);
    });
  };

  

  // Функция для анализа изображения на наличие лица
  const analyzeImageForFace = (data: Uint8ClampedArray, width: number, height: number): boolean => {
    let skinTonePixels = 0;
    let faceLikeRegions = 0;

    // Анализируем пиксели для поиска признаков лица
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Проверяем, похож ли цвет на кожу
        if (isSkinTone(r, g, b)) {
          skinTonePixels++;
        }
      }
    }

    // Вычисляем процент пикселей цвета кожи
    const totalPixels = (width * height) / 16; // Учитываем шаг 4x4
    const skinTonePercentage = (skinTonePixels / totalPixels) * 100;

    // Дополнительные проверки
    const hasReasonableSize = width > 200 && height > 200;
    const hasAspectRatio = Math.abs(width / height - 0.75) < 0.2; // Примерное соотношение сторон лица
    const hasEnoughSkinTone = skinTonePercentage > 15; // Должно быть достаточно цвета кожи

    // Считаем что это лицо если выполняются основные критерии
    const isLikelyFace = hasReasonableSize && hasEnoughSkinTone;

    console.log('Face detection analysis:', {
      width,
      height,
      skinTonePercentage: skinTonePercentage.toFixed(2),
      hasReasonableSize,
      hasAspectRatio,
      hasEnoughSkinTone,
      isLikelyFace
    });

    return isLikelyFace;
  };

  // Функция для определения цвета кожи
  const isSkinTone = (r: number, g: number, b: number): boolean => {
    // Преобразуем RGB в YCbCr для лучшего определения цвета кожи
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

    // Диапазоны цветов кожи в YCbCr
    const skinRanges = [
      { yMin: 80, yMax: 255, cbMin: 85, cbMax: 135, crMin: 135, crMax: 180 }, // Светлая кожа
      { yMin: 80, yMax: 255, cbMin: 85, cbMax: 135, crMin: 135, crMax: 180 }, // Средняя кожа
      { yMin: 80, yMax: 255, cbMin: 85, cbMax: 135, crMin: 135, crMax: 180 }, // Темная кожа
    ];

    return skinRanges.some(range =>
      y >= range.yMin && y <= range.yMax &&
      cb >= range.cbMin && cb <= range.cbMax &&
      cr >= range.crMin && cr <= range.crMax
    );
  };

  /// НОВАЯ ФУНКЦИЯ: Проверка обнаружения лица
const checkFaceDetection = async (photoData: string) => {
  setIsScanning(true);
  setFaceDetectionStatus('checking');
  setFaceDetectionError(null);

  console.log('Starting face detection for photo:', photoData.substring(0, 100) + '...');

  try {
    const image = new Image();
    image.src = photoData;
    
    image.onload = async () => {
      try {
        console.log('Image loaded, dimensions:', image.width, 'x', image.height);
        
        const faceResult = await simulateFaceAnalysis(image);
        console.log('Face analysis completed:', faceResult);
        
        const hasFace = validateFaceDetection(faceResult);
        
        if (hasFace) {
          console.log('Face detected successfully');
          setFaceDetectionStatus('success');
          setTimeout(() => {
            setShowQuestionnaire(true);
          }, 1000);
        } else {
          console.log('Face not detected or validation failed');
          setFaceDetectionStatus('error');
          setFaceDetectionError('Лицо не обнаружено на фотографии. Пожалуйста, сделайте четкое фото лица.');
        }
      } catch (error) {
        console.error('Face detection error:', error);
        setFaceDetectionStatus('error');
        setFaceDetectionError('Ошибка при анализе изображения. Пожалуйста, попробуйте снова.');
      }
    };

    image.onerror = () => {
      console.error('Failed to load image');
      setFaceDetectionStatus('error');
      setFaceDetectionError('Не удалось загрузить изображение для анализа.');
    };

  } catch (error) {
    console.error('Face detection setup error:', error);
    setFaceDetectionStatus('error');
    setFaceDetectionError('Не удалось загрузить изображение для анализа.');
  }
};

  const handleQuestionnaireComplete = (questionnaireData: HealthQuestionnaire) => {
    console.log('Анкета заполнена, данные:', questionnaireData);
    setQuestionnaireData(questionnaireData);
    setShowQuestionnaire(false);

    setTimeout(() => {
      setIsScanning(false);
      setShowResult(true);
      setResultAnimation(true);
    }, 300);
  };

  const handleAnalysisComplete = (result: HealthAnalysisResult) => {
    setAnalysisResult(result);
  };

  const reset = () => {
    setPhoto(null);
    setShowResult(false);
    setShowQuestionnaire(false);
    setIsScanning(false);
    setQuestionnaireData(null);
    setAnalysisResult(null);
    setFaceDetectionStatus(null);
    setFaceDetectionError(null);
    stopCamera();
  };

  const handleQuestionnaireClose = () => {
    setShowQuestionnaire(false);
    reset();
  };

  // Компонент для отображения статуса проверки лица
  const FaceDetectionStatusComponent = () => {
    if (faceDetectionStatus === 'checking') {
      return (
        <div className={styles.faceDetectionStatus}>
          <div className={styles.statusChecking}>
            <div className={styles.spinner}></div>
            <h3>Проверка фотографии</h3>
            <p>Ищем лицо на изображении...</p>
          </div>
        </div>
      );
    }

    if (faceDetectionStatus === 'error') {
      return (
        <div className={styles.faceDetectionStatus}>
          <div className={styles.statusError}>
            <AlertCircle size={48} />
            <h3>Лицо не обнаружено</h3>
            <p>{faceDetectionError}</p>
            <div className={styles.requirements}>
              <h4>Требования к фото:</h4>
              <ul>
                <li>✓ Четкое изображение лица</li>
                <li>✓ Хорошее освещение</li>
                <li>✓ Лицо должно занимать большую часть кадра</li>
                <li>✓ Прямой взгляд в камеру</li>
                <li>✓ Отсутствие солнцезащитных очков</li>
              </ul>
            </div>
            <button className={styles.retryButton} onClick={reset}>
              Сделать новое фото
            </button>
          </div>
        </div>
      );
    }

    if (faceDetectionStatus === 'success') {
      return (
        <div className={styles.faceDetectionStatus}>
          <div className={styles.statusSuccess}>
            <div className={styles.successIcon}>✓</div>
            <h3>Лицо обнаружено!</h3>
            <p>Переходим к заполнению анкеты...</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${showQuestionnaire ? styles.blurred : ''}`}>
        {!photo && !isCameraActive && faceDetectionStatus === null && (
          <div className={styles.uploadSection}>
            <h1 className={styles.title}>Сканирование лица</h1>
            <p className={styles.subtitle}>Выберите способ загрузки фотографии</p>

            <div className={styles.buttonGroup}>
              <button className={styles.actionButton} onClick={startCamera}>
                <Camera size={24} />
                <span>Использовать камеру</span>
              </button>

              <button
                className={styles.actionButton}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} />
                <span>Загрузить фото</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className={styles.fileInput}
            />
          </div>
        )}

        {isCameraActive && !photo && (
          <div className={styles.centeredCamera}>
            <div className={styles.videoContainer}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={styles.videoFeed}
              />
            </div>

            <div className={styles.captureControls}>
              <button className={styles.captureMainButton} onClick={capturePhoto}>
                Сделать снимок
              </button>
              <button className={styles.cancelSmall} onClick={reset}>
                Отмена
              </button>
            </div>
          </div>
        )}

        {photo && isScanning && faceDetectionStatus && (
          <div className={styles.scanningSection}>
            <div className={styles.photoWrapper}>
              <img src={photo} alt="Captured" className={styles.photo} />
              {faceDetectionStatus === 'checking' && (
                <div className={styles.scanAnimation}>
                  <div className={styles.scanLine}></div>
                </div>
              )}
            </div>
            <FaceDetectionStatusComponent />
          </div>
        )}

        {showResult && photo && questionnaireData && (
          <div className={`${styles.resultSection} ${resultAnimation ? styles.animate : ''}`}>
            <div className={styles.leftPanel}>
              <div className={styles.photoContainer}>
                <img src={photo} alt="Scanned face" className={styles.resultPhoto} />
              </div>
              <button className={styles.resetButton} onClick={reset}>
                Сканировать другое фото
              </button>
            </div>

            <div className={styles.rightPanel}>
              <div className={styles.resultCard}>
                <h2 className={styles.resultTitle}>Результат анализа</h2>
                <div className={styles.resultContent}>
                  <HealthAnalyzer
                    photo={photo}
                    questionnaireData={questionnaireData}
                    onAnalysisComplete={handleAnalysisComplete}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Модальное окно с анкетой */}
      {showQuestionnaire && (
        <div className={styles.questionnaireModal}>
          <div className={styles.questionnaireOverlay} onClick={handleQuestionnaireClose} />
          <div className={styles.questionnaireContent}>
            <Questionnaire onComplete={handleQuestionnaireComplete} />
            <button
              className={styles.closeQuestionnaire}
              onClick={handleQuestionnaireClose}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}