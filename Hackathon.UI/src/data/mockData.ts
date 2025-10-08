import type { Clinic, Doctor, Appointment } from '../types';

export const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'Центральная поликлиника №1',
    address: 'ул. Ленина, 45',
    city: 'Москва'
  },
  {
    id: '2',
    name: 'Городская больница №7',
    address: 'пр. Мира, 123',
    city: 'Москва'
  },
  {
    id: '3',
    name: 'Медицинский центр "Здоровье"',
    address: 'ул. Пушкина, 67',
    city: 'Санкт-Петербург'
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: 'd1',
    clinicId: '1',
    name: 'Иванов Петр Сергеевич',
    specialty: 'Терапевт',
    photoUrl: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd2',
    clinicId: '1',
    name: 'Смирнова Елена Александровна',
    specialty: 'Кардиолог',
    photoUrl: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd3',
    clinicId: '2',
    name: 'Петров Андрей Викторович',
    specialty: 'Невролог',
    photoUrl: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd4',
    clinicId: '2',
    name: 'Козлова Мария Дмитриевна',
    specialty: 'Дерматолог',
    photoUrl: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd5',
    clinicId: '3',
    name: 'Соколов Игорь Павлович',
    specialty: 'Хирург',
    photoUrl: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=200'
  }
];

const generateAppointments = (): Appointment[] => {
  const appointments: Appointment[] = [];
  const today = new Date();
  const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  mockDoctors.forEach(doctor => {
    for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      const dateString = date.toISOString().split('T')[0];

      const appointmentsPerDay = Math.floor(Math.random() * 4) + 3;
      const availableTimes = times.slice(0, appointmentsPerDay);

      availableTimes.forEach(time => {
        const isBooked = Math.random() > 0.7;
        appointments.push({
          id: `${doctor.id}-${dateString}-${time}`,
          doctorId: doctor.id,
          date: dateString,
          time,
          isBooked,
          userEmail: isBooked ? 'user@example.com' : undefined,
          userName: isBooked ? 'Забронировано' : undefined
        });
      });
    }
  });

  return appointments;
};

export const mockAppointments = generateAppointments();
