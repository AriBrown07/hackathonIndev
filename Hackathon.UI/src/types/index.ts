  interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
}

  interface Doctor {
  id: string;
  clinicId: string;
  name: string;
  specialty: string;
  photoUrl: string;
}

  interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  isBooked: boolean;
  userEmail?: string;
  userName?: string;
}

  interface BookingFormData {
  name: string;
  email: string;
}
