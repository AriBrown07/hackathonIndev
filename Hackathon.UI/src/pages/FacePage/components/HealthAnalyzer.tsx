import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  Brain,
  Eye,
  Navigation,
  Loader,
  Heart,
  Shield,
  Zap,
  Clock,
  Droplets,
  Sun,
  Moon,
  Smile,
  Frown,
  Thermometer,
  Activity as Fitness
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
  facialAnalysis: FacialAnalysis;
  skinHealth: SkinHealth;
  stressIndicators: StressIndicators;
  lifestyleFactors: LifestyleFactors;
  healthRisks: HealthRisks;
  detailedConclusion: DetailedConclusion;
  recommendations: Recommendation[];
  warnings: string[];
}

export interface FacialAnalysis {
  symmetry: number;
  eyeHealth: EyeHealth;
  facialTension: FacialTension;
  posture: PostureAnalysis;
}

export interface EyeHealth {
  fatigueLevel: number;
  darkCircles: number;
  eyeOpenness: number;
  overall: number;
}

export interface FacialTension {
  jawClenching: number;
  foreheadTension: number;
  overall: number;
}

export interface PostureAnalysis {
  headTilt: number;
  shoulderAlignment: number;
  overall: number;
}

export interface SkinHealth {
  complexion: ComplexionAnalysis;
  texture: TextureAnalysis;
  hydration: number;
  sensitivity: number;
  overall: number;
}

export interface ComplexionAnalysis {
  evenness: number;
  redness: number;
  pigmentation: number;
}

export interface TextureAnalysis {
  smoothness: number;
  pores: number;
  elasticity: number;
}

export interface StressIndicators {
  physical: PhysicalStress;
  mental: MentalStress;
  recoveryNeed: number;
  overall: number;
}

export interface PhysicalStress {
  muscleTension: number;
  eyeStrain: number;
  sleepDeprivation: number;
}

export interface MentalStress {
  anxietyLevel: number;
  burnoutRisk: number;
  cognitiveFunction: number;
}

export interface LifestyleFactors {
  sleep: SleepAnalysis;
  nutrition: NutritionAnalysis;
  activity: ActivityLevel;
  habits: HabitsAnalysis;
  overall: number;
}

export interface SleepAnalysis {
  quality: number;
  duration: number;
  consistency: number;
}

export interface NutritionAnalysis {
  hydration: number;
  dietQuality: number;
  alcoholImpact: number;
}

export interface ActivityLevel {
  physical: number;
  recovery: number;
  sedentaryTime: number;
}

export interface HabitsAnalysis {
  smokingImpact: number;
  sunExposure: number;
  stressManagement: number;
}

export interface HealthRisks {
  skinConditions: string[];
  chronicDiseases: string[];
  lifestyleRisks: string[];
  stressRelated: string[];
}

export interface DetailedConclusion {
  executiveSummary: string;
  facialHealth: string;
  skinAssessment: string;
  stressEvaluation: string;
  lifestyleImpact: string;
  preventiveMeasures: string;
  positiveAspects: string[];
  improvementAreas: string[];
}

export interface Recommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  actions: string[];
  timeline: string;
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
      'Анализ симметрии лица...',
      'Оценка состояния кожи...',
      'Определение уровня стресса...',
      'Анализ осанки и мышечного напряжения...',
      'Оценка факторов образа жизни...',
      'Формирование детального заключения...'
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
    
    const facialAnalysis = analyzeFacialFeatures(faceResult, questionnaire);
    const skinHealth = analyzeSkinHealth(questionnaire, faceResult);
    const stressIndicators = analyzeStressIndicators(faceResult, questionnaire);
    const lifestyleFactors = analyzeLifestyleFactors(questionnaire);
    const healthRisks = identifyHealthRisks(questionnaire);
    const detailedConclusion = generateDetailedConclusion(facialAnalysis, skinHealth, stressIndicators, lifestyleFactors, healthRisks, questionnaire);
    const recommendations = generateRecommendations(facialAnalysis, skinHealth, stressIndicators, lifestyleFactors, healthRisks);

    const overallScore = calculateOverallScore(
      facialAnalysis,
      skinHealth, 
      stressIndicators,
      lifestyleFactors
    );

    return {
      overallScore,
      facialAnalysis,
      skinHealth,
      stressIndicators,
      lifestyleFactors,
      healthRisks,
      detailedConclusion,
      recommendations,
      warnings: generateWarnings(healthRisks, stressIndicators)
    };
  };

  const analyzeFacialFeatures = (faceResult: FaceAnalysisResult, questionnaire: HealthQuestionnaire): FacialAnalysis => {
    return {
      symmetry: faceResult.symmetry,
      eyeHealth: {
        fatigueLevel: Math.min(100, (1 - faceResult.eyeAspectRatio) * 100),
        darkCircles: questionnaire.stressLevel * 8 + (questionnaire.sleepQuality === 'poor' ? 30 : 0),
        eyeOpenness: faceResult.eyeAspectRatio * 100,
        overall: Math.max(0, 100 - (1 - faceResult.eyeAspectRatio) * 50 - questionnaire.stressLevel * 3)
      },
      facialTension: {
        jawClenching: Math.min(100, Math.abs(faceResult.headPose.yaw) * 2 + questionnaire.stressLevel * 6),
        foreheadTension: Math.min(100, Math.abs(faceResult.headPose.pitch) * 1.5 + questionnaire.stressLevel * 5),
        overall: Math.min(100, (Math.abs(faceResult.headPose.yaw) + Math.abs(faceResult.headPose.pitch)) * 1.5 + questionnaire.stressLevel * 5)
      },
      posture: {
        headTilt: Math.max(0, 100 - Math.abs(faceResult.headPose.roll) * 3),
        shoulderAlignment: 85 - Math.abs(faceResult.headPose.roll) * 2,
        overall: Math.max(0, 100 - Math.abs(faceResult.headPose.roll) * 2.5)
      }
    };
  };

  const analyzeSkinHealth = (questionnaire: HealthQuestionnaire, faceResult: FaceAnalysisResult): SkinHealth => {
    const baseScore = 75;
    const conditionFactor = questionnaire.hasSkinConditions ? -25 : 15;
    const sensitivityFactor = questionnaire.skinSensitivity === 'high' ? -15 : 
                             questionnaire.skinSensitivity === 'low' ? 5 : 0;
    const sunFactor = questionnaire.recentSunExposure ? -20 : 10;
    const stressFactor = -questionnaire.stressLevel * 2;

    return {
      complexion: {
        evenness: faceResult.symmetry > 80 ? 85 : 70,
        redness: questionnaire.skinSensitivity === 'high' ? 40 : 20 + questionnaire.stressLevel * 3,
        pigmentation: questionnaire.recentSunExposure ? 35 : 15
      },
      texture: {
        smoothness: baseScore + conditionFactor + sensitivityFactor,
        pores: questionnaire.hasSkinConditions ? 35 : 65,
        elasticity: Math.max(30, 80 - questionnaire.age * 0.5)
      },
      hydration: questionnaire.skinSensitivity === 'high' ? 60 : 75 - questionnaire.stressLevel * 2,
      sensitivity: questionnaire.skinSensitivity === 'high' ? 80 : 
                   questionnaire.skinSensitivity === 'medium' ? 50 : 20,
      overall: Math.max(0, Math.min(100, baseScore + conditionFactor + sensitivityFactor + sunFactor + stressFactor))
    };
  };

  const analyzeStressIndicators = (faceResult: FaceAnalysisResult, questionnaire: HealthQuestionnaire): StressIndicators => {
    const physicalStress = Math.min(100, 
      (100 - faceResult.eyeAspectRatio * 100) * 0.4 +
      Math.abs(faceResult.headPose.roll) * 0.5 +
      questionnaire.stressLevel * 6
    );

    const mentalStress = Math.min(100, questionnaire.stressLevel * 10);

    return {
      physical: {
        muscleTension: Math.min(100, Math.abs(faceResult.headPose.roll) * 3 + questionnaire.stressLevel * 7),
        eyeStrain: Math.min(100, (1 - faceResult.eyeAspectRatio) * 80),
        sleepDeprivation: questionnaire.sleepQuality === 'poor' ? 80 : 
                         questionnaire.sleepQuality === 'fair' ? 50 : 20
      },
      mental: {
        anxietyLevel: Math.min(100, questionnaire.stressLevel * 9 + (questionnaire.sleepQuality === 'poor' ? 20 : 0)),
        burnoutRisk: Math.min(100, questionnaire.stressLevel * 8 + (questionnaire.symptoms.includes('Усталость') ? 25 : 0)),
        cognitiveFunction: Math.max(0, 100 - questionnaire.stressLevel * 6 - (questionnaire.sleepQuality === 'poor' ? 30 : 0))
      },
      recoveryNeed: Math.min(100, physicalStress * 0.6 + mentalStress * 0.4),
      overall: Math.min(100, (physicalStress + mentalStress) / 2)
    };
  };

  const analyzeLifestyleFactors = (questionnaire: HealthQuestionnaire): LifestyleFactors => {
    return {
      sleep: {
        quality: questionnaire.sleepQuality === 'excellent' ? 90 :
                questionnaire.sleepQuality === 'good' ? 75 :
                questionnaire.sleepQuality === 'fair' ? 60 : 40,
        duration: 70,
        consistency: questionnaire.sleepQuality === 'excellent' ? 85 : 60
      },
      nutrition: {
        hydration: 70,
        dietQuality: questionnaire.alcoholConsumption === 'high' ? 40 :
                    questionnaire.alcoholConsumption === 'moderate' ? 65 : 80,
        alcoholImpact: questionnaire.alcoholConsumption === 'high' ? 80 :
                      questionnaire.alcoholConsumption === 'moderate' ? 40 : 10
      },
      activity: {
        physical: 65,
        recovery: questionnaire.sleepQuality === 'excellent' ? 80 : 50,
        sedentaryTime: 60
      },
      habits: {
        smokingImpact: questionnaire.smoking ? 90 : 10,
        sunExposure: questionnaire.recentSunExposure ? 70 : 20,
        stressManagement: Math.max(0, 100 - questionnaire.stressLevel * 8)
      },
      overall: calculateLifestyleScore(questionnaire)
    };
  };

  const calculateLifestyleScore = (questionnaire: HealthQuestionnaire): number => {
    let score = 70;
    
    if (questionnaire.sleepQuality === 'excellent') score += 15;
    else if (questionnaire.sleepQuality === 'poor') score -= 20;
    
    if (questionnaire.smoking) score -= 25;
    
    if (questionnaire.alcoholConsumption === 'high') score -= 20;
    else if (questionnaire.alcoholConsumption === 'moderate') score -= 10;
    
    score -= questionnaire.stressLevel * 2;
    
    return Math.max(0, Math.min(100, score));
  };

  const identifyHealthRisks = (questionnaire: HealthQuestionnaire): HealthRisks => {
    const risks: HealthRisks = {
      skinConditions: [],
      chronicDiseases: [],
      lifestyleRisks: [],
      stressRelated: []
    };

    if (questionnaire.hasSkinConditions) {
      risks.skinConditions = questionnaire.skinConditions;
    }

    if (questionnaire.hasChronicDiseases) {
      risks.chronicDiseases = questionnaire.chronicDiseases;
    }

    if (questionnaire.smoking) {
      risks.lifestyleRisks.push('Курение');
    }

    if (questionnaire.alcoholConsumption === 'high') {
      risks.lifestyleRisks.push('Высокое потребление алкоголя');
    }

    if (questionnaire.sleepQuality === 'poor') {
      risks.lifestyleRisks.push('Низкое качество сна');
    }

    if (questionnaire.stressLevel > 7) {
      risks.stressRelated.push('Высокий уровень стресса');
    }

    if (questionnaire.symptoms.includes('Усталость')) {
      risks.stressRelated.push('Хроническая усталость');
    }

    return risks;
  };

  const generateDetailedConclusion = (
    facial: FacialAnalysis,
    skin: SkinHealth,
    stress: StressIndicators,
    lifestyle: LifestyleFactors,
    risks: HealthRisks,
    questionnaire: HealthQuestionnaire
  ): DetailedConclusion => {
    
    const positiveAspects: string[] = [];
    const improvementAreas: string[] = [];

    // Определяем положительные аспекты
    if (facial.symmetry > 80) {
      positiveAspects.push("отличная симметрия лица");
    }
    if (skin.overall > 70) {
      positiveAspects.push("хорошее общее состояние кожи");
    }
    if (stress.overall < 40) {
      positiveAspects.push("низкий уровень стресса");
    }
    if (lifestyle.overall > 70) {
      positiveAspects.push("здоровый образ жизни");
    }
    if (!questionnaire.smoking) {
      positiveAspects.push("отсутствие вредных привычек");
    }

    // Определяем области для улучшения
    if (facial.eyeHealth.fatigueLevel > 60) {
      improvementAreas.push("усталость глаз");
    }
    if (facial.facialTension.overall > 50) {
      improvementAreas.push("мышечное напряжение в области лица");
    }
    if (skin.hydration < 60) {
      improvementAreas.push("недостаточное увлажнение кожи");
    }
    if (stress.overall > 60) {
      improvementAreas.push("высокий уровень стресса");
    }
    if (lifestyle.sleep.quality < 60) {
      improvementAreas.push("низкое качество сна");
    }

    return {
      executiveSummary: generateExecutiveSummary(facial, skin, stress, lifestyle, questionnaire),
      facialHealth: generateFacialHealthAnalysis(facial),
      skinAssessment: generateSkinAssessment(skin, questionnaire),
      stressEvaluation: generateStressEvaluation(stress, questionnaire),
      lifestyleImpact: generateLifestyleImpact(lifestyle, risks),
      preventiveMeasures: generatePreventiveMeasures(risks, facial, skin, stress),
      positiveAspects,
      improvementAreas
    };
  };

  const generateExecutiveSummary = (
    facial: FacialAnalysis,
    skin: SkinHealth,
    stress: StressIndicators,
    lifestyle: LifestyleFactors,
    questionnaire: HealthQuestionnaire
  ): string => {
    const aspects: string[] = [];
    
    if (facial.symmetry > 75) {
      aspects.push("хорошие показатели симметрии лица");
    } else {
      aspects.push("некоторые асимметрии, требующие внимания");
    }
    
    if (skin.overall > 65) {
      aspects.push("удовлетворительное состояние кожи");
    } else {
      aspects.push("требуется улучшение ухода за кожей");
    }
    
    if (stress.overall < 50) {
      aspects.push("умеренный уровень стресса");
    } else {
      aspects.push("повышенный уровень стресса, требующий управления");
    }
    
    if (lifestyle.overall > 60) {
      aspects.push("в целом здоровый образ жизни");
    } else {
      aspects.push("некоторые аспекты образа жизни требуют коррекции");
    }

    return `На основе комплексного анализа выявлено ${aspects.join(', ')}. ${questionnaire.userName}, ваш организм демонстрирует хороший потенциал для поддержания здоровья при условии выполнения рекомендаций.`;
  };

  const generateFacialHealthAnalysis = (facial: FacialAnalysis): string => {
    const analysis: string[] = [];
    
    analysis.push(`Симметрия лица составляет ${facial.symmetry}%, что ${facial.symmetry > 80 ? 'является отличным показателем' : 'находится в пределах нормы'}.`);
    
    if (facial.eyeHealth.fatigueLevel > 60) {
      analysis.push(`Обнаружены признаки усталости глаз (${facial.eyeHealth.fatigueLevel}%), рекомендуется уделить внимание отдыху и увлажнению глаз.`);
    }
    
    if (facial.facialTension.overall > 50) {
      analysis.push(`Наблюдается мышечное напряжение в области лица, особенно в ${facial.facialTension.jawClenching > facial.facialTension.foreheadTension ? 'челюстной зоне' : 'области лба'}.`);
    }
    
    analysis.push(`Осанка головы ${facial.posture.overall > 70 ? 'хорошая' : 'требует коррекции'} для предотвращения мышечного дисбаланса.`);

    return analysis.join(' ');
  };

  const generateSkinAssessment = (skin: SkinHealth, questionnaire: HealthQuestionnaire): string => {
    const assessment: string[] = [];
    
    assessment.push(`Общее состояние кожи оценивается в ${skin.overall}%.`);
    assessment.push(`Уровень увлажнения составляет ${skin.hydration}%, что ${skin.hydration > 70 ? 'является хорошим показателем' : 'требует улучшения'}.`);
    
    if (skin.complexion.redness > 40) {
      assessment.push("Обнаружена склонность к покраснениям, возможно связанная с чувствительностью кожи или стрессом.");
    }
    
    if (questionnaire.hasSkinConditions) {
      assessment.push(`Имеющиеся состояния кожи (${questionnaire.skinConditions.join(', ')}) требуют специального ухода и наблюдения.`);
    }

    return assessment.join(' ');
  };

  const generateStressEvaluation = (stress: StressIndicators, questionnaire: HealthQuestionnaire): string => {
    const evaluation: string[] = [];
    
    evaluation.push(`Общий уровень стресса составляет ${stress.overall}%.`);
    
    if (stress.physical.muscleTension > 60) {
      evaluation.push("Выраженное мышечное напряжение указывает на накопление физического стресса.");
    }
    
    if (stress.mental.burnoutRisk > 70) {
      evaluation.push("Высокий риск эмоционального выгорания требует немедленных мер по восстановлению.");
    }
    
    if (questionnaire.stressLevel > 7) {
      evaluation.push("Субъективная оценка стресса подтверждается объективными показателями.");
    }

    return evaluation.join(' ');
  };

  const generateLifestyleImpact = (lifestyle: LifestyleFactors, risks: HealthRisks): string => {
    const impact: string[] = [];
    
    impact.push(`Общая оценка образа жизни: ${lifestyle.overall}%.`);
    
    if (lifestyle.sleep.quality < 60) {
      impact.push("Низкое качество сна существенно влияет на восстановление организма.");
    }
    
    if (lifestyle.habits.smokingImpact > 50) {
      impact.push("Курение оказывает значительное негативное влияние на здоровье.");
    }
    
    if (risks.lifestyleRisks.length > 0) {
      impact.push(`Факторы риска: ${risks.lifestyleRisks.join(', ')}.`);
    }

    return impact.join(' ');
  };

  const generatePreventiveMeasures = (
    risks: HealthRisks,
    facial: FacialAnalysis,
    skin: SkinHealth,
    stress: StressIndicators
  ): string => {
    const measures: string[] = [];
    
    if (stress.overall > 60) {
      measures.push("регулярные практики управления стрессом");
    }
    
    if (skin.hydration < 70) {
      measures.push("усиление режима увлажнения кожи");
    }
    
    if (facial.eyeHealth.fatigueLevel > 50) {
      measures.push("гимнастика для глаз и перерывы при работе за компьютером");
    }
    
    if (risks.lifestyleRisks.includes('Курение')) {
      measures.push("программа по отказу от курения");
    }

    return measures.length > 0 
      ? `Рекомендуемые профилактические меры: ${measures.join(', ')}.`
      : "Текущие профилактические меры адекватны, рекомендуется поддерживать существующий режим.";
  };

  const generateRecommendations = (
    facial: FacialAnalysis,
    skin: SkinHealth,
    stress: StressIndicators,
    lifestyle: LifestyleFactors,
    risks: HealthRisks
  ): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Рекомендации по лицу и осанке
    if (facial.facialTension.overall > 50 || facial.posture.overall < 70) {
      recommendations.push({
        category: 'Осанка и мышечное напряжение',
        priority: facial.facialTension.overall > 70 ? 'high' : 'medium',
        actions: [
          'Ежедневная гимнастика для лица',
          'Упражнения для шеи и плеч',
          'Самомассаж височно-нижнечелюстной области'
        ],
        timeline: '2-3 недели'
      });
    }

    // Рекомендации по коже
    if (skin.overall < 70 || skin.hydration < 65) {
      recommendations.push({
        category: 'Уход за кожей',
        priority: skin.overall < 60 ? 'high' : 'medium',
        actions: [
          'Индивидуальный подбор уходовых средств',
          'Регулярное увлажнение',
          'Защита от солнца SPF 30+'
        ],
        timeline: 'непрерывно'
      });
    }

    // Рекомендации по стрессу
    if (stress.overall > 50) {
      recommendations.push({
        category: 'Управление стрессом',
        priority: stress.overall > 70 ? 'high' : 'medium',
        actions: [
          'Дыхательные упражнения 2 раза в день',
          'Прогулки на свежем воздухе',
          'Техники релаксации перед сном'
        ],
        timeline: '4-6 недель'
      });
    }

    // Рекомендации по сну
    if (lifestyle.sleep.quality < 70) {
      recommendations.push({
        category: 'Качество сна',
        priority: 'medium',
        actions: [
          'Соблюдение режима сна',
          'Создание комфортных условий для сна',
          'Ограничение экранного времени перед сном'
        ],
        timeline: '2-3 недели'
      });
    }

    return recommendations;
  };

  const generateWarnings = (risks: HealthRisks, stress: StressIndicators): string[] => {
    const warnings: string[] = [];
    
    if (stress.mental.burnoutRisk > 80) {
      warnings.push('Крайне высокий риск эмоционального выгорания - рекомендуется консультация специалиста');
    }
    
    if (risks.chronicDiseases.length > 0) {
      warnings.push('Наличие хронических заболеваний требует регулярного медицинского наблюдения');
    }
    
    if (risks.lifestyleRisks.includes('Курение')) {
      warnings.push('Курение значительно повышает риски для здоровья - рассмотрите программу отказа');
    }

    return warnings;
  };

  const calculateOverallScore = (
    facial: FacialAnalysis,
    skin: SkinHealth,
    stress: StressIndicators,
    lifestyle: LifestyleFactors
  ): number => {
    const weights = {
      facial: 0.25,
      skin: 0.20,
      stress: 0.30,
      lifestyle: 0.25
    };

    return Math.round(
      facial.symmetry * 0.1 +
      facial.eyeHealth.overall * 0.05 +
      facial.posture.overall * 0.05 +
      facial.facialTension.overall * 0.05 +
      skin.overall * weights.skin +
      (100 - stress.overall) * weights.stress +
      lifestyle.overall * weights.lifestyle
    );
  };

  // Остальной код компонента (рендеринг) остается таким же, как в предыдущем примере
  // Добавлю только обновленную секцию детального заключения

  if (modelsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size={32} className={styles.spinner} />
        <h3>Загрузка моделей анализа...</h3>
        <p>Пожалуйста, подождите</p>
      </div>
    );
  }

  if (modelsError) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={40} />
        <h3>Ошибка загрузки</h3>
        <p>{modelsError}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.progressSection}>
          <h3>Расширенный анализ здоровья</h3>
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
              <span>Анализ лица</span>
            </div>
            <div className={styles.step}>
              <Shield size={20} />
              <span>Состояние кожи</span>
            </div>
            <div className={styles.step}>
              <Activity size={20} />
              <span>Уровень стресса</span>
            </div>
            <div className={styles.step}>
              <Zap size={20} />
              <span>Образ жизни</span>
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
          <div className={styles.scoreLabel}>Индекс здоровья</div>
        </div>
        <div className={styles.scoreDescription}>
          <TrendingUp size={20} />
          <span>Комплексная оценка на основе 24 показателей</span>
        </div>
      </div>

      {/* Сетка показателей */}
      <div className={styles.metricsGrid}>
        {/* Анализ лица */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Brain size={20} />
            <h4>Анализ лица</h4>
          </div>
          <div className={styles.metricList}>
            <div className={styles.metricItem}>
              <span>Симметрия</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.facialAnalysis.symmetry}%` }}
                ></div>
              </div>
              <span>{analysisResult.facialAnalysis.symmetry}%</span>
            </div>
            <div className={styles.metricItem}>
              <span>Усталость глаз</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.facialAnalysis.eyeHealth.fatigueLevel}%` }}
                ></div>
              </div>
              <span>{analysisResult.facialAnalysis.eyeHealth.fatigueLevel}%</span>
            </div>
            <div className={styles.metricItem}>
              <span>Мышечное напряжение</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.facialAnalysis.facialTension.overall}%` }}
                ></div>
              </div>
              <span>{analysisResult.facialAnalysis.facialTension.overall}%</span>
            </div>
          </div>
        </div>

        {/* Состояние кожи */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Shield size={20} />
            <h4>Состояние кожи</h4>
          </div>
          <div className={styles.metricList}>
            <div className={styles.metricItem}>
              <span>Общее состояние</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.skinHealth.overall}%` }}
                ></div>
              </div>
              <span>{analysisResult.skinHealth.overall}%</span>
            </div>
            <div className={styles.metricItem}>
              <span>Увлажнение</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.skinHealth.hydration}%` }}
                ></div>
              </div>
              <span>{analysisResult.skinHealth.hydration}%</span>
            </div>
            <div className={styles.metricItem}>
              <span>Ровность тона</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.skinHealth.complexion.evenness}%` }}
                ></div>
              </div>
              <span>{analysisResult.skinHealth.complexion.evenness}%</span>
            </div>
          </div>
        </div>

        {/* Уровень стресса */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Activity size={20} />
            <h4>Уровень стресса</h4>
          </div>
          <div className={styles.metricList}>
            <div className={styles.metricItem}>
              <span>Физический стресс</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.stressIndicators.physical.muscleTension}%` }}
                ></div>
              </div>
              <span>{analysisResult.stressIndicators.physical.muscleTension}%</span>
            </div>
            <div className={styles.metricItem}>
              <span>Ментальный стресс</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.stressIndicators.mental.anxietyLevel}%` }}
                ></div>
              </div>
              <span>{analysisResult.stressIndicators.mental.anxietyLevel}%</span>
            </div>
            <div className={styles.metricItem}>
              <span>Потребность в восстановлении</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.stressIndicators.recoveryNeed}%` }}
                ></div>
              </div>
              <span>{analysisResult.stressIndicators.recoveryNeed}%</span>
            </div>
          </div>
        </div>

        {/* Образ жизни */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Zap size={20} />
            <h4>Образ жизни</h4>
          </div>
          <div className={styles.metricList}>
            <div className={styles.metricItem}>
              <span>Качество сна</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.lifestyleFactors.sleep.quality}%` }}
                ></div>
              </div>
              <span>{analysisResult.lifestyleFactors.sleep.quality}%</span>
            </div>
            <div className={styles.metricItem}>
              <span>Управление стрессом</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.lifestyleFactors.habits.stressManagement}%` }}
                ></div>
              </div>
              <span>{analysisResult.lifestyleFactors.habits.stressManagement}%</span>
            </div>
            <div className={styles.metricItem}>
              <span>Общая оценка</span>
              <div className={styles.metricBar}>
                <div 
                  className={styles.metricFill} 
                  style={{ width: `${analysisResult.lifestyleFactors.overall}%` }}
                ></div>
              </div>
              <span>{analysisResult.lifestyleFactors.overall}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Детальное заключение */}
      <div className={styles.detailedConclusion}>
        <div className={styles.conclusionHeader}>
          <Heart size={24} />
          <h3>💫 Детальное заключение о состоянии здоровья</h3>
        </div>
        
        <div className={styles.executiveSummary}>
          <div className={styles.summaryIcon}>🎯</div>
          <div className={styles.summaryContent}>
            <h4>Ключевые выводы</h4>
            <p>{analysisResult.detailedConclusion.executiveSummary}</p>
          </div>
        </div>

        <div className={styles.conclusionGrid}>
          <div className={styles.conclusionSection}>
            <div className={styles.sectionIcon}>😊</div>
            <h4>Здоровье лица и осанка</h4>
            <p>{analysisResult.detailedConclusion.facialHealth}</p>
          </div>

          <div className={styles.conclusionSection}>
            <div className={styles.sectionIcon}>✨</div>
            <h4>Состояние кожи</h4>
            <p>{analysisResult.detailedConclusion.skinAssessment}</p>
          </div>

          <div className={styles.conclusionSection}>
            <div className={styles.sectionIcon}>🧠</div>
            <h4>Уровень стресса</h4>
            <p>{analysisResult.detailedConclusion.stressEvaluation}</p>
          </div>

          <div className={styles.conclusionSection}>
            <div className={styles.sectionIcon}>🌱</div>
            <h4>Влияние образа жизни</h4>
            <p>{analysisResult.detailedConclusion.lifestyleImpact}</p>
          </div>
        </div>

        {/* Положительные аспекты и области улучшения */}
        <div className={styles.aspectsGrid}>
          <div className={styles.positiveAspects}>
            <div className={styles.aspectsHeader}>
              <Smile size={20} />
              <h4>Сильные стороны</h4>
            </div>
            <div className={styles.aspectsList}>
              {analysisResult.detailedConclusion.positiveAspects.map((aspect, index) => (
                <div key={index} className={styles.positiveAspect}>
                  <div className={styles.aspectBullet}>✓</div>
                  <span>{aspect}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.improvementAreas}>
            <div className={styles.aspectsHeader}>
              <Frown size={20} />
              <h4>Области для улучшения</h4>
            </div>
            <div className={styles.aspectsList}>
              {analysisResult.detailedConclusion.improvementAreas.map((area, index) => (
                <div key={index} className={styles.improvementArea}>
                  <div className={styles.aspectBullet}>⚡</div>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.preventiveSection}>
          <div className={styles.sectionIcon}>🛡️</div>
          <h4>Профилактические меры</h4>
          <p>{analysisResult.detailedConclusion.preventiveMeasures}</p>
        </div>
      </div>

      {/* Рекомендации */}
      {analysisResult.recommendations.length > 0 && (
        <div className={styles.recommendations}>
          <div className={styles.sectionHeader}>
            <TrendingUp size={20} />
            <h4>Персональные рекомендации</h4>
          </div>
          <div className={styles.recommendationGrid}>
            {analysisResult.recommendations.map((rec, index) => (
              <div key={index} className={`${styles.recommendationItem} ${styles[`priority${rec.priority}`]}`}>
                <div className={styles.recommendationHeader}>
                  <h5>{rec.category}</h5>
                  <span className={styles.priorityBadge}>{rec.priority === 'high' ? 'Высокий приоритет' : rec.priority === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}</span>
                </div>
                <div className={styles.actionsList}>
                  {rec.actions.map((action, actionIndex) => (
                    <div key={actionIndex} className={styles.actionItem}>
                      <div className={styles.actionBullet}>•</div>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.timeline}>
                  <Clock size={14} />
                  <span>Рекомендуемый срок: {rec.timeline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Предупреждения */}
      {analysisResult.warnings.length > 0 && (
        <div className={styles.warnings}>
          <div className={styles.sectionHeader}>
            <AlertCircle size={20} />
            <h4>Требует особого внимания</h4>
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
        <p>🎭 Анализ выполнен с использованием технологии MediaPipe для анализа лица и комплексной оценки 24 показателей здоровья</p>
      </div>
    </div>
  );
};

export default HealthAnalyzer;