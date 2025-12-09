import { motion } from 'motion/react';

export default function MissionTicketStep({ theme, value, onChange, onNext }) {
  const parsed = Number.parseFloat(value);
  const canProceed = Number.isFinite(parsed) && parsed > 0;

  return (
    <div className="mt-4 pb-8 space-y-4">
      <div>
        <h2
          className="mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: theme.text }}
        >
          Qual o valor do ticket?
        </h2>
        <p className="mb-4" style={{ color: theme.subtle, fontFamily: 'Montserrat, sans-serif' }}>
          Informe o valor máximo de consumo que o espião poderá gastar nesta missão.
        </p>
      </div>
      <input
        type="number"
        min="0"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-4 py-3"
        placeholder="Ex.: 45.90"
        style={{ borderColor: theme.cardBorder, backgroundColor: 'transparent', color: theme.text }}
      />
      <p style={{ color: theme.subtle, fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem' }}>
        Este valor será usado como referência para despesas reembolsáveis.
      </p>
      <motion.button
        disabled={!canProceed}
        whileTap={{ scale: 0.98 }}
        onClick={() => canProceed && onNext()}
        className="w-full rounded-xl px-5 py-3 shadow-md"
        style={{
          backgroundColor: canProceed ? theme.ctaBg : theme.cardBg,
          color: canProceed ? theme.ctaText : theme.subtle,
          border: `1px solid ${canProceed ? theme.ctaBg : theme.cardBorder}`,
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          opacity: canProceed ? 1 : 0.6,
        }}
      >
        Avançar
      </motion.button>
    </div>
  );
}

