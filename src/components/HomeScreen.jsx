import { useState, useRef, useEffect, useMemo } from 'react';
import { Moon, Sun, Settings, Lock, Mail, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoImage from 'figma:asset/e5b6946d364d3f97bc93d1ee8c185d77858727d0.png';
import taoSushiImage from 'figma:asset/2c25c884e5f3a022a65e00fc287f189718ddc9f9.png';
import stoImage from 'figma:asset/3284f22689a863d918f344a5db349923b1f414dd.png';
import luzzoImage from 'figma:asset/2894bc9553ee663e6443ea5891d3cdd8785cb3c0.png';
import { ImageWithFallback } from './figma/ImageWithFallback.jsx';
import { useUserProfile } from '../context/userProfileContext.jsx';
import MissionQuestionnaire from './mission/MissionQuestionnaire.jsx';
import MissionAcceptStep from './mission/MissionAcceptStep.jsx';
import BottomTabBar from './BottomTabBar.jsx';
import { apiUrl } from '../apiClient';

export function HomeScreen({
  onNavigateToSettings,
  onNavigateToProfile,
  onNavigateToWizard,
  userFullName,
  userId,
  onNavigateToMissionsOverview,
  onNavigateToEvaluationsList,
}) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [scrollProgress, setScrollProgress] = useState({
    missions: 0,
    restaurants: 0,
    rankings: 0,
    profile: 0,
    settings: 0,
    support: 0,
  });
  const [hasOverflow, setHasOverflow] = useState({
    missions: false,
    restaurants: false,
    rankings: false,
    profile: false,
    settings: false,
    support: false,
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [showHeroArrows, setShowHeroArrows] = useState(false);
  const heroTimerRef = useRef(null);
  const [pendingMission, setPendingMission] = useState(null);
  const [missionActionLoading, setMissionActionLoading] = useState(false);
  const [missionError, setMissionError] = useState('');
  const [missionRefreshKey, setMissionRefreshKey] = useState(0);
  const [missionFlowStage, setMissionFlowStage] = useState(null);
  const [missionQuestions, setMissionQuestions] = useState([]);
  const [activeMission, setActiveMission] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const missionsRef = useRef(null);
  const restaurantsRef = useRef(null);
  const rankingsRef = useRef(null);
  const profileRef = useRef(null);
  const settingsRef = useRef(null);
  const supportRef = useRef(null);
  const missionsSectionRef = useRef(null);
  const evaluationsSectionRef = useRef(null);
  const profileSectionRef = useRef(null);
  const settingsSectionRef = useRef(null);

  const previousUserIdRef = useRef(null);
  const { state: profileState, setUserId, setCompleted } = useUserProfile();
  useEffect(() => {
    if (userId && setUserId) setUserId(userId);
  }, [userId]);
  useEffect(() => {
    if (!setCompleted) return;
    if (previousUserIdRef.current !== userId) {
      setCompleted(false);
      previousUserIdRef.current = userId;
    }
  }, [userId]);
  useEffect(() => {
    let ignore = false;
    async function checkProfile() {
      if (!userId) return;
      try {
        const res = await fetch(apiUrl(`/api/profiles/${userId}`));
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore && data && data.completed) setCompleted(true);
      } catch (_e) {
        // ignore
      }
    }
    checkProfile();
    return () => { ignore = true; };
  }, [userId]);

  const theme = useMemo(() => ({
    background: isDarkMode ? '#0d0d0d' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#1b1715',
    cardBg: isDarkMode ? '#141414' : '#f3f3f3',
    cardBorder: isDarkMode ? '#2a2a2a' : '#e0e0e0',
    sectionTitle: isDarkMode ? '#ffffff' : '#1b1715',
    toggleBg: isDarkMode ? '#1b1715' : '#f5f5f5',
    toggleBorder: isDarkMode ? '#2a2a2a' : '#e0e0e0',
    toggleIcon: isDarkMode ? '#ffffff' : '#1b1715',
    iconOpacity: isDarkMode ? 1 : 0.8,
    labelText: isDarkMode ? '#ffffff' : '#1b1715',
    widgetBg: isDarkMode ? '#111111' : '#ffffff',
    widgetBorder: isDarkMode ? '#1f1f1f' : '#e0e0e0',
    widgetText: isDarkMode ? '#ffffff' : '#1b1715',
    widgetHover: isDarkMode ? '#1b1b1b' : '#f5f5f5',
    widgetActive: isDarkMode ? '#e10209' : '#e8e8e8',
    widgetShadow: 'rgba(0, 0, 0, 0.35)',
    ctaBg: '#e10209',
    ctaText: '#ffffff',
  }), [isDarkMode]);


  const requestJson = async (path, options = {}) => {
    const res = await fetch(apiUrl(path), options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Ocorreu um erro inesperado.');
    }
    return data;
  };

  const fetchMissionQuestions = async (missionId) => {
    if (!missionId || !userId) return [];
    const data = await requestJson(
      `/api/missions/${missionId}/questionnaire?userId=${userId}`
    );
    return data?.questions || [];
  };

  const startQuestionnaire = async (mission, { withLoader = true } = {}) => {
    if (!mission?._id) return;
    try {
      if (withLoader) setMissionActionLoading(true);
      const questions = await fetchMissionQuestions(mission._id);
      setMissionQuestions(questions);
      setActiveMission(mission);
      setMissionFlowStage('questionnaire');
      setMissionError('');
    } catch (err) {
      setMissionError(err.message || 'Não foi possível abrir o questionário.');
    } finally {
      if (withLoader) setMissionActionLoading(false);
    }
  };

  const refreshMissionList = () => setMissionRefreshKey((prev) => prev + 1);

  useEffect(() => {
    if (!userId || !profileState?.completed) {
      setPendingMission(null);
      return;
    }
    const controller = new AbortController();
    let ignore = false;
    async function loadMission() {
      try {
        const data = await requestJson(
          `/api/missions/my?userId=${userId}`,
          { signal: controller.signal }
        );
        if (!ignore) {
          setPendingMission(data?.mission || null);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
        if (!ignore) setPendingMission(null);
      }
    }
    loadMission();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [userId, profileState?.completed, missionRefreshKey]);

  const closeMissionFlow = () => {
    setMissionFlowStage(null);
    setActiveMission(null);
    setMissionQuestions([]);
    setMissionError('');
  };

  useEffect(() => {
    if (!pendingMission) {
      closeMissionFlow();
    }
  }, [pendingMission]);

  const handleMissionButtonClick = () => {
    if (!pendingMission) return;
    setActiveMission(pendingMission);
    setMissionError('');
    if (pendingMission.status === 'waiting') {
      setMissionFlowStage('accept');
    } else {
      startQuestionnaire(pendingMission);
    }
  };

  const handleMissionAccept = async () => {
    const mission = activeMission || pendingMission;
    if (!mission?._id) return;
    try {
      setMissionActionLoading(true);
      setMissionError('');
      const { mission: updated } = await requestJson(
        `/api/missions/${mission._id}/accept`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );
      setPendingMission(updated);
      setActiveMission(updated);
      await startQuestionnaire(updated, { withLoader: false });
    } catch (err) {
      setMissionError(err.message || 'Não foi possível aceitar a missão.');
    } finally {
      setMissionActionLoading(false);
    }
  };

  const handleMissionReject = async () => {
    const mission = activeMission || pendingMission;
    if (!mission?._id) return;
    try {
      setMissionActionLoading(true);
      setMissionError('');
      await requestJson(`/api/missions/${mission._id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setPendingMission(null);
      closeMissionFlow();
      refreshMissionList();
    } catch (err) {
      setMissionError(err.message || 'Não foi possível rejeitar a missão.');
    } finally {
      setMissionActionLoading(false);
    }
  };

  const handleQuestionnaireFinish = () => {
    closeMissionFlow();
    setPendingMission(null);
    refreshMissionList();
  };

  const handleQuestionnaireAbort = () => {
    closeMissionFlow();
  };

  const handleMissionStatusChange = (nextStatus) => {
    setPendingMission((prev) => (prev ? { ...prev, status: nextStatus } : prev));
    setActiveMission((prev) => (prev ? { ...prev, status: nextStatus } : prev));
  };

  const scrollToRef = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'missions':
        if (onNavigateToMissionsOverview) {
          onNavigateToMissionsOverview();
        } else {
          scrollToRef(missionsSectionRef);
        }
        break;
      case 'evaluations':
        if (onNavigateToEvaluationsList) {
          onNavigateToEvaluationsList();
        } else {
          scrollToRef(evaluationsSectionRef);
        }
        break;
      case 'profile':
        if (onNavigateToProfile) onNavigateToProfile();
        else scrollToRef(profileSectionRef);
        break;
      case 'settings':
        if (onNavigateToSettings) onNavigateToSettings();
        else scrollToRef(settingsSectionRef);
        break;
      default:
        break;
    }
  };

  const missions = [
    { id: 1, title: 'Tao Sushi', image: taoSushiImage },
    { id: 2, title: 'STŌ Restaurante', image: stoImage },
    { id: 3, title: 'Luzzo', image: luzzoImage },
  ];

  const restaurants = [
    { id: 1, name: 'Avaliação #1', image: 'https://images.unsplash.com/photo-1759419038843-29749ac4cd2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBlbGVnYW50fGVufDF8fHx8MTc2MjQ3OTM5OHww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 2, name: 'Avaliação #2', image: 'https://images.unsplash.com/photo-1604552914267-90a8d81a4254?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwY2FmZXxlbnwxfHx8fDE3NjI1MDgzNzh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 3, name: 'Avaliação #3', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NjI1MTcyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  ];

  const heroSlides = [
    { id: 1, title: 'Competição Semanal', subtitle: 'Conquiste o topo do ranking', cta: 'Jogar Agora', image: 'https://images.unsplash.com/photo-1759701546980-1211be084c70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wZXRpdGlvbiUyMHdpbm5lciUyMHRyb3BoeXxlbnwxfHx8fDE3NjI1MjQ5MTl8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Competição Semanal - Troféu de campeão' },
    { id: 3, title: 'Ranking Global', subtitle: 'Veja sua posição mundial', cta: 'Ver ranking', image: 'https://images.unsplash.com/photo-1587401048047-6014f28435f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG9iYWwlMjByYW5raW5nJTIwY29tcGV0aXRpb258ZW58MXx8fHwxNzYyNjEyODE0fDA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Ranking Global - Competição mundial' },
    { id: 4, title: 'Conquistas & Medalhas', subtitle: 'Desbloqueie todas as conquistas', cta: 'Ver conquistas', image: 'https://images.unsplash.com/photo-1613825787641-2dbbd4f96a1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2hpZXZlbWVudHMlMjBtZWRhbHMlMjB0cm9waGllc3xlbnwxfHx8fDE3NjI2MTI4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Conquistas e Medalhas - Desbloqueie troféus' },
    { id: 5, title: 'Promoção de Parceiro', subtitle: 'Ofertas exclusivas para você', cta: 'Ver oferta', image: 'https://images.unsplash.com/photo-1583147986942-2249ecc53aa8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJ0bmVyJTIwcHJvbW90aW9uJTIwZGVhbHxlbnwxfHx8fDE3NjI2MTI4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Promoção de Parceiro - Ofertas especiais' },
    { id: 6, title: 'Campanha Especial', subtitle: 'Participe do evento limitado', cta: 'Participar', image: 'https://images.unsplash.com/photo-1761300725208-e8f92da35f5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZWxlYnJhdGlvbiUyMHBhcnR5JTIwZXZlbnR8ZW58MXx8fHwxNzYyNjEyODE4fDA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Campanha Especial - Evento limitado' },
  ];

  useEffect(() => {
    if (!isHeroHovered) {
      heroTimerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 4700);
    }
    return () => {
      if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    };
  }, [isHeroHovered, heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  useEffect(() => {
    const checkOverflow = () => {
      const refs = {
        missions: missionsRef,
        restaurants: restaurantsRef,
        rankings: rankingsRef,
        profile: profileRef,
        settings: settingsRef,
        support: supportRef,
      };
      const newOverflowState = {};
      Object.entries(refs).forEach(([key, ref]) => {
        if (ref.current) {
          newOverflowState[key] = ref.current.scrollWidth > ref.current.clientWidth;
        }
      });
      setHasOverflow(newOverflowState);
    };

    checkOverflow();
    const resizeObserver = new ResizeObserver(checkOverflow);
    const refs = [missionsRef, restaurantsRef, rankingsRef, profileRef, settingsRef, supportRef];
    refs.forEach(ref => { if (ref.current) resizeObserver.observe(ref.current); });
    return () => resizeObserver.disconnect();
  }, []);

  if (missionFlowStage === 'accept' && activeMission) {
    return (
      <MissionAcceptStep
        mission={activeMission}
        theme={theme}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onBack={closeMissionFlow}
        onAccept={handleMissionAccept}
        onReject={handleMissionReject}
        loading={missionActionLoading}
        error={missionError}
      />
    );
  }

  if (missionFlowStage === 'questionnaire' && activeMission) {
    return (
      <MissionQuestionnaire
        mission={activeMission}
        questions={missionQuestions}
        theme={theme}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onAbort={handleQuestionnaireAbort}
        onFinish={handleQuestionnaireFinish}
        onStatusChange={handleMissionStatusChange}
        userId={userId}
      />
    );
  }

  const handleScroll = (e, key) => {
    const target = e.currentTarget;
    const scrollLeft = target.scrollLeft;
    const scrollWidth = target.scrollWidth - target.clientWidth;
    const progress = scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;
    setScrollProgress(prev => ({ ...prev, [key]: progress }));
  };

  const SectionHeader = ({ title, progress, showSlider }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3
          className="uppercase"
          style={{ 
            fontFamily: 'Montserrat, sans-serif', 
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '0.5px',
            opacity: 1,
            color: theme.sectionTitle,
            transition: 'color 0.4s ease'
          }}
        >
          {title}
        </h3>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: showSlider ? 1 : 0,
            scale: showSlider ? 1 : 0.8,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ 
            width: '40px',
            height: '2px',
            borderRadius: '2px',
            backgroundColor: isDarkMode ? '#3a3a3a' : '#dcdcdc',
            overflow: 'hidden',
            pointerEvents: showSlider ? 'auto' : 'none',
          }}
        >
          <motion.div
            className="h-full"
            style={{ 
              backgroundColor: '#e10209',
              borderRadius: '2px'
            }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
      </div>
      <div 
        className="h-0.5"
        style={{ 
          width: '50px',
          backgroundColor: '#e10209'
        }}
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backgroundColor: theme.background }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="min-h-screen pb-24"
    >
      <motion.nav
        className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between backdrop-blur-md"
        animate={{ backgroundColor: isDarkMode ? 'rgba(27, 23, 21, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="My Spy Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1
            className="tracking-tight"
            style={{ 
              fontFamily: 'Montserrat, sans-serif', 
              fontWeight: 700,
              opacity: 1,
              color: theme.text,
              transition: 'color 0.4s ease'
            }}
          >
            {userFullName ? `Olá, ${userFullName}` : 'My Spy'}
          </h1>
        </div>

        <motion.button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
          animate={{ 
            backgroundColor: theme.toggleBg,
            borderColor: theme.toggleBorder
          }}
          transition={{ duration: 0.4 }}
          style={{ border: '1px solid' }}
        >
          <motion.div
            initial={false}
            animate={{ 
              rotate: isDarkMode ? 0 : 180,
              color: theme.toggleIcon,
              opacity: theme.iconOpacity
            }}
            transition={{ duration: 0.4 }}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </motion.div>
        </motion.button>
      </motion.nav>

      <div className="px-4 mt-4">
        {!profileState?.completed && (
          <motion.button
            className="w-full rounded-xl px-5 py-4 relative flex items-center justify-center shadow-lg hover:opacity-95 active:opacity-90 transition-opacity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              backgroundColor: theme.ctaBg,
              color: theme.ctaText,
            }}
            aria-label="Completar Perfil"
            onClick={onNavigateToWizard}
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              Completar Perfil
            </span>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <ChevronRight size={18} />
            </div>
          </motion.button>
        )}

        {profileState?.completed && pendingMission && (
          <motion.button
            className="w-full rounded-xl px-5 py-4 relative flex items-center justify-center shadow-lg hover:opacity-95 active:opacity-90 transition-opacity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              backgroundColor: theme.ctaBg,
              color: theme.ctaText,
              marginTop: '0.5rem',
            }}
            aria-label="Fazer missão"
            onClick={handleMissionButtonClick}
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              {pendingMission.status === 'waiting' ? 'Fazer Missão' : 'Retomar Missão'}
            </span>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <ChevronRight size={18} />
            </div>
          </motion.button>
        )}

        {missionError && !missionFlowStage && profileState?.completed && pendingMission && (
          <p className="text-sm mt-2" style={{ color: '#f87171' }}>
            {missionError}
          </p>
        )}
      </div>

      <div className="px-4 mt-6 mb-8">
        <motion.div 
          className="relative rounded-2xl overflow-hidden h-58"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onMouseEnter={() => {
            setIsHeroHovered(true);
            setShowHeroArrows(true);
          }}
          onMouseLeave={() => {
            setIsHeroHovered(false);
            setShowHeroArrows(false);
          }}
          onTouchStart={() => setShowHeroArrows(true)}
          onTouchEnd={() => setTimeout(() => setShowHeroArrows(false), 2000)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <ImageWithFallback
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].alt}
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t"
                style={{
                  background: isDarkMode 
                    ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.25) 100%)'
                    : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)'
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <motion.h2 
                  className="text-white mb-1"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  style={{ 
                    fontFamily: 'Montserrat, sans-serif', 
                    fontWeight: 700,
                    fontSize: '21px',
                    textShadow: '0 2px 8px rgba(0,0,0,0.4)'
                  }}
                >
                  {heroSlides[currentSlide].title}
                </motion.h2>
                <motion.p 
                  className="text-white/90 mb-4"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  style={{ 
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '15px',
                    textShadow: '0 1px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {heroSlides[currentSlide].subtitle}
                </motion.p>
                <motion.button
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="px-6 py-2 rounded-lg transition-all hover:opacity-90 active:opacity-75"
                  style={{ 
                    backgroundColor: theme.ctaBg,
                    color: theme.ctaText,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  {heroSlides[currentSlide].cta}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {showHeroArrows && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 active:bg-black/70 transition-all z-10"
                  aria-label="Slide anterior"
                >
                  <ChevronLeft size={20} />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 active:bg-black/70 transition-all z-10"
                  aria-label="Próximo slide"
                >
                  <ChevronRight size={20} />
                </motion.button>
              </>
            )}
          </AnimatePresence>

          <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="transition-all rounded-full"
                style={{
                  width: currentSlide === index ? '20px' : '6px',
                  height: '6px',
                  backgroundColor: currentSlide === index 
                    ? '#e10209' 
                    : isDarkMode ? '#6b6b6b' : '#d0d0d0',
                  opacity: currentSlide === index ? 1 : 0.7
                }}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mb-8" ref={missionsSectionRef}>
        <div className="px-4 mb-6">
          <SectionHeader title="MISSÕES" progress={scrollProgress.missions} showSlider={hasOverflow.missions} />
        </div>
        <div className="w-full flex justify-start md:justify-center">
          <div 
            ref={missionsRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pl-4 md:pl-0"
            onScroll={(e) => handleScroll(e, 'missions')}
            style={{ 
              scrollPaddingLeft: '1rem',
              maxWidth: '100vw',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex gap-3.5 md:gap-3.5 md:mx-auto">
              {missions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  className="flex-shrink-0 snap-start cursor-pointer w-[calc(76vw-16px)] md:w-[290px]"
                  style={{ 
                    marginRight: index === missions.length - 1 ? '1rem' : '0'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                >
                  <div 
                    className="relative rounded-2xl overflow-hidden h-[200px] md:h-[200px]"
                    style={{ 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <img
                      src={mission.image}
                      alt={mission.title}
                      className="w-full h-full object-cover"
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p
                        className="text-white"
                        style={{ 
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 700,
                          fontSize: '15px',
                          lineHeight: '1.3'
                        }}
                      >
                        {mission.title}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-8" ref={evaluationsSectionRef}>
        <SectionHeader title="AVALIAÇÕES" progress={scrollProgress.restaurants} showSlider={hasOverflow.restaurants} />
        <div 
          ref={restaurantsRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          onScroll={(e) => handleScroll(e, 'restaurants')}
        >
          {restaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              className="flex-shrink-0 w-40 cursor-pointer hover:scale-105 transition-transform"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            >
              <div className="rounded-xl overflow-hidden mb-2">
                <ImageWithFallback
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-40 object-cover"
                />
              </div>
              <p
                className="px-2"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  opacity: 1,
                  color: theme.labelText,
                  transition: 'color 0.4s ease'
                }}
              >
                {restaurant.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-8" ref={profileSectionRef}>
        <SectionHeader title="RANKING" progress={scrollProgress.rankings} showSlider={hasOverflow.rankings} />
        <div 
          ref={rankingsRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          onScroll={(e) => handleScroll(e, 'rankings')}
        >
          {[ 
            { id: 1, title: 'TOP 1 - Campeão', image: 'https://images.unsplash.com/photo-1592551230478-ecd6b630cc08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjB0cm9waHklMjBhd2FyZHxlbnwxfHx8fDE3NjI2MTMzMjV8MA&ixlib=rb-4.1.0&q=80&w=1080', badge: 'TOP', alt: 'Troféu dourado - TOP 1 Campeão' },
            { id: 2, title: 'Alvo Preciso', image: 'https://images.unsplash.com/photo-1724680943135-08c96af5dc4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXJnZXQlMjBjcm9zc2hhaXIlMjBwcmVjaXNpb258ZW58MXx8fHwxNzYyNjEyODA5fDA&ixlib=rb-4.1.0&q=80&w=1080', badge: 'TOP', alt: 'Mira precisa - Alvo atingido' },
            { id: 3, title: 'Código Secreto', image: 'https://images.unsplash.com/photo-1701099153650-bc35d4327c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmNyeXB0ZWQlMjBjb2RlJTIwc2NyZWVufGVufDF8fHx8MTc2MjYxMjgwOXww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Código encriptado - Missão secreta' },
            { id: 4, title: 'Troféu de Honra', image: 'https://images.unsplash.com/photo-1720592592437-0c679716ac48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwbWVkYWwlMjBhd2FyZHxlbnwxfHx8fDE3NjI2MTM1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Medalha dourada - Honra ao mérito' },
            { id: 5, title: 'Pódio da Vitória', image: 'https://images.unsplash.com/photo-1590764258299-0f91fa7f95e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wZXRpdGlvbiUyMHdpbm5lciUyMHBvZGl1bXxlbnwxfHx8fDE3NjI2MTI4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Pódio de vencedores' },
            { id: 6, title: 'Painel de Líderes', image: 'https://images.unsplash.com/photo-1717944517387-988d7377232f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWFkZXJib2FyZCUyMHRhYmxlJTIwaWNvbnxlbnwxfHx8fDE3NjI2MTMzMjV8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Leaderboard - Painel de classificação' },
          ].map((rank, index) => (
            <motion.div
              key={rank.id}
              className="flex-shrink-0 w-40 cursor-pointer hover:scale-105 transition-transform"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
            >
              <div className="rounded-xl overflow-hidden mb-2 relative">
                {rank.badge && (
                  <div 
                    className="absolute top-2 right-2 px-2 py-1 rounded text-xs z-10"
                    style={{ backgroundColor: '#f9ed06', color: '#1b1715', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
                  >
                    {rank.badge}
                  </div>
                )}
                <ImageWithFallback
                  src={rank.image}
                  alt={rank.alt || rank.title}
                  className="w-full h-56 object-cover"
                />
              </div>
              <p
                className="px-2"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  opacity: 1,
                  color: theme.labelText,
                  transition: 'color 0.4s ease'
                }}
              >
                {rank.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-8" ref={profileSectionRef}>
        <SectionHeader title="PERFIL DO USUÁRIO" progress={scrollProgress.profile} showSlider={hasOverflow.profile} />
        <div 
          ref={profileRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          onScroll={(e) => handleScroll(e, 'profile')}
        >
          {[userFullName || 'Agente 007', 'Conquistas', 'Estatísticas'].map((item) => (
            <motion.div
              key={item}
              className="flex-shrink-0 w-32 h-32 rounded-xl flex items-center justify-center cursor-pointer transition-all"
              onClick={item === (userFullName || 'Agente 007') ? onNavigateToProfile : undefined}
              whileHover={{ scale: 1.03, backgroundColor: theme.widgetActive }}
              whileTap={{ backgroundColor: theme.widgetActive }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ backgroundColor: theme.widgetBg, opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={{ 
                boxShadow: `0 4px 8px ${theme.widgetShadow}`,
                filter: 'blur(0px)',
                border: `1px solid ${theme.widgetBorder}`
              }}
            >
              <p
                className="text-center px-2"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  color: theme.widgetText,
                  opacity: 1
                }}
              >
                {item}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-8" ref={settingsSectionRef}>
        <SectionHeader title="CONFIGURAÇÕES" progress={scrollProgress.settings} showSlider={hasOverflow.settings} />
        <div 
          ref={settingsRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          onScroll={(e) => handleScroll(e, 'settings')}
        >
          {[{ label: 'Ajustes', icon: Settings, onClick: onNavigateToSettings }, { label: 'Privacidade', icon: Lock }].map(
            ({ label, icon: Icon, onClick }) => (
              <motion.button
                key={label}
                onClick={onClick}
                className="flex-shrink-0 w-32 h-32 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-2"
                whileHover={{ scale: 1.03, backgroundColor: theme.widgetActive }}
                whileTap={{ backgroundColor: theme.widgetActive }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ backgroundColor: theme.widgetBg, opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                style={{ 
                  boxShadow: `0 4px 8px ${theme.widgetShadow}`,
                  filter: 'blur(0px)',
                  border: `1px solid ${theme.widgetBorder}`
                }}
              >
                <Icon size={24} color={theme.widgetText} />
                <p
                  className="text-center"
                  style={{ 
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    color: theme.widgetText,
                    opacity: 1
                  }}
                >
                  {label}
                </p>
              </motion.button>
            )
          )}
        </div>
      </div>

      <div className="px-4 mb-8">
        <SectionHeader title="SUPORTE / AJUDA" progress={scrollProgress.support} showSlider={hasOverflow.support} />
        <div 
          ref={supportRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          onScroll={(e) => handleScroll(e, 'support')}
        >
          {[{ label: 'Contato', icon: Mail }, { label: 'Tutoriais', icon: BookOpen }].map(({ label, icon: Icon }) => (
            <motion.div
              key={label}
              className="flex-shrink-0 w-32 h-32 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-2"
              whileHover={{ scale: 1.03, backgroundColor: theme.widgetActive }}
              whileTap={{ backgroundColor: theme.widgetActive }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ backgroundColor: theme.widgetBg, opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={{ 
                boxShadow: `0 4px 8px ${theme.widgetShadow}`,
                filter: 'blur(0px)',
                border: `1px solid ${theme.widgetBorder}`
              }}
            >
              <Icon size={24} color={theme.widgetText} />
              <p
                className="text-center"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  color: theme.widgetText,
                  opacity: 1
                }}
              >
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <BottomTabBar activeTab={activeTab} onChange={handleTabChange} />
    </motion.div>
  );
}


