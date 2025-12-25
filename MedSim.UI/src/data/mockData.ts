import type { Clinic, Doctor, Appointment } from '../types';


  export const mockClinics: Clinic[] = [
  {
    id: '1',
    name: '1-я клиническая поликлиника Центрального района города Минска',
    address: 'ул. Сухая 6',
    city: 'Минск, Минская область',
    coordinates: [53.903467, 27.537821]
  },
  {
    id: '2',
    name: '6-я поликлиника',
    address: 'ул. Ульяновская 5',
    city: 'Минск, Минская область',
    coordinates: [53.896707, 27.568966]
  },
  {
    id: '3',
    name: '3-я центральная районная клиническая поликлиника Октябрьского района',
    address: 'ул. Воронянского 13/2',
    city: 'Минск, Минская область',
    coordinates: [53.878914, 27.544179]
  },
  {
    id: '4',
    name: '20-я Городская поликлиника',
    address: 'Проспект Пушкина 16',
    city: 'Минск, Минская область',
    coordinates: [53.900204, 27.498167]
  },
  {
    id: '5',
    name: 'УЗ "2-я центральная районная поликлиника Фрунзенского района г.Минска"',
    address: 'ул. Якубовского, 33',
    city: 'Минск',
    coordinates: [53.897918, 27.453845] 
  },
];



export const mockDoctors: Doctor[] = [
  // 1-я клиническая поликлиника Центрального района города Минска
  {
    id: 'd1_1',
    clinicId: '1',
    name: 'Иванов Петр Сергеевич',
    specialty: 'Терапевт',
    photoUrl: 'https://novolekar.by/images/Barabanovnew.jpg'
  },
  {
    id: 'd1_2',
    clinicId: '1',
    name: 'Смирнова Елена Александровна',
    specialty: 'Кардиолог',
    photoUrl: 'https://centrsna.by/upload/iblock/abf/itpu7b2s67a4h2yj7bszp9223p9iladv.JPG'
  },
  {
    id: 'd1_3',
    clinicId: '1',
    name: 'Петрова Алина Викторовна',
    specialty: 'Невролог',
    photoUrl: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd1_4',
    clinicId: '1',
    name: 'Козлов Андрей Сергеевич',
    specialty: 'Дерматолог',
    photoUrl: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd1_5',
    clinicId: '1',
    name: 'Соколова Наталья Павловна',
    specialty: 'Хирург',
    photoUrl: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd1_6',
    clinicId: '1',
    name: 'Марченко Виталий Александрович',
    specialty: 'Педиатр',
    photoUrl: 'https://images.pexels.com/photos/4173244/pexels-photo-4173244.jpeg?auto=compress&cs=tinysrgb&w=200'
  },

  {
    id: 'd1_8',
    clinicId: '1',
    name: 'Луцкевич Михаил Андреевич',
    specialty: 'Травматолог',
    photoUrl: 'https://brest.lode.by/images/cache/58d/0w8lkb24yc5kllciojuuc3a5elgb67vh.jpg'
  },
  {
    id: 'd1_9',
    clinicId: '1',
    name: 'Петрович Татьяна Ивановна',
    specialty: 'Офтальмолог',
    photoUrl: 'https://beloptika.by/wp-content/uploads/2024/11/priem-vracha-oftalmologa-1.png'
  },
  

  // 6-я поликлиника
  {
    id: 'd2_1',
    clinicId: '2',
    name: 'Ковалева Анна Михайловна',
    specialty: 'Терапевт',
    photoUrl: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd2_2',
    clinicId: '2',
    name: 'Жуковский Дмитрий Иванович',
    specialty: 'Кардиолог',
    photoUrl: 'https://nordin.by/wp-content/uploads/2022/12/doctor-full.jpg'
  },
  {
    id: 'd2_3',
    clinicId: '2',
    name: 'Шевченко Александра Петровна',
    specialty: 'Невролог',
    photoUrl: 'https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg?semt=ais_hybrid&w=740&q=80'
  },
  {
    id: 'd2_4',
    clinicId: '2',
    name: 'Белый Олег Викторович',
    specialty: 'Дерматолог',
    photoUrl: 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd2_5',
    clinicId: '2',
    name: 'Савицкий Алексей Владимирович',
    specialty: 'Хирург',
    photoUrl: 'https://medavenu.by/wp-content/uploads/2022/06/berezovsky.webp'
  },
  {
    id: 'd2_6',
    clinicId: '2',
    name: 'Яковлев Святослав Игоревич',
    specialty: 'Педиатр',
    photoUrl: 'https://images.pexels.com/photos/4173244/pexels-photo-4173244.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd2_8',
    clinicId: '2',
    name: 'Новик Юрий Станиславович',
    specialty: 'Травматолог',
    photoUrl: 'https://medelit.by/wp-content/uploads/2024/01/%D0%90%D0%91%D0%94%D0%A0%D0%90%D0%A8%D0%98%D0%A2%D0%9E%D0%92-%D0%92%D0%98%D0%A2%D0%90%D0%9B%D0%98%D0%99-%D0%92%D0%AF%D0%A7%D0%95%D0%A1%D0%9B%D0%90%D0%92%D0%9E%D0%92%D0%98%D0%A7.-%D0%92%D0%A0%D0%90%D0%A7-%D0%9E%D0%9D%D0%9A%D0%9E%D0%9B%D0%9E%D0%93-%D0%9C%D0%90%D0%9C%D0%9C%D0%9E%D0%9B%D0%9E%D0%93-768x1152.jpg'
  },
  {
    id: 'd2_9',
    clinicId: '2',
    name: 'Орлова Марина Викторовна',
    specialty: 'Офтальмолог',
    photoUrl: 'https://media.istockphoto.com/id/1372002650/ru/%D1%84%D0%BE%D1%82%D0%BE/%D0%BE%D0%B1%D1%80%D0%B5%D0%B7%D0%B0%D0%BD%D0%BD%D1%8B%D0%B9-%D0%BF%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82-%D0%BF%D1%80%D0%B8%D0%B2%D0%BB%D0%B5%D0%BA%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE%D0%B9-%D0%BC%D0%BE%D0%BB%D0%BE%D0%B4%D0%BE%D0%B9-%D0%B6%D0%B5%D0%BD%D1%89%D0%B8%D0%BD%D1%8B-%D0%B2%D1%80%D0%B0%D1%87%D0%B0-%D1%81%D1%82%D0%BE%D1%8F%D1%89%D0%B5%D0%B9-%D1%81%D0%BE-%D1%81%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%BD%D1%8B%D0%BC%D0%B8-%D1%80%D1%83%D0%BA%D0%B0%D0%BC%D0%B8-%D0%B2.jpg?s=612x612&w=0&k=20&c=ZvlKdLihjMD-SGIKLNkU4t5wCqDpOYRMkSFIkYO-pv8='
  },
  

  // 3-я центральная районная клиническая поликлиника Октябрьского района
  {
    id: 'd3_1',
    clinicId: '3',
    name: 'Лебедева Мария Николаевна',
    specialty: 'Терапевт',
    photoUrl: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd3_2',
    clinicId: '3',
    name: 'Кудрявцев Григорий Владимирович',
    specialty: 'Кардиолог',
    photoUrl: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd3_3',
    clinicId: '3',
    name: 'Ковалевский Алексей Викторович',
    specialty: 'Невролог',
    photoUrl: 'https://www.mobil-med.org/media/head_doctor.jpg'
  },
  {
    id: 'd3_4',
    clinicId: '3',
    name: 'Семенов Виктор Олегович',
    specialty: 'Дерматолог',
    photoUrl: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd3_5',
    clinicId: '3',
    name: 'Шиманский Денис Олегович',
    specialty: 'Хирург',
    photoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_6zRUxLd325gqKxy4BL-wMjQrUrw1MH7Q-g&s'
  },
  {
    id: 'd3_6',
    clinicId: '3',
    name: 'Савицкий Петр Игоревич',
    specialty: 'Педиатр',
    photoUrl: 'https://ortoped.by/assets/cache_image/template/images/team/op-%D1%82%D0%B0%D0%BB%D0%B0%D0%BA%D0%BE_450x500_e04.jpg'
  },

  {
    id: 'd3_8',
    clinicId: '3',
    name: 'Николаев Владислав Сергеевич',
    specialty: 'Травматолог',
    photoUrl: 'https://mrt.by/storage/doctors/55de6946-471b-49b1-bc4c-c35c789af79a/image.jpg'
  },
  {
    id: 'd3_9',
    clinicId: '3',
    name: 'Федорова Анна Михайловна',
    specialty: 'Офтальмолог',
    photoUrl: 'https://idealmed.by/assets/images/sotrudniki/tomasheva1.jpg'
  },


  // 20-я Городская поликлиника
  {
    id: 'd4_1',
    clinicId: '4',
    name: 'Романова Александра Борисовна',
    specialty: 'Терапевт',
    photoUrl: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd4_2',
    clinicId: '4',
    name: 'Волкова Татьяна Сергеевна',
    specialty: 'Кардиолог',
    photoUrl: 'https://21med.by/images/Sotrudniki-OOP/dryapko.jpg'
  },
  {
    id: 'd4_3',
    clinicId: '4',
    name: 'Кузнецов Михаил Александрович',
    specialty: 'Невролог',
    photoUrl: 'https://imgs.mondial-enterprise.com/WOQfSYbWJec39ttW3U74SJVxcYG1FLTZnst5qFqTqn0/rs:fill:1200:1200:1:1/g:sm/bg:B08BA8/aHR0cHM6Ly93d3cu/YmVzdC10cmVhdG1l/bnQuY29tL3JhaWxz/L2FjdGl2ZV9zdG9y/YWdlL2Jsb2JzL2V5/SmZjbUZwYkhNaU9u/c2liV1Z6YzJGblpT/STZJa0pCYUhCQmNU/QkhJaXdpWlhod0lq/cHVkV3hzTENKd2RY/SWlPaUppYkc5aVgy/bGtJbjE5LS0yZTE2/MzIxNDc4ODk2ZjEz/OWJmMThmZTRiM2Rh/YjQ5ZTAwZmMwYjFh/L1dQS19OZXVlX0ts/aW5pay5KUEc.jpg'
  },
  {
    id: 'd4_4',
    clinicId: '4',
    name: 'Попова Ольга Владимировна',
    specialty: 'Дерматолог',
    photoUrl: 'https://www.zdravitsa.ru/upload/services/terapevtPRO.jpg'
  },
  {
    id: 'd4_5',
    clinicId: '4',
    name: 'Васильева Николь Николаевна',
    specialty: 'Хирург',
    photoUrl: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'd4_6',
    clinicId: '4',
    name: 'Морозова Надежда Петровна',
    specialty: 'Педиатр',
    photoUrl: 'https://images.squarespace-cdn.com/content/v1/5abb33cfa9e0281a89dca40e/1645033463835-8ZIG4HQWMPHZ4VLHAPRW/%D0%9B%D1%8C%D0%B2%D0%BE%D0%B2%D1%81%D0%BA%D0%B0%D1%8F_%D0%B2%D1%80%D0%B0%D1%87-removebg-preview.png?format=1500w'
  },

  {
    id: 'd4_8',
    clinicId: '4',
    name: 'Тимофеев Сергей Владимирович',
    specialty: 'Травматолог',
    photoUrl: 'https://sonoplus.by/wp-content/uploads/2020/04/vrachi_07a-225x300.jpg'
  },
  {
    id: 'd4_9',
    clinicId: '4',
    name: 'Комарова Ирина Дмитриевна',
    specialty: 'Офтальмолог',
    photoUrl: 'https://astramed.waw.pl/media/cache/ee/bb/eebb7e54932f0309e7912e3b2c25a6d5.jpg'
  },

 

  // 2-я центральная районная поликлиника Фрунзенского района г.Минска
  {
    id: 'd5_1',
    clinicId: '5',
    name: 'Григорьева Людмила Анатольевна',
    specialty: 'Терапевт',
    photoUrl: 'https://dv.by/wp-content/uploads/2015/08/KurzinaE-1000x1000.png'
  },
  {
    id: 'd5_2',
    clinicId: '5',
    name: 'Козловский Виктор Петрович',
    specialty: 'Кардиолог',
    photoUrl: 'https://pridneprovskij.by/upload/medialibrary/1d1/1d12233e06841f8c02770d9e7039e7d6.jpg'
  },
  {
    id: 'd5_3',
    clinicId: '5',
    name: 'Павлова Елена Сергеевна',
    specialty: 'Невролог',
    photoUrl: 'https://vet.city/upload/iblock/bfe/di3i9kz6c4so0b0zv40hiv24a9p49zeu.jpg'
  },
  {
    id: 'd5_4',
    clinicId: '5',
    name: 'Сорокина Анна Владимировна',
    specialty: 'Дерматолог',
    photoUrl: 'https://medelit.by/wp-content/uploads/2024/01/%D0%96%D0%B5%D0%B3%D0%B7%D0%B4%D1%80%D0%B8%D0%BD-%D0%9E%D0%BA%D1%81%D0%B0%D0%BD%D0%B0-%D0%90%D0%BD%D1%80%D1%81%D0%B5%D0%BD%D1%8C%D0%B5%D0%B2%D0%BD%D0%B0-%D0%B2%D1%80%D0%B0%D1%87-%D0%B0%D0%BA%D1%83%D1%88%D0%B5%D1%80-%D0%B3%D0%B8%D0%BD%D0%B5%D0%BA%D0%BE%D0%BB%D0%BE%D0%B3-683x1024.jpg'
  },
  {
    id: 'd5_5',
    clinicId: '5',
    name: 'Медведев Артем Николаевич',
    specialty: 'Хирург',
    photoUrl: 'https://gkib.by/images/doctors/velgin.jpg'
  },
  {
    id: 'd5_6',
    clinicId: '5',
    name: 'Круглова Ольга Михайловна',
    specialty: 'Педиатр',
    photoUrl: 'https://mikosha.by/wp-content/uploads/2025/03/photo_2025-03-05_11-41-12.jpg'
  },

  {
    id: 'd5_8',
    clinicId: '5',
    name: 'Борисов Денис Олегович',
    specialty: 'Травматолог',
    photoUrl: 'https://gm.clinic/upload/resize_cache/iblock/320/4ytpmgt5qognuvhjmrpv8l1zpzpv988n/300_400_1/Zoloev.jpg'
  },
  {
    id: 'd5_9',
    clinicId: '5',
    name: 'Антонова Светлана Игоревна',
    specialty: 'Офтальмолог',
    photoUrl: 'https://dv.by/wp-content/uploads/2015/08/Sofii-skaya-kvadrat-rev3-1250x1250.png'
  },

 
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


