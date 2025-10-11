import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertCircle } from 'lucide-react';
import Questionnaire from '../Questionnaire/Questionnaire';
import HealthAnalyzer from './components/HealthAnalyzer';
import type { HealthAnalysisResult } from './components/HealthAnalyzer';
import styles from './FacePage.module.scss';
import { Link } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import type { HealthQuestionnaire } from '../../types';

interface FaceDetectionResult {
  detected: boolean;
  eyeAspectRatio: number;
  mouthOpenness: number;
  symmetry: number;
}

export default function FaceScanner() {
  const [showSaveModal, setShowSaveModal] = useState(false);
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

  // === Загружаем модели ===
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        console.log('✅ Face API модели загружены');
      } catch (err) {
        console.error('❌ Ошибка загрузки моделей FaceAPI:', err);
      }
    };
    loadModels();
  }, []);

  // === Работа с камерой ===
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
      videoRef.current.play().catch((err) => console.warn('Video play interrupted:', err));
    }
  }, [isCameraActive, stream]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsCameraActive(false);
  };

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoData = e.target?.result as string;
      setPhoto(photoData);
      checkFaceDetection(photoData);
    };
    reader.readAsDataURL(file);
  };

  // === Анализ лица ===
  const detectFace = async (photoData: string): Promise<FaceDetectionResult> => {
    try {
      const img = await faceapi.fetchImage(photoData);

      // Таймаут 5 секунд на случай зависания
      const timeoutPromise = new Promise<FaceDetectionResult>((resolve) =>
        setTimeout(() => resolve({ detected: false, eyeAspectRatio: 0, mouthOpenness: 0, symmetry: 0 }), 5000)
      );

      const detectionPromise = (async () => {
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 }))
          .withFaceLandmarks(true);

        if (!detection) {
          return { detected: false, eyeAspectRatio: 0, mouthOpenness: 0, symmetry: 0 };
        }

        const leftEye = detection.landmarks.getLeftEye();
        const rightEye = detection.landmarks.getRightEye();
        const mouth = detection.landmarks.getMouth();

        const eyeAspectRatio = calcEyeAspectRatio(leftEye, rightEye);
        const mouthOpenness = calcMouthOpenness(mouth);
        const symmetry = calcFaceSymmetry(detection.landmarks);

        return { detected: true, eyeAspectRatio, mouthOpenness, symmetry };
      })();

      // Возвращаем то, что сработает раньше
      return await Promise.race([timeoutPromise, detectionPromise]);
    } catch (err) {
      console.error('Ошибка при анализе лица:', err);
      return { detected: false, eyeAspectRatio: 0, mouthOpenness: 0, symmetry: 0 };
    }
  };

  const calcEyeAspectRatio = (leftEye: any[], rightEye: any[]) => {
    const avgHeight = ((leftEye[1].y - leftEye[5].y) + (rightEye[1].y - rightEye[5].y)) / 2;
    const avgWidth = ((leftEye[3].x - leftEye[0].x) + (rightEye[3].x - rightEye[0].x)) / 2;
    return Number(((avgHeight / avgWidth) * 100).toFixed(2));
  };

  const calcMouthOpenness = (mouth: any[]) => {
    const height = mouth[14].y - mouth[18].y;
    const width = mouth[6].x - mouth[0].x;
    return Number(((height / width) * 100).toFixed(2));
  };

  const calcFaceSymmetry = (landmarks: any) => {
    const leftCheek = landmarks.positions[1];
    const rightCheek = landmarks.positions[15];
    const nose = landmarks.positions[33];
    const midX = (leftCheek.x + rightCheek.x) / 2;
    const symmetry = 100 - Math.abs(midX - nose.x);
    return Math.max(0, Math.min(100, symmetry));
  };

  // === Проверка фото ===
  const checkFaceDetection = async (photoData: string) => {
    setIsScanning(true);
    setFaceDetectionStatus('checking');
    setFaceDetectionError(null);

    try {
      const faceResult = await detectFace(photoData);
      console.log('Face detection result:', faceResult);

      if (faceResult.detected) {
        setFaceDetectionStatus('success');
        setTimeout(() => setShowQuestionnaire(true), 1000);
      } else {
        setFaceDetectionStatus('error');
        setFaceDetectionError('Лицо не обнаружено. Пожалуйста, сделайте четкое фото.');
      }
    } catch (error) {
      console.error('Ошибка проверки лица:', error);
      setFaceDetectionStatus('error');
      setFaceDetectionError('Не удалось проанализировать фото.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleQuestionnaireComplete = (data: HealthQuestionnaire) => {
    setQuestionnaireData(data);
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

  // === UI блок статусов ===
  const FaceDetectionStatusComponent = () => {
    if (faceDetectionStatus === 'checking') {
      return (
        <div className={styles.faceDetectionStatus}>
          <div className={styles.statusChecking}>
            <div className={styles.spinner}></div>
            <h3>Проверка фотографии...</h3>
            <p>Ищем лицо на изображении</p>
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
                <li>Лицо в центре кадра</li>
                <li>Хорошее освещение</li>
                <li>Без очков и головных уборов</li>
                <li>Прямой взгляд в камеру</li>
              </ul>
            </div>
            <button className={styles.retryButton} onClick={reset}>
              Попробовать снова
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
              <video ref={videoRef} autoPlay playsInline muted className={styles.videoFeed} />
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

    {photo && faceDetectionStatus && !showResult && (
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
              <div className={styles.actionButtons}>
                <button className={styles.resetButton} onClick={reset}>
                  Сканировать другое фото
                </button>
                <Link to="/coupons">
                  <button className={styles.ticketButton}>Взять талон к врачу</button>
                </Link>
              </div>
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
                <button className={styles.saveButton} onClick={() => setShowSaveModal(true)}>
                  Сохранить
                </button>

                {showSaveModal && (
                  <div className={styles.saveModal}>
                    <div className={styles.saveOverlay} onClick={() => setShowSaveModal(false)} />
                    <div className={styles.saveContent}>
                      <h3>Сохранить результат</h3>
                      <div className={styles.saveActions}>
                        <button>Сохранить в аккаунт</button>
                        <button>Скачать PDF</button>
                      </div>
                      <button
                        className={styles.closeSaveModal}
                        onClick={() => setShowSaveModal(false)}
                      >
                        X
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {showQuestionnaire && (
        <div className={styles.questionnaireModal}>
          <div className={styles.questionnaireOverlay} onClick={handleQuestionnaireClose} />
          <div className={styles.questionnaireContent}>
            <Questionnaire onComplete={handleQuestionnaireComplete} />
            <button className={styles.closeQuestionnaire} onClick={handleQuestionnaireClose}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
