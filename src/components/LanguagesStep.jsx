import React, { useState } from 'react';
import { motion } from 'motion/react';

const OPTIONS = ['Português', 'Espanhol', 'Inglês', 'Francês', 'Italiano', 'Outros'];

export default function LanguagesStep({ theme, value = [], onNext }) {
  const [selected, setSelected] = useState(Array.isArray(value) ? value : []);

  const toggle = (opt) => {
    setSelected((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]));
  };

  const canProceed = selected.length >= 1;

  return (
    <div className="mt-4 pb-10">
      <h2
        className="mb-2"
        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: theme.text }}
      >
        Idiomas falados pela equipa
      </h2>
      <p className="mb-4" style={{ color: theme.subtle }}>
        Selecione um ou mais idiomas
      </p>

      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const active = selected.includes(opt);
          return (
            <motion.button
              key={opt}
              onClick={() => toggle(opt)}
              className="rounded-xl px-3 py-3 text-center"
              whileTap={{ scale: 0.98 }}
              animate={{
                backgroundColor: active ? theme.primaryAccent : theme.cardBg,
                color: active ? '#ffffff' : theme.text,
                borderColor: active ? theme.primaryAccent : theme.cardBorder,
              }}
              transition={{ duration: 0.2 }}
              style={{ border: '1px solid' }}
            >
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, display: 'block', textAlign: 'center' }}>{opt}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6">
        <motion.button
          onClick={() => canProceed && onNext(selected)}
          className="w-full rounded-xl px-5 py-3 shadow-md"
          whileTap={{ scale: 0.98 }}
          animate={{ backgroundColor: canProceed ? theme.primaryAccent : theme.cardBg }}
          transition={{ duration: 0.2 }}
          style={{
            color: canProceed ? '#ffffff' : theme.subtle,
            border: `1px solid ${canProceed ? theme.primaryAccent : theme.cardBorder}`,
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
          }}
          disabled={!canProceed}
        >
          Finalizar
        </motion.button>
      </div>
    </div>
  );
}


