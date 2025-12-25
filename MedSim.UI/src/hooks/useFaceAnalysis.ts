import { useEffect, useState } from 'react';
import { FilesetResolver, FaceDetector, FaceLandmarker } from '@mediapipe/tasks-vision';

export interface FaceAnalysisResult {
  detected: boolean;
  faceCount: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: any[];
  symmetry: number;
  eyeAspectRatio: number;
  mouthOpenness: number;
  headPose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
}

export const useFaceAnalysis = () => {
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeModels();
  }, []);

  const initializeModels = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      // Face Detection
      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
          delegate: "GPU"
        },
        runningMode: "IMAGE" as const,
        minDetectionConfidence: 0.5
      });

      // Face Landmarker (Face Mesh)
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "IMAGE" as const,
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true
      });

      setFaceDetector(detector);
      setFaceLandmarker(landmarker);
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing MediaPipe models:', err);
      setError('Не удалось загрузить модели анализа лица');
      setIsLoading(false);
    }
  };

  const analyzeImage = async (image: HTMLImageElement): Promise<FaceAnalysisResult> => {
    if (!faceDetector || !faceLandmarker) {
      throw new Error('Модели не загружены');
    }

    try {
      // Создаем canvas для анализа
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Не удалось создать контекст canvas');
      
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      // Запускаем обе модели
      const detectionResult = faceDetector.detect(image);
      const landmarkResult = faceLandmarker.detect(image);

      return processResults(detectionResult, landmarkResult, image.width, image.height);
    } catch (err) {
      console.error('Error during face analysis:', err);
      throw new Error('Ошибка при анализе изображения');
    }
  };

  const processResults = (detectionResult: any, landmarkResult: any, width: number, height: number): FaceAnalysisResult => {
    if (!detectionResult.detections || detectionResult.detections.length === 0) {
      return {
        detected: false,
        faceCount: 0,
        symmetry: 0,
        eyeAspectRatio: 0,
        mouthOpenness: 0,
        headPose: { pitch: 0, yaw: 0, roll: 0 }
      };
    }

    const detection = detectionResult.detections[0];
    const landmarks = landmarkResult.faceLandmarks?.[0] || [];

    // Расчет метрик
    const symmetry = calculateSymmetry(landmarks);
    const eyeAspectRatio = calculateEyeAspectRatio(landmarks);
    const mouthOpenness = calculateMouthOpenness(landmarks);
    const headPose = estimateHeadPose(landmarks);

    return {
      detected: true,
      faceCount: detectionResult.detections.length,
      boundingBox: {
        x: detection.boundingBox.originX,
        y: detection.boundingBox.originY,
        width: detection.boundingBox.width,
        height: detection.boundingBox.height
      },
      landmarks,
      symmetry,
      eyeAspectRatio,
      mouthOpenness,
      headPose
    };
  };

  const calculateSymmetry = (landmarks: any[]): number => {
    if (!landmarks || landmarks.length === 0) return 0;

    // Ключевые точки для симметрии
    const leftCheek = 234;
    const rightCheek = 454;
    const leftEye = 33;
    const rightEye = 263;
    const leftMouth = 61;
    const rightMouth = 291;

    const symmetryPoints = [
      [leftCheek, rightCheek],
      [leftEye, rightEye],
      [leftMouth, rightMouth]
    ];

    let totalDiff = 0;
    let validPoints = 0;

    symmetryPoints.forEach(([leftIdx, rightIdx]) => {
      const leftPoint = landmarks[leftIdx];
      const rightPoint = landmarks[rightIdx];
      
      if (leftPoint && rightPoint) {
        const diff = Math.sqrt(
          Math.pow(leftPoint.x - (1 - rightPoint.x), 2) +
          Math.pow(leftPoint.y - rightPoint.y, 2)
        );
        totalDiff += diff;
        validPoints++;
      }
    });

    if (validPoints === 0) return 0;

    const avgDiff = totalDiff / validPoints;
    const symmetry = Math.max(0, 100 - avgDiff * 200);
    return Math.round(symmetry);
  };

  const calculateEyeAspectRatio = (landmarks: any[]): number => {
    if (!landmarks || landmarks.length < 478) return 0;

    // Индексы для левого глаза
    const leftEye = [33, 160, 158, 133, 153, 144];
    // Индексы для правого глаза  
    const rightEye = [362, 385, 387, 263, 373, 380];

    const calculateEAR = (eyePoints: number[]) => {
      const A = distance(landmarks[eyePoints[1]], landmarks[eyePoints[5]]);
      const B = distance(landmarks[eyePoints[2]], landmarks[eyePoints[4]]);
      const C = distance(landmarks[eyePoints[0]], landmarks[eyePoints[3]]);
      
      return (A + B) / (2 * C);
    };

    const leftEAR = calculateEAR(leftEye);
    const rightEAR = calculateEAR(rightEye);

    return (leftEAR + rightEAR) / 2;
  };

  const distance = (point1: any, point2: any): number => {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + 
      Math.pow(point1.y - point2.y, 2)
    );
  };

  const calculateMouthOpenness = (landmarks: any[]): number => {
    if (!landmarks || landmarks.length < 478) return 0;

    const upperLip = 13;
    const lowerLip = 14;

    if (!landmarks[upperLip] || !landmarks[lowerLip]) return 0;

    const openness = Math.abs(landmarks[upperLip].y - landmarks[lowerLip].y);
    return Math.min(openness * 150, 100); // Масштабируем для лучшей визуализации
  };

  const estimateHeadPose = (landmarks: any[]): { pitch: number; yaw: number; roll: number } => {
    if (!landmarks || landmarks.length < 478) return { pitch: 0, yaw: 0, roll: 0 };

    const noseTip = 1;
    const chin = 152;
    const leftEye = 33;
    const rightEye = 263;

    if (!landmarks[noseTip] || !landmarks[chin] || !landmarks[leftEye] || !landmarks[rightEye]) {
      return { pitch: 0, yaw: 0, roll: 0 };
    }

    // Упрощенная оценка позы головы
    const pitch = (landmarks[noseTip].y - landmarks[chin].y) * 180;
    const yaw = (landmarks[leftEye].x - landmarks[rightEye].x) * 90;
    const roll = (landmarks[leftEye].y - landmarks[rightEye].y) * 90;

    return {
      pitch: Math.round(pitch),
      yaw: Math.round(yaw),
      roll: Math.round(roll)
    };
  };

  return {
    isLoading,
    error,
    analyzeImage
  };
};