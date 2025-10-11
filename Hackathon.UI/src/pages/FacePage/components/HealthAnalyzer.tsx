import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  Brain,
  Loader,
  Heart,
  Shield,
  Zap,
  Clock,
  ArrowRight,
  Stethoscope
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
  doctorRecommendations: DoctorRecommendation[];
  warnings: string[];
}

export interface DoctorRecommendation {
  specialty: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  examination: string[];
  frequency: string;
  urgency: string;
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
  exercises?: string[];
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
      }, index * 800);
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

  const generateDoctorRecommendations = (
    risks: HealthRisks,
    stress: StressIndicators,
    skin: SkinHealth,
    facial: FacialAnalysis,
    questionnaire: HealthQuestionnaire
  ): DoctorRecommendation[] => {
    const recommendations: DoctorRecommendation[] = [];

    // Рекомендации по стрессу и ментальному здоровью
    if (stress.mental.burnoutRisk > 70 || stress.mental.anxietyLevel > 70) {
      recommendations.push({
        specialty: 'Психотерапевт/Психолог',
        priority: 'high',
        reason: 'Высокий уровень стресса и риск эмоционального выгорания',
        examination: [
          'Оценка уровня тревожности и депрессии',
          'Диагностика эмоционального выгорания',
          'Анализ копинг-стратегий'
        ],
        frequency: '1-2 раза в неделю в начале терапии',
        urgency: 'В течение 2 недель'
      });
    }

    if (stress.physical.sleepDeprivation > 70 || questionnaire.sleepQuality === 'poor') {
      recommendations.push({
        specialty: 'Сомнолог',
        priority: 'high',
        reason: 'Выраженные нарушения сна и накопленная усталость',
        examination: [
          'Полисомнография при необходимости',
          'Оценка гигиены сна',
          'Анализ циркадных ритмов'
        ],
        frequency: 'По назначению врача',
        urgency: 'В течение месяца'
      });
    }

    // Рекомендации по кожным заболеваниям
    if (questionnaire.hasSkinConditions || skin.overall < 60) {
      recommendations.push({
        specialty: 'Дерматолог',
        priority: questionnaire.hasSkinConditions ? 'high' : 'medium',
        reason: 'Наличие кожных заболеваний или неудовлетворительное состояние кожи',
        examination: [
          'Дерматоскопия',
          'Анализ состояния кожного барьера',
          'Диагностика сопутствующих заболеваний'
        ],
        frequency: '1-2 раза в год',
        urgency: 'В течение месяца'
      });
    }

    // Рекомендации по хроническим заболеваниям
    if (questionnaire.hasChronicDiseases) {
      recommendations.push({
        specialty: 'Терапевт',
        priority: 'high',
        reason: 'Наличие хронических заболеваний, требующих наблюдения',
        examination: [
          'Общий анализ крови и мочи',
          'Биохимический анализ крови',
          'Контроль основных показателей здоровья'
        ],
        frequency: 'Каждые 6 месяцев',
        urgency: 'В течение 2 недель'
      });
    }

    // Рекомендации по мышечному напряжению
    if (facial.facialTension.overall > 70 || facial.posture.overall < 60) {
      recommendations.push({
        specialty: 'Остеопат/Невролог',
        priority: 'medium',
        reason: 'Выраженное мышечное напряжение и нарушения осанки',
        examination: [
          'Оценка мышечного тонуса',
          'Анализ биомеханики позвоночника',
          'Проверка неврологического статуса'
        ],
        frequency: 'По назначению специалиста',
        urgency: 'В течение месяца'
      });
    }

    // Рекомендации по питанию и ЖКТ
    if (questionnaire.alcoholConsumption === 'high') {
      recommendations.push({
        specialty: 'Гастроэнтеролог/Диетолог',
        priority: 'medium',
        reason: 'Высокое потребление алкоголя и нагрузка на ЖКТ',
        examination: [
          'Биохимический анализ крови',
          'УЗИ органов брюшной полости',
          'Анализ пищевого дневника'
        ],
        frequency: '1 раз в год',
        urgency: 'В течение 2 месяцев'
      });
    }

    // Общая рекомендация по ежегодному чекапу
    recommendations.push({
      specialty: 'Терапевт для ежегодного чекапа',
      priority: 'low',
      reason: 'Профилактический осмотр и оценка общего состояния здоровья',
      examination: [
        'Общий и биохимический анализ крови',
        'ЭКГ',
        'Измерение артериального давления',
        'Антропометрия'
      ],
      frequency: 'Ежегодно',
      urgency: 'В течение 6 месяцев'
    });

    return recommendations;
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
    const doctorRecommendations = generateDoctorRecommendations(healthRisks, stressIndicators, skinHealth, facialAnalysis, questionnaire);

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
      doctorRecommendations,
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
    healthRisks: HealthRisks
  ): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Рекомендации по лицу и осанке
    if (facial.facialTension.overall > 50 || facial.posture.overall < 70) {
      recommendations.push({
        category: 'Осанка и мышечное напряжение',
        priority: facial.facialTension.overall > 70 ? 'high' : 'medium',
        actions: [
          '• Ежедневная гимнастика для лица по 5-7 минут утром и вечером',
          '• Самомассаж височно-нижнечелюстного сустава круговыми движениями',
          '• Контроль положения головы при работе за компьютером',
          '• Растяжка мышц шеи с наклонами головы в разные стороны'
        ],
        exercises: [
          'Упражнение "Лев": широко откройте рот и высуньте язык, напрягая все мышцы лица, затем расслабьтесь. Повторите 5 раз.',
          'Массаж висков: круговыми движениями массируйте виски указательными пальцами 2-3 минуты',
          'Движения челюстью: медленно открывайте и закрывайте рот, двигайте челюстью влево-вправо. 10 повторений.',
          'Растяжка шеи: наклоните голову к правому плечу, задержитесь на 15 секунд, затем к левому. По 3 подхода.'
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
          'Очищение кожи утром и вечером мягкими средствами без спирта',
          'Использование увлажняющего крема с гиалуроновой кислотой',
          'Ежедневная защита от солнца SPF 30+ даже в пасмурную погоду',
          'Использование сыворотки с витамином C утром для улучшения тона кожи',
          'Еженедельное применение увлажняющих масок',
          'Обильное питье - не менее 2 литров воды в день'
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
          'Дыхательные упражнения 4-7-8: вдох 4 секунды, задержка 7 секунд, выдох 8 секунд. 5 циклов утром и вечером',
          'Прогулки на свежем воздухе минимум 30 минут в день',
          'Техника прогрессивной мышечной релаксации перед сном',
          'Ограничение потребления кофеина до 200 мг в день',
          'Ведение дневника стресса для отслеживания триггеров',
          'Практика осознанности через медитацию по 10 минут в день'
        ],
        exercises: [
          'Дыхание 4-7-8: сядьте прямо, язык за верхние зубы. Вдох через нос 4 сек, задержка 7 сек, выдох через рот 8 сек. 5 повторов.',
          'Прогрессивная релаксация: лежа, последовательно напрягайте и расслабляйте мышцы от пальцев ног до лица. 15 минут.',
          'Медитация осознанности: сядьте удобно, сосредоточьтесь на дыхании. При появлении мыслей просто отмечайте их и возвращайтесь к дыханию.'
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
          'Соблюдение режима сна: подъем и отход ко сну в одно время даже в выходные',
          'Создание ритуала перед сном: теплый душ, чтение, легкая растяжка',
          'Оптимальная температура в спальне 18-20°C',
          'Полное затемнение комнаты и устранение источников шума',
          'Отказ от использования электронных устройств за 1 час до сна',
          'Ограничение жидкости за 2 часа до сна'
        ],
        timeline: '2-3 недели'
      });
    }

    // Рекомендации по питанию
    if (lifestyle.nutrition.dietQuality < 60 || lifestyle.nutrition.alcoholImpact > 40) {
      recommendations.push({
        category: 'Питание и гидратация',
        priority: lifestyle.nutrition.dietQuality < 50 ? 'medium' : 'low',
        actions: [
          'Сбалансированное питание с акцентом на овощи и белок',
          'Употребление 2-2.5 литров воды в течение дня',
          'Ограничение обработанных продуктов и сахара',
          'Включение в рацион омега-3 жирных кислот',
          'Контроль размера порций и регулярность приемов пищи',
          'Ограничение алкоголя до 1-2 порций в неделю'
        ],
        timeline: 'постоянно'
      });
    }

    // Рекомендации по физической активности
    if (lifestyle.activity.physical < 60 || lifestyle.activity.sedentaryTime > 60) {
      recommendations.push({
        category: 'Физическая активность',
        priority: 'medium',
        actions: [
          'Ежедневная ходьба не менее 10000 шагов',
          'Силовые тренировки 2-3 раза в неделю',
          'Растяжка и мобильность упражнения ежедневно',
          'Перерывы каждые 45 минут при сидячей работе',
          'Использование лестницы вместо лифта',
          'Утренняя зарядка 10-15 минут'
        ],
        exercises: [
          'Комплекс утренней зарядки: наклоны, повороты, приседания, отжимания от стола - 10-15 минут',
          'Офисная гимнастика: вращения плечами, наклоны головы, растяжка спины - каждые 2 часа',
          'Силовая тренировка: приседания, отжимания, планка - 20-30 минут 3 раза в неделю'
        ],
        timeline: 'постоянно'
      });
    }

    return recommendations;
  };

  const generateWarnings = (risks: HealthRisks, stress: StressIndicators): string[] => {
    const warnings: string[] = [];
    
    if (stress.mental.burnoutRisk > 80) {
      warnings.push('Крайне высокий риск эмоционального выгорания - рекомендуется срочная консультация психолога или терапевта');
    }
    
    if (risks.chronicDiseases.length > 0) {
      warnings.push('Наличие хронических заболеваний требует регулярного медицинского наблюдения и соблюдения всех рекомендаций врача');
    }
    
    if (risks.lifestyleRisks.includes('Курение')) {
      warnings.push('Курение значительно повышает риски сердечно-сосудистых заболеваний и рака - настоятельно рекомендуем обратиться в кабинет отказа от курения');
    }

    if (stress.physical.sleepDeprivation > 70) {
      warnings.push('Выраженное недосыпание может серьезно влиять на здоровье - рекомендуется консультация сомнолога');
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
          <h3>Детальное заключение о состоянии здоровья</h3>
        </div>
        
    <div className={styles.executiveSummary}>
  <div className={styles.flexRow}>
    <TrendingUp size={24} />
    <h4>Ключевые выводы</h4>
  </div>
  <p>{analysisResult.detailedConclusion.executiveSummary}</p>
</div>

        <div className={styles.conclusionGrid}>
          <div className={styles.conclusionSection}>
            <h4>Здоровье лица и осанка</h4>
            <p>{analysisResult.detailedConclusion.facialHealth}</p>
          </div>

        <div className={styles.conclusionSection}>
  <div className={styles.flexRow}>
    <Shield size={20} />
    <h4>Состояние кожи</h4>
  </div>
  <p>{analysisResult.detailedConclusion.skinAssessment}</p>
</div>

          <div className={styles.conclusionSection}>
  <div className={styles.flexRow}>
    <Activity size={20} />
    <h4>Уровень стресса</h4>
  </div>
  <p>{analysisResult.detailedConclusion.stressEvaluation}</p>
</div>

          <div className={styles.conclusionSection}>
  <div className={styles.sectionHeader}>
    <Zap size={20} />
    <h4>Влияние образа жизни</h4>
  </div>
  <p>{analysisResult.detailedConclusion.lifestyleImpact}</p>
</div>
        </div>

        {/* Положительные аспекты и области улучшения */}
        <div className={styles.aspectsGrid}>
          <div className={styles.positiveAspects}>
            <div className={styles.aspectsHeader}>
              <div className={styles.successIcon}>✓</div>
              <h4>Сильные стороны</h4>
            </div>
            <div className={styles.aspectsList}>
              {analysisResult.detailedConclusion.positiveAspects.map((aspect, index) => (
              <div key={index} className={styles.positiveAspect}>
  <div className={styles.aspectBullet}>
    <ArrowRight size={14} />
  </div>
  <span>{aspect}</span>
</div>
              ))}
            </div>
          </div>

          <div className={styles.improvementAreas}>
            <div className={styles.aspectsHeader}>
              <h4>Области для улучшения</h4>
            </div>
            <div className={styles.aspectsList}>
              {analysisResult.detailedConclusion.improvementAreas.map((area, index) => (
                <div key={index} className={styles.improvementArea}>
                  <div className={styles.aspectBullet}>•</div>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.preventiveSection}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <div className={styles.sectionIcon}>
    <Shield size={20} />
  </div>
  <h4>Профилактические меры</h4>
</div>
          <p>{analysisResult.detailedConclusion.preventiveMeasures}</p>
        </div>
      </div>

      {/* Рекомендации по врачам */}
      {analysisResult.doctorRecommendations && analysisResult.doctorRecommendations.length > 0 && (
        <div className={styles.doctorRecommendations}>
          
          <div className={styles.medicalNotice}>
            <div className={styles.noticeContent}>
              <h4>Важная информация</h4>
              <p>
                На основе анализа выявлены показания для консультации со специалистами. 
                Регулярные медицинские осмотры помогают предотвратить развитие заболеваний 
                и сохранить здоровье на долгие годы.
              </p>
            </div>
          </div>

          <div className={styles.doctorTable}>

            {analysisResult.doctorRecommendations
              .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              })
              .map((rec, index) => (
              <div key={index} className={`${styles.tableRow} ${styles[`priority${rec.priority}`]}`}>
                <div className={styles.tableCell}>
                  <strong>{rec.specialty}</strong>
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.priorityBadge} ${styles[rec.priority]}`}>
                    {rec.priority === 'high' ? 'Высокий' : rec.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </span>
                </div>
                <div className={styles.tableCell}>{rec.reason}</div>
                <div className={styles.tableCell}>
                  <ul className={styles.examinationList}>
                    {rec.examination.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.tableCell}>{rec.frequency}</div>
                <div className={styles.tableCell}>
                  <span className={styles.urgency}>{rec.urgency}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.medicalGuidance}>
            <h4>Как подготовиться к визиту к врачу:</h4>
            <div className={styles.guidanceList}>
             <div className={styles.guidanceItem}>
                <div className={styles.guidanceRow}>
                  <div className={styles.guidanceNumber}>1</div>
                  <strong className={styles.guidanceTitle}>Соберите медицинскую документацию</strong>
                </div>
                <p className={styles.guidanceText}>Результаты предыдущих анализов, выписки из медицинских карт, список принимаемых препаратов</p>
              </div>
             <div className={styles.guidanceItem}>
                <div className={styles.guidanceRow}>
                  <div className={styles.guidanceNumber}>2</div>
                  <strong>Составьте список вопросов</strong>
                </div>
                <p>Запишите все симптомы, которые вас беспокоят, и вопросы, которые хотите задать врачу</p>
              </div>
           <div className={styles.guidanceItem}>
              <div className={styles.guidanceRow}>
                <div className={styles.guidanceNumber}>3</div>
                <strong>Ведите дневник наблюдений</strong>
              </div>
              <p>Отмечайте изменения в состоянии здоровья, особенности питания и режима дня</p>
            </div>
              <div className={styles.guidanceItem}>
                <div className={styles.guidanceRow}>
                  <div className={styles.guidanceNumber}>4</div>
                  <strong>Подготовьтесь к обследованию</strong>
                </div>
                <p>Уточните требования к подготовке для конкретных анализов и исследований</p>
              </div>
            </div>
          </div>

          <div className={styles.emergencyNotice}>
            <div className={styles.emergencyContent}>
              <h5>Когда требуется срочная медицинская помощь:</h5>
              <ul>
                <li>Острая боль любой локализации</li>
                <li>Внезапное ухудшение зрения или слуха</li>
                <li>Затрудненное дыхание или одышка</li>
                <li>Сильное головокружение или потеря сознания</li>
                <li>Резкое повышение температуры тела</li>
              </ul>
              <p className={styles.emergencyContact}>
                При возникновении экстренных ситуаций немедленно обращайтесь в скорую помощь по телефону <strong>103</strong>
              </p>
            </div>
          </div>
        </div>
      )}

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
                  <span className={styles.priorityBadge}>
                    {rec.priority === 'high' ? 'Высокий приоритет' : rec.priority === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}
                  </span>
                </div>
                
                <div className={styles.actionsSection}>
                  <h6>Конкретные действия:</h6>
                  <div className={styles.actionsList}>
                    {rec.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className={styles.actionItem}>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {rec.exercises && rec.exercises.length > 0 && (
                  <div className={styles.exercisesSection}>
                    <h6>Практические упражнения:</h6>
                   <div className={styles.exercisesList}>
                    {rec.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className={styles.exerciseRow}>
                        <div className={styles.exerciseNumber}>{exerciseIndex + 1}</div>
                        <span>{exercise}</span>
                      </div>
                    ))}
                  </div>
                  </div>
                )}

                <div className={styles.timeline}>
                  <span>Рекомендуемый срок выполнения: {rec.timeline}</span>
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
        <p><strong>Обратите внимание:</strong> качество фотографии существенно влияет на точность показателей, и результаты могут не отражать реальную ситуацию</p>
        <p><strong>Важно:</strong> Информация в программе носит справочный характер и не заменяет консультацию специалиста. Для точной оценки здоровья рекомендуем обратиться к врачу.</p>
      </div>
    </div>
  );
};

export default HealthAnalyzer;