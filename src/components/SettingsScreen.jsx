import { ChevronLeft, ChevronRight, User, Heart, Lock, Globe, MessageCircle, HelpCircle, Star, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import BottomTabBar from './BottomTabBar.jsx';

export function SettingsScreen({ onNavigateBack, onNavigateToProfile, onLogout, onNavigateToTab }) {
  const theme = {
    background: '#0d0d0d',
    surface: '#141414',
    border: '#2a2a2a',
    textPrimary: '#ffffff',
    textSecondary: '#c7c7c7',
    accent: '#e10209',
    hoverBg: '#1a1a1a',
  };

  const sections = [
    {
      title: 'Conta',
      items: [
        { id: 'profile', icon: User, label: 'Meu cadastro', action: () => onNavigateToProfile?.() },
        { id: 'prefs', icon: Heart, label: 'Minhas preferências' },
        { id: 'password', icon: Lock, label: 'Alterar senha', action: () => onNavigateToTab?.('profile') },
      ],
    },
    {
      title: 'App',
      items: [
        { id: 'language', icon: Globe, label: 'Idioma', value: 'Português' },
      ],
    },
    {
      title: 'Suporte & Loja',
      items: [
        { id: 'support', icon: MessageCircle, label: 'Contato ao suporte' },
        { id: 'faq', icon: HelpCircle, label: 'Perguntas frequentes' },
        { id: 'store', icon: Star, label: 'Avaliar na loja' },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="min-h-screen pb-[200px]"
      style={{ backgroundColor: theme.background }}
    >
      <div
      className="sticky top-0 z-40 px-4 py-4 flex items-center justify-between backdrop-blur-md"
      style={{ backgroundColor: 'rgba(13, 13, 13, 0.95)' }}
      >
        <motion.button
          onClick={onNavigateBack}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ color: theme.textPrimary }}
        >
          <ChevronLeft size={24} />
        </motion.button>

        <h1
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            color: theme.textPrimary,
          }}
        >
          Ajustes
        </h1>

        <div className="w-8 h-8" />
      </div>

      <div className="px-4 py-6 space-y-8">
{sections.map((section, index) => (
  <motion.div
    key={section.title}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="mt-6"
  >
            <h2
              className="mb-3 px-2"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: '13px',
                color: theme.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {section.title}
            </h2>

            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
              }}
            >
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const isLast = itemIndex === section.items.length - 1;
                return (
                  <div key={item.id}>
                    <motion.button
                      onClick={item.action}
                      className="w-full px-4 flex items-center gap-3 transition-all text-left"
                      style={{ height: '58px' }}
                      whileHover={{ backgroundColor: theme.hoverBg }}
                      whileTap={{ scale: 0.98, opacity: 0.9 }}
                    >
                      <div className="flex-shrink-0">
                        <Icon size={22} color={theme.accent} strokeWidth={2} />
                      </div>
                      <span
                        className="flex-1"
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 500,
                          fontSize: '15px',
                          color: theme.textPrimary,
                        }}
                      >
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.value && (
                          <span
                            style={{
                              fontSize: '13px',
                              fontFamily: 'Montserrat, sans-serif',
                              fontWeight: 500,
                              color: theme.textSecondary,
                            }}
                          >
                            {item.value}
                          </span>
                        )}
                        <ChevronRight size={18} color={theme.textSecondary} style={{ opacity: 0.7 }} />
                      </div>
                    </motion.button>
                    {!isLast && (
                      <div
                        className="mx-4"
                        style={{ height: '1px', backgroundColor: theme.border }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="fixed bottom-[72px] left-0 right-0 px-4 py-6"
        style={{
          background: 'linear-gradient(to top, #0d0d0d 80%, transparent)',
          maxWidth: '430px',
          margin: '0 auto',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <p
          className="text-center mb-3"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            fontSize: '11px',
            color: theme.textSecondary,
          }}
        >
          My Spy v2.0
        </p>

        <motion.button
          onClick={onLogout}
          className="w-full rounded-xl flex items-center justify-center gap-2"
          style={{
            backgroundColor: theme.accent,
            color: '#FFFFFF',
            height: '52px',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: '15px',
            border: 'none',
            cursor: 'pointer',
          }}
          whileHover={{ backgroundColor: '#bc020a', boxShadow: '0 4px 12px rgba(225,2,9,0.3)' }}
          whileTap={{ scale: 0.98, opacity: 0.85 }}
        >
          <LogOut size={20} />
          Fazer logout
        </motion.button>
      </motion.div>

      {onNavigateToTab && (
        <BottomTabBar activeTab="settings" onChange={onNavigateToTab} />
      )}
    </motion.div>
  );
}
