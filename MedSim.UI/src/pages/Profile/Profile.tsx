import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTickets } from '../../hooks/useTickets';
import { useMedicalFiles } from '../../hooks/useMedicalFiles'; // Импортируем новый хук
import { LogOut, User, FileText, Download, Upload, Settings, Printer, Eye, X, Camera } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './Profile.module.scss';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { tickets, removeTicket } = useTickets(user);
  const { 
    medicalFiles, 
    isUploading, 
    uploadFiles, 
    removeMedicalFile, 
    downloadFile 
  } = useMedicalFiles(user); // Используем хук для медицинских файлов
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'medical' | 'tickets'>('medical');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Функция для загрузки файлов
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      await uploadFiles(files);
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error);
      alert(error instanceof Error ? error.message : 'Произошла ошибка при загрузке файлов');
    } finally {
      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Функция для форматирования размера файла
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Функция для генерации HTML контента талона (остается без изменений)
  const generateTicketHTML = (ticket: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Медицинский талон - ${ticket.patientName}</title>
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
          .status-used {
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
            ТАЛОН № ${ticket.appointmentId}
          </div>
          
          <div class="content">
            <div class="info-section">
              <h3>Информация о пациенте</h3>
              <div class="info-row">
                <span class="info-label">Фамилия Имя:</span>
                <span class="info-value">${ticket.patientName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${ticket.patientEmail}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Статус талона:</span>
                <span class="info-value">
                  <span class="status-badge status-${ticket.status}">${ticket.status === 'active' ? 'АКТИВЕН' : ticket.status === 'used' ? 'ИСПОЛЬЗОВАН' : 'ОТМЕНЕН'}</span>
                </span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Информация о приеме</h3>
              <div class="info-row">
                <span class="info-label">Дата приема:</span>
                <span class="info-value">${ticket.appointmentDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Время приема:</span>
                <span class="info-value">${ticket.appointmentTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Лечащий врач:</span>
                <span class="info-value">${ticket.doctorName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Специальность:</span>
                <span class="info-value">${ticket.doctorSpecialty}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Поликлиника:</span>
                <span class="info-value">${ticket.clinicName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Адрес:</span>
                <span class="info-value">${ticket.clinicAddress}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Талон создан:</strong> ${new Date(ticket.createdAt).toLocaleDateString('ru-RU')}</p>
            <p><strong>Важная информация:</strong> Приходите за 10-15 минут до приема. Имейте при себе паспорт и полис ОМС.</p>
            <p>При отмене записи сообщите заранее по телефону регистратуры.</p>
          </div>
        </div>

        <div class="watermark">FaceDiagnosis</div>
      </body>
      </html>
    `;
  };

  // Функция для создания PDF (остается без изменений)
  const handleDownloadPDF = async (ticket: any) => {
    setIsGeneratingPDF(ticket.id);
    
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
      iframeDoc.write(generateTicketHTML(ticket));
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
      
      const fileName = `Медицинский_талон_${ticket.patientName.replace(/\s+/g, '_')}_${ticket.appointmentDate.replace(/\./g, '_')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Ошибка при создании PDF файла');
    } finally {
      setIsGeneratingPDF(null);
    }
  };

  // Функция для печати (остается без изменений)
  const handlePrintTicket = (ticket: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateTicketHTML(ticket));
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'used': return 'Использован';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'used': return styles.statusUsed;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      {/* Боковая панель */}
      <div className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <User size={40} />
          </div>
          <div className={styles.userDetails}>
            <h3 className={styles.userName}>
              {user?.email?.split('@')[0] || 'Пользователь'}
            </h3>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
        </div>

        <nav className={styles.navigation}>
          <button
            className={`${styles.navButton} ${activeTab === 'medical' ? styles.active : ''}`}
            onClick={() => setActiveTab('medical')}
          >
            <FileText size={20} />
            <span>Медицинские заключения</span>
            {medicalFiles.length > 0 && (
              <span className={styles.badge}>{medicalFiles.length}</span>
            )}
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'tickets' ? styles.active : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <FileText size={20} />
            <span>Мои талоны ({tickets.length})</span>
          </button>
          <button 
            className={styles.navButton}
            onClick={() => navigate('/coupons')}
          >
            <FileText size={20} />
            <span>Запись на прием</span>
          </button>
          <button className={styles.navButton} onClick={() => navigate('/main')}>
            <Camera size={20} />
            <span>Пройти фото-обследование</span>
          </button>
        </nav>

        <button className={styles.logoutButton} onClick={signOut}>
          <LogOut size={20} />
          <span>Выйти</span>
        </button>
      </div>

      {/* Основное содержимое */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {activeTab === 'medical' ? 'Медицинские заключения' : 'Мои талоны'}
          </h1>
          {activeTab === 'medical' && (
            <div className={styles.uploadSection}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                multiple
                style={{ display: 'none' }}
              />
              <button
                className={styles.uploadButton}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload size={20} />
                {isUploading ? 'Загрузка...' : 'Загрузить PDF'}
              </button>
            </div>
          )}
        </div>

        <div className={styles.fileSection}>
          {activeTab === 'medical' ? (
            // Медицинские заключения
            <>
              {medicalFiles.map((file) => (
                <div key={file.id} className={styles.fileCard}>
                  <div className={styles.fileIcon}>
                    <FileText size={32} />
                  </div>
                  <div className={styles.fileInfo}>
                    <h4 className={styles.fileName}>{file.name}</h4>
                    <div className={styles.fileMeta}>
                      <span className={styles.fileDate}>
                        Загружено: {formatDate(file.uploadDate)}
                      </span>
                      <span className={styles.fileSize}>
                        Размер: {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.fileActions}>
                    <button
                      className={styles.downloadButton}
                      onClick={() => downloadFile(file)}
                      title="Скачать файл"
                    >
                      <Download size={20} />
                    </button>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeMedicalFile(file.id)}
                      title="Удалить файл"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
              
              {medicalFiles.length === 0 && (
                <div className={styles.emptyState}>
                  <FileText size={48} />
                  <h3>Медицинские заключения не найдены</h3>
                  <p>Загрузите ваш первый PDF-файл с медицинским заключением</p>
                  <button
                    className={styles.primaryButton}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={20} />
                    Загрузить первый файл
                  </button>
                </div>
              )}
            </>
          ) : (
            // Талоны
            <>
              {tickets.map((ticket) => (
                <div key={ticket.id} className={styles.ticketCard}>
                  <div className={styles.ticketHeader}>
                    <div className={styles.ticketInfo}>
                      <h4 className={styles.ticketTitle}>
                        Талон к {ticket.doctorSpecialty}
                      </h4>
                      <p className={styles.ticketDoctor}>{ticket.doctorName}</p>
                      <p className={styles.ticketClinic}>{ticket.clinicName}</p>
                    </div>
                    <div className={`${styles.ticketStatus} ${getStatusClass(ticket.status)}`}>
                      {getStatusText(ticket.status)}
                    </div>
                  </div>
                  
                  <div className={styles.ticketDetails}>
                    <div className={styles.detailItem}>
                      <strong>Дата:</strong> {ticket.appointmentDate}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Время:</strong> {ticket.appointmentTime}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Пациент:</strong> {ticket.patientName}
                    </div>
                  </div>

                  <div className={styles.ticketActions}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleDownloadPDF(ticket)}
                      disabled={isGeneratingPDF === ticket.id}
                    >
                      <Download size={18} />
                      {isGeneratingPDF === ticket.id ? 'Генерация...' : 'PDF'}
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => handlePrintTicket(ticket)}
                    >
                      <Printer size={18} />
                      Печать
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => removeTicket(ticket.id)}
                    >
                      <Eye size={18} />
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
              
              {tickets.length === 0 && (
                <div className={styles.emptyState}>
                  <FileText size={48} />
                  <h3>Талоны не найдены</h3>
                  <p>Запишитесь на прием, чтобы получить талоны</p>
                  <button 
                    className={styles.primaryButton}
                    onClick={() => navigate('/coupons')}
                  >
                    Записаться на прием
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}