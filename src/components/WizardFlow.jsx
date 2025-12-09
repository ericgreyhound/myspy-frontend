import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useUserProfile } from '../context/userProfileContext.jsx';
import AddressStep from './AddressStep.jsx';
import CuisineStep from './CuisineStep.jsx';
import MealsOutsideStep from './MealsOutsideStep.jsx';
import FrequencyStep from './FrequencyStep.jsx';
import MealCostStep from './MealCostStep.jsx';
import MotivationStep from './MotivationStep.jsx';
import CompanionshipStep from './CompanionshipStep.jsx';
import KidsAreaStep from './KidsAreaStep.jsx';
import { apiUrl } from '../apiClient';
import PetFriendlyStep from './PetFriendlyStep.jsx';
import PlanSelectionStep from './PlanSelectionStep.jsx';
import SpecialNeedsStep from './SpecialNeedsStep.jsx';
import LanguagesStep from './LanguagesStep.jsx';

export default function WizardFlow({ userId, profileType = 'individual', onDone }) {
  const { state, updatePreferences, setCompleted, setUserId } = useUserProfile();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [current, setCurrent] = useState(0);

  React.useEffect(() => {
    if (userId && state.userId !== userId) setUserId(userId);
  }, [userId, state.userId, setUserId]);

  const theme = {
    background: isDarkMode ? '#1b1715' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#1b1715',
    cardBg: isDarkMode ? '#2a2a2a' : '#f3f3f3',
    cardBorder: isDarkMode ? '#3a3a3a' : '#e0e0e0',
    subtle: isDarkMode ? '#999999' : '#666666',
    inputBg: isDarkMode ? '#1b1715' : '#ffffff',
    inputBorder: isDarkMode ? '#3a3a3a' : '#d6d6d6',
    primaryAccent: '#e10209',
  };

  const personalSteps = [
    { key: 'address', title: 'Endereço', component: AddressStep },
    { key: 'cuisine', title: 'Preferências de Culinária', component: CuisineStep },
    { key: 'meals', title: 'Refeições fora de casa', component: MealsOutsideStep },
    { key: 'frequency', title: 'Frequência', component: FrequencyStep },
    { key: 'cost', title: 'Gasto Médio', component: MealCostStep },
    { key: 'motivation', title: 'Motivações', component: MotivationStep },
    { key: 'companionship', title: 'Come acompanhado?', component: CompanionshipStep },
    { key: 'special_needs', title: 'Necessidades especiais', component: SpecialNeedsStep },
    { key: 'languages', title: 'Idiomas', component: LanguagesStep },
  ];

  const businessSteps = [
    { key: 'address', title: 'Endereço', component: AddressStep },
    { key: 'kids_area', title: 'Área Kids', component: KidsAreaStep },
    { key: 'pet_friendly', title: 'Pet Friendly', component: PetFriendlyStep },
    { key: 'plan', title: 'Planos', component: PlanSelectionStep },
  ];

  const steps = profileType === 'business' ? businessSteps : personalSteps;

  const StepCmp = steps[current].component;
  const currentKey = steps[current].key;
  const stepValue =
    currentKey === 'special_needs'
      ? {
          selected: state.preferences.special_needs,
          detail: state.preferences.special_needs_detail,
        }
      : state.preferences[currentKey];

  async function handleNext(data) {
    let updates;
    if (currentKey === 'special_needs') {
      const answerValue = data?.answer ?? data?.selected ?? data ?? '';
      const detailValue = typeof data?.detail === 'string' ? data.detail.trim() : '';
      updates = {
        special_needs: typeof answerValue === 'string' ? answerValue.trim() : answerValue,
        special_needs_detail: detailValue,
      };
    } else if (currentKey === 'address') {
      const addressValue = typeof data === 'string' ? data.trim() : '';
      updates = { address: addressValue };
    } else {
      updates = { [currentKey]: data };
    }

    // Save into context first
    updatePreferences(updates);

    const mergedPreferences = { ...state.preferences, ...updates };

    // Move to next or finish
    if (current < steps.length - 1) {
      setCurrent((c) => c + 1);
      return;
    }
    // Finish: send to backend
    const payload = {
      userId: state.userId,
      preferences: mergedPreferences,
    };
    try {
      await fetch(apiUrl('/api/profiles'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (_e) {
      // ignore network error for now; UX stays the same
    }
    setCompleted(true);
    if (typeof onDone === 'function') onDone();
  }

  function handleBack() {
    if (current === 0) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    setCurrent((c) => c - 1);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: theme.background,
        fontFamily: 'Montserrat, sans-serif',
        maxWidth: '430px',
        margin: '0 auto',
      }}
    >
      <motion.div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-4"
        style={{ backgroundColor: theme.background }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-opacity-10 transition-all"
          style={{ color: theme.text }}
          aria-label="Voltar"
        >
          <ArrowLeft size={24} />
        </button>
        
        <h1
          className="flex-1 text-center"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: theme.text,
          }}
        >
          Completar Perfil
        </h1>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-opacity-10 transition-all"
          style={{ color: theme.text }}
          aria-label="Alternar tema"
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </motion.div>

      <div className="px-4">
        <StepCmp
          isDarkMode={isDarkMode}
          theme={theme}
          value={stepValue}
          userId={state.userId}
          onBack={handleBack}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}


