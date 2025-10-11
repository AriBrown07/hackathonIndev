// hooks/usePDFGenerator.ts
import { useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const usePDFGenerator = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = useCallback(async (fileName: string = 'health-report') => {
    if (!contentRef.current) {
      console.error('No content element found for PDF generation');
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Скрываем элементы, которые не должны попасть в PDF
      const elementsToHide = contentRef.current.querySelectorAll('[data-pdf-hide]');
      const originalStyles: { [key: string]: string } = {};
      
      elementsToHide.forEach(el => {
        originalStyles[(el as HTMLElement).style.display] = (el as HTMLElement).style.display;
        (el as HTMLElement).style.display = 'none';
      });

      // Создаем canvas из всего контента
      const canvas = await html2canvas(contentRef.current, {
        scale: 1.5, // Уменьшаем scale для лучшей производительности
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
        onclone: (clonedDoc, element) => {
          // Улучшаем стили для печати
          const clonedElement = element as HTMLElement;
          clonedElement.style.padding = '20px';
          clonedElement.style.backgroundColor = '#ffffff';
          
          // Увеличиваем контрастность для печати
          const textElements = clonedElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
          textElements.forEach(el => {
            const element = el as HTMLElement;
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.color.includes('rgb') && !computedStyle.color.includes('0, 0, 0')) {
              element.style.color = '#000000';
            }
            if (computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
              element.style.backgroundColor = 'transparent';
            }
          });
        }
      });

      // Восстанавливаем скрытые элементы
      elementsToHide.forEach(el => {
        (el as HTMLElement).style.display = originalStyles[(el as HTMLElement).style.display] || '';
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Рассчитываем размеры для PDF
      const ratio = imgHeight / imgWidth;
      let pdfWidth = pageWidth - 20; // Отступы по бокам
      let pdfHeight = pdfWidth * ratio;
      
      // Если контент помещается на одну страницу
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      } else {
        // Если контент длинный, разбиваем на страницы
        let heightLeft = pdfHeight;
        let position = 0;
        const pageHeightWithMargin = pageHeight - 20;
        
        while (heightLeft > 0) {
          if (position > 0) {
            pdf.addPage();
          }
          
          // Вычисляем высоту для текущей страницы
          const currentPageHeight = Math.min(pageHeightWithMargin, heightLeft);
          
          
          
          position += currentPageHeight / pdfWidth * imgWidth;
          heightLeft -= pageHeightWithMargin;
        }
      }

      pdf.save(`${fileName}-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Не удалось создать PDF файл');
    }
  }, []);

  return { 
    contentRef: contentRef as React.RefObject<HTMLDivElement | null>, 
    generatePDF 
  };
};