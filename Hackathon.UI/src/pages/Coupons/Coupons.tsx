import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, MapPin, Clock, User, Mail, CheckCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Coupons.module.scss';
import { mockClinics, mockDoctors, mockAppointments } from '../../data/mockData';
import type { Doctor, Appointment, BookingFormData } from '../../types';

interface SelectedAppointment {
  appointment: Appointment;
  doctor: Doctor;
}

const Coupons: React.FC = () => {
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({ name: '', email: '' });
  const [isBooked, setIsBooked] = useState(false);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const specialties = useMemo(() => {
    return Array.from(new Set(mockDoctors.map(d => d.specialty)));
  }, []);

  const cities = useMemo(() => {
    return Array.from(new Set(mockClinics.map(c => c.city)));
  }, []);

  // Фильтрация врачей с мемоизацией
  const filteredDoctors = useMemo(() => {
    return mockDoctors.filter(doctor => {
      const matchesClinic = !selectedClinic || doctor.clinicId === selectedClinic;
      const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
      const matchesSearch = !searchTerm ||
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesClinic && matchesSpecialty && matchesSearch;
    });
  }, [selectedClinic, selectedSpecialty, searchTerm]);

  const getClinicForDoctor = useCallback((doctorId: string) => {
    const doctor = mockDoctors.find(d => d.id === doctorId);
    return doctor ? mockClinics.find(c => c.id === doctor.clinicId) : null;
  }, []);

  // Получение дат для ближайшего месяца
  const getCurrentMonthDates = useCallback(() => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset + 1, 1);
    
    const dates: string[] = [];
    const currentDate = new Date(currentMonth);
    
    while (currentDate < nextMonth) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }, [currentMonthOffset]);

  // Получение расписания для выбранного врача с фильтрацией по месяцу
  const getAppointmentsForDoctor = useCallback((doctorId: string) => {
    const currentMonthDates = getCurrentMonthDates();
    return appointments.filter(apt => 
      apt.doctorId === doctorId && 
      currentMonthDates.includes(apt.date)
    );
  }, [appointments, getCurrentMonthDates]);

  // Группировка по датам
  const groupAppointmentsByDate = useCallback((appointments: Appointment[]) => {
    const grouped: { [key: string]: Appointment[] } = {};
    
    appointments.forEach(apt => {
      if (!grouped[apt.date]) {
        grouped[apt.date] = [];
      }
      grouped[apt.date].push(apt);
    });
    
    return grouped;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const weekday = date.toLocaleString('ru-RU', { weekday: 'short' });
    return { day, weekday };
  }, []);

  const getCurrentMonthName = useCallback(() => {
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    return targetMonth.toLocaleString('ru-RU', { year: 'numeric', month: 'long' });
  }, [currentMonthOffset]);

  const handleDoctorSelect = useCallback((doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCurrentMonthOffset(0); // Сброс к текущему месяцу при выборе врача
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedDoctor(null);
    setCurrentMonthOffset(0);
  }, []);

  const handleSlotClick = useCallback((appointment: Appointment, doctor: Doctor) => {
    if (!appointment.isBooked) {
      setSelectedAppointment({ appointment, doctor });
      setIsBooked(false);
      setBookingForm({ name: '', email: '' });
    }
  }, []);

  const handleBooking = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAppointment && bookingForm.name && bookingForm.email) {
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === selectedAppointment.appointment.id
            ? { ...apt, isBooked: true, userName: bookingForm.name, userEmail: bookingForm.email }
            : apt
        )
      );

      setIsBooked(true);

      setTimeout(() => {
        setSelectedAppointment(null);
        setBookingForm({ name: '', email: '' });
      }, 3000);
    }
  }, [selectedAppointment, bookingForm]);

  const handleCloseModal = useCallback(() => {
    setSelectedAppointment(null);
    setIsBooked(false);
    setBookingForm({ name: '', email: '' });
  }, []);

  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonthOffset(prev => direction === 'next' ? prev + 1 : prev - 1);
  }, []);

  // Пагинация врачей
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10;

  const paginatedDoctors = useMemo(() => {
    const startIndex = (currentPage - 1) * doctorsPerPage;
    return filteredDoctors.slice(startIndex, startIndex + doctorsPerPage);
  }, [filteredDoctors, currentPage]);

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  // Рендер списка врачей
  const renderDoctorsList = () => (
    <>
      <div className={styles.doctorsGrid}>
        {paginatedDoctors.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🔍</div>
            <div className={styles.emptyStateTitle}>Врачи не найдены</div>
            <div className={styles.emptyStateText}>Попробуйте изменить параметры фильтрации</div>
          </div>
        ) : (
          paginatedDoctors.map(doctor => {
            const clinic = getClinicForDoctor(doctor.id);
            
            return (
              <div 
                key={doctor.id} 
                className={styles.doctorCard}
                onClick={() => handleDoctorSelect(doctor)}
              >
                <div className={styles.doctorHeader}>
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    className={styles.doctorPhoto}
                  />
                  <div className={styles.doctorInfo}>
                    <h2 className={styles.doctorName}>{doctor.name}</h2>
                    <div className={styles.doctorSpecialty}>{doctor.specialty}</div>
                    {clinic && (
                      <div className={styles.clinicInfo}>
                        <MapPin size={16} />
                        <span>{clinic.name}, {clinic.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.selectButton}>
                  Выбрать время
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          
          <span className={styles.paginationInfo}>
            Страница {currentPage} из {totalPages}
          </span>
          
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Вперед
          </button>
        </div>
      )}
    </>
  );

  // Рендер расписания выбранного врача
  const renderDoctorSchedule = () => {
    if (!selectedDoctor) return null;

    const clinic = getClinicForDoctor(selectedDoctor.id);
    const doctorAppointments = getAppointmentsForDoctor(selectedDoctor.id);
    const groupedAppointments = groupAppointmentsByDate(doctorAppointments);
    const currentMonthDates = getCurrentMonthDates();

    return (
      <div className={styles.scheduleView}>
        {/* Шапка с информацией о враче и кнопкой назад */}
        <div className={styles.scheduleHeader}>
          <button 
            className={styles.backButton}
            onClick={handleBackToList}
          >
            <ChevronLeft size={20} />
            Назад к списку врачей
          </button>
          
          <div className={styles.selectedDoctorInfo}>
            <img
              src={selectedDoctor.photoUrl}
              alt={selectedDoctor.name}
              className={styles.doctorPhotoLarge}
            />
            <div className={styles.doctorDetails}>
              <h2 className={styles.doctorNameLarge}>{selectedDoctor.name}</h2>
              <div className={styles.doctorSpecialtyLarge}>{selectedDoctor.specialty}</div>
              {clinic && (
                <div className={styles.clinicInfoLarge}>
                  <MapPin size={18} />
                  <span>{clinic.name}, {clinic.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Навигация по месяцам */}
        <div className={styles.monthNavigation}>
          <button
            className={styles.monthNavButton}
            onClick={() => handleMonthChange('prev')}
            disabled={currentMonthOffset === 0}
          >
            <ChevronLeft size={20} />
            Предыдущий месяц
          </button>
          
          <div className={styles.currentMonth}>
            <Calendar size={24} />
            {getCurrentMonthName()}
          </div>
          
          <button
            className={styles.monthNavButton}
            onClick={() => handleMonthChange('next')}
          >
            Следующий месяц
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Календарь с расписанием */}
        <div className={styles.calendar}>
          <div className={styles.daysGrid}>
            {currentMonthDates.map(date => {
              const { day, weekday } = formatDate(date);
              const slots = groupedAppointments[date] || [];
              
              return (
                <div key={date} className={styles.dayCard}>
                  <div className={styles.dayHeader}>
                    <div>{day}</div>
                    <div className={styles.weekday}>{weekday}</div>
                  </div>
                  <div className={styles.slots}>
                    {slots.length > 0 ? (
                      slots.map(slot => (
                        <div
                          key={slot.id}
                          className={`${styles.slot} ${
                            slot.isBooked ? styles.slotBooked : styles.slotAvailable
                          }`}
                          onClick={() => handleSlotClick(slot, selectedDoctor)}
                        >
                          {slot.time}
                        </div>
                      ))
                    ) : (
                      <div className={styles.noSlots}>—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Запись на прием</h1>
        <p className={styles.subtitle}>
          {selectedDoctor ? 'Выберите удобное время для приема' : 'Выберите врача для записи на прием'}
        </p>
      </div>

      {/* Фильтры */}
      {!selectedDoctor && (
        <div className={styles.filters}>
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Город</label>
              <select
                className={styles.filterSelect}
                value={selectedClinic}
                onChange={(e) => {
                  setSelectedClinic(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Все поликлиники</option>
                {mockClinics.map(clinic => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name} - {clinic.city}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Специальность</label>
              <select
                className={styles.filterSelect}
                value={selectedSpecialty}
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Все специальности</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Поиск врача</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Имя или специальность..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className={styles.content}>
        {selectedDoctor ? renderDoctorSchedule() : renderDoctorsList()}
      </div>

      {/* Модальное окно записи */}
      {selectedAppointment && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {!isBooked ? (
              <>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Запись на прием</h2>
                  <button className={styles.closeButton} onClick={handleCloseModal}>
                    <X size={24} />
                  </button>
                </div>

                <div className={styles.appointmentInfo}>
                  <div className={styles.infoRow}>
                    <User size={20} />
                    <span>{selectedAppointment.doctor.name}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <Calendar size={20} />
                    <span>{new Date(selectedAppointment.appointment.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <Clock size={20} />
                    <span>{selectedAppointment.appointment.time}</span>
                  </div>
                </div>

                <form className={styles.form} onSubmit={handleBooking}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ваше имя</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Иван Иванов"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email для подтверждения</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      placeholder="ivan@example.com"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      onClick={handleCloseModal}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                      Записаться
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className={styles.successMessage}>
                <div className={styles.successTitle}>
                  <CheckCircle size={32} />
                  Запись успешно оформлена!
                </div>
                <p className={styles.successText}>
                  Подтверждение отправлено на {bookingForm.email}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;