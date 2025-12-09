import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';

export default function MissionQuestionStep({ question, theme, submitting = false, onSubmit, initialAnswer }) {
  const [value, setValue] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (!question) return;
    setFileName('');
    if (initialAnswer !== undefined && initialAnswer !== null) {
      setValue(initialAnswer);
      if (question.type === 'upload') {
        setFileName('Ficheiro enviado');
      }
      return;
    }
    if (question.type === 'rating') {
      setValue(question.minValue ?? 0);
    } else {
      setValue(question.type === 'boolean' ? '' : '');
    }
  }, [question?._id, initialAnswer]);

  const ratingConfig = useMemo(
    () => ({
      min: typeof question?.minValue === 'number' ? question.minValue : 0,
      max: typeof question?.maxValue === 'number' ? question.maxValue : 5,
    }),
    [question?.minValue, question?.maxValue]
  );

  const canProceed = useMemo(() => {
    if (!question) return false;
    switch (question.type) {
      case 'rating':
        return Number.isFinite(Number(value));
      case 'boolean':
        return typeof value === 'boolean';
      case 'text':
        return String(value || '').trim().length > 0;
      case 'upload':
        return Boolean(value);
      case 'numeric':
        return value !== '' && Number.isFinite(Number(value));
      default:
        return false;
    }
  }, [question, value]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setValue(reader.result);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!question || !canProceed || submitting) return;
    if (question.type === 'numeric') {
      onSubmit?.(Number(value));
      return;
    }
    onSubmit?.(value);
  };

  const renderInput = () => {
    if (!question) return null;
    switch (question.type) {
      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm" style={{ color: theme.subtle }}>
              <span>{ratingConfig.min}</span>
              <span>{ratingConfig.max}</span>
            </div>
            <input
              type="range"
              min={ratingConfig.min}
              max={ratingConfig.max}
              step="1"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-lg font-semibold">
              {value}
            </div>
          </div>
        );
      case 'boolean':
        return (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Sim', value: true },
              { label: 'Não', value: false },
            ].map((option) => {
              const active = value === option.value;
              return (
                <motion.button
                  key={option.label}
                  onClick={() => setValue(option.value)}
                  className="rounded-2xl py-3 font-semibold"
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    backgroundColor: active ? theme.ctaBg : 'transparent',
                    color: active ? theme.ctaText : theme.text,
                    borderColor: active ? theme.ctaBg : theme.cardBorder,
                  }}
                  style={{ border: '1px solid' }}
                >
                  {option.label}
                </motion.button>
              );
            })}
          </div>
        );
      case 'text':
        return (
          <textarea
            rows={4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
            style={{
              borderColor: theme.cardBorder,
              backgroundColor: 'transparent',
              color: theme.text,
            }}
            placeholder="Digite a sua resposta"
          />
        );
      case 'numeric':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
            style={{
              borderColor: theme.cardBorder,
              backgroundColor: 'transparent',
              color: theme.text,
            }}
            placeholder="Introduza o valor"
          />
        );
      case 'upload':
        return (
          <div className="space-y-3">
            <label
              className="w-full rounded-xl border px-4 py-3 text-center cursor-pointer block"
              style={{
                borderColor: theme.cardBorder,
                backgroundColor: 'transparent',
                color: theme.text,
              }}
            >
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              Escolher ficheiro
            </label>
            {fileName && (
              <div
                className="text-sm px-4 py-2 rounded-lg flex items-center justify-between"
                style={{
                  border: `1px solid ${theme.cardBorder}`,
                  color: theme.text,
                }}
              >
                <span className="truncate">{fileName}</span>
                <button
                  onClick={() => {
                    setValue('');
                    setFileName('');
                  }}
                  className="ml-3 text-xs underline"
                  style={{ color: theme.subtle }}
                >
                  Remover
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!question) return null;

  return (
    <div className="space-y-6">
      <div>
        <p
          className="text-xs uppercase tracking-[0.3em] mb-2"
          style={{ color: theme.subtle, fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
        >
          {question.category}
        </p>
        <h2
          className="mt-2"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            color: theme.text,
            lineHeight: 1.3,
            fontSize: '18px',
          }}
        >
          {question.text}
        </h2>
      </div>

      <div className="mt-4">{renderInput()}</div>

      <motion.button
        onClick={handleSubmit}
        disabled={!canProceed || submitting}
        className="w-full rounded-2xl py-3 font-semibold shadow-md"
        whileTap={{ scale: 0.98 }}
        style={{
          backgroundColor: canProceed ? theme.ctaBg : theme.cardBg,
          color: canProceed ? theme.ctaText : theme.subtle,
          border: `1px solid ${canProceed ? theme.ctaBg : theme.cardBorder}`,
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting ? 'A enviar...' : 'Continuar'}
      </motion.button>
    </div>
  );
}


