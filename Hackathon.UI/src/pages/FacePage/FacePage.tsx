import { useState, useRef, useEffect } from 'react';
import { Camera, Upload } from 'lucide-react';
import styles from './FacePage.module.scss';

export default function FaceScanner() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      // ВАЖНО: сначала сохраняем поток и включаем камеру
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Не удалось получить доступ к камере');
    }
  };

  // Привязываем stream к <video>, когда он смонтирован
  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .catch((err) => console.warn('Video play interrupted:', err));
    }
  }, [isCameraActive, stream]);

  // Чистим треки при размонтировании
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
        startScanning();
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
        setPhoto(e.target?.result as string);
        startScanning();
      };
      reader.readAsDataURL(file);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowResult(true);
    }, 3000);
  };

  const reset = () => {
    setPhoto(null);
    setShowResult(false);
    setIsScanning(false);
    stopCamera();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {!photo && !isCameraActive && (
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

            {/* Вариант 1: заменить на cameraControls,
                Вариант 2: добавить алиас в SCSS */}
            <div className={styles.captureControls}>
              <button className={styles.captureMainButton} onClick={capturePhoto}>
                Сделать снимок
              </button>
              <button className={styles.cancelSmall} onClick={stopCamera}>
                Отмена
              </button>
            </div>
          </div>
        )}

        {photo && !showResult && (
          <div className={styles.scanningSection}>
            <div className={styles.photoWrapper}>
              <img src={photo} alt="Captured" className={styles.photo} />
              {isScanning && (
                <div className={styles.scanAnimation}>
                  <div className={styles.scanLine}></div>
                </div>
              )}
            </div>
            {isScanning && <p className={styles.scanningText}>Сканирование лица...</p>}
          </div>
        )}

        {showResult && (
          <div className={styles.resultSection}>
            <div className={styles.leftPanel}>
              <div className={styles.photoContainer}>
                <img src={photo!} alt="Scanned face" className={styles.resultPhoto} />
              </div>
              <button className={styles.resetButton} onClick={reset}>
                Сканировать другое фото
              </button>
            </div>

            <div className={styles.rightPanel}>
              <div className={styles.resultCard}>
                <h2 className={styles.resultTitle}>Результат анализа</h2>
                <div className={styles.resultContent}>{/* ... */}</div>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
