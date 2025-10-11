import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, MapPin, Clock, User, Mail, CheckCircle, X, ChevronLeft, Stethoscope, Shield, Award, Car } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './DriverCommission.module.scss';
import { mockClinics, mockDoctors, mockAppointments } from '../../data/mockData';
import type { Doctor, Appointment, BookingFormData } from '../../types';

interface SelectedAppointment {
  appointment: Appointment;
  doctor: Doctor;
}

const DriverCommission: React.FC = () => {
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedAppointments, setSelectedAppointments] = useState<SelectedAppointment[]>([]);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({ 
    name: '', 
    email: '', 

  });
  const [isBooked, setIsBooked] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentStep, setCurrentStep] = useState<'clinic' | 'doctors' | 'booking'>('clinic');

  // Пакет водительской комиссии
  const commissionPackage = {
    name: 'Водительская медицинская комиссия',
    description: 'Обязательное медицинское освидетельствование для получения водительских прав',
    requiredDoctors: ['Психиатр', 'Нарколог', 'Офтальмолог', 'Терапевт', 'Невролог'],
    duration: '2-3 часа',
    price: 'от 50 BYN',
    benefits: [
      'Осмотр у всех необходимых специалистов',
      'Заключение психиатра и нарколога',
      'Справка установленного образца',
      'Действительно по всей Беларуси',
      'Подходит для категорий A, A1, B, B1, BE, M'
    ],
    requirements: [
      'Паспорт гражданина РБ',
      'Фотография 3x4 см (матовая)',
      'Военный билет (для военнообязанных)'
    ]
  };

  // Фильтрация врачей для водительской комиссии
  const commissionDoctors = useMemo(() => {
    if (!selectedClinic) return [];
    
    return mockDoctors.filter(doctor => 
      doctor.clinicId === selectedClinic &&
      commissionPackage.requiredDoctors.includes(doctor.specialty)
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
      .slice(0, 5);
    
    return futureAppointments;
  }, []);

  // Получение информации о клинике
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
      const filtered = prev.filter(apt => apt.doctor.id !== doctor.id);
      return [...filtered, { appointment, doctor }];
    });
  }, []);

  // Проверка готовности к бронированию
  const isReadyForBooking = useMemo(() => {
    return selectedAppointments.length === commissionPackage.requiredDoctors.length;
  }, [selectedAppointments]);

  // Переход к бронированию
  const handleProceedToBooking = useCallback(() => {
    if (isReadyForBooking) {
      setCurrentStep('booking');
    }
  }, [isReadyForBooking]);

  // Генерация HTML для PDF справки водительской комиссии
  const generateCommissionCertificateHTML = useCallback((bookingData: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    passport: string;
    licenseNumber: string;
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
        <title>Справка водительской комиссии - ${bookingData.patientName}</title>
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
          .certificate-container {
            max-width: 800px;
            margin: 0 auto;
            border: 3px solid #2c5530;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 { 
            margin: 0 0 10px 0;
            font-size: 28px;
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
            border: 1px solid #ddd;
          }
          .content {
            padding: 30px;
          }
          .info-section { 
            margin-bottom: 25px;
            padding: 20px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            background: #f8fff8;
          }
          .info-section h3 { 
            color: #2c5530; 
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
            border-left: 4px solid #4a7c59;
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
          .price-badge {
            background: #4a7c59;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
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
            color: #2c5530;
            transform: rotate(-15deg);
            pointer-events: none;
          }
          .certificate-number {
            text-align: center;
            font-size: 18px;
            font-weight: 600;
            color: #2c5530;
            margin: 15px 0;
          }
          .validity {
            background: #fff8e1;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ffa000;
            margin: 20px 0;
          }
          @media print {
            body { 
              margin: 0;
              padding: 0;
            }
            .certificate-container {
              box-shadow: none;
              border: 2px solid #2c5530;
            }
            .watermark {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="header">
            <h1>МЕДИЦИНСКАЯ СПРАВКА</h1>
            <p class="clinic-info">для допуска к управлению транспортными средствами</p>
            <p class="clinic-info">${bookingData.clinicName}</p>
          </div>
          
          <div class="certificate-number">
            № ВК-${Date.now().toString().slice(-8)}
          </div>
          
          <div class="barcode">
            ВОДИТЕЛЬСКАЯ КОМИССИЯ ${new Date().getFullYear()}
          </div>
          
          <div class="content">
            <div class="info-section">
              <h3>Информация о водителе</h3>
              <div class="info-row">
                <span class="info-label">Фамилия Имя Отчество:</span>
                <span class="info-value">${bookingData.patientName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Паспорт:</span>
                <span class="info-value">${bookingData.passport}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Водительское удостоверение:</span>
                <span class="info-value">${bookingData.licenseNumber || 'Не указано'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Телефон:</span>
                <span class="info-value">${bookingData.patientPhone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Стоимость:</span>
                <span class="info-value">
                  <span class="price-badge">2 500 ₽</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Статус:</span>
                <span class="info-value">
                  <span class="status-badge">ОЖИДАЕТ ОСМОТРА</span>
                </span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Расписание осмотров</h3>
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

            <div class="validity">
              <strong>Справка действительна:</strong> 12 месяцев с даты выдачи<br>
              <strong>Категории:</strong> A, A1, B, B1, BE, M
            </div>

            <div class="info-section">
              <h3>Требования для получения справки</h3>
              <ul>
                <li>Паспорт гражданина РБ</li>
                <li>Фотография 3x4 см (матовая)</li>
                <li>Военный билет (для военнообязанных)</li>
                <li>Старое водительское удостоверение (при наличии)</li>
              </ul>
              <p><strong>Приходите за 20 минут до первого приема.</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Справка сгенерирована:</strong> ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}</p>
            <p>${bookingData.clinicName} - ${bookingData.clinicAddress}</p>
            <p>Лицензия № ЛО-77-01-019385 от 12.04.2022</p>
          </div>
        </div>

        <div class="watermark">ВОДИТЕЛЬСКАЯ КОМИССИЯ</div>
      </body>
      </html>
    `;
  }, []);

  // Создание и отправка PDF справки
  const generateAndSendCommissionPDF = useCallback(async (bookingData: any) => {
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
      iframeDoc.write(generateCommissionCertificateHTML(bookingData));
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
      
      const fileName = `Водительская_комиссия_${bookingData.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log(`Справка водительской комиссии создана для: ${bookingData.patientEmail}`);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [generateCommissionCertificateHTML]);

  // Оформление записи на комиссию
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

      const pdfGenerated = await generateAndSendCommissionPDF(bookingData);

      if (pdfGenerated) {
        setIsBooked(true);
        
        setTimeout(() => {
          setSelectedClinic('');
          setSelectedAppointments([]);
          setBookingForm({ name: '', email: '' });
          setCurrentStep('clinic');
          setIsBooked(false);
        }, 5000);
      } else {
        alert('Ошибка при создании справки. Пожалуйста, попробуйте еще раз.');
      }
    }
  }, [selectedClinicInfo, selectedAppointments, bookingForm, generateAndSendCommissionPDF]);

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
          <Car size={48} className={styles.packageIcon} />
          <div>
            <h2 className={styles.packageTitle}>{commissionPackage.name}</h2>
            <p className={styles.packageDescription}>{commissionPackage.description}</p>
          </div>
        </div>
        
        <div className={styles.packageDetails}>
          <div className={styles.detailItem}>
            <Clock size={20} />
            <div>
              <strong>Продолжительность:</strong>
              <span>{commissionPackage.duration}</span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <Award size={20} />
            <div>
              <strong>Стоимость:</strong>
              <span className={styles.price}>{commissionPackage.price}</span>
            </div>
          </div>
        </div>

        <div className={styles.benefits}>
          <h3>Что входит в комиссию:</h3>
          <div className={styles.benefitsGrid}>
            {commissionPackage.benefits.map((benefit, index) => (
              <div key={index} className={styles.benefitItem}>
                <CheckCircle size={16} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.requirements}>
          <h3>Необходимые документы:</h3>
          <div className={styles.requirementsList}>
            {commissionPackage.requirements.map((requirement, index) => (
              <div key={index} className={styles.requirementItem}>
                <CheckCircle size={16} />
                <span>{requirement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.clinicsSection}>
        <h3 className={styles.sectionTitle}>Выберите медицинский центр для прохождения комиссии:</h3>
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
              <div className={styles.clinicPrice}>
                Стоимость: <strong> 50 BYN</strong>
              </div>
              <div className={styles.selectClinicButton}>
                Выбрать этот центр
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
            <h2>Выберите время осмотра у специалистов</h2>
            <p>Медицинский центр: <strong>{selectedClinicInfo.name}</strong> • {selectedClinicInfo.address}</p>
          </div>
          <p className={styles.instruction}>Необходимо выбрать время у {commissionPackage.requiredDoctors.length} врачей</p>
        </div>

        <div className={styles.doctorsGrid}>
          {commissionDoctors.map(doctor => {
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
                    {doctor.specialty === 'Психиатр' || doctor.specialty === 'Нарколог' ? (
                      <div className={styles.specialNote}>Обязательный специалист</div>
                    ) : null}
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
              Выбрано: <strong>{selectedAppointments.length}</strong> из <strong>{commissionPackage.requiredDoctors.length}</strong> специалистов
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
        <h2>Оформление водительской комиссии</h2>
        <p>Заполните данные для получения медицинской справки</p>
      </div>

      <div className={styles.bookingSummary}>
        <div className={styles.summaryCard}>
          <h3>Информация о комиссии</h3>
          <div className={styles.summaryItem}>
            <strong>Медицинский центр:</strong> {selectedClinicInfo?.name}
          </div>
          <div className={styles.summaryItem}>
            <strong>Адрес:</strong> {selectedClinicInfo?.address}
          </div>
          <div className={styles.summaryItem}>
            <strong>Стоимость:</strong> <span className={styles.priceBadge}>2 500 ₽</span>
          </div>
          <div className={styles.summaryItem}>
            <strong>Действительна:</strong> 12 месяцев
          </div>
        </div>

        <div className={styles.selectedAppointments}>
          <h3>Выбранные осмотры:</h3>
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
            <label className={styles.formLabel}>Фамилия Имя Отчество *</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Иванов Иван Иванович"
              value={bookingForm.name}
              onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
              required
            />
          </div>
        </div>

         

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email для получения справки *</label>
            <input
              type="email"
              className={styles.formInput}
              placeholder="ivan@example.com"
              value={bookingForm.email}
              onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
              required
            />
          </div>

      

        <div className={styles.formNote}>
          <strong>Важно:</strong> При себе необходимо иметь паспорт, фотографию 3x4 см и военный билет (для военнообязанных). 
          Приходите за 20 минут до первого приема. Оплата производится в медицинском центре перед осмотром.
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
            {isGeneratingPDF ? 'Генерация справки...' : 'Записаться на комиссию'}
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
            <Car size={32} />
            <div>
              <h1 className={styles.title}>Водительская медицинская комиссия</h1>
              <p className={styles.subtitle}>
                {currentStep === 'clinic' && 'Выберите медицинский центр для прохождения комиссии'}
                {currentStep === 'doctors' && 'Выберите время осмотра у специалистов'}
                {currentStep === 'booking' && 'Оформление записи на комиссию'}
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
                Запись на водительскую комиссию оформлена!
              </div>
              <p className={styles.successText}>
                Предварительная справка отправлена на {bookingForm.email} и загружена на ваше устройство
              </p>
              <div className={styles.successDetails}>
                <div className={styles.detailItem}>
                  <strong>Медицинский центр:</strong> {selectedClinicInfo?.name}
                </div>
                <div className={styles.detailItem}>
                  <strong>Водитель:</strong> {bookingForm.name}
                </div>
                <div className={styles.detailItem}>
                  <strong>Стоимость:</strong> 2 500 ₽ (оплата в центре)
                </div>
              </div>
              <div className={styles.appointmentsReminder}>
                <h4>График осмотров:</h4>
                {selectedAppointments.map(({ appointment, doctor }) => (
                  <div key={doctor.id} className={styles.reminderItem}>
                    <strong>{doctor.name}</strong> ({doctor.specialty}) - {new Date(appointment.date).toLocaleDateString('ru-RU')} в {appointment.time}
                  </div>
                ))}
              </div>
              <p className={styles.successNote}>
                <strong>При себе необходимо иметь:</strong> паспорт, фотографию 3x4 см, военный билет (для военнообязанных)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverCommission;