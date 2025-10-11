import { useEffect, useState, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modelsLoaded = useRef(false);

  useEffect(() => {
    initializeModels();
  }, []);

  const initializeModels = async () => {
    try {
      if (modelsLoaded.current) return;

      console.log('⏳ Загрузка моделей face-api.js...');
      
      // Используем модели из CDN вместо локальных файлов
      const modelPath = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      
      await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelPath);
      await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);
      
      modelsLoaded.current = true;
      setIsLoading(false);
      console.log('✅ Модели face-api.js успешно загружены');
    } catch (err) {
      console.error('❌ Ошибка загрузки моделей face-api.js:', err);
      
      // Попробуем альтернативный CDN
      try {
        console.log('🔄 Попытка загрузки с альтернативного CDN...');
        const altModelPath = 'https://unpkg.com/@vladmandic/face-api/model/';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(altModelPath);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(altModelPath);
        await faceapi.nets.faceRecognitionNet.loadFromUri(altModelPath);
        
        modelsLoaded.current = true;
        setIsLoading(false);
        console.log('✅ Модели успешно загружены с альтернативного CDN');
      } catch (fallbackErr) {
        console.error('❌ Ошибка загрузки с альтернативного CDN:', fallbackErr);
        setError('Не удалось загрузить модели анализа лица. Проверьте подключение к интернету.');
        setIsLoading(false);
      }
    }
  };

  // Остальные функции остаются без изменений
  const analyzeImage = async (image: HTMLImageElement): Promise<FaceAnalysisResult> => {
    if (!modelsLoaded.current) {
      throw new Error('Модели не загружены');
    }

    try {
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.3
      });

      const detections = await faceapi
        .detectAllFaces(image, detectionOptions)
        .withFaceLandmarks(true)
        .withFaceDescriptors();

      if (!detections || detections.length === 0) {
        return {
          detected: false,
          faceCount: 0,
          symmetry: 0,
          eyeAspectRatio: 0,
          mouthOpenness: 0,
          headPose: { pitch: 0, yaw: 0, roll: 0 }
        };
      }

      const detection = detections[0];
      return processFaceDetection(detection, image.width, image.height);
    } catch (err) {
      console.error('Error during face analysis:', err);
      throw new Error('Ошибка при анализе изображения');
    }
  };

  const processFaceDetection = (
    detection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>,
    width: number,
    height: number
  ): FaceAnalysisResult => {
    const landmarks = detection.landmarks;
    const box = detection.detection.box;

    const symmetry = calculateSymmetry(landmarks);
    const eyeAspectRatio = calculateEyeAspectRatio(landmarks);
    const mouthOpenness = calculateMouthOpenness(landmarks);
    const headPose = estimateHeadPose(landmarks);

    return {
      detected: true,
      faceCount: 1,
      boundingBox: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height
      },
      landmarks: landmarks.positions,
      symmetry,
      eyeAspectRatio,
      mouthOpenness,
      headPose
    };
  };

  const calculateSymmetry = (landmarks: faceapi.FaceLandmarks68): number => {
    const positions = landmarks.positions;
    
    const leftCheek = positions[1];
    const rightCheek = positions[15];
    const leftEyeOuter = positions[36];
    const rightEyeOuter = positions[45];
    const leftMouth = positions[48];
    const rightMouth = positions[54];

    let totalDiff = 0;
    let validPoints = 0;

    const symmetryPoints = [
      [leftCheek, rightCheek],
      [leftEyeOuter, rightEyeOuter],
      [leftMouth, rightMouth]
    ];

    symmetryPoints.forEach(([leftPoint, rightPoint]) => {
      const mirroredRightX = 1 - rightPoint.x;
      const diff = Math.sqrt(
        Math.pow(leftPoint.x - mirroredRightX, 2) +
        Math.pow(leftPoint.y - rightPoint.y, 2)
      );
      totalDiff += diff;
      validPoints++;
    });

    if (validPoints === 0) return 0;

    const avgDiff = totalDiff / validPoints;
    const symmetry = Math.max(0, 100 - avgDiff * 500);
    return Math.round(Math.min(100, symmetry));
  };

  const calculateEyeAspectRatio = (landmarks: faceapi.FaceLandmarks68): number => {
    const positions = landmarks.positions;
    
    const leftEye = [36, 37, 38, 39, 40, 41];
    const rightEye = [42, 43, 44, 45, 46, 47];

    const calculateEAR = (eyePoints: number[]): number => {
      const A = distance(positions[eyePoints[1]], positions[eyePoints[5]]);
      const B = distance(positions[eyePoints[2]], positions[eyePoints[4]]);
      const C = distance(positions[eyePoints[0]], positions[eyePoints[3]]);
      
      return (A + B) / (2 * C);
    };

    const leftEAR = calculateEAR(leftEye);
    const rightEAR = calculateEAR(rightEye);

    const avgEAR = (leftEAR + rightEAR) / 2;
    return Math.min(1, avgEAR * 3);
  };

  const distance = (point1: any, point2: any): number => {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + 
      Math.pow(point1.y - point2.y, 2)
    );
  };

  const calculateMouthOpenness = (landmarks: faceapi.FaceLandmarks68): number => {
    const positions = landmarks.positions;
    
    const upperLip = positions[62];
    const lowerLip = positions[66];

    const verticalDistance = Math.abs(upperLip.y - lowerLip.y);
    const mouthWidth = distance(positions[48], positions[54]);
    
    const openness = verticalDistance / mouthWidth;
    return Math.min(1, openness * 5);
  };

  const estimateHeadPose = (landmarks: faceapi.FaceLandmarks68): { pitch: number; yaw: number; roll: number } => {
    const positions = landmarks.positions;
    
    const noseTip = positions[30];
    const chin = positions[8];
    const leftEye = positions[36];
    const rightEye = positions[45];
    
    const pitch = (noseTip.y - chin.y) * 200 - 50;
    const yaw = (leftEye.x - rightEye.x) * 100;
    const roll = (leftEye.y - rightEye.y) * 100;

    return {
      pitch: Math.round(Math.max(-90, Math.min(90, pitch))),
      yaw: Math.round(Math.max(-90, Math.min(90, yaw))),
      roll: Math.round(Math.max(-90, Math.min(90, roll)))
    };
  };

  return {
    isLoading,
    error,
    analyzeImage
  };
};