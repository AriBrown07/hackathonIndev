export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
}

export interface Doctor {
  id: string;
  clinicId: string;
  name: string;
  specialty: string;
  photoUrl: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  isBooked: boolean;
  userEmail?: string;
  userName?: string;
}

export interface BookingFormData {
  name: string;
  email: string;
}

export interface HealthQuestionnaire {
  id?: string;
  userId?: string;
  userName: string;
  age: number;
  gender: string;
  hasChronicDiseases: boolean;
  chronicDiseases: string[];
  currentMedications: string[];
  allergies: string[];
  hasSkinConditions: boolean;
  skinConditions: string[];
  skinSensitivity: 'low' | 'medium' | 'high';
  recentSunExposure: boolean;
  recentInjuries: boolean;
  injuryDetails: string;
  alcoholConsumption: 'none' | 'moderate' | 'high';
  smoking: boolean;
  stressLevel: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  symptoms: string[];
  symptomDuration: string;
  additionalNotes: string;
  createdAt?: string;
  updatedAt?: string;
}


