import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import MissionTicketStep from './MissionTicketStep.jsx';
import MissionEstablishmentStep from './MissionEstablishmentStep.jsx';
import MissionSpyStep from './MissionSpyStep.jsx';
import { apiUrl } from '../../apiClient';

const STEPS = [
  {
    title: 'Qual o valor do ticket?',
    description: 'Defina o valor máximo reembolsável para esta missão.',
  },
  {
    title: 'Qual o estabelecimento?',
    description: 'Selecione o estabelecimento a ser avaliado.',
  },
  {
    title: 'Qual o espião?',
    description: 'Escolha quem irá executar a missão.',
  },
];

export default function MissionWizard({ theme, isDarkMode, onToggleTheme = () => {}, onCancel, onCreated }) {
  const [step, setStep] = useState(0);
  const [ticketValue, setTicketValue] = useState('');
  const [estSearch, setEstSearch] = useState('');
  const [spySearch, setSpySearch] = useState('');
  const [estOptions, setEstOptions] = useState([]);
  const [spyOptions, setSpyOptions] = useState([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [selectedSpy, setSelectedSpy] = useState(null);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);
  const [loadingSpies, setLoadingSpies] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step !== 1) return;
    const query = estSearch.trim();
    if (!query) {
      setEstOptions([]);
      setLoadingEstablishments(false);
      return;
    }
    const controller = new AbortController();
    const handler = setTimeout(async () => {
      try {
        setLoadingEstablishments(true);
        const res = await fetch(
          apiUrl(`/api/users?q=${encodeURIComponent(query)}&limit=8&profileType=business`),
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Falha ao carregar estabelecimentos');
        const data = await res.json();
        setEstOptions(data.items || []);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setLoadingEstablishments(false);
      }
    }, 250);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [step, estSearch]);

  useEffect(() => {
    if (step !== 2) return;
    const query = spySearch.trim();
    if (!query) {
      setSpyOptions([]);
      setLoadingSpies(false);
      return;
    }
    const controller = new AbortController();
    const handler = setTimeout(async () => {
      try {
        setLoadingSpies(true);
        const res = await fetch(
          apiUrl(
            `/api/users?q=${encodeURIComponent(
              query
            )}&limit=8&profileType=individual&profileCompleted=true`
          ),
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Falha ao carregar espiões');
        const data = await res.json();
        setSpyOptions(data.items || []);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setLoadingSpies(false);
      }
    }, 250);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [step, spySearch]);

  const goBack = () => {
    setError('');
    if (step === 0) {
      onCancel();
      return;
    }
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setError('');
    setStep((prev) => Math.min(STEPS.length - 1, prev + 1));
  };

  const handleSubmit = async () => {
    try {
      const value = Number.parseFloat(ticketValue);
      if (!Number.isFinite(value) || value <= 0 || !selectedEstablishment || !selectedSpy) {
        setError('Complete todos os campos para criar a missão.');
        return;
      }
      setSubmitting(true);
      const res = await fetch(apiUrl('/api/missions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketValue: value,
          establishmentId: selectedEstablishment._id,
          spyId: selectedSpy._id,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || 'Não foi possível criar a missão.');
      }
      onCreated();
    } catch (err) {
      setError(err.message || 'Não foi possível criar a missão.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <MissionTicketStep
          theme={theme}
          value={ticketValue}
          onChange={setTicketValue}
          onNext={handleNext}
        />
      );
    }

    if (step === 1) {
      return (
        <MissionEstablishmentStep
          theme={theme}
          searchValue={estSearch}
          onSearchChange={setEstSearch}
          options={estOptions}
          loading={loadingEstablishments}
          selected={selectedEstablishment}
          onSelect={(opt) => setSelectedEstablishment(opt)}
          onRemove={() => setSelectedEstablishment(null)}
          onNext={handleNext}
        />
      );
    }

    return (
      <MissionSpyStep
        theme={theme}
        ticketValue={ticketValue}
        establishment={selectedEstablishment}
        searchValue={spySearch}
        onSearchChange={setSpySearch}
        options={spyOptions}
        loading={loadingSpies}
        selected={selectedSpy}
        onSelect={(opt) => setSelectedSpy(opt)}
        onRemove={() => setSelectedSpy(null)}
        onNext={handleSubmit}
        actionLoading={submitting}
      />
    );
  };

  return (
    <motion.div
      key="mission-wizard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-10 px-4"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div className="max-w-lg mx-auto pt-8 px-4">
        <div
          className="flex items-center justify-between mb-6"
          style={{ minHeight: '64px' }}
        >
          <button
            onClick={goBack}
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
              color: theme.text,
            }}
          >
            Criar Missão
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

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p className="text-sm mt-4" style={{ color: '#f87171', fontFamily: 'Montserrat, sans-serif' }}>
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}

