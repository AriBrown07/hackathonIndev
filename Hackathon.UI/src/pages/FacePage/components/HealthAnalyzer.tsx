import React, { useEffect, useState } from 'react';
import { 
  Heart, 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  Brain,
  Eye,
  Navigation,
  Loader
} from 'lucide-react';
import styles from './HealthAnalyzer.module.scss';
import type { HealthQuestionnaire } from '../../../types';
import { useFaceAnalysis, type FaceAnalysisResult } from '../../../hooks/useFaceAnalysis';

interface HealthAnalyzerProps {
  photo: string;
  questionnaireData: HealthQuestionnaire;
  onAnalysisComplete: (result: HealthAnalysisResult) => void;
}

export interface HealthAnalysisResult {
  overallScore: number;
  faceAnalysis: FaceAnalysis;
  postureAnalysis: PostureAnalysis;
  skinAnalysis: SkinAnalysis;
  vitalSigns: VitalSigns;
  recommendations: string[];
  warnings: string[];
  metrics: HealthMetrics;
}

interface FaceAnalysis {
  symmetry: number;
  skinHealth: number;
  eyeFatigue: number;
  stressIndicators: number;
  landmarks: number;
  eyeAspectRatio: number;
  mouthOpenness: number;
  headPose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
}

interface PostureAnalysis {
  headTilt: number;
  shoulderAlignment: number;
  spineCurvature: number;
  confidence: number;
}

interface SkinAnalysis {
  complexion: number;
  texture: number;
  moistureLevel: number;
  issues: string[];
}

interface VitalSigns {
  heartRateEstimate: number;
  breathingRate: number;
  stressLevel: number;
}

interface HealthMetrics {
  bmiEstimate: number;
  bodyFatPercentage: number;
  muscleMass: number;
  hydrationLevel: number;
}

const HealthAnalyzer: React.FC<HealthAnalyzerProps> = ({ 
  photo, 
  questionnaireData, 
  onAnalysisComplete 
}) => {
  const [analysisResult, setAnalysisResult] = useState<HealthAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
  const { isLoading: modelsLoading, error: modelsError, analyzeImage } = useFaceAnalysis();

  useEffect(() => {
    if (!modelsLoading && !modelsError) {
      analyzeHealth();
    }
  }, [modelsLoading, modelsError]);

  const simulateProgress = () => {
    const steps = [
      'Инициализация Face Detection...',
      'Загрузка Face Mesh...',
      'Анализ симметрии лица...',
      'Оценка позы головы...',
      'Анализ состояния глаз...',
      'Генерация рекомендаций...'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(step);
        setProgress(((index + 1) / steps.length) * 100);
      }, index * 1000);
    });
  };

  const analyzeHealth = async () => {
    if (modelsLoading || modelsError) {
      setLoading(false);
      return;
    }

    setLoading(true);
    simulateProgress();

    try {
      const image = new Image();
      image.src = photo;
      await image.decode();

      setCurrentStep('Анализ лица с помощью MediaPipe...');
      
      const faceResult = await analyzeImage(image);
      const result = generateHealthResults(faceResult, questionnaireData);
      
      setAnalysisResult(result);
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Error in health analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHealthResults = (
    faceResult: FaceAnalysisResult, 
    questionnaire: HealthQuestionnaire
  ): HealthAnalysisResult => {
    const baseScore = 75;
    const faceSymmetryFactor = faceResult.symmetry * 0.2;
    const eyeFatigueFactor = -faceResult.eyeAspectRatio * 10;
    const ageFactor = questionnaire.age < 30 ? 10 : questionnaire.age > 50 ? -5 : 0;
    const stressFactor = -questionnaire.stressLevel * 2;
    const sleepFactor = questionnaire.sleepQuality === 'excellent' ? 10 : 
                       questionnaire.sleepQuality === 'good' ? 5 : 
                       questionnaire.sleepQuality === 'poor' ? -10 : 0;
    const habitsFactor = questionnaire.smoking ? -15 : 
                        questionnaire.alcoholConsumption === 'high' ? -10 :
                        questionnaire.alcoholConsumption === 'moderate' ? -5 : 0;

    const overallScore = Math.max(0, Math.min(100, 
      baseScore + faceSymmetryFactor + eyeFatigueFactor + ageFactor + stressFactor + sleepFactor + habitsFactor
    ));

    return {
      overallScore,
      faceAnalysis: {
        symmetry: faceResult.symmetry,
        skinHealth: questionnaire.hasSkinConditions ? 60 : 80,
        eyeFatigue: Math.max(0, 100 - faceResult.eyeAspectRatio * 200),
        stressIndicators: Math.min(100, questionnaire.stressLevel * 10 + Math.abs(faceResult.headPose.roll) / 2),
        landmarks: faceResult.landmarks?.length || 0,
        eyeAspectRatio: faceResult.eyeAspectRatio,
        mouthOpenness: faceResult.mouthOpenness,
        headPose: faceResult.headPose
      },
      postureAnalysis: {
        headTilt: Math.max(0, 100 - Math.abs(faceResult.headPose.roll) / 2),
        shoulderAlignment: 85,
        spineCurvature: 80,
        confidence: 90
      },
      skinAnalysis: {
        complexion: 78,
        texture: 82,
        moistureLevel: questionnaire.skinSensitivity === 'high' ? 65 : 75,
        issues: questionnaire.skinConditions
      },
      vitalSigns: {
        heartRateEstimate: 72 + questionnaire.stressLevel,
        breathingRate: 16,
        stressLevel: questionnaire.stressLevel * 10
      },
      metrics: {
        bmiEstimate: calculateBMI(questionnaire.age, questionnaire.gender),
        bodyFatPercentage: estimateBodyFat(questionnaire.age, questionnaire.gender),
        muscleMass: 65,
        hydrationLevel: 72
      },
      recommendations: generateRecommendations(faceResult, questionnaire),
      warnings: generateWarnings(faceResult, questionnaire)
    };
  };

  const calculateBMI = (age: number, gender: string): number => {
    const base = gender === 'male' ? 23 : 22;
    return age < 30 ? base : base + (age - 30) * 0.1;
  };

  const estimateBodyFat = (age: number, gender: string): number => {
    const base = gender === 'male' ? 18 : 25;
    return base + (age - 25) * 0.2;
  };

  const generateRecommendations = (
    faceResult: FaceAnalysisResult, 
    questionnaire: HealthQuestionnaire
  ): string[] => {
    const recommendations: string[] = [];
    
    if (faceResult.eyeAspectRatio < 0.2) {
      recommendations.push('Обнаружены признаки усталости глаз. Рекомендуется отдых для глаз');
    }
    
    if (faceResult.symmetry < 80) {
      recommendations.push('Обнаружена асимметрия лица. Рекомендуется консультация специалиста');
    }
    
    if (Math.abs(faceResult.headPose.roll) > 20) {
      recommendations.push('Обнаружен наклон головы. Обратите внимание на осанку');
    }
    
    if (questionnaire.stressLevel > 7) {
      recommendations.push('Высокий уровень стресса. Рекомендуются техники релаксации');
    }
    
    if (questionnaire.sleepQuality === 'poor') {
      recommendations.push('Низкое качество сна. Улучшите гигиену сна');
    }

    if (questionnaire.smoking) {
      recommendations.push('Курение негативно влияет на состояние кожи и общее здоровье');
    }

    return recommendations;
  };

  const generateWarnings = (
    faceResult: FaceAnalysisResult, 
    questionnaire: HealthQuestionnaire
  ): string[] => {
    const warnings: string[] = [];
    
    if (!faceResult.detected) {
      warnings.push('Лицо не обнаружено. Убедитесь, что лицо хорошо видно на фото');
    }
    
    if (questionnaire.stressLevel > 8) {
      warnings.push('Очень высокий уровень стресса. Рекомендуется консультация врача');
    }
    
    if (questionnaire.symptoms.includes('Боль в груди')) {
      warnings.push('Боль в груди требует немедленной медицинской помощи');
    }

    return warnings;
  };

  if (modelsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size={32} className={styles.spinner} />
        <h3>Загрузка моделей MediaPipe...</h3>
        <p>Пожалуйста, подождите, загружаются модели для анализа лица</p>
      </div>
    );
  }

  if (modelsError) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={40} />
        <h3>Ошибка загрузки моделей</h3>
        <p>{modelsError}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.progressSection}>
          <h3>Анализ здоровья с помощью MediaPipe</h3>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className={styles.currentStep}>{currentStep}</p>
          <div className={styles.analysisSteps}>
            <div className={styles.step}>
              <Brain size={20} />
              <span>Face Detection</span>
            </div>
            <div className={styles.step}>
              <Activity size={20} />
              <span>Face Mesh</span>
            </div>
            <div className={styles.step}>
              <Eye size={20} />
              <span>Анализ симметрии</span>
            </div>
            <div className={styles.step}>
              <Navigation size={20} />
              <span>Оценка позы</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={40} />
        <h3>Ошибка анализа</h3>
        <p>Не удалось проанализировать изображение</p>
      </div>
    );
  }

  return (
    <div className={styles.healthReport}>
      <div className={styles.overallScore}>
        <div className={styles.scoreCircle}>
          <div className={styles.scoreValue}>{analysisResult.overallScore}</div>
          <div className={styles.scoreLabel}>Общий показатель</div>
        </div>
        <div className={styles.scoreDescription}>
          <TrendingUp size={20} />
          <span>На основе анализа MediaPipe и анкеты</span>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Brain size={20} />
            <h4>Анализ лица MediaPipe</h4>
          </div>
          <div className={styles.metricList}>
            <div className={styles.metricItem}>
              <span>Симметрия лица</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.faceAnalysis.symmetry}%` }}
                ></div>
              </div>
              <span>{analysisResult.faceAnalysis.symmetry}%</span>
            </div>
            <div className={styles.metricItem}>
              <span>Соотношение глаз</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.faceAnalysis.eyeAspectRatio * 200}%` }}
                ></div>
              </div>
              <span>{analysisResult.faceAnalysis.eyeAspectRatio.toFixed(2)}</span>
            </div>
            <div className={styles.metricItem}>
              <span>Точек распознавания</span>
              <span className={styles.metricValue}>{analysisResult.faceAnalysis.landmarks}</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Navigation size={20} />
            <h4>Поза головы</h4>
          </div>
          <div className={styles.poseInfo}>
            <div className={styles.poseItem}>
              <span>Наклон (Pitch)</span>
              <span className={styles.poseValue}>{analysisResult.faceAnalysis.headPose.pitch}°</span>
            </div>
            <div className={styles.poseItem}>
              <span>Поворот (Yaw)</span>
              <span className={styles.poseValue}>{analysisResult.faceAnalysis.headPose.yaw}°</span>
            </div>
            <div className={styles.poseItem}>
              <span>Крен (Roll)</span>
              <span className={styles.poseValue}>{analysisResult.faceAnalysis.headPose.roll}°</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Heart size={20} />
            <h4>Витальные показатели</h4>
          </div>
          <div className={styles.vitalSigns}>
            <div className={styles.vitalItem}>
              <span>Пульс</span>
              <span className={styles.vitalValue}>{analysisResult.vitalSigns.heartRateEstimate} уд/мин</span>
            </div>
            <div className={styles.vitalItem}>
              <span>Дыхание</span>
              <span className={styles.vitalValue}>{analysisResult.vitalSigns.breathingRate} вдохов/мин</span>
            </div>
            <div className={styles.vitalItem}>
              <span>Уровень стресса</span>
              <span className={styles.vitalValue}>{analysisResult.vitalSigns.stressLevel}%</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Eye size={20} />
            <h4>Состояние глаз</h4>
          </div>
          <div className={styles.metricList}>
            <div className={styles.metricItem}>
              <span>Усталость глаз</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.faceAnalysis.eyeFatigue}%` }}
                ></div>
              </div>
              <span>{analysisResult.faceAnalysis.eyeFatigue}%</span>
            </div>
            <div className={styles.metricItem}>
              <span>Открытость рта</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.faceAnalysis.mouthOpenness}%` }}
                ></div>
              </div>
              <span>{analysisResult.faceAnalysis.mouthOpenness}%</span>
            </div>
          </div>
        </div>
      </div>

      {analysisResult.recommendations.length > 0 && (
        <div className={styles.recommendations}>
          <div className={styles.sectionHeader}>
            <TrendingUp size={20} />
            <h4>Рекомендации на основе анализа</h4>
          </div>
          <div className={styles.recommendationList}>
            {analysisResult.recommendations.map((rec, index) => (
              <div key={index} className={styles.recommendationItem}>
                <div className={styles.recommendationBullet}></div>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysisResult.warnings.length > 0 && (
        <div className={styles.warnings}>
          <div className={styles.sectionHeader}>
            <AlertCircle size={20} />
            <h4>Обратите внимание</h4>
          </div>
          <div className={styles.warningList}>
            {analysisResult.warnings.map((warning, index) => (
              <div key={index} className={styles.warningItem}>
                <AlertCircle size={16} />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.mediapipeInfo}>
        <p>Анализ выполнен с использованием MediaPipe Face Detection и Face Mesh</p>
      </div>
    </div>
  );
};

export default HealthAnalyzer;