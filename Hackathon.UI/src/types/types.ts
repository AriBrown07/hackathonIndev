export interface HealthQuestionnaire {
  userName: string;
  age: number;
  gender: string;
  hasChronicDiseases: boolean;
  chronicDiseases: string[];
  currentMedications: string[];
  allergies: string[];
  hasSkinConditions: boolean;
  skinConditions: string[];
  skinSensitivity: string;
  recentSunExposure: boolean;
  recentInjuries: boolean;
  injuryDetails: string;
  alcoholConsumption: string;
  smoking: boolean;
  stressLevel: number;
  sleepQuality: string;
  symptoms: string[];
  symptomDuration: string;
  additionalNotes: string;
}