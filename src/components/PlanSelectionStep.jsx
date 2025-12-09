import React, { useState } from 'react';
import { motion } from 'motion/react';
import { apiUrl } from '../apiClient';

const PLAN_OPTIONS = [
  {
    id: 'free',
    label: 'Mensal',
    namePriceLabel: 'FREE · €0 / mês por unidade de estabelecimento',
    highlight: '2 meses de cortesia',
    features: ['2 spies/mês', 'Relatório parcial com dados gerais'],
  },
  {
    id: 'royale',
    label: 'ROYALE',
    namePriceLabel: 'ROYALE · €50,00 / mês por unidade de estabelecimento',
    highlight: '4 spies/mês por unidade',
    features: [
      'Relatórios e dashboards detalhados com informação precisa dos respondentes',
      'Acesso a fotos e comentários dos spies',
      'Comparação entre restaurantes do bairro e da cidade',
    ],
  },
  {
    id: 'diamond',
    label: 'DIAMOND',
    namePriceLabel: 'DIAMOND · €100,00 / mês por unidade de estabelecimento',
    highlight: '6 spies/mês por unidade',
    features: [
      'Relatórios e dashboards detalhados com informação precisa dos respondentes',
      'Acesso a fotos e comentários dos spies',
      'Comparação entre restaurantes do bairro e da cidade',
      'Avaliações comparativas com Google, The Fork e Facebook',
      'Selecção de perguntas personalizadas',
      'Análises e relatórios personalizados preparados por um consultor especializado',
    ],
  },
];

export default function PlanSelectionStep({ theme, value = '', userId, onNext }) {
  const [selected, setSelected] = useState(value || '');
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleSubscribe(plan) {
    setError('');
    setInfo('');
    if (!userId) {
      setError('Não conseguimos identificar o estabelecimento. Entre novamente e tente de novo.');
      return;
    }

    try {
      setLoadingPlan(plan.id);
      setSelected(plan.id);

      const payload = {
        planId: plan.id,
        userId,
        successUrl: `${window.location.origin}?checkout=success`,
        cancelUrl: `${window.location.origin}?checkout=cancel`,
      };

      const response = await fetch(apiUrl('/api/payments/checkout-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Não foi possível iniciar o checkout.');
      }

      const data = await response.json();

      if (data?.url) {
        setInfo('Redirecionando para Stripe…');
        await onNext(plan.id);
        window.location.href = data.url;
        return;
      }

      throw new Error('Resposta inesperada do Stripe.');
    } catch (err) {
      setError(err.message || 'Erro ao subscrever o plano.');
    } finally {
      setLoadingPlan('');
    }
  }

  return (
    <div className="mt-4 pb-8">
      <h2
        className="mb-2"
        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: theme.text }}
      >
        Escolha o plano do estabelecimento
      </h2>
      <div className="space-y-4">
        {PLAN_OPTIONS.map((plan) => {
          const active = selected === plan.id;
          return (
            <motion.div
              key={plan.id}
              className="rounded-2xl p-4 border shadow-sm"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                borderColor: active ? theme.primaryAccent : theme.cardBorder,
                backgroundColor: active ? theme.cardBg : 'transparent',
              }}
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="w-full text-center">
                    <p
                      className="text-sm uppercase tracking-widest"
                      style={{
                        color: theme.subtle,
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 600,
                      }}
                    >
                      {plan.label}
                    </p>
                    <div
                      className="mt-1"
                      style={{
                        width: '100%',
                        height: '1px',
                        backgroundColor: theme.cardBorder,
                      }}
                    />
                  </div>
                  <p
                    className="text-xl mt-4"
                    style={{ color: theme.text, fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
                  >
                    {plan.namePriceLabel}
                  </p>
                </div>
                {active && (
                  <span
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: theme.primaryAccent, color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    Selecionado
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm" style={{ color: theme.primaryAccent, fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                {plan.highlight}
              </p>

              <ul className="mt-4 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} style={{ color: theme.text, fontFamily: 'Montserrat, sans-serif' }}>
                    • {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={() => handleSubscribe(plan)}
                className="w-full mt-6 rounded-xl px-4 py-3 font-semibold"
                whileTap={{ scale: 0.98 }}
                style={{
                  border: `1px solid ${theme.primaryAccent}`,
                  backgroundColor: active ? theme.primaryAccent : 'transparent',
                  color: active ? '#ffffff' : theme.primaryAccent,
                  fontFamily: 'Montserrat, sans-serif',
                }}
                disabled={Boolean(loadingPlan)}
              >
                {loadingPlan === plan.id ? 'Processando...' : 'Subscrever'}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {info && (
        <p className="mt-4 text-sm" style={{ color: theme.text, fontFamily: 'Montserrat, sans-serif' }}>
          {info}
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm" style={{ color: '#ff6b6b', fontFamily: 'Montserrat, sans-serif' }}>
          {error}
        </p>
      )}

      <p className="mt-6 text-xs leading-relaxed" style={{ color: theme.subtle, fontFamily: 'Montserrat, sans-serif' }}>
        Você será redirecionado para o checkout seguro da Stripe para finalizar o pagamento. Após a
        confirmação, retornaremos ao My Spy automaticamente.
      </p>
    </div>
  );
}


