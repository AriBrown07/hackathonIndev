import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Clock, User, Mail, CheckCircle, X } from 'lucide-react';
import styles from './Coupons.module.scss';
import { mockClinics, mockDoctors, mockAppointments } from '../../data/mockData';

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

  const specialties = useMemo(() => {
    return Array.from(new Set(mockDoctors.map(d => d.specialty)));
  }, []);

  const cities = useMemo(() => {
    return Array.from(new Set(mockClinics.map(c => c.city)));
  }, []);

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

  const getClinicForDoctor = (doctorId: string) => {
    const doctor = mockDoctors.find(d => d.id === doctorId);
    return doctor ? mockClinics.find(c => c.id === doctor.clinicId) : null;
  };

  const getAppointmentsForDoctor = (doctorId: string) => {
    return appointments.filter(apt => apt.doctorId === doctorId);
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

  const handleSlotClick = (appointment: Appointment, doctor: Doctor) => {
    if (!appointment.isBooked) {
      setSelectedAppointment({ appointment, doctor });
      setIsBooked(false);
      setBookingForm({ name: '', email: '' });
    }
  };

  const handleBooking = (e: React.FormEvent) => {
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
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
    setIsBooked(false);
    setBookingForm({ name: '', email: '' });
  };

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

      <div className={styles.doctorsList}>
        {filteredDoctors.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🔍</div>
            <div className={styles.emptyStateTitle}>Врачи не найдены</div>
            <div className={styles.emptyStateText}>Попробуйте изменить параметры фильтрации</div>
          </div>
        ) : (
          filteredDoctors.map(doctor => {
            const clinic = getClinicForDoctor(doctor.id);
            const doctorAppointments = getAppointmentsForDoctor(doctor.id);
            const groupedAppointments = groupAppointmentsByMonth(doctorAppointments);

            return (
              <div key={doctor.id} className={styles.doctorCard}>
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

                <div className={styles.calendar}>
                  {Object.entries(groupedAppointments).map(([month, dates]) => (
                    <div key={month} className={styles.monthSection}>
                      <div className={styles.monthTitle}>
                        <Calendar size={24} />
                        {month}
                      </div>
                      <div className={styles.daysGrid}>
                        {Object.entries(dates).map(([date, slots]) => {
                          const { day, weekday } = formatDate(date);
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
                                      onClick={() => handleSlotClick(slot, doctor)}
                                    >
                                      {slot.time}
                                    </div>
                                  ))
                                ) : (
                                  <div className={styles.noSlots}>Нет слотов</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
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
