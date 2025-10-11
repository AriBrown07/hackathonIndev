// hooks/useMedicalFiles.ts
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

export interface MedicalFile {
  id: string;
  name: string;
  fileName: string;
  uploadDate: string;
  size: number;
  url?: string;
  fileType: string;
}

export const useMedicalFiles = (user: User | null) => {
  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Загрузка медицинских файлов из localStorage при инициализации
  useEffect(() => {
    if (user) {
      const savedFiles = localStorage.getItem(`medicalFiles_${user.id}`);
      if (savedFiles) {
        setMedicalFiles(JSON.parse(savedFiles));
      }
    }
  }, [user]);

  // Сохранение медицинских файлов в localStorage
  const saveMedicalFiles = (newFiles: MedicalFile[]) => {
    if (user) {
      localStorage.setItem(`medicalFiles_${user.id}`, JSON.stringify(newFiles));
      setMedicalFiles(newFiles);
    }
  };

  // Добавление нового медицинского файла
  const addMedicalFile = (fileData: Omit<MedicalFile, 'id'>) => {
    const newFile: MedicalFile = {
      ...fileData,
      id: `medical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedFiles = [...medicalFiles, newFile];
    saveMedicalFiles(updatedFiles);
    return newFile;
  };

  // Удаление медицинского файла
  const removeMedicalFile = (fileId: string) => {
    const updatedFiles = medicalFiles.filter(file => file.id !== fileId);
    saveMedicalFiles(updatedFiles);
  };

  // Загрузка файлов с обработкой
  const uploadFiles = async (files: FileList): Promise<MedicalFile[]> => {
    if (!user) throw new Error('Пользователь не авторизован');

    setIsUploading(true);
    const newFiles: MedicalFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Проверяем, что файл - PDF
        if (file.type !== 'application/pdf') {
          throw new Error('Пожалуйста, загружайте только PDF файлы');
        }

        // Проверяем размер файла (максимум 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`Файл "${file.name}" слишком большой. Максимальный размер: 10MB`);
        }

        // Создаем объект URL для предпросмотра
        const fileUrl = URL.createObjectURL(file);
        
        const medicalFile: MedicalFile = {
          id: `medical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ""), // имя без расширения
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          size: file.size,
          url: fileUrl,
          fileType: file.type
        };

        newFiles.push(medicalFile);
      }

      // Добавляем новые файлы в состояние
      const updatedFiles = [...medicalFiles, ...newFiles];
      saveMedicalFiles(updatedFiles);
      
      // Здесь можно добавить логику для загрузки на сервер
      await uploadFilesToServer(newFiles);

      return newFiles;
    } catch (error) {
      // Откатываем изменения в случае ошибки
      if (newFiles.length > 0) {
        const remainingFiles = medicalFiles.filter(
          file => !newFiles.some(newFile => newFile.id === file.id)
        );
        saveMedicalFiles(remainingFiles);
      }
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Заглушка для загрузки на сервер
  const uploadFilesToServer = async (files: MedicalFile[]) => {
    // В реальном приложении здесь будет API вызов
    console.log('Загрузка файлов на сервер:', files);
    
    // Имитация загрузки на сервер
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // В реальном приложении:
    // const formData = new FormData();
    // files.forEach(file => {
    //   formData.append('medicalFiles', file.file);
    // });
    // await fetch('/api/medical-files/upload', {
    //   method: 'POST',
    //   body: formData,
    //   headers: {
    //     'Authorization': `Bearer ${user?.token}`
    //   }
    // });
  };

  // Скачивание файла
  const downloadFile = (file: MedicalFile) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    medicalFiles,
    isUploading,
    uploadFiles,
    removeMedicalFile,
    downloadFile,
    addMedicalFile,
  };
};