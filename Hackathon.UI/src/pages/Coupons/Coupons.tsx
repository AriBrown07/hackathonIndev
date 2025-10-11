import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, MapPin, Clock, User, Mail, CheckCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Функция для генерации HTML контента талона
  const generateTicketHTML = useCallback((appointmentData: {
    patientName: string;
    patientEmail: string;
    doctorName: string;
    doctorSpecialty: string;
    clinicName: string;
    clinicAddress: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentId: string;
  }) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Медицинский талон - ${appointmentData.patientName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          body { 
            font-family: 'Inter', Arial, sans-serif; 
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          .ticket-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #667eea;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 { 
            margin: 0 0 10px 0;
            font-size: 32px;
            font-weight: 700;
          }
          .clinic-info {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
          }
          .barcode {
            text-align: center;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 18px;
            letter-spacing: 3px;
            background: #f5f5f5;
            padding: 10px;
            border-radius: 8px;
          }
          .content {
            padding: 30px;
          }
          .info-section { 
            margin-bottom: 25px;
            padding: 20px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            background: #f8f9ff;
          }
          .info-section h3 { 
            color: #667eea; 
            margin-top: 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            font-size: 20px;
            font-weight: 600;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
          }
          .info-label {
            font-weight: 600;
            color: #555;
            flex: 1;
          }
          .info-value {
            color: #333;
            flex: 2;
            text-align: right;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            background: #e8f5e8;
            color: #2e7d32;
          }
          .footer { 
            background: #f5f5f5;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #ddd;
          }
          .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
          }
          .footer strong {
            color: #333;
          }
          .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            opacity: 0.1;
            font-size: 48px;
            color: #667eea;
            transform: rotate(-15deg);
            pointer-events: none;
          }
          @media print {
            body { 
              margin: 0;
              padding: 0;
            }
            .ticket-container {
              box-shadow: none;
              border: 1px solid #ccc;
            }
            .watermark {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="header">
            <h1>МЕДИЦИНСКИЙ ТАЛОН</h1>
            <p class="clinic-info">FaceDiagnosis System - Медицинская диагностика онлайн</p>
          </div>
          
          <div class="barcode">
            ТАЛОН № ${appointmentData.appointmentId}
          </div>
          
          <div class="content">
            <div class="info-section">
              <h3>Информация о пациенте</h3>
              <div class="info-row">
                <span class="info-label">Фамилия Имя:</span>
                <span class="info-value">${appointmentData.patientName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${appointmentData.patientEmail}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Статус талона:</span>
                <span class="info-value">
                  <span class="status-badge">АКТИВЕН</span>
                </span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Информация о приеме</h3>
              <div class="info-row">
                <span class="info-label">Дата приема:</span>
                <span class="info-value">${appointmentData.appointmentDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Время приема:</span>
                <span class="info-value">${appointmentData.appointmentTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Лечащий врач:</span>
                <span class="info-value">${appointmentData.doctorName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Специальность:</span>
                <span class="info-value">${appointmentData.doctorSpecialty}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Поликлиника:</span>
                <span class="info-value">${appointmentData.clinicName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Адрес:</span>
                <span class="info-value">${appointmentData.clinicAddress}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Талон сгенерирован:</strong> ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}</p>
            <p><strong>Важная информация:</strong> Приходите за 10-15 минут до приема. Имейте при себе паспорт и полис ОМС.</p>
            <p>При отмене записи сообщите заранее по телефону регистратуры.</p>
          </div>
        </div>

        <div class="watermark">FaceDiagnosis</div>
      </body>
      </html>
    `;
  }, []);

  // Функция для создания и отправки PDF талона
  const generateAndSendTicketPDF = useCallback(async (appointmentData: {
    patientName: string;
    patientEmail: string;
    doctorName: string;
    doctorSpecialty: string;
    clinicName: string;
    clinicAddress: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentId: string;
  }) => {
    setIsGeneratingPDF(true);
    
    try {
      // Создаем временный iframe для рендеринга HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '-10000px';
      iframe.style.bottom = '0';
      iframe.style.width = '800px';
      iframe.style.height = '1000px';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Cannot access iframe document');
      }
      
      // Записываем HTML в iframe
      iframeDoc.open();
      iframeDoc.write(generateTicketHTML(appointmentData));
      iframeDoc.close();
      
      // Ждем загрузки контента
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Создаем canvas из iframe
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 800,
        height: iframeDoc.body.scrollHeight,
        windowWidth: 800,
        windowHeight: iframeDoc.body.scrollHeight
      });
      
      // Удаляем iframe
      document.body.removeChild(iframe);
      
      // Создаем PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Рассчитываем размеры для A4
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 20) / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Сохраняем PDF локально (в реальном приложении здесь была бы отправка на email)
      const fileName = `Медицинский_талон_${appointmentData.patientName.replace(/\s+/g, '_')}_${appointmentData.appointmentDate.replace(/\./g, '_')}.pdf`;
      pdf.save(fileName);
      
      // Имитация отправки на email
      console.log(`Талон отправлен на email: ${appointmentData.patientEmail}`);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [generateTicketHTML]);

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
    setCurrentMonthOffset(0);
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

  // Обновленная функция обработки записи
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

      // Генерируем и отправляем PDF талон
      const appointmentData = {
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
        appointmentId: selectedAppointment.appointment.id
      };

      const pdfGenerated = await generateAndSendTicketPDF(appointmentData);

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
  }, [selectedAppointment, bookingForm, getClinicForDoctor, generateAndSendTicketPDF]);

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

  // Рендер списка врачей (остается без изменений)
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

  // Рендер расписания выбранного врача (остается без изменений)
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
                    <label className={styles.formLabel}>Email для получения талона</label>
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
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? 'Генерация талона...' : 'Записаться'}
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
                  Талон отправлен на {bookingForm.email} и загружен на ваше устройство
                </p>
                <p className={styles.successNote}>
                  Пожалуйста, сохраните PDF файл и приходите с ним на прием
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