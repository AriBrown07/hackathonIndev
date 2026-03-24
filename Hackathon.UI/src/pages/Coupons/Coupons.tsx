import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, MapPin, Clock, User, Mail, CheckCircle, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTickets } from '../../hooks/useTickets';
import styles from './Coupons.module.scss';
import { Link, useNavigate } from 'react-router-dom';

// Типы данных
interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  clinicId: string;
  photo?: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  isBooked: boolean;
  userName?: string;
  userEmail?: string;
}

interface BookingFormData {
  name: string;
  email: string;
}

interface SelectedAppointment {
  doctor: Doctor;
  appointment: Appointment;
}

// Моковые данные
const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'Городская поликлиника №1',
    address: 'ул. Центральная, д. 10',
    phone: '+7 (495) 123-45-67'
  },
  {
    id: '2',
    name: 'Диагностический центр "Здоровье"',
    address: 'пр. Мира, д. 25',
    phone: '+7 (495) 234-56-78'
  },
  {
    id: '3',
    name: 'Клиника современной медицины',
    address: 'ул. Ленина, д. 15',
    phone: '+7 (495) 345-67-89'
  }
];

const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Иванова Анна Сергеевна',
    specialty: 'Терапевт',
    experience: 12,
    rating: 4.8,
    clinicId: '1'
  },
  {
    id: '2',
    name: 'Петров Дмитрий Владимирович',
    specialty: 'Кардиолог',
    experience: 15,
    rating: 4.9,
    clinicId: '1'
  },
  {
    id: '3',
    name: 'Сидорова Елена Викторовна',
    specialty: 'Невролог',
    experience: 10,
    rating: 4.7,
    clinicId: '2'
  },
  {
    id: '4',
    name: 'Козлов Алексей Иванович',
    specialty: 'Хирург',
    experience: 20,
    rating: 5.0,
    clinicId: '3'
  },
  {
    id: '5',
    name: 'Фролова Мария Петровна',
    specialty: 'Офтальмолог',
    experience: 8,
    rating: 4.6,
    clinicId: '2'
  },
  {
    id: '6',
    name: 'Николаев Сергей Александрович',
    specialty: 'Отоларинголог',
    experience: 11,
    rating: 4.8,
    clinicId: '3'
  }
];

const generateMockAppointments = (): Appointment[] => {
  const appointments: Appointment[] = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    if (date.getDay() === 0 || date.getDay() === 6) continue; // Пропускаем выходные
    
    const dateString = date.toISOString().split('T')[0];
    
    mockDoctors.forEach(doctor => {
      // Генерируем 3-4 временных слота на день для каждого врача
      const timeSlots = ['09:00', '11:00', '14:00', '16:00'];
      const slotsCount = 3 + Math.floor(Math.random() * 2);
      
      timeSlots.slice(0, slotsCount).forEach(time => {
        appointments.push({
          id: `apt_${doctor.id}_${dateString}_${time}`,
          doctorId: doctor.id,
          date: dateString,
          time: time,
          isBooked: Math.random() > 0.8 // 20% записей занято
        });
      });
    });
  }
  
  return appointments;
};

export default function Coupons() {
  const { user } = useAuth();
  const { addTicket } = useTickets(user);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>(generateMockAppointments());
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    name: user?.email?.split('@')[0] || '',
    email: user?.email || ''
  });
  const [isBooked, setIsBooked] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [isExamsDropdownOpen, setIsExamsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Получение уникальных специальностей
  const specialties = useMemo(() => {
    const specs = mockDoctors.map(doctor => doctor.specialty);
    return ['all', ...Array.from(new Set(specs))];
  }, []);

  // Получение врачей с учетом фильтра
  const filteredDoctors = useMemo(() => {
    return selectedSpecialty === 'all' 
      ? mockDoctors 
      : mockDoctors.filter(doctor => doctor.specialty === selectedSpecialty);
  }, [selectedSpecialty]);

  // Получение доступных дат
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(appointments.map(apt => apt.date)))
      .sort()
      .filter(date => {
        if (!selectedSpecialty || selectedSpecialty === 'all') return true;
        return appointments.some(apt => 
          apt.date === date && 
          filteredDoctors.some(doctor => doctor.id === apt.doctorId)
        );
      });
    
    return dates;
  }, [appointments, selectedSpecialty, filteredDoctors]);

  // Получение дат для текущей недели
  const currentWeekDates = useMemo(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + currentWeekOffset * 7);
    
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      if (availableDates.includes(dateString)) {
        weekDates.push(dateString);
      }
    }
    
    return weekDates;
  }, [availableDates, currentWeekOffset]);

  // Получение клиники для врача
  const getClinicForDoctor = useCallback((doctorId: string) => {
    const doctor = mockDoctors.find(d => d.id === doctorId);
    if (!doctor) return null;
    return mockClinics.find(clinic => clinic.id === doctor.clinicId) || null;
  }, []);

  // Получение доступных записей для врача на выбранную дату
  const getDoctorAppointments = useCallback((doctorId: string, date: string) => {
    return appointments.filter(apt => 
      apt.doctorId === doctorId && 
      apt.date === date &&
      !apt.isBooked
    );
  }, [appointments]);

  // Обработчик выбора записи
  const handleAppointmentSelect = useCallback((doctor: Doctor, appointment: Appointment) => {
    setSelectedAppointment({ doctor, appointment });
    setIsBooked(false);
  }, []);

  // Обработчик изменений в форме
  const handleBookingFormChange = useCallback((field: keyof BookingFormData, value: string) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Функция для генерации и отправки PDF талона
  const generateAndSendTicketPDF = useCallback(async (ticketData: any): Promise<boolean> => {
    try {
      // В реальном приложении здесь был бы вызов API для генерации PDF
      console.log('Генерация PDF талона:', ticketData);
      
      // Имитация задержки генерации PDF
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // В реальном приложении здесь был бы код для:
      // 1. Генерации PDF на сервере
      // 2. Отправки на email
      // 3. Сохранения в базу данных
      
      return true;
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
      return false;
    }
  }, []);

  // Обработчик записи на прием
  const handleBooking = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAppointment && bookingForm.name && bookingForm.email) {
      const clinic = getClinicForDoctor(selectedAppointment.doctor.id);
      
      if (!clinic) {
        alert('Ошибка: не найдена информация о поликлинике');
        return;
      }

      // Обновляем состояние записи
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === selectedAppointment.appointment.id
            ? { ...apt, isBooked: true, userName: bookingForm.name, userEmail: bookingForm.email }
            : apt
        )
      );

      // Создаем данные для талона
      const ticketData = {
        patientName: bookingForm.name,
        patientEmail: bookingForm.email,
        doctorName: selectedAppointment.doctor.name,
        doctorSpecialty: selectedAppointment.doctor.specialty,
        clinicName: clinic.name,
        clinicAddress: clinic.address,
        appointmentDate: new Date(selectedAppointment.appointment.date).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        appointmentTime: selectedAppointment.appointment.time,
        appointmentId: selectedAppointment.appointment.id,
        status: 'active' as const
      };

      // Добавляем талон в хранилище
      addTicket(ticketData);

      // Генерируем и отправляем PDF талон
      const pdfGenerated = await generateAndSendTicketPDF(ticketData);

      if (pdfGenerated) {
        setIsBooked(true);
        
        setTimeout(() => {
          setSelectedAppointment(null);
          setBookingForm({ name: '', email: '' });
        }, 3000);
      } else {
        alert('Ошибка при создании талона. Пожалуйста, попробуйте еще раз.');
      }
    }
  }, [selectedAppointment, bookingForm, getClinicForDoctor, generateAndSendTicketPDF, addTicket]);

  // Форматирование даты
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  // Получение названия дня недели
  const getDayName = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { weekday: 'long' });
  }, []);

  // Навигация по неделям
  const handlePrevWeek = useCallback(() => {
    setCurrentWeekOffset(prev => prev - 1);
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeekOffset(prev => prev + 1);
  }, []);

  // Сброс фильтров
  const handleResetFilters = useCallback(() => {
    setSelectedSpecialty('all');
    setSelectedDate('');
    setCurrentWeekOffset(0);
  }, []);

  // Обработчик выбора осмотра
  const handleExamSelect = (examType: string) => {
    setIsExamsDropdownOpen(false);
    if (examType === 'medicalExamination') {
      navigate('/medicalExamination');
    } else if (examType === 'driver') {
      // Здесь будет переход на страницу водительской комиссии
      navigate('/driver');
      console.log('Переход на страницу водительской комиссии');
    }
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.accountButton}
        onClick={() => navigate('/profile')}
        title="Перейти в профиль"
      >
        <User size={20} />
      </button>
      <div className={styles.header}>
        <h1 className={styles.title}>Запись на прием</h1>
        <p className={styles.subtitle}>
          Выберите специалиста и удобное время для записи
        </p>
      </div>

      {/* Фильтры */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Специальность:</label>
          <select
            className={styles.filterSelect}
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>
                {specialty === 'all' ? 'Все специальности' : specialty}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Дата приема:</label>
          <select
            className={styles.filterSelect}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            <option value="">Любая дата</option>
            {availableDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        </div>

        {/* Выпадающий список дополнительных осмотров */}
        <div className={styles.examDropdown}>
          <button 
            className={styles.examDropdownButton}
            onClick={() => setIsExamsDropdownOpen(!isExamsDropdownOpen)}
          >
            Дополнительные осмотры
            <ChevronDown size={16} className={isExamsDropdownOpen ? styles.rotate : ''} />
          </button>
          
          {isExamsDropdownOpen && (
            <div className={styles.examDropdownMenu}>
              <button 
                className={styles.examDropdownItem}
                onClick={() => handleExamSelect('medicalExamination')}
              >
                <div className={styles.examItem}>
                  <span className={styles.examName}>Профосмотры</span>
                  <span className={styles.examFrequency}>(раз в год)</span>
                </div>
              </button>
              <button 
                className={styles.examDropdownItem}
                onClick={() => handleExamSelect('driver')}
              >
                <div className={styles.examItem}>
                  <span className={styles.examName}>Водительская комиссия</span>
                  <span className={styles.examFrequency}>(раз в 5 лет)</span>
                </div>
              </button>
            </div>
          )}
        </div>

        <button className={styles.resetButton} onClick={handleResetFilters}>
          Сбросить фильтры
        </button>
      </div>

      {/* Навигация по неделям */}
      <div className={styles.weekNavigation}>
        <button className={styles.navButton} onClick={handlePrevWeek}>
          <ChevronLeft size={20} />
          Предыдущая неделя
        </button>
        
        <div className={styles.currentWeek}>
          Неделя {currentWeekOffset === 0 ? 'текущая' : 
                  currentWeekOffset > 0 ? `+${currentWeekOffset}` : currentWeekOffset}
        </div>
        
        <button className={styles.navButton} onClick={handleNextWeek}>
          Следующая неделя
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Список врачей и расписание */}
      <div className={styles.doctorsGrid}>
        {filteredDoctors.map(doctor => {
          const clinic = getClinicForDoctor(doctor.id);
          
          return (
            <div key={doctor.id} className={styles.doctorCard}>
              <div className={styles.doctorHeader}>
                <div className={styles.doctorAvatar}>
                  <User size={32} />
                </div>
                <div className={styles.doctorInfo}>
                  <h3 className={styles.doctorName}>{doctor.name}</h3>
                  <p className={styles.doctorSpecialty}>{doctor.specialty}</p>
                  <p className={styles.doctorExperience}>
                    Опыт работы: {doctor.experience} лет
                  </p>
                  <div className={styles.doctorRating}>
                    Рейтинг: {doctor.rating} ★
                  </div>
                </div>
              </div>

              {clinic && (
                <div className={styles.clinicInfo}>
                  <MapPin size={16} />
                  <span>{clinic.name}</span>
                  <br />
                  <span className={styles.clinicAddress}>{clinic.address}</span>
                </div>
              )}

              {/* Расписание на неделю */}
              <div className={styles.schedule}>
                <h4 className={styles.scheduleTitle}>Доступные записи:</h4>
                <div className={styles.weekSchedule}>
                  {currentWeekDates.map(date => {
                    const dayAppointments = getDoctorAppointments(doctor.id, date);
                    
                    return (
                      <div key={date} className={styles.daySchedule}>
                        <div className={styles.dayHeader}>
                          <div className={styles.dayName}>
                            {getDayName(date)}
                          </div>
                          <div className={styles.date}>
                            {new Date(date).getDate()}
                          </div>
                        </div>
                        
                        <div className={styles.timeSlots}>
                          {dayAppointments.map(apt => (
                            <button
                              key={apt.id}
                              className={styles.timeSlot}
                              onClick={() => handleAppointmentSelect(doctor, apt)}
                            >
                              <Clock size={14} />
                              {apt.time}
                            </button>
                          ))}
                          
                          {dayAppointments.length === 0 && (
                            <div className={styles.noSlots}>
                              Нет записей
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Модальное окно записи */}
      {selectedAppointment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            {isBooked ? (
              <div className={styles.successMessage}>
                <CheckCircle size={48} className={styles.successIcon} />
                <h3>Запись успешно оформлена!</h3>
                <p>Талон сохранен в вашем профиле и отправлен на email.</p>
                <p>Вы можете скачать его в любое время.</p>
                <button
                  className={styles.closeButton}
                  onClick={() => setSelectedAppointment(null)}
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <h2>Оформление записи</h2>
                  <button
                    className={styles.closeButton}
                    onClick={() => setSelectedAppointment(null)}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className={styles.appointmentDetails}>
                  <h3>Детали приема:</h3>
                  <div className={styles.detailItem}>
                    <strong>Врач:</strong> {selectedAppointment.doctor.name}
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Специальность:</strong> {selectedAppointment.doctor.specialty}
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Дата:</strong> {formatDate(selectedAppointment.appointment.date)}
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Время:</strong> {selectedAppointment.appointment.time}
                  </div>
                  {(() => {
                    const clinic = getClinicForDoctor(selectedAppointment.doctor.id);
                    return clinic ? (
                      <>
                        <div className={styles.detailItem}>
                          <strong>Поликлиника:</strong> {clinic.name}
                        </div>
                        <div className={styles.detailItem}>
                          <strong>Адрес:</strong> {clinic.address}
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>

                <form onSubmit={handleBooking} className={styles.bookingForm}>
                  <h3>Данные пациента:</h3>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <User size={18} />
                      Фамилия и Имя
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={bookingForm.name}
                      onChange={(e) => handleBookingFormChange('name', e.target.value)}
                      required
                      placeholder="Введите ваше ФИО"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Mail size={18} />
                      Email
                    </label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={bookingForm.email}
                      onChange={(e) => handleBookingFormChange('email', e.target.value)}
                      required
                      placeholder="Введите ваш email"
                    />
                  </div>

                  <button type="submit" className={styles.bookButton}>
                    <Calendar size={20} />
                    Подтвердить запись
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Сообщение если нет врачей */}
      {filteredDoctors.length === 0 && (
        <div className={styles.emptyState}>
          <User size={48} />
          <h3>Врачи не найдены</h3>
          <p>Попробуйте изменить параметры фильтрации</p>
          <button className={styles.resetButton} onClick={handleResetFilters}>
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}