import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, MapPin, Clock, User, Mail, CheckCircle, X, ChevronLeft, Stethoscope, Shield, Award } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './MedicalExamination.module.scss';
import { mockClinics, mockDoctors, mockAppointments } from '../../data/mockData';
import type { Doctor, Appointment, BookingFormData } from '../../types';

interface SelectedAppointment {
  appointment: Appointment;
  doctor: Doctor;
}

const MedicalExamination: React.FC = () => {
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedAppointments, setSelectedAppointments] = useState<SelectedAppointment[]>([]);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({ name: '', email: '', });
  const [isBooked, setIsBooked] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentStep, setCurrentStep] = useState<'clinic' | 'doctors' | 'booking'>('clinic');

  // Единый бесплатный профосмотр
  const examinationPackage = {
    name: 'Бесплатный профилактический осмотр',
    description: 'Комплексное медицинское обследование по полису ОМС',
    requiredDoctors: ['Терапевт', 'Офтальмолог', 'Невролог', 'Хирург'],
    duration: '3-4 часа',
    price: 'Бесплатно по полису ОМС',
    benefits: [
      'Полное обследование организма',
      'Консультации специалистов',
      'Лабораторные исследования',
      'Заключение о состоянии здоровья'
    ]
  };

  // Фильтрация врачей для профосмотра
  const examinationDoctors = useMemo(() => {
    if (!selectedClinic) return [];
    
    return mockDoctors.filter(doctor => 
      doctor.clinicId === selectedClinic &&
      examinationPackage.requiredDoctors.includes(doctor.specialty)
    );
  }, [selectedClinic]);

  // Получение ближайших доступных записей для врача
  const getNearestAppointments = useCallback((doctorId: string) => {
    const now = new Date();
    const futureAppointments = mockAppointments
      .filter(apt => 
        apt.doctorId === doctorId && 
        !apt.isBooked &&
        new Date(apt.date) >= now
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Берем 5 ближайших записей
    
    return futureAppointments;
  }, []);

  // Получение информации о клинике
  const getClinicForDoctor = useCallback((doctorId: string) => {
    const doctor = mockDoctors.find(d => d.id === doctorId);
    return doctor ? mockClinics.find(c => c.id === doctor.clinicId) : null;
  }, []);

  // Получение выбранной клиники
  const selectedClinicInfo = useMemo(() => {
    return mockClinics.find(clinic => clinic.id === selectedClinic);
  }, [selectedClinic]);

  // Выбор клиники
  const handleClinicSelect = useCallback((clinicId: string) => {
    setSelectedClinic(clinicId);
    setSelectedAppointments([]);
    setCurrentStep('doctors');
  }, []);

  // Выбор времени приема
  const handleAppointmentSelect = useCallback((appointment: Appointment, doctor: Doctor) => {
    setSelectedAppointments(prev => {
      // Удаляем предыдущую запись к этому врачу, если есть
      const filtered = prev.filter(apt => apt.doctor.id !== doctor.id);
      // Добавляем новую запись
      return [...filtered, { appointment, doctor }];
    });
  }, []);

  // Проверка готовности к бронированию
  const isReadyForBooking = useMemo(() => {
    return selectedAppointments.length === examinationPackage.requiredDoctors.length;
  }, [selectedAppointments]);

  // Переход к бронированию
  const handleProceedToBooking = useCallback(() => {
    if (isReadyForBooking) {
      setCurrentStep('booking');
    }
  }, [isReadyForBooking]);

  // Генерация HTML для PDF талона профосмотра
  const generateExaminationTicketHTML = useCallback((bookingData: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    appointments: SelectedAppointment[];
    clinicName: string;
    clinicAddress: string;
  }) => {
    const formatAppointmentDate = (dateString: string, time: string) => {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('ru-RU')} в ${time}`;
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Талон профосмотра - ${bookingData.patientName}</title>
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
          .appointment-list {
            margin-top: 15px;
          }
          .appointment-item {
            background: white;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .appointment-doctor {
            font-weight: 600;
            margin-bottom: 5px;
          }
          .appointment-details {
            font-size: 14px;
            color: #666;
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
          .free-badge {
            background: #4caf50;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
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
            <h1>ТАЛОН ПРОФОСМОТРА</h1>
            <p class="clinic-info">${bookingData.clinicName} • ${bookingData.clinicAddress}</p>
          </div>
          
          <div class="barcode">
            ПРОФОСМОТР № ${Date.now().toString().slice(-6)}
          </div>
          
          <div class="content">
            <div class="info-section">
              <h3>Информация о пациенте</h3>
              <div class="info-row">
                <span class="info-label">Фамилия Имя:</span>
                <span class="info-value">${bookingData.patientName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Телефон:</span>
                <span class="info-value">${bookingData.patientPhone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${bookingData.patientEmail}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Стоимость:</span>
                <span class="info-value">
                  <span class="free-badge">БЕСПЛАТНО ПО ПОЛИСУ ОМС</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Статус:</span>
                <span class="info-value">
                  <span class="status-badge">ЗАПИСЬ ОФОРМЛЕНА</span>
                </span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Расписание приемов</h3>
              <div class="appointment-list">
                ${bookingData.appointments.map(apt => `
                  <div class="appointment-item">
                    <div class="appointment-doctor">${apt.doctor.name} - ${apt.doctor.specialty}</div>
                    <div class="appointment-details">
                      ${formatAppointmentDate(apt.appointment.date, apt.appointment.time)}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="info-section">
              <h3>Важная информация</h3>
              <p><strong>При себе необходимо иметь:</strong></p>
              <ul>
                <li>Паспорт гражданина РФ</li>
                <li>Полис обязательного медицинского страхования (ОМС)</li>
                <li>СНИЛС (при наличии)</li>
              </ul>
              <p><strong>Приходите за 15 минут до назначенного времени.</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Талон сгенерирован:</strong> ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}</p>
            <p>FaceDiagnosis System - Медицинская диагностика онлайн</p>
          </div>
        </div>

        <div class="watermark">FaceDiagnosis</div>
      </body>
      </html>
    `;
  }, []);

  // Создание и отправка PDF талона
  const generateAndSendExaminationPDF = useCallback(async (bookingData: any) => {
    setIsGeneratingPDF(true);
    
    try {
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
      
      iframeDoc.open();
      iframeDoc.write(generateExaminationTicketHTML(bookingData));
      iframeDoc.close();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      
      document.body.removeChild(iframe);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 20) / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const fileName = `Профосмотр_${bookingData.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log(`Талон профосмотра создан для: ${bookingData.patientEmail}`);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [generateExaminationTicketHTML]);

  // Оформление записи на профосмотр
  const handleBooking = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedClinicInfo && selectedAppointments.length > 0 && bookingForm.name && bookingForm.email) {
      const bookingData = {
        patientName: bookingForm.name,
        patientEmail: bookingForm.email,
        appointments: selectedAppointments,
        clinicName: selectedClinicInfo.name,
        clinicAddress: selectedClinicInfo.address
      };

      const pdfGenerated = await generateAndSendExaminationPDF(bookingData);

      if (pdfGenerated) {
        setIsBooked(true);
        
        setTimeout(() => {
          setSelectedClinic('');
          setSelectedAppointments([]);
          setBookingForm({ name: '', email: ''});
          setCurrentStep('clinic');
          setIsBooked(false);
        }, 5000);
      } else {
        alert('Ошибка при создании талона. Пожалуйста, попробуйте еще раз.');
      }
    }
  }, [selectedClinicInfo, selectedAppointments, bookingForm, generateAndSendExaminationPDF]);

  const handleCloseModal = useCallback(() => {
    setSelectedAppointments([]);
    setIsBooked(false);
    setBookingForm({ name: '', email: '' });
  }, []);

  const handleBack = useCallback(() => {
    if (currentStep === 'doctors') {
      setCurrentStep('clinic');
      setSelectedAppointments([]);
    } else if (currentStep === 'booking') {
      setCurrentStep('doctors');
    }
  }, [currentStep]);

  // Рендер шага выбора клиники
  const renderClinicSelection = () => (
    <div className={styles.clinicSelection}>
      <div className={styles.packageInfo}>
        <div className={styles.packageHeader}>
          <Shield size={48} className={styles.packageIcon} />
          <div>
            <h2 className={styles.packageTitle}>{examinationPackage.name}</h2>
            <p className={styles.packageDescription}>{examinationPackage.description}</p>
          </div>
        </div>
        
        <div className={styles.packageDetails}>
          <div className={styles.detailItem}>
            <Clock size={20} />
            <div>
              <strong>Продолжительность:</strong>
              <span>{examinationPackage.duration}</span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <Award size={20} />
            <div>
              <strong>Стоимость:</strong>
              <span className={styles.freePrice}>{examinationPackage.price}</span>
            </div>
          </div>
        </div>

        <div className={styles.benefits}>
          <h3>Что входит в профосмотр:</h3>
          <div className={styles.benefitsGrid}>
            {examinationPackage.benefits.map((benefit, index) => (
              <div key={index} className={styles.benefitItem}>
                <CheckCircle size={16} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.clinicsSection}>
        <h3 className={styles.sectionTitle}>Выберите поликлинику для прохождения осмотра:</h3>
        <div className={styles.clinicsGrid}>
          {mockClinics.map(clinic => (
            <div 
              key={clinic.id} 
              className={styles.clinicCard}
              onClick={() => handleClinicSelect(clinic.id)}
            >
              <div className={styles.clinicHeader}>
                <h4 className={styles.clinicName}>{clinic.name}</h4>
                <div className={styles.clinicCity}>{clinic.city}</div>
              </div>
              <div className={styles.clinicAddress}>
                <MapPin size={16} />
                <span>{clinic.address}</span>
              </div>
              <div className={styles.selectClinicButton}>
                Выбрать эту поликлинику
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Рендер шага выбора врачей и времени
  const renderDoctorsSelection = () => {
    if (!selectedClinicInfo) return null;

    return (
      <div className={styles.doctorsSelection}>
        <div className={styles.selectionHeader}>
          <div className={styles.clinicInfo}>
            <h2>Выберите время приема у специалистов</h2>
            <p>Поликлиника: <strong>{selectedClinicInfo.name}</strong> • {selectedClinicInfo.address}</p>
          </div>
          <p className={styles.instruction}>Необходимо выбрать время у {examinationPackage.requiredDoctors.length} врачей</p>
        </div>

        <div className={styles.doctorsGrid}>
          {examinationDoctors.map(doctor => {
            const nearestAppointments = getNearestAppointments(doctor.id);
            const selectedAppointment = selectedAppointments.find(apt => apt.doctor.id === doctor.id);

            return (
              <div key={doctor.id} className={styles.doctorCard}>
                <div className={styles.doctorInfo}>
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    className={styles.doctorPhoto}
                  />
                  <div className={styles.doctorDetails}>
                    <h3 className={styles.doctorName}>{doctor.name}</h3>
                    <div className={styles.doctorSpecialty}>{doctor.specialty}</div>
                  
                  </div>
                </div>

                <div className={styles.appointmentsSection}>
                  <h4>Ближайшие доступные записи:</h4>
                  <div className={styles.appointmentsList}>
                    {nearestAppointments.length > 0 ? (
                      nearestAppointments.map(appointment => (
                        <div
                          key={appointment.id}
                          className={`${styles.appointmentSlot} ${
                            selectedAppointment?.appointment.id === appointment.id ? styles.selected : ''
                          }`}
                          onClick={() => handleAppointmentSelect(appointment, doctor)}
                        >
                          <Calendar size={16} />
                          <span>
                            {new Date(appointment.date).toLocaleDateString('ru-RU', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })} в {appointment.time}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noSlots}>Нет доступных записей</div>
                    )}
                  </div>
                </div>

                {selectedAppointment && (
                  <div className={styles.selectedTime}>
                    <CheckCircle size={18} />
                    <span>
                      <strong>Выбрано:</strong> {new Date(selectedAppointment.appointment.date).toLocaleDateString('ru-RU')} в {selectedAppointment.appointment.time}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.selectionFooter}>
          <div className={styles.progress}>
            <div className={styles.progressText}>
              Выбрано: <strong>{selectedAppointments.length}</strong> из <strong>{examinationPackage.requiredDoctors.length}</strong> специалистов
            </div>
            {!isReadyForBooking && (
              <div className={styles.progressWarning}>
                Для продолжения необходимо выбрать время у всех специалистов
              </div>
            )}
          </div>
          <button
            className={styles.continueButton}
            onClick={handleProceedToBooking}
            disabled={!isReadyForBooking}
          >
            Продолжить оформление
          </button>
        </div>
      </div>
    );
  };

  // Рендер шага бронирования
  const renderBooking = () => (
    <div className={styles.bookingForm}>
      <div className={styles.bookingHeader}>
        <h2>Оформление записи на профосмотр</h2>
        <p>Проверьте выбранные приемы и заполните данные</p>
      </div>

      <div className={styles.bookingSummary}>
        <div className={styles.summaryCard}>
          <h3>Информация о профосмотре</h3>
          <div className={styles.summaryItem}>
            <strong>Поликлиника:</strong> {selectedClinicInfo?.name}
          </div>
          <div className={styles.summaryItem}>
            <strong>Адрес:</strong> {selectedClinicInfo?.address}
          </div>
          <div className={styles.summaryItem}>
            <strong>Стоимость:</strong> <span className={styles.freeBadge}>Бесплатно по полису ОМС</span>
          </div>
        </div>

        <div className={styles.selectedAppointments}>
          <h3>Выбранные приемы:</h3>
          {selectedAppointments.map(({ appointment, doctor }) => (
            <div key={doctor.id} className={styles.appointmentSummary}>
              <div className={styles.appointmentDoctor}>
                <strong>{doctor.name}</strong> - {doctor.specialty}
              </div>
              <div className={styles.appointmentTime}>
                {new Date(appointment.date).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })} в {appointment.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleBooking} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Фамилия и Имя *</label>
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
            <label className={styles.formLabel}>Email для получения талона *</label>
            <input
              type="email"
              className={styles.formInput}
              placeholder="ivan@example.com"
              value={bookingForm.email}
              onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className={styles.formNote}>
          <strong>Важно:</strong> При себе необходимо иметь паспорт и полис ОМС. Приходите за 15 минут до назначенного времени.
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleBack}
          >
            Назад к выбору времени
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? 'Генерация талона...' : 'Записаться на профосмотр'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          {currentStep !== 'clinic' && (
            <button className={styles.backButton} onClick={handleBack}>
              <ChevronLeft size={20} />
              Назад
            </button>
          )}
          <div className={styles.titleSection}>
            <Stethoscope size={32} />
            <div>
              <h1 className={styles.title}>Профилактический осмотр</h1>
              <p className={styles.subtitle}>
                {currentStep === 'clinic' && 'Выберите поликлинику для прохождения осмотра'}
                {currentStep === 'doctors' && 'Выберите время приема у специалистов'}
                {currentStep === 'booking' && 'Оформление записи'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {currentStep === 'clinic' && renderClinicSelection()}
        {currentStep === 'doctors' && renderDoctorsSelection()}
        {currentStep === 'booking' && renderBooking()}
      </div>

      {/* Модальное окно успешного бронирования */}
      {isBooked && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.successMessage}>
              <div className={styles.successTitle}>
                <CheckCircle size={48} />
                Запись на профосмотр оформлена!
              </div>
              <p className={styles.successText}>
                Талон отправлен на {bookingForm.email} и загружен на ваше устройство
              </p>
              <div className={styles.successDetails}>
                <div className={styles.detailItem}>
                  <strong>Поликлиника:</strong> {selectedClinicInfo?.name}
                </div>
                <div className={styles.detailItem}>
                  <strong>Пациент:</strong> {bookingForm.name}
                </div>
               
              </div>
              <div className={styles.appointmentsReminder}>
                <h4>Не забудьте посетить:</h4>
                {selectedAppointments.map(({ appointment, doctor }) => (
                  <div key={doctor.id} className={styles.reminderItem}>
                    <strong>{doctor.name}</strong> ({doctor.specialty}) - {new Date(appointment.date).toLocaleDateString('ru-RU')} в {appointment.time}
                  </div>
                ))}
              </div>
              <p className={styles.successNote}>
                При себе необходимо иметь: паспорт, полис ОМС, СНИЛС
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalExamination;