import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Sun, Moon, CheckCircle } from 'lucide-react';
import MissionQuestionStep from './MissionQuestionStep.jsx';
import { apiUrl } from '../../apiClient';

export default function MissionQuestionnaire({
  mission,
  questions = [],
  theme,
  isDarkMode,
  onToggleTheme,
  onAbort,
  onFinish,
  onStatusChange,
  userId,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [localMission, setLocalMission] = useState(mission);
  const [answersMap, setAnswersMap] = useState({});
  const initializedRef = useRef(false);

  useEffect(() => {
    setLocalMission(mission);
  }, [mission]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const progress = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round(((currentIndex + 1) / totalQuestions) * 100);
  }, [currentIndex, totalQuestions]);

  useEffect(() => {
    if (!questions.length || initializedRef.current) return;
    const initialAnswers = {};
    questions.forEach((q) => {
      if (q.answer !== undefined && q.answer !== null) {
        initialAnswers[q._id] = q.answer;
      }
    });
    setAnswersMap(initialAnswers);
    const firstPendingIdx = questions.findIndex((q) => initialAnswers[q._id] === undefined);
    setCurrentIndex(firstPendingIdx === -1 ? questions.length - 1 : firstPendingIdx);
    initializedRef.current = true;
  }, [questions]);

  const getNextIndex = () => {
    for (let i = currentIndex + 1; i < totalQuestions; i += 1) {
      if (answersMap[questions[i]._id] === undefined) {
        return i;
      }
    }
    return Math.min(currentIndex + 1, totalQuestions - 1);
  };

  const sendJson = async (path, payload) => {
    const res = await fetch(apiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Não foi possível processar a solicitação.');
    }
    return data;
  };

  const handleAnswerSubmit = async (answerValue) => {
    if (!currentQuestion?._id || !mission?._id || !userId) return;
    try {
      setSubmitting(true);
      setError('');
      await sendJson(`/api/missions/${mission._id}/answer`, {
        userId,
        questionId: currentQuestion._id,
        answer: answerValue,
      });

      setAnswersMap((prev) => ({ ...prev, [currentQuestion._id]: answerValue }));

      if (localMission?.status === 'accepted') {
        setLocalMission((prev) => ({ ...prev, status: 'in_progress' }));
        onStatusChange?.('in_progress');
      }

      if (currentIndex === totalQuestions - 1) {
        await sendJson(`/api/missions/${mission._id}/complete`, { userId });
        setCompleted(true);
        return;
      }

      setCurrentIndex(getNextIndex());
    } catch (err) {
      setError(err.message || 'Falha ao enviar resposta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
      setError('');
      return;
    }
    if (window.confirm('Deseja pausar esta missão agora? Você poderá retomar mais tarde.')) {
      onAbort?.();
    }
  };

  if (!totalQuestions) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: theme.background, color: theme.text }}
      >
        <div className="text-center space-y-3">
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Não há perguntas configuradas para esta missão.
          </p>
          <button
            onClick={onAbort}
            className="px-4 py-2 rounded-xl"
            style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
          >
            Voltar
          </button>
        </div>
      </motion.div>
    );
  }

  if (completed) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: theme.background, color: theme.text }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle size={64} color="#4ade80" />
          </div>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
            Missão concluída!
          </h2>
          <p style={{ color: theme.subtle }}>
            Obrigado por enviar todas as respostas. Em breve o estabelecimento receberá a sua avaliação.
          </p>
          <button
            onClick={onFinish}
            className="w-full rounded-xl py-3 font-semibold"
            style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
          >
            Voltar ao início
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen pb-10 px-4"
      style={{ backgroundColor: theme.background, color: theme.text }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-lg mx-auto pt-8 px-2">
        <div
          className="flex items-center justify-between mb-6"
          style={{ minHeight: '64px' }}
        >
          <button
            onClick={handleBack}
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
              fontSize: '18px',
            }}
          >
            Responder Missão
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

        <div
          className="mb-4 px-4 py-3 rounded-2xl"
          style={{ border: `1px solid ${theme.cardBorder}` }}
        >
          <p className="text-sm" style={{ color: theme.subtle }}>
            Estabelecimento
          </p>
          <p
            className="font-semibold"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {localMission?.establishmentName}
          </p>
          <p className="text-sm mt-2" style={{ color: theme.subtle }}>
            Ticket máximo: € {Number(localMission?.ticketValue || 0).toFixed(2)}
          </p>
          <p className="text-xs mt-1" style={{ color: theme.subtle }}>
            Progresso: {currentIndex + 1} de {totalQuestions}
          </p>
          <div
            className="mt-2 h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: `${theme.cardBorder}` }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: theme.ctaBg,
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion?._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <MissionQuestionStep
              question={currentQuestion}
              theme={theme}
              submitting={submitting}
              onSubmit={handleAnswerSubmit}
              initialAnswer={answersMap[currentQuestion?._id]}
            />
          </motion.div>
        </AnimatePresence>

        {error && (
          <p className="text-sm mt-4" style={{ color: '#f87171' }}>
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}


