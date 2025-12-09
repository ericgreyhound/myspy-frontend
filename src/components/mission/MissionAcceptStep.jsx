import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';

export default function MissionAcceptStep({
  mission,
  theme,
  isDarkMode,
  onToggleTheme,
  onBack,
  onAccept,
  onReject,
  loading = false,
  error = '',
}) {
  if (!mission) return null;

  const [phase, setPhase] = useState('decision'); // decision -> checkin

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-10 px-4"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div className="max-w-lg mx-auto pt-8 px-2">
        <div className="flex items-center justify-between mb-6" style={{ minHeight: '64px' }}>
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full border flex items-center justify-center"
            style={{ borderColor: theme.cardBorder, color: theme.text }}
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </button>

          <h1
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
            }}
          >
            Fazer Missão
          </h1>

          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full border flex items-center justify-center"
            style={{ borderColor: theme.cardBorder, color: theme.text }}
            aria-label="Alternar tema"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {phase === 'decision' ? (
          <div className="space-y-6">
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: theme.subtle, fontFamily: 'Montserrat, sans-serif' }}
              >
                Nova missão
              </p>
              <h2
                className="mt-3"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: '18px',
                  lineHeight: 1.3,
                }}
              >
                Você recebeu uma missão em {mission.establishmentName || 'um estabelecimento'}.
              </h2>
              <p style={{ marginTop: '12px', color: theme.subtle, fontFamily: 'Montserrat, sans-serif', fontSize: '14px' }}>
                Deseja aceitar esta missão agora?
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  if (!loading) {
                    setPhase('checkin');
                  }
                }}
                disabled={loading}
                className="w-full rounded-2xl py-4 font-semibold shadow-md transition-opacity"
                style={{
                  backgroundColor: theme.ctaBg,
                  color: theme.ctaText,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Aceitar missão
              </button>
              <button
                onClick={onReject}
                disabled={loading}
                className="w-full rounded-2xl py-4 font-semibold border transition-opacity"
                style={{
                  borderColor: theme.cardBorder,
                  color: theme.text,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Recusar missão
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: theme.subtle, fontFamily: 'Montserrat, sans-serif' }}
              >
                Antes de começares a tua missão…
              </p>
              <h2
                className="mt-3"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: '18px',
                  lineHeight: 1.3,
                }}
              >
                Confirma que estás no local correto e faz o check-in para validares esta avaliação.
              </h2>
            </div>

            <div
              className="px-4 py-4 rounded-2xl space-y-3"
              style={{ border: `1px solid ${theme.cardBorder}` }}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.subtle, fontFamily: 'Montserrat, sans-serif' }}>
                  Nome do restaurante
                </p>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                  {mission.establishmentName || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.subtle, fontFamily: 'Montserrat, sans-serif' }}>
                  Morada
                </p>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                  {mission.establishmentAddress || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.subtle, fontFamily: 'Montserrat, sans-serif' }}>
                  Valor do voucher
                </p>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                  € {Number(mission.ticketValue || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={onAccept}
                disabled={loading}
                className="w-full rounded-2xl py-4 font-semibold shadow-md transition-opacity"
                style={{
                  backgroundColor: theme.ctaBg,
                  color: theme.ctaText,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Confirmar check-in
              </button>
              <button
                onClick={onReject}
                disabled={loading}
                className="w-full rounded-2xl py-4 font-semibold border transition-opacity"
                style={{
                  borderColor: theme.cardBorder,
                  color: theme.text,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Informações incorretas
              </button>
              <p className="text-xs text-center" style={{ color: theme.subtle }}>
                Se os dados não correspondem ao local onde estás, não inicies a avaliação e fala com o suporte.
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm" style={{ color: '#f87171' }}>
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}


