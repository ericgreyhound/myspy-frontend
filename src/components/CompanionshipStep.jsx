import React, { useState } from 'react';
import { motion } from 'motion/react';

const OPTIONS = ['Sim', 'Não'];

export default function CompanionshipStep({ theme, value = '', onNext }) {
  const [selected, setSelected] = useState(value || '');

  const canProceed = Boolean(selected);

  return (
    <div className="mt-4 pb-8">
      <h2
        className="mb-2"
        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: theme.text }}
      >
        Costuma comer acompanhado?
      </h2>
      <p className="mb-4" style={{ color: theme.subtle }}>
        Selecione uma opção
      </p>

      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const active = selected === opt;
          return (
            <motion.button
              key={opt}
              onClick={() => setSelected(opt)}
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
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>{opt}</span>
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
          Avançar
        </motion.button>
      </div>
    </div>
  );
}


