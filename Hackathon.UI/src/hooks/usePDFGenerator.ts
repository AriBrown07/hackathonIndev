// hooks/usePDFGenerator.ts
import { useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const usePDFGenerator = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = useCallback(async (fileName: string = 'health-report') => {
    const element = contentRef.current;
    if (!element) {
      console.error('No content element found for PDF generation');
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Сохраняем оригинальные стили
      const originalOverflow = element.style.overflow;
      const originalHeight = element.style.height;
      
      // Устанавливаем стили для корректного рендеринга
      element.style.overflow = 'visible';
      element.style.height = 'auto';

      // Скрываем элементы, которые не должны попасть в PDF
      const elementsToHide = element.querySelectorAll('[data-pdf-hide]');
      const originalStyles: { [key: string]: string } = {};
      
      elementsToHide.forEach((el, index) => {
        originalStyles[`element-${index}`] = (el as HTMLElement).style.display;
        (el as HTMLElement).style.display = 'none';
      });

    
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc, clonedElement) => {
          
          const clonedEl = clonedElement as HTMLElement;
          clonedEl.style.padding = '20px';
          clonedEl.style.backgroundColor = '#ffffff';
          clonedEl.style.width = '100%';
          clonedEl.style.height = 'auto';
          
          // Улучшаем контрастность для печати
          const textElements = clonedEl.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li');
          textElements.forEach(el => {
            const textEl = el as HTMLElement;
            textEl.style.color = '#000000';
            textEl.style.backgroundColor = 'transparent';
          });
        }
      });

      // Восстанавливаем оригинальные стили
      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;
      
      elementsToHide.forEach((el, index) => {
        (el as HTMLElement).style.display = originalStyles[`element-${index}`] || '';
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Рассчитываем размеры для PDF
      const ratio = imgHeight / imgWidth;
      const pdfWidth = pageWidth - 20; // Отступы по бокам
      const pdfHeight = pdfWidth * ratio;
      
      // Если контент помещается на одну страницу
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      } else {
        // Для длинного контента разбиваем на страницы
        let heightLeft = pdfHeight;
        let position = 0;
        const pageHeightWithMargin = pageHeight - 20;
        
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
        
        while (heightLeft > pageHeightWithMargin) {
          position += pageHeightWithMargin;
          pdf.addPage();
          pdf.addImage(
            imgData, 
            'PNG', 
            10, 
            -position / pdfWidth * pdfHeight + 10, 
            pdfWidth, 
            pdfHeight
          );
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
    contentRef, 
    generatePDF 
  };
};