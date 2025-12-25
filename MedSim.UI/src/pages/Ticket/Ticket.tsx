import { useState } from 'react';
import { Calendar, Clock, User, MapPin, Download, Plus, Stethoscope, ArrowLeft, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './Ticket.module.scss';

interface Ticket {
  id: number;
  lastName: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  room: string;
  status: 'active' | 'completed' | 'cancelled';
}

export default function Ticket() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Данные талончиков
  const tickets: Ticket[] = [
    {
      id: 1,
      lastName: 'Иванов',
      date: '15.10.2024',
      time: '10:00',
      doctor: 'Петрова А.С.',
      specialty: 'Терапевт',
      room: '101',
      status: 'active'
    },
    {
      id: 2,
      lastName: 'Иванов',
      date: '20.10.2024',
      time: '14:30',
      doctor: 'Сидоров В.П.',
      specialty: 'Кардиолог',
      room: '215',
      status: 'active'
    },
    {
      id: 3,
      lastName: 'Иванов',
      date: '05.10.2024',
      time: '11:15',
      doctor: 'Козлова М.И.',
      specialty: 'Невролог',
      room: '308',
      status: 'completed'
    }
  ];

  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === 'all') return true;
    return ticket.status === activeFilter;
  });

  // Функция для получения HTML контента для PDF и печати
  const getTicketHTML = (ticket: Ticket) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Медицинский талон - ${ticket.lastName}</title>
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
          }
          .status-active {
            background: #e8f5e8;
            color: #2e7d32;
          }
          .status-completed {
            background: #e3f2fd;
            color: #1565c0;
          }
          .status-cancelled {
            background: #ffebee;
            color: #c62828;
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
            ТАЛОН № ${ticket.id.toString().padStart(6, '0')}
          </div>
          
          <div class="content">
            <div class="info-section">
              <h3>Информация о пациенте</h3>
              <div class="info-row">
                <span class="info-label">Фамилия:</span>
                <span class="info-value">${ticket.lastName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Статус талона:</span>
                <span class="info-value">
                  <span class="status-badge ${getStatusClass(ticket.status)}">${getStatusText(ticket.status)}</span>
                </span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Информация о приеме</h3>
              <div class="info-row">
                <span class="info-label">Дата приема:</span>
                <span class="info-value">${ticket.date}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Время приема:</span>
                <span class="info-value">${ticket.time}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Лечащий врач:</span>
                <span class="info-value">${ticket.doctor}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Специальность:</span>
                <span class="info-value">${ticket.specialty}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Кабинет:</span>
                <span class="info-value">${ticket.room}</span>
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
        
        <script>
          window.onload = function() {
            // Автопечать только для окон печати
            if (window.location.search.includes('print=true')) {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          };
        </script>
      </body>
      </html>
    `;
  };

  // Функция для сохранения в PDF
  const handleSaveAsPDF = async (ticket: Ticket) => {
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
      iframeDoc.write(getTicketHTML(ticket));
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
      pdf.save(`Медицинский_талон_${ticket.lastName}_${ticket.date.replace(/\./g, '_')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Не удалось создать PDF файл. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Функция для печати
  const handlePrintTicket = (ticket: Ticket) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(getTicketHTML(ticket));
      printWindow.document.close();
    }
  };

  const handleNewAppointment = () => {
    // TODO: Реализовать запись к врачу
    console.log('Запись к врачу');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusStyleClass = (status: string) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'completed': return styles.statusCompleted;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      {/* Фон с анимациями */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <div className={styles.content}>
        {/* Заголовок страницы */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <Link to="/profile" className={styles.backButton}>
              <ArrowLeft size={20} />
            </Link>
            <div className={styles.iconWrapper}>
              <Stethoscope size={32} />
            </div>
            <div>
              <h1 className={styles.title}>Мои талоны</h1>
              <p className={styles.subtitle}>
                Управление вашими записями к врачу
              </p>
            </div>
          </div>
          
          <button className={styles.newAppointmentButton} onClick={handleNewAppointment}>
            <Plus size={20} />
            Новая запись
          </button>
        </div>

        {/* Фильтры */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${activeFilter === 'all' ? styles.active : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Все записи
          </button>
          <button
            className={`${styles.filterButton} ${activeFilter === 'active' ? styles.active : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Активные
          </button>
          <button
            className={`${styles.filterButton} ${activeFilter === 'completed' ? styles.active : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Завершенные
          </button>
        </div>

        {/* Список талончиков */}
        <div className={styles.ticketsGrid}>
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className={styles.ticketCard}>
              {/* Основная карточка талончика */}
              <div className={styles.ticketHeader}>
                <div className={styles.patientInfo}>
                  <User size={20} />
                  <span className={styles.lastName}>{ticket.lastName}</span>
                </div>
                <div className={`${styles.status} ${getStatusStyleClass(ticket.status)}`}>
                  {getStatusText(ticket.status)}
                </div>
              </div>

              <div className={styles.ticketBody}>
                <div className={styles.doctorInfo}>
                  <h3 className={styles.doctorName}>{ticket.doctor}</h3>
                  <p className={styles.specialty}>{ticket.specialty}</p>
                </div>

                <div className={styles.details}>
                  <div className={styles.detailItem}>
                    <Calendar size={18} />
                    <span>{ticket.date}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <Clock size={18} />
                    <span>{ticket.time}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <MapPin size={18} />
                    <span>Кабинет {ticket.room}</span>
                  </div>
                </div>
              </div>

              <div className={styles.ticketFooter}>
                <button 
                  className={styles.downloadButton}
                  onClick={() => handleSaveAsPDF(ticket)}
                >
                  <Download size={18} />
                  Скачать PDF
                </button>
                <button 
                  className={styles.printButton}
                  onClick={() => handlePrintTicket(ticket)}
                >
                  <Printer size={18} />
                  Печать
                </button>
              </div>
            </div>
          ))}

          {/* Сообщение если талончиков нет */}
          {filteredTickets.length === 0 && (
            <div className={styles.emptyState}>
              <Calendar size={64} />
              <h3>Записи не найдены</h3>
              <p>У вас пока нет записей к врачу</p>
              <button className={styles.emptyStateButton} onClick={handleNewAppointment}>
                <Plus size={20} />
                Записаться к врачу
              </button>
            </div>
          )}
        </div>

        {/* Информационный блок */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h4>Полезная информация</h4>
            <ul>
              <li>Приходите за 10-15 минут до приема</li>
              <li>Имейте при себе паспорт и полис ОМС</li>
              <li>При отмене записи сообщите заранее</li>
              <li>Сохраните талончик в PDF для предъявления</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}