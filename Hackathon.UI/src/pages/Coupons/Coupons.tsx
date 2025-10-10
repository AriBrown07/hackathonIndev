import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, MapPin, Clock, User, Mail, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './Coupons.module.scss';
import { mockClinics, mockDoctors, mockAppointments } from '../../data/mockData';
import type { Doctor, Appointment, BookingFormData } from '../../types';

interface SelectedAppointment {
  appointment: Appointment;
  doctor: Doctor;
}

interface ExpandedDoctor {
  [doctorId: string]: boolean;
}

// Функция для получения только ближайшего месяца
const getNearestMonthAppointments = (appointments: Appointment[]) => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  return appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= now && aptDate < nextMonth;
  });
};

const groupAppointmentsByMonth = (appointments: Appointment[]) => {
  const grouped: { [key: string]: { [key: string]: Appointment[] } } = {};

  appointments.forEach(apt => {
    const date = new Date(apt.date);
    const monthKey = date.toLocaleString('ru-RU', { year: 'numeric', month: 'long' });
    const dateKey = apt.date;

    if (!grouped[monthKey]) {
      grouped[monthKey] = {};
    }
    if (!grouped[monthKey][dateKey]) {
      grouped[monthKey][dateKey] = [];
    }
    grouped[monthKey][dateKey].push(apt);
  });

  return grouped;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const weekday = date.toLocaleString('ru-RU', { weekday: 'short' });
  return { day, weekday };
};

const preprocessData = () => {
  const clinicMap = new Map(mockClinics.map(c => [c.id, c]));
  const doctorMap = new Map(mockDoctors.map(d => [d.id, d]));
  
  const appointmentsByDoctor = new Map<string, Appointment[]>();
  
  // Фильтруем только ближайшие appointments
  mockAppointments.forEach(apt => {
    const aptDate = new Date(apt.date);
    const now = new Date();
    // Показываем только будущие даты
    if (aptDate >= now) {
      if (!appointmentsByDoctor.has(apt.doctorId)) {
        appointmentsByDoctor.set(apt.doctorId, []);
      }
      appointmentsByDoctor.get(apt.doctorId)!.push(apt);
    }
  });

  const groupedAppointmentsByDoctor = new Map<string, ReturnType<typeof groupAppointmentsByMonth>>();
  appointmentsByDoctor.forEach((appointments, doctorId) => {
    // Берем только ближайший месяц для каждого врача
    const nearestMonthAppointments = getNearestMonthAppointments(appointments);
    if (nearestMonthAppointments.length > 0) {
      groupedAppointmentsByDoctor.set(doctorId, groupAppointmentsByMonth(nearestMonthAppointments));
    }
  });

  return { clinicMap, doctorMap, groupedAppointmentsByDoctor };
};

const Coupons: React.FC = () => {
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({ name: '', email: '' });
  const [isBooked, setIsBooked] = useState(false);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [expandedDoctors, setExpandedDoctors] = useState<ExpandedDoctor>({});
  const [visibleDoctorsCount, setVisibleDoctorsCount] = useState<number>(5);

  const { clinicMap, doctorMap, groupedAppointmentsByDoctor } = useMemo(() => preprocessData(), []);

  const specialties = useMemo(() => {
    return Array.from(new Set(mockDoctors.map(d => d.specialty)));
  }, []);

  const filteredDoctors = useMemo(() => {
    const filtered = mockDoctors.filter(doctor => {
      // Проверяем, есть ли у врача доступные слоты в ближайшем месяце
      const hasAvailableSlots = groupedAppointmentsByDoctor.has(doctor.id);
      
      const matchesClinic = !selectedClinic || doctor.clinicId === selectedClinic;
      const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
      const matchesSearch = !searchTerm ||
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesClinic && matchesSpecialty && matchesSearch && hasAvailableSlots;
    });

    return filtered;
  }, [selectedClinic, selectedSpecialty, searchTerm, groupedAppointmentsByDoctor]);

  // Показываем только ограниченное количество врачей
  const visibleDoctors = useMemo(() => {
    return filteredDoctors.slice(0, visibleDoctorsCount);
  }, [filteredDoctors, visibleDoctorsCount]);

  const handleShowMore = useCallback(() => {
    setVisibleDoctorsCount(prev => prev + 5);
  }, []);

  const handleShowLess = useCallback(() => {
    setVisibleDoctorsCount(5);
  }, []);

  const toggleDoctorExpanded = useCallback((doctorId: string) => {
    setExpandedDoctors(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
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

  const Slot = React.memo(({ slot, doctor }: { slot: Appointment; doctor: Doctor }) => (
    <div
      className={`${styles.slot} ${
        slot.isBooked ? styles.slotBooked : styles.slotAvailable
      }`}
      onClick={() => handleSlotClick(slot, doctor)}
    >
      {slot.time}
    </div>
  ));

  const DayCard = React.memo(({ date, slots, doctor }: { date: string; slots: Appointment[]; doctor: Doctor }) => {
    const { day, weekday } = useMemo(() => formatDate(date), [date]);
    
    return (
      <div className={styles.dayCard}>
        <div className={styles.dayHeader}>
          <div>{day}</div>
          <div className={styles.weekday}>{weekday}</div>
        </div>
        <div className={styles.slots}>
          {slots.length > 0 ? (
            slots.map(slot => (
              <Slot key={slot.id} slot={slot} doctor={doctor} />
            ))
          ) : (
            <div className={styles.noSlots}>Нет слотов</div>
          )}
        </div>
      </div>
    );
  });

  const MonthSection = React.memo(({ month, dates, doctor }: { month: string; dates: { [key: string]: Appointment[] }; doctor: Doctor }) => (
    <div className={styles.monthSection}>
      <div className={styles.monthTitle}>
        <Calendar size={20} />
        {month}
      </div>
      <div className={styles.daysGrid}>
        {Object.entries(dates).map(([date, slots]) => (
          <DayCard key={date} date={date} slots={slots} doctor={doctor} />
        ))}
      </div>
    </div>
  ));

  const DoctorCard = React.memo(({ doctor, isExpanded }: { doctor: Doctor; isExpanded: boolean }) => {
    const clinic = clinicMap.get(doctor.clinicId);
    const groupedAppointments = groupedAppointmentsByDoctor.get(doctor.id);

    if (!groupedAppointments) return null;

    return (
      <div className={styles.doctorCard}>
        <div 
          className={styles.doctorHeader}
          onClick={() => toggleDoctorExpanded(doctor.id)}
          style={{ cursor: 'pointer' }}
        >
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
          <div className={styles.expandIcon}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {isExpanded && (
          <div className={styles.calendar}>
            {Object.entries(groupedAppointments).map(([month, dates]) => (
              <MonthSection key={month} month={month} dates={dates} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Запись на прием</h1>
        <p className={styles.subtitle}>Выберите врача и удобное время для визита</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Город</label>
            <select
              className={styles.filterSelect}
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
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
              onChange={(e) => setSelectedSpecialty(e.target.value)}
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.resultsInfo}>
        Найдено врачей: {filteredDoctors.length}
        {filteredDoctors.length > visibleDoctorsCount && (
          <span> (показано: {visibleDoctors.length})</span>
        )}
      </div>

      <div className={styles.doctorsList}>
        {visibleDoctors.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🔍</div>
            <div className={styles.emptyStateTitle}>Врачи не найдены</div>
            <div className={styles.emptyStateText}>
              {filteredDoctors.length === 0 
                ? "Попробуйте изменить параметры фильтрации"
                : "Нет доступных записей в ближайшем месяце"
              }
            </div>
          </div>
        ) : (
          <>
            {visibleDoctors.map(doctor => (
              <DoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                isExpanded={expandedDoctors[doctor.id] || false}
              />
            ))}
            
            {/* Кнопки показать еще/скрыть */}
            {filteredDoctors.length > visibleDoctorsCount && (
              <div className={styles.showMoreContainer}>
                <button className={styles.showMoreButton} onClick={handleShowMore}>
                  Показать еще {Math.min(5, filteredDoctors.length - visibleDoctorsCount)} врачей
                </button>
              </div>
            )}
            
            {visibleDoctorsCount > 5 && (
              <div className={styles.showMoreContainer}>
                <button className={styles.showLessButton} onClick={handleShowLess}>
                  Скрыть список
                </button>
              </div>
            )}
          </>
        )}
      </div>

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