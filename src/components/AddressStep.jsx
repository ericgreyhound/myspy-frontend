import React, { useState } from 'react';
import { motion } from 'motion/react';

export default function AddressStep({ theme, value = '', onNext }) {
  const [address, setAddress] = useState(typeof value === 'string' ? value : '');
  const trimmed = address.trim();
  const canProceed = trimmed.length >= 5;

  function handleSubmit() {
    if (!canProceed) return;
    onNext(trimmed);
  }

  return (
    <div className="mt-4 pb-8">
      <h2
        className="mb-2"
        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: theme.text }}
      >
        Qual é a sua morada?
      </h2>
      <p className="mb-4" style={{ color: theme.subtle }}>
        Indique a morada manualmente. Em breve poderá pesquisar pelo código postal.
      </p>

      <motion.textarea
        rows={3}
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        className="w-full rounded-xl px-4 py-3 text-sm resize-y focus:outline-none"
        whileFocus={{ scale: 1.01 }}
        style={{
          backgroundColor: theme.inputBg,
          color: theme.text,
          border: `1px solid ${theme.inputBorder}`,
          fontFamily: 'Montserrat, sans-serif',
          minHeight: '110px',
        }}
        placeholder="Rua, número, andar, freguesia..."
      />

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


