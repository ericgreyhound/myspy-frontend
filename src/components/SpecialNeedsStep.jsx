import React, { useState } from 'react';
import { motion } from 'motion/react';

const OPTIONS = ['Sim', 'Não'];

export default function SpecialNeedsStep({ theme, value = {}, onNext }) {
  const initialSelected = value?.selected || value?.answer || (typeof value === 'string' ? value : '') || '';
  const initialDetail = value?.detail || value?.description || value?.text || '';
  const [selected, setSelected] = useState(initialSelected);
  const [details, setDetails] = useState(initialDetail);

  const needsDetails = selected === 'Sim';
  const canProceed = needsDetails ? Boolean(details.trim()) : Boolean(selected);

  function handleSelect(opt) {
    setSelected(opt);
    if (opt !== 'Sim') setDetails('');
  }

  function handleSubmit() {
    if (!canProceed) return;
    onNext({
      answer: selected,
      detail: needsDetails ? details.trim() : '',
    });
  }

  return (
    <div className="mt-4 pb-8">
      <h2
        className="mb-2"
        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: theme.text }}
      >
        Necessidades especiais
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
              onClick={() => handleSelect(opt)}
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

      {needsDetails && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <label
            htmlFor="special-need-detail"
            className="block mb-2 text-sm"
            style={{ color: theme.subtle, fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            Indique de que necessita
          </label>
          <textarea
            id="special-need-detail"
            rows={3}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm resize-none focus:outline-none"
            style={{
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              fontFamily: 'Montserrat, sans-serif',
            }}
            placeholder="Ex.: intolerância ao glúten, acesso para mobilidade reduzida..."
          />
        </motion.div>
      )}

      <div className="mt-6">
        <motion.button
          onClick={handleSubmit}
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


