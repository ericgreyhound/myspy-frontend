import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, User, Search, X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import logoImage from 'figma:asset/e5b6946d364d3f97bc93d1ee8c185d77858727d0.png';
import { ImageWithFallback } from './figma/ImageWithFallback.jsx';
import MissionWizard from './mission/MissionWizard.jsx';
import { apiUrl } from '../apiClient';

const heroSlides = [
  {
    id: 1,
    title: 'Coordene missões estratégicas',
    subtitle: 'Defina avaliações e acompanhe resultados em tempo real.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1080&q=80',
    alt: 'Painel administrativo',
  },
  {
    id: 2,
    title: 'Gestão de utilizadores',
    subtitle: 'Consulte perfis NIF e mantenha o acesso seguro.',
    image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1080&q=80',
    alt: 'Gestão de utilizadores',
  },
  {
    id: 3,
    title: 'Estabelecimentos em foco',
    subtitle: 'Veja o estado das subscrições e planos activos.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1080&q=80',
    alt: 'Gestão de estabelecimentos',
  },
];

function TablePagination({ page, pages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-end gap-2 mt-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <button onClick={onPrev} disabled={page <= 1} className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40">
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm">
        Página {page} de {pages}
      </span>
      <button onClick={onNext} disabled={page >= pages} className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function AdminDashboard({ onNavigateToSettings, userFullName = 'Administrador' }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [showHeroArrows, setShowHeroArrows] = useState(false);
  const heroTimerRef = useRef(null);

  const [missionSearch, setMissionSearch] = useState('');
  const [missionQuery, setMissionQuery] = useState('');
  const [missionPage, setMissionPage] = useState(1);
  const [missionsData, setMissionsData] = useState({ items: [], total: 0, pages: 1, page: 1 });
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [missionsRefreshKey, setMissionsRefreshKey] = useState(0);

  const [userSearch, setUserSearch] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userData, setUserData] = useState({ items: [], total: 0, pages: 1 });
  const [userLoading, setUserLoading] = useState(false);

  const [businessSearch, setBusinessSearch] = useState('');
  const [businessQuery, setBusinessQuery] = useState('');
  const [businessPage, setBusinessPage] = useState(1);
  const [businessData, setBusinessData] = useState({ items: [], total: 0, pages: 1 });
  const [businessLoading, setBusinessLoading] = useState(false);

  const [missionWizardOpen, setMissionWizardOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMissionPage(1);
      setMissionQuery(missionSearch);
    }, 350);
    return () => clearTimeout(timer);
  }, [missionSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserPage(1);
      setUserQuery(userSearch);
    }, 350);
    return () => clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusinessPage(1);
      setBusinessQuery(businessSearch);
    }, 350);
    return () => clearTimeout(timer);
  }, [businessSearch]);

  useEffect(() => {
    const controller = new AbortController();
    const term = missionQuery.trim();
    if (!term) {
      setMissionsLoading(false);
      setMissionsData({ items: [], total: 0, pages: 1, page: 1 });
      controller.abort();
      return;
    }
    async function fetchMissions() {
      try {
        setMissionsLoading(true);
        const res = await fetch(
          apiUrl(`/api/missions?q=${encodeURIComponent(term)}&page=${missionPage}&limit=8`),
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Falha ao carregar missões');
        const data = await res.json();
        setMissionsData(data);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setMissionsLoading(false);
      }
    }
    fetchMissions();
    return () => controller.abort();
  }, [missionQuery, missionPage, missionsRefreshKey]);

  const theme = useMemo(
    () => ({
      background: isDarkMode ? '#1b1715' : '#ffffff',
      text: isDarkMode ? '#ffffff' : '#1b1715',
      cardBg: isDarkMode ? '#2a2a2a' : '#f3f3f3',
      cardBorder: isDarkMode ? '#3a3a3a' : '#e0e0e0',
      subtle: isDarkMode ? '#9ca3af' : '#4b5563',
      ctaBg: '#e10209',
      ctaText: '#ffffff',
    }),
    [isDarkMode]
  );

  const SectionHeader = ({ title }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3
          className="uppercase"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '0.5px',
            color: theme.text,
            transition: 'color 0.3s ease',
          }}
        >
          {title}
        </h3>
        <div className="w-10 h-0.5 bg-[#e10209]" />
      </div>
    </div>
  );

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

  useEffect(() => {
    const controller = new AbortController();
    const term = userQuery.trim();
    if (!term) {
      setUserLoading(false);
      setUserData({ items: [], total: 0, pages: 1, page: 1 });
      controller.abort();
      return;
    }
    async function fetchUsers() {
      try {
        setUserLoading(true);
        const res = await fetch(
          apiUrl(`/api/users?q=${encodeURIComponent(term)}&page=${userPage}&limit=8&profileType=individual`),
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Falha ao carregar utilizadores');
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setUserLoading(false);
      }
    }
    fetchUsers();
    return () => controller.abort();
  }, [userQuery, userPage]);

  useEffect(() => {
    const controller = new AbortController();
    const term = businessQuery.trim();
    if (!term) {
      setBusinessLoading(false);
      setBusinessData({ items: [], total: 0, pages: 1, page: 1 });
      controller.abort();
      return;
    }
    async function fetchBusiness() {
      try {
        setBusinessLoading(true);
        const res = await fetch(
          apiUrl(`/api/users?q=${encodeURIComponent(term)}&page=${businessPage}&limit=8&profileType=business`),
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Falha ao carregar estabelecimentos');
        const data = await res.json();
        setBusinessData(data);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setBusinessLoading(false);
      }
    }
    fetchBusiness();
    return () => controller.abort();
  }, [businessQuery, businessPage]);

  const handleToggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  const renderSearchBar = ({ value, onChange, placeholder, onSubmit, onClear }) => (
    <div className="flex items-center gap-2 mt-4">
      <div className="flex-1 relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border px-4 py-3 bg-transparent"
          style={{ borderColor: theme.cardBorder, color: theme.text, fontFamily: 'Montserrat, sans-serif' }}
        />
        {value && (
          <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: theme.subtle }}>
            <X size={16} />
          </button>
        )}
      </div>
      <button
        onClick={onSubmit}
        className="rounded-xl px-4 py-3 flex items-center gap-2"
        style={{ backgroundColor: theme.ctaBg, color: '#fff', fontFamily: 'Montserrat, sans-serif' }}
      >
        <Search size={16} />
        Pesquisar
      </button>
    </div>
  );

  const renderUsersTable = () => (
    <div className="mt-4 border rounded-2xl p-4" style={{ borderColor: theme.cardBorder }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <thead>
            <tr style={{ color: theme.subtle }}>
              <th className="py-2 px-4">NIF</th>
              <th className="py-2 px-4">Nome</th>
              <th className="py-2 px-4">Email</th>
            </tr>
          </thead>
          <tbody>
            {!hasUserQuery ? (
              <tr>
                <td colSpan={3} className="py-4 text-center" style={{ color: theme.subtle }}>
                  Digite para pesquisar os utilizadores.
                </td>
              </tr>
            ) : userLoading ? (
              <tr>
                <td colSpan={3} className="py-4 text-center" style={{ color: theme.subtle }}>
                  A carregar...
                </td>
              </tr>
            ) : userData.items.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center" style={{ color: theme.subtle }}>
                  Sem registos encontrados.
                </td>
              </tr>
            ) : (
              userData.items.map((item) => (
                <tr key={item._id} style={{ color: theme.text }}>
                  <td className="py-3 px-4 border-t" style={{ borderColor: theme.cardBorder }}>
                    {item.taxId || '—'}
                  </td>
                  <td className="py-3 px-4 border-t" style={{ borderColor: theme.cardBorder }}>
                    {item.fullName || '—'}
                  </td>
                  <td className="py-3 px-4 border-t" style={{ borderColor: theme.cardBorder }}>
                    {item.email || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {hasUserQuery && (
        <TablePagination
          page={userData.page || userPage}
          pages={userData.pages || 1}
          onPrev={() => setUserPage((p) => Math.max(1, p - 1))}
          onNext={() => setUserPage((p) => (p < (userData.pages || 1) ? p + 1 : p))}
        />
      )}
    </div>
  );

  const renderBusinessTable = () => (
    <div className="mt-4 border rounded-2xl p-4" style={{ borderColor: theme.cardBorder }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <thead>
            <tr style={{ color: theme.subtle }}>
              <th className="py-2 px-4">NIPC</th>
              <th className="py-2 px-4">Razão social</th>
              <th className="py-2 px-4">Email</th>
            </tr>
          </thead>
          <tbody>
            {!hasBusinessQuery ? (
              <tr>
                <td colSpan={3} className="py-4 text-center" style={{ color: theme.subtle }}>
                  Digite para pesquisar seus estabelecimentos.
                </td>
              </tr>
            ) : businessLoading ? (
              <tr>
                <td colSpan={3} className="py-4 text-center" style={{ color: theme.subtle }}>
                  A carregar...
                </td>
              </tr>
            ) : businessData.items.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center" style={{ color: theme.subtle }}>
                  Sem estabelecimentos registados.
                </td>
              </tr>
            ) : (
              businessData.items.map((item) => (
                <tr key={item._id} style={{ color: theme.text }}>
                  <td className="py-3 px-4 border-t" style={{ borderColor: theme.cardBorder }}>
                    {item.taxId || '—'}
                  </td>
                  <td className="py-3 px-4 border-t" style={{ borderColor: theme.cardBorder }}>
                    {item.fullName || '—'}
                  </td>
                  <td className="py-3 px-4 border-t" style={{ borderColor: theme.cardBorder }}>
                    {item.email || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {hasBusinessQuery && (
        <TablePagination
          page={businessData.page || businessPage}
          pages={businessData.pages || 1}
          onPrev={() => setBusinessPage((p) => Math.max(1, p - 1))}
          onNext={() => setBusinessPage((p) => (p < (businessData.pages || 1) ? p + 1 : p))}
        />
      )}
    </div>
  );

  const statusLabels = {
    waiting: 'Em espera',
    accepted: 'Aceite',
    in_progress: 'Em curso',
    completed: 'Concluída',
    rejected: 'Rejeitada',
  };

  const statusColors = {
    waiting: '#facc15',
    accepted: '#22c55e',
    in_progress: '#38bdf8',
    completed: '#4ade80',
    rejected: '#ef4444',
  };

  const hasMissionQuery = missionQuery.trim().length > 0;
  const hasUserQuery = userQuery.trim().length > 0;
  const hasBusinessQuery = businessQuery.trim().length > 0;

  const renderMissionsTable = () => (
    <div className="mt-4 border rounded-2xl p-4" style={{ borderColor: theme.cardBorder }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <thead>
            <tr style={{ color: theme.subtle }}>
              <th className="py-2 px-4">Estabelecimento</th>
              <th className="py-2 px-4">Espião</th>
              <th className="py-2 px-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {!hasMissionQuery ? (
              <tr>
                <td colSpan={3} className="py-4 text-center" style={{ color: theme.subtle }}>
                  Digite para pesquisar as missões.
                </td>
              </tr>
            ) : missionsLoading ? (
              <tr>
                <td colSpan={3} className="py-4 text-center" style={{ color: theme.subtle }}>
                  A carregar...
                </td>
              </tr>
            ) : missionsData.items.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center" style={{ color: theme.subtle }}>
                  Sem missões registadas.
                </td>
              </tr>
            ) : (
              missionsData.items.map((mission) => (
                <tr key={mission._id} style={{ color: theme.text }}>
                  <td className="py-3 px-4 border-t" style={{ borderColor: theme.cardBorder }}>
                    {mission.establishmentName || '—'}
                  </td>
                  <td className="py-3 px-4 border-t" style={{ borderColor: theme.cardBorder }}>
                    {mission.spyName || '—'}
                  </td>
                  <td className="py-3 px-4 border-t" style={{ borderColor: theme.cardBorder }}>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${(statusColors[mission.status] || theme.subtle)}22`,
                        color: statusColors[mission.status] || theme.text,
                      }}
                    >
                      {statusLabels[mission.status] || mission.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {hasMissionQuery && (
        <TablePagination
          page={missionsData.page || missionPage}
          pages={missionsData.pages || 1}
          onPrev={() => setMissionPage((p) => Math.max(1, p - 1))}
          onNext={() => setMissionPage((p) => (p < (missionsData.pages || 1) ? p + 1 : p))}
        />
      )}
    </div>
  );

  const renderMissionsPanel = () => (
    <div className="space-y-4 mt-2">
      {renderSearchBar({
        value: missionSearch,
        onChange: setMissionSearch,
        placeholder: 'Filtrar por estabelecimento, espião...',
        onSubmit: () => {
          setMissionPage(1);
          setMissionQuery(missionSearch);
        },
        onClear: () => {
          setMissionSearch('');
          setMissionPage(1);
          setMissionQuery('');
        },
      })}
      {renderMissionsTable()}
    </div>
  );

  const openMissionWizard = () => setMissionWizardOpen(true);
  const handleMissionCancel = () => setMissionWizardOpen(false);
  const handleMissionCreated = () => {
    setMissionWizardOpen(false);
    setMissionsRefreshKey((prev) => prev + 1);
  };

  if (missionWizardOpen) {
    return (
      <MissionWizard
        theme={theme}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleDarkMode}
        onCancel={handleMissionCancel}
        onCreated={handleMissionCreated}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backgroundColor: theme.background }}
      className="min-h-screen pb-10"
      style={{ color: theme.text }}
    >
      <motion.nav
        className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between backdrop-blur-md"
        animate={{ backgroundColor: isDarkMode ? 'rgba(27,23,21,0.95)' : 'rgba(255,255,255,0.95)' }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white">
            <ImageWithFallback src={logoImage} alt="EVOT" className="w-full h-full object-cover" />
          </div>
          <h1
            className="tracking-tight"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: theme.text,
              transition: 'color 0.3s ease',
            }}
          >
            {userFullName ? `Olá, ${userFullName}` : 'EVOT'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
            <motion.button
              onClick={handleToggleDarkMode}
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
            animate={{
              backgroundColor: isDarkMode ? '#1b1715' : '#f5f5f5',
              borderColor: theme.cardBorder,
            }}
            transition={{ duration: 0.4 }}
            style={{ border: '1px solid' }}
          >
            <motion.div
              initial={false}
              animate={{
                rotate: isDarkMode ? 0 : 180,
                color: theme.text,
                opacity: isDarkMode ? 1 : 0.85,
              }}
              transition={{ duration: 0.4 }}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </motion.div>
          </motion.button>

          <motion.button
            onClick={onNavigateToSettings}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:scale-110 active:scale-95"
            animate={{
              borderColor: theme.cardBorder,
              backgroundColor: theme.cardBg,
            }}
            transition={{ duration: 0.4 }}
            style={{ border: '1px solid' }}
          >
            <motion.div
              animate={{
                color: theme.text,
                opacity: isDarkMode ? 1 : 0.85,
              }}
              transition={{ duration: 0.4 }}
            >
              <User size={16} />
            </motion.div>
          </motion.button>
        </div>
      </motion.nav>

      <div className="px-4 mt-4">
        <motion.button
          className="w-full rounded-xl px-5 py-4 relative flex items-center justify-center shadow-lg hover:opacity-95 active:opacity-90 transition-opacity"
          style={{ backgroundColor: theme.ctaBg, color: theme.ctaText, fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
          onClick={openMissionWizard}
        >
          Nova Missão
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <ArrowRight size={18} />
          </div>
        </motion.button>
      </div>

      <div className="px-4 mt-6 mb-8">
        <motion.div
          className="relative rounded-2xl overflow-hidden"
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
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="absolute inset-0 h-56"
            >
              <ImageWithFallback
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].alt}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)'
                    : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)',
                }}
              />
            </motion.div>
          </AnimatePresence>

          <div className="relative p-6 h-56 flex flex-col justify-end" style={{ color: '#fff' }}>
            <p className="text-xs uppercase tracking-[0.3em]" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.3em' }}>
              ADMINistração
            </p>
            <h2 className="text-2xl font-bold mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {heroSlides[currentSlide].title}
            </h2>
            <p className="text-sm mt-1" style={{ fontFamily: 'Montserrat, sans-serif', opacity: 0.85 }}>
              {heroSlides[currentSlide].subtitle}
            </p>
          </div>

          {showHeroArrows && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 text-white rounded-full p-2 backdrop-blur-md"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 text-white rounded-full p-2 backdrop-blur-md"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: currentSlide === index ? '32px' : '12px',
                  backgroundColor: currentSlide === index ? '#ffffff' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-4 pb-12 space-y-16">
        <section>
          <SectionHeader title="MISSÕES" />
          {renderMissionsPanel()}
        </section>

        <section>
          <div className="mt-4">
            <SectionHeader title="UTILIZADORES" />
          </div>
          {renderSearchBar({
            value: userSearch,
            onChange: setUserSearch,
            placeholder: 'Filtrar por NIF, nome...',
            onSubmit: () => {
              setUserPage(1);
              setUserQuery(userSearch);
            },
            onClear: () => {
              setUserSearch('');
              setUserPage(1);
              setUserQuery('');
            },
          })}
          {renderUsersTable()}
        </section>

        <section>
          <div className="mt-4">
            <SectionHeader title="ESTABELECIMENTOS" />
          </div>
          {renderSearchBar({
            value: businessSearch,
            onChange: setBusinessSearch,
            placeholder: 'Filtrar por NIPC, razão social...',
            onSubmit: () => {
              setBusinessPage(1);
              setBusinessQuery(businessSearch);
            },
            onClear: () => {
              setBusinessSearch('');
              setBusinessPage(1);
              setBusinessQuery('');
            },
          })}
          {renderBusinessTable()}
        </section>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
