import { useState, useRef } from 'react';
import { Upload, Camera, FileImage, Activity, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import styles from './Diagnostics.module.scss';

interface HealthQuestion {
  id: string;
  question: string;
  options: string[];
}

interface DiagnosisResult {
  condition: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  description: string;
}

const Diagnostics = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [step, setStep] = useState<'upload' | 'questionnaire' | 'result'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  const healthQuestions: HealthQuestion[] = [
    {
      id: 'symptoms',
      question: 'Какие симптомы вы наблюдаете?',
      options: ['Боль', 'Покраснение', 'Отек', 'Зуд', 'Нет симптомов']
    },
    {
      id: 'duration',
      question: 'Как долго наблюдаются симптомы?',
      options: ['Менее суток', '1-3 дня', '3-7 дней', 'Более недели', 'Более месяца']
    },
    {
      id: 'previous',
      question: 'Были ли подобные случаи ранее?',
      options: ['Да, часто', 'Да, редко', 'Нет, впервые']
    },
    {
      id: 'medications',
      question: 'Принимаете ли вы какие-либо лекарства?',
      options: ['Да, регулярно', 'Да, иногда', 'Нет']
    },
    {
      id: 'allergies',
      question: 'Есть ли у вас аллергии?',
      options: ['Да, на медикаменты', 'Да, пищевые', 'Да, другие', 'Нет']
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWebcamCapture = async () => {
    if (!isWebcamActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          setIsWebcamActive(true);
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Не удалось получить доступ к камере');
      }
    } else {
      if (webcamRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = webcamRef.current.videoWidth;
        canvas.height = webcamRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(webcamRef.current, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'webcam-photo.jpg', { type: 'image/jpeg' });
              setImageFile(file);
              setImagePreview(canvas.toDataURL());
            }
          });
        }
        const stream = webcamRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setIsWebcamActive(false);
      }
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextStep = () => {
    if (step === 'upload' && imagePreview) {
      setStep('questionnaire');
    } else if (step === 'questionnaire') {
      analyzeData();
    }
  };

  const analyzeData = async () => {
    setIsAnalyzing(true);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockResult: DiagnosisResult = {
      condition: 'Дерматит',
      severity: 'medium',
      confidence: 78,
      description: 'На основе анализа изображения и ваших ответов, обнаружены признаки контактного дерматита. Это воспалительное заболевание кожи, которое возникает при контакте с раздражающим веществом.',
      recommendations: [
        'Избегайте контакта с потенциальными аллергенами',
        'Используйте увлажняющие кремы для кожи',
        'Не расчесывайте пораженные участки',
        'Рекомендуется консультация дерматолога',
        'При усилении симптомов немедленно обратитесь к врачу'
      ]
    };

    setDiagnosisResult(mockResult);
    setIsAnalyzing(false);
    setStep('result');
  };

  const resetDiagnostics = () => {
    setImagePreview(null);
    setImageFile(null);
    setAnswers({});
    setDiagnosisResult(null);
    setStep('upload');
    setIsWebcamActive(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low': return 'Низкая';
      case 'medium': return 'Средняя';
      case 'high': return 'Высокая';
      default: return 'Неизвестная';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Activity className={styles.headerIcon} />
          <h1 className={styles.title}>Медицинская диагностика</h1>
        </div>
        {step !== 'upload' && (
          <button className={styles.resetButton} onClick={resetDiagnostics}>
            Начать заново
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          {step === 'upload' && (
            <div className={styles.uploadSection}>
              <h2 className={styles.sectionTitle}>Загрузите изображение</h2>

              <div className={styles.uploadOptions}>
                <button
                  className={styles.uploadButton}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8" />
                  <span>Загрузить с устройства</span>
                </button>

                <button
                  className={`${styles.uploadButton} ${isWebcamActive ? styles.active : ''}`}
                  onClick={handleWebcamCapture}
                >
                  <Camera className="w-8 h-8" />
                  <span>{isWebcamActive ? 'Сделать снимок' : 'Использовать камеру'}</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className={styles.fileInput}
              />

              {isWebcamActive && (
                <div className={styles.webcamContainer}>
                  <video
                    ref={webcamRef}
                    autoPlay
                    playsInline
                    className={styles.webcam}
                  />
                </div>
              )}

              {imagePreview && !isWebcamActive && (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" />
                  <div className={styles.imageOverlay}>
                    <FileImage className="w-8 h-8" />
                    <span>Изображение загружено</span>
                  </div>
                </div>
              )}

              {imagePreview && (
                <button
                  className={styles.continueButton}
                  onClick={handleNextStep}
                >
                  Продолжить к анкете
                </button>
              )}
            </div>
          )}

          {step === 'questionnaire' && (
            <div className={styles.questionnaireSection}>
              <h2 className={styles.sectionTitle}>Анкета о состоянии здоровья</h2>

              <div className={styles.questions}>
                {healthQuestions.map((q, index) => (
                  <div key={q.id} className={styles.question}>
                    <label className={styles.questionLabel}>
                      {index + 1}. {q.question}
                    </label>
                    <div className={styles.options}>
                      {q.options.map(option => (
                        <button
                          key={option}
                          className={`${styles.option} ${answers[q.id] === option ? styles.selected : ''}`}
                          onClick={() => handleAnswerChange(q.id, option)}
                        >
                          {answers[q.id] === option && <CheckCircle2 className="w-5 h-5" />}
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                className={styles.analyzeButton}
                onClick={handleNextStep}
                disabled={Object.keys(answers).length < healthQuestions.length}
              >
                Начать анализ
              </button>
            </div>
          )}

          {step === 'result' && imagePreview && (
            <div className={styles.resultImageSection}>
              <h2 className={styles.sectionTitle}>Загруженное изображение</h2>
              <div className={styles.resultImage}>
                <img src={imagePreview} alt="Analyzed" />
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightPanel}>
          {step === 'result' && !isAnalyzing && diagnosisResult ? (
            <div className={styles.resultsSection}>
              <div className={styles.resultsHeader}>
                <Activity className={styles.resultsIcon} />
                <h2 className={styles.sectionTitle}>Результаты диагностики</h2>
              </div>

              <div className={styles.resultCard}>
                <div className={styles.diagnosisHeader}>
                  <h3 className={styles.diagnosisTitle}>{diagnosisResult.condition}</h3>
                  <div
                    className={styles.severityBadge}
                    style={{ backgroundColor: getSeverityColor(diagnosisResult.severity) }}
                  >
                    {getSeverityLabel(diagnosisResult.severity)} степень
                  </div>
                </div>

                <div className={styles.confidenceBar}>
                  <div className={styles.confidenceLabel}>
                    <span>Уровень достоверности</span>
                    <span className={styles.confidenceValue}>{diagnosisResult.confidence}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progress}
                      style={{ width: `${diagnosisResult.confidence}%` }}
                    />
                  </div>
                </div>

                <div className={styles.description}>
                  <p>{diagnosisResult.description}</p>
                </div>

                <div className={styles.recommendations}>
                  <h4 className={styles.recommendationsTitle}>Рекомендации:</h4>
                  <ul className={styles.recommendationsList}>
                    {diagnosisResult.recommendations.map((rec, index) => (
                      <li key={index} className={styles.recommendationItem}>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.disclaimer}>
                  <AlertCircle className="w-5 h-5" />
                  <p>
                    Это предварительная оценка. Для точного диагноза необходима консультация специалиста.
                  </p>
                </div>

                <button className={styles.appointmentButton}>
                  Записаться к врачу
                </button>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className={styles.analyzingSection}>
              <Loader2 className={styles.spinner} />
              <h3 className={styles.analyzingTitle}>Анализируем данные...</h3>
              <p className={styles.analyzingText}>
                Обрабатываем изображение и анализируем ваши ответы.
                Это может занять несколько секунд.
              </p>
            </div>
          ) : (
            <div className={styles.placeholderSection}>
              <Activity className={styles.placeholderIcon} />
              <h3 className={styles.placeholderTitle}>Результаты диагностики</h3>
              <p className={styles.placeholderText}>
                Загрузите изображение и заполните анкету, чтобы получить предварительную оценку состояния здоровья
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;
