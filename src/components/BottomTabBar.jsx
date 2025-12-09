import { motion } from 'motion/react';
import { Home, Target, ClipboardCheck, User, Settings } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'missions', label: 'Missões', icon: Target },
  { id: 'evaluations', label: 'Avaliações', icon: ClipboardCheck },
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export default function BottomTabBar({ activeTab = 'home', onChange }) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ maxWidth: '430px', margin: '0 auto' }}
    >
      <div
        className="flex items-center justify-between w-full"
        style={{
          height: '72px',
          backgroundColor: '#141414',
          borderTop: '1px solid #2A2A2A',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const color = isActive ? '#E10209' : '#C7C7C7';

          return (
            <motion.button
              key={tab.id}
              onClick={() => onChange?.(tab.id)}
              className="flex flex-col items-center justify-center gap-1"
              style={{
                flex: 1,
                minHeight: '44px',
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <motion.div animate={{ color }} transition={{ duration: 0.2 }}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <motion.span
                animate={{ color }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: '10px',
                  lineHeight: 1.2,
                }}
              >
                {tab.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

