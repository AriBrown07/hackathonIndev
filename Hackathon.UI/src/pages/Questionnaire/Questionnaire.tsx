import React, { useState } from 'react';
import type { FormEvent } from 'react';
import {
  User,
  Heart,
  Activity,
  AlertCircle,
  Sun,
  FileText,
  CheckCircle,
  Loader,
  X
} from 'lucide-react';
import styles from './Questionnaire.module.scss';

import type { HealthQuestionnaire } from '../../types';

const commonSymptoms = [
  'Головная боль',
  'Усталость',
  'Тошнота',
  'Головокружение',
  'Боль в суставах',
  'Кашель',
  'Повышенная температура',
  'Бессонница',
  'Потеря аппетита',
  'Боль в груди'
];

const commonSkinConditions = [
  'Акне',
  'Экзема',
  'Псориаз',
  'Розацеа',
  'Дерматит',
  'Витилиго',
  'Меланома'
];

const commonChronicDiseases = [
  'Диабет',
  'Гипертония',
  'Астма',
  'Артрит',
  'Заболевания щитовидной железы',
  'Сердечно-сосудистые заболевания',
  'Хроническая обструктивная болезнь легких'
];

interface QuestionnaireProps {
  onComplete?: (data: HealthQuestionnaire) => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<HealthQuestionnaire>({
    userName: '',
    age: 25,
    gender: '',
    hasChronicDiseases: false,
    chronicDiseases: [],
    currentMedications: [],
    allergies: [],
    hasSkinConditions: false,
    skinConditions: [],
    skinSensitivity: 'medium',
    recentSunExposure: false,
    recentInjuries: false,
    injuryDetails: '',
    alcoholConsumption: 'none',
    smoking: false,
    stressLevel: 5,
    sleepQuality: 'fair',
    symptoms: [],
    symptomDuration: '',
    additionalNotes: ''
  });

  const [tagInputs, setTagInputs] = useState({
    medication: '',
    allergy: '',
    symptom: ''
  });

  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (
    field: keyof HealthQuestionnaire,
    value: string | number | boolean | string[]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (field: 'currentMedications' | 'allergies' | 'symptoms', value: string) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[];
      if (!currentArray.includes(value.trim())) {
        handleInputChange(field, [...currentArray, value.trim()]);
      }
    }
  };

  const removeTag = (field: 'currentMedications' | 'allergies' | 'symptoms', value: string) => {
    const currentArray = formData[field] as string[];
    handleInputChange(
      field,
      currentArray.filter(item => item !== value)
    );
  };

  const handleTagKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: 'currentMedications' | 'allergies' | 'symptoms',
    inputField: 'medication' | 'allergy' | 'symptom'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(field, tagInputs[inputField]);
      setTagInputs(prev => ({ ...prev, [inputField]: '' }));
    }
  };

  const toggleArrayItem = (field: 'chronicDiseases' | 'skinConditions', value: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(value)) {
      handleInputChange(
        field,
        currentArray.filter(item => item !== value)
      );
    } else {
      handleInputChange(field, [...currentArray, value]);
    }
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.userName !== '' && formData.age > 0 && formData.gender !== '';
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return true;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep() && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setError('');
    } else {
      setError('Пожалуйста, заполните все обязательные поля');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {

      await new Promise(resolve => setTimeout(resolve, 1000));


      if (onComplete) {
        onComplete(formData);
      }

    } catch (err) {
      console.error('Error submitting questionnaire:', err);
      setError('Произошла ошибка при отправке анкеты. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionIcon}>
                <User size={20} />
              </div>
              Основная информация
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Имя <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                className={styles.input}
                value={formData.userName}
                onChange={e => handleInputChange('userName', e.target.value)}
                placeholder="Ваше имя"
                required
              />
              <div className={styles.hint}>
                Результаты анализа будут отправлены на этот email
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Возраст <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={styles.input}
                value={formData.age}
                onChange={e => handleInputChange('age', parseInt(e.target.value) || 0)}
                min="1"
                max="120"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Пол <span className={styles.required}>*</span>
              </label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="male"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={e => handleInputChange('gender', e.target.value)}
                  />
                  <label htmlFor="male">Мужской</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="female"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={e => handleInputChange('gender', e.target.value)}
                  />
                  <label htmlFor="female">Женский</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="other"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={e => handleInputChange('gender', e.target.value)}
                  />
                  <label htmlFor="other">Другой</label>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionIcon}>
                <Heart size={20} />
              </div>
              Хронические заболевания
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Есть ли у вас хронические заболевания?
              </label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="chronicYes"
                    name="hasChronic"
                    checked={formData.hasChronicDiseases}
                    onChange={() => handleInputChange('hasChronicDiseases', true)}
                  />
                  <label htmlFor="chronicYes">Да</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="chronicNo"
                    name="hasChronic"
                    checked={!formData.hasChronicDiseases}
                    onChange={() => handleInputChange('hasChronicDiseases', false)}
                  />
                  <label htmlFor="chronicNo">Нет</label>
                </div>
              </div>
            </div>

            {formData.hasChronicDiseases && (
              <div className={styles.conditionalSection}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Выберите заболевания:
                  </label>
                  <div className={styles.checkboxGroup}>
                    {commonChronicDiseases.map(disease => (
                      <div key={disease} className={styles.checkboxOption}>
                        <input
                          type="checkbox"
                          id={`disease-${disease}`}
                          checked={formData.chronicDiseases.includes(disease)}
                          onChange={() => toggleArrayItem('chronicDiseases', disease)}
                        />
                        <label htmlFor={`disease-${disease}`}>{disease}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Текущие лекарства
              </label>
              <div className={styles.tagInput}>
                {formData.currentMedications.map(med => (
                  <div key={med} className={styles.tag}>
                    {med}
                    <button
                      type="button"
                      className={styles.tagRemove}
                      onClick={() => removeTag('currentMedications', med)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  className={styles.tagInputField}
                  placeholder="Введите название и нажмите Enter"
                  value={tagInputs.medication}
                  onChange={e => setTagInputs(prev => ({ ...prev, medication: e.target.value }))}
                  onKeyDown={e => handleTagKeyDown(e, 'currentMedications', 'medication')}
                />
              </div>
              <div className={styles.hint}>
                Нажмите Enter после ввода каждого лекарства
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Аллергии
              </label>
              <div className={styles.tagInput}>
                {formData.allergies.map(allergy => (
                  <div key={allergy} className={styles.tag}>
                    {allergy}
                    <button
                      type="button"
                      className={styles.tagRemove}
                      onClick={() => removeTag('allergies', allergy)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  className={styles.tagInputField}
                  placeholder="Введите аллерген и нажмите Enter"
                  value={tagInputs.allergy}
                  onChange={e => setTagInputs(prev => ({ ...prev, allergy: e.target.value }))}
                  onKeyDown={e => handleTagKeyDown(e, 'allergies', 'allergy')}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionIcon}>
                <Activity size={20} />
              </div>
              Состояние кожи
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Есть ли у вас заболевания кожи?
              </label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="skinYes"
                    name="hasSkin"
                    checked={formData.hasSkinConditions}
                    onChange={() => handleInputChange('hasSkinConditions', true)}
                  />
                  <label htmlFor="skinYes">Да</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="skinNo"
                    name="hasSkin"
                    checked={!formData.hasSkinConditions}
                    onChange={() => handleInputChange('hasSkinConditions', false)}
                  />
                  <label htmlFor="skinNo">Нет</label>
                </div>
              </div>
            </div>

            {formData.hasSkinConditions && (
              <div className={styles.conditionalSection}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Выберите заболевания:
                  </label>
                  <div className={styles.checkboxGroup}>
                    {commonSkinConditions.map(condition => (
                      <div key={condition} className={styles.checkboxOption}>
                        <input
                          type="checkbox"
                          id={`skin-${condition}`}
                          checked={formData.skinConditions.includes(condition)}
                          onChange={() => toggleArrayItem('skinConditions', condition)}
                        />
                        <label htmlFor={`skin-${condition}`}>{condition}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Чувствительность кожи
              </label>
              <select
                className={styles.select}
                value={formData.skinSensitivity}
                onChange={e => handleInputChange('skinSensitivity', e.target.value)}
              >
                <option value="low">Низкая</option>
                <option value="medium">Средняя</option>
                <option value="high">Высокая</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Были ли вы на солнце в последние 48 часов?
              </label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="sunYes"
                    name="sun"
                    checked={formData.recentSunExposure}
                    onChange={() => handleInputChange('recentSunExposure', true)}
                  />
                  <label htmlFor="sunYes">Да</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="sunNo"
                    name="sun"
                    checked={!formData.recentSunExposure}
                    onChange={() => handleInputChange('recentSunExposure', false)}
                  />
                  <label htmlFor="sunNo">Нет</label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionIcon}>
                <AlertCircle size={20} />
              </div>
              Травмы и повреждения
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Были ли недавние травмы или повреждения?
              </label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="injuryYes"
                    name="injury"
                    checked={formData.recentInjuries}
                    onChange={() => handleInputChange('recentInjuries', true)}
                  />
                  <label htmlFor="injuryYes">Да</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="injuryNo"
                    name="injury"
                    checked={!formData.recentInjuries}
                    onChange={() => handleInputChange('recentInjuries', false)}
                  />
                  <label htmlFor="injuryNo">Нет</label>
                </div>
              </div>
            </div>

            {formData.recentInjuries && (
              <div className={styles.conditionalSection}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Опишите травму:
                  </label>
                  <textarea
                    className={styles.textarea}
                    value={formData.injuryDetails}
                    onChange={e => handleInputChange('injuryDetails', e.target.value)}
                    placeholder="Опишите характер и локализацию травмы..."
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionIcon}>
                <Sun size={20} />
              </div>
              Образ жизни
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Употребление алкоголя
              </label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="alcoholNone"
                    name="alcohol"
                    value="none"
                    checked={formData.alcoholConsumption === 'none'}
                    onChange={e => handleInputChange('alcoholConsumption', e.target.value)}
                  />
                  <label htmlFor="alcoholNone">Не употребляю</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="alcoholModerate"
                    name="alcohol"
                    value="moderate"
                    checked={formData.alcoholConsumption === 'moderate'}
                    onChange={e => handleInputChange('alcoholConsumption', e.target.value)}
                  />
                  <label htmlFor="alcoholModerate">Умеренно</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="alcoholHigh"
                    name="alcohol"
                    value="high"
                    checked={formData.alcoholConsumption === 'high'}
                    onChange={e => handleInputChange('alcoholConsumption', e.target.value)}
                  />
                  <label htmlFor="alcoholHigh">Часто</label>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Курение
              </label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="smokingYes"
                    name="smoking"
                    checked={formData.smoking}
                    onChange={() => handleInputChange('smoking', true)}
                  />
                  <label htmlFor="smokingYes">Да</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="smokingNo"
                    name="smoking"
                    checked={!formData.smoking}
                    onChange={() => handleInputChange('smoking', false)}
                  />
                  <label htmlFor="smokingNo">Нет</label>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Уровень стресса (1-10)
              </label>
              <div className={styles.sliderGroup}>
                <input
                  type="range"
                  className={styles.slider}
                  min="1"
                  max="10"
                  value={formData.stressLevel}
                  onChange={e => handleInputChange('stressLevel', parseInt(e.target.value))}
                />
                <div className={styles.sliderValue}>{formData.stressLevel}</div>
                <div className={styles.sliderLabels}>
                  <span>Минимальный</span>
                  <span>Максимальный</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Качество сна
              </label>
              <select
                className={styles.select}
                value={formData.sleepQuality}
                onChange={e => handleInputChange('sleepQuality', e.target.value)}
              >
                <option value="poor">Плохое</option>
                <option value="fair">Удовлетворительное</option>
                <option value="good">Хорошее</option>
                <option value="excellent">Отличное</option>
              </select>
            </div>
          </div>
        );

      case 6:
        return (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionIcon}>
                <Activity size={20} />
              </div>
              Текущие симптомы
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Выберите симптомы из списка:
              </label>
              <div className={styles.checkboxGroup}>
                {commonSymptoms.map(symptom => (
                  <div key={symptom} className={styles.checkboxOption}>
                    <input
                      type="checkbox"
                      id={`symptom-${symptom}`}
                      checked={formData.symptoms.includes(symptom)}
                      onChange={() => {
                        if (formData.symptoms.includes(symptom)) {
                          removeTag('symptoms', symptom);
                        } else {
                          addTag('symptoms', symptom);
                        }
                      }}
                    />
                    <label htmlFor={`symptom-${symptom}`}>{symptom}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Дополнительные симптомы
              </label>
              <div className={styles.tagInput}>
                {formData.symptoms
                  .filter(s => !commonSymptoms.includes(s))
                  .map(symptom => (
                    <div key={symptom} className={styles.tag}>
                      {symptom}
                      <button
                        type="button"
                        className={styles.tagRemove}
                        onClick={() => removeTag('symptoms', symptom)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                <input
                  type="text"
                  className={styles.tagInputField}
                  placeholder="Добавьте симптом и нажмите Enter"
                  value={tagInputs.symptom}
                  onChange={e => setTagInputs(prev => ({ ...prev, symptom: e.target.value }))}
                  onKeyDown={e => handleTagKeyDown(e, 'symptoms', 'symptom')}
                />
              </div>
            </div>

            {formData.symptoms.length > 0 && (
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Длительность симптомов
                </label>
                <select
                  className={styles.select}
                  value={formData.symptomDuration}
                  onChange={e => handleInputChange('symptomDuration', e.target.value)}
                >
                  <option value="">Выберите...</option>
                  <option value="less_than_day">Менее суток</option>
                  <option value="1-3_days">1-3 дня</option>
                  <option value="4-7_days">4-7 дней</option>
                  <option value="1-2_weeks">1-2 недели</option>
                  <option value="more_than_2_weeks">Более 2 недель</option>
                  <option value="chronic">Хронические</option>
                </select>
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionIcon}>
                <FileText size={20} />
              </div>
              Дополнительная информация
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Дополнительные заметки
              </label>
              <textarea
                className={styles.textarea}
                value={formData.additionalNotes}
                onChange={e => handleInputChange('additionalNotes', e.target.value)}
                placeholder="Укажите любую дополнительную информацию, которая может быть полезна для диагностики..."
                rows={5}
              />
              <div className={styles.hint}>
                Это поможет нам предоставить более точный анализ
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Анкета о состоянии здоровья</h1>
          <p className={styles.subtitle}>
            Пожалуйста, ответьте на вопросы о вашем здоровье. Эта информация поможет
            нам провести более точный анализ изображения и предоставить персонализированные рекомендации.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.progressBar}>
            <div className={styles.progressLabel}>
              <span>Шаг {currentStep} из {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <div className={styles.actions}>
              {currentStep > 1 && (
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={prevStep}
                  disabled={isSubmitting}
                >
                  Назад
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  onClick={nextStep}
                  disabled={!validateStep()}
                >
                  Далее
                </button>
              ) : (
                <button
                  type="submit"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className={styles.loading}>
                      <Loader className={styles.spinner} size={20} />
                      Анализируем...
                    </span>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Завершить анкету
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;