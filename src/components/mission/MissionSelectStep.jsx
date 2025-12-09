import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';

export default function MissionSelectStep({
  theme,
  title,
  description,
  placeholder,
  searchValue,
  onSearchChange,
  options,
  loading,
  selected,
  onSelect,
  onRemove,
  onNext,
  actionLabel = 'Avançar',
  actionLoading = false,
  idleMessage = 'Digite para pesquisar.',
  children,
}) {
  const canProceed = Boolean(selected);
  const hasSearch = Boolean(searchValue?.trim());

  return (
    <div className="mt-4 pb-8 space-y-4">
      <div>
        <h2
          className="mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: theme.text }}
        >
          {title}
        </h2>
        <p className="mb-4" style={{ color: theme.subtle, fontFamily: 'Montserrat, sans-serif' }}>
          {description}
        </p>
      </div>

      <input
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-3 bg-transparent"
        style={{ borderColor: theme.cardBorder, color: theme.text }}
      />

      <div className="rounded-2xl border max-h-48 overflow-y-auto" style={{ borderColor: theme.cardBorder }}>
        {!hasSearch ? (
          <p className="p-3 text-sm" style={{ color: theme.subtle }}>
            {idleMessage}
          </p>
        ) : loading ? (
          <p className="p-3 text-sm" style={{ color: theme.subtle }}>
            A carregar...
          </p>
        ) : options.length === 0 ? (
          <p className="p-3 text-sm" style={{ color: theme.subtle }}>
            Nenhum registo encontrado.
          </p>
        ) : (
          options.map((option) => {
            const active = selected?._id === option._id;
            return (
              <button
                key={option._id}
                onClick={() => onSelect(option)}
                className="w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors"
                style={{
                  borderColor: theme.cardBorder,
                  color: theme.text,
                  backgroundColor: active ? `${theme.ctaBg}15` : 'transparent',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span style={{ display: 'block', fontWeight: 600 }}>{option.fullName}</span>
                    <span style={{ color: theme.subtle, fontSize: '0.8rem' }}>{option.taxId || option.email || '—'}</span>
                  </div>
                  {active && (
                    <span className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: theme.ctaBg, color: '#fff' }}>
                      <Check size={14} />
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {selected && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        >
          <div>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>{selected.fullName}</p>
            <p style={{ color: theme.subtle, fontSize: '0.85rem' }}>{selected.email || selected.taxId || '—'}</p>
          </div>
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-full border flex items-center justify-center"
            style={{ borderColor: theme.cardBorder, color: theme.text }}
            aria-label="Remover seleção"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <motion.button
        disabled={!canProceed || actionLoading}
        whileTap={{ scale: 0.98 }}
        onClick={() => canProceed && onNext()}
        className="w-full rounded-xl px-5 py-3 shadow-md"
        style={{
          backgroundColor: canProceed && !actionLoading ? theme.ctaBg : theme.cardBg,
          color: canProceed && !actionLoading ? theme.ctaText : theme.subtle,
          border: `1px solid ${canProceed && !actionLoading ? theme.ctaBg : theme.cardBorder}`,
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          opacity: canProceed ? 1 : 0.6,
        }}
      >
        {actionLoading ? 'Aguarde...' : actionLabel}
      </motion.button>

      {children}
    </div>
  );
}

