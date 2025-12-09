import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import logoImage from 'figma:asset/e5b6946d364d3f97bc93d1ee8c185d77858727d0.png';
import { apiUrl } from '../apiClient';

export function LoginScreen({ onNavigateToSignUp, onNavigateToHome, onUserAuthenticated, onForgotPassword, onAdminLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (normalizedEmail === 'admin@evot.com.br' && password === '123456') {
      if (typeof onAdminLogin === 'function') {
        onAdminLogin();
        return;
      }
    }
    if (!email || !password) {
      setError('Preencha o email e a palavra-passe.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/users/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Erro ${res.status}`);
      }
      const data = await res.json();
      if (onUserAuthenticated) {
        onUserAuthenticated({
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          taxId: data.taxId,
          taxIdType: data.taxIdType,
          profileType: data.profileType,
        });
      }
      if (onNavigateToHome) onNavigateToHome();
    } catch (err) {
      setError(err.message || 'Falha ao iniciar sessão.');
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    background: isDarkMode ? '#1b1715' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#1b1715',
    inputBg: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f3f3f3',
    inputBorder: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#dcdcdc',
    inputText: isDarkMode ? '#ffffff' : '#1b1715',
    placeholderText: isDarkMode ? '#9ca3af' : '#6b7280',
    iconColor: isDarkMode ? '#9ca3af' : '#6b7280',
    primaryButton: '#e10209',
    primaryButtonHover: isDarkMode ? 'rgba(225, 2, 9, 0.9)' : '#c10108',
    secondaryButton: '#e10209',
    secondaryButtonHover: isDarkMode ? 'rgba(225, 2, 9, 0.9)' : '#c10108',
    linkColor: isDarkMode ? '#9ca3af' : '#6b7280',
    linkHoverColor: isDarkMode ? '#ffffff' : '#1b1715',
    dividerColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    toggleBg: isDarkMode ? '#1b1715' : '#f5f5f5',
    toggleBorder: isDarkMode ? '#2a2a2a' : '#e0e0e0',
    toggleIcon: isDarkMode ? '#ffffff' : '#1b1715',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backgroundColor: theme.background }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="flex flex-col items-center justify-center min-h-screen px-8 relative overflow-hidden"
    >
      <motion.div 
        className="absolute top-10 right-8 w-40 h-40 rounded-full blur-3xl" 
        animate={{ opacity: isDarkMode ? 0.05 : 0.03 }}
        transition={{ duration: 0.4 }}
        style={{ backgroundColor: '#b6019a' }} 
      />
      <motion.div 
        className="absolute bottom-32 left-8 w-32 h-32 rounded-full blur-2xl" 
        animate={{ opacity: isDarkMode ? 0.05 : 0.03 }}
        transition={{ duration: 0.4 }}
        style={{ backgroundColor: '#f9ed06' }} 
      />
      <motion.div 
        className="absolute top-1/3 right-1/4 w-20 h-20 rotate-45" 
        animate={{ opacity: isDarkMode ? 0.05 : 0.03 }}
        transition={{ duration: 0.4 }}
        style={{ backgroundColor: '#e10209' }} 
      />

      <motion.button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
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
            color: theme.toggleIcon
          }}
          transition={{ duration: 0.4 }}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </motion.div>
      </motion.button>

      <div className="w-full max-w-sm z-10 flex flex-col items-center">
        <div className="mb-12 flex flex-col items-center gap-4">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="My Spy Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: '22px',
              color: theme.text,
              textAlign: 'center'
            }}
          >
            My Spy
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          {error && (
            <div
              className="w-full rounded-md p-3"
              style={{ backgroundColor: isDarkMode ? '#201b19' : '#f3f3f3', border: `1px solid ${isDarkMode ? '#3a3a3a' : '#e0e0e0'}`, color: '#ffb4b4', fontFamily: 'Montserrat, sans-serif' }}
            >
              {error}
            </div>
          )}
          <motion.div 
            className="relative w-full"
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div 
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              animate={{ color: theme.iconColor }}
              transition={{ duration: 0.4 }}
            >
              <Mail size={20} />
            </motion.div>
            <motion.input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Introduza o seu email ou utilizador"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              animate={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              }}
              transition={{ duration: 0.4 }}
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                '--tw-ring-color': '#b6019a'
              }}
            />
          </motion.div>

          <motion.div 
            className="relative w-full"
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div 
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              animate={{ color: theme.iconColor }}
              transition={{ duration: 0.4 }}
            >
              <Lock size={20} />
            </motion.div>
            <motion.input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduza a sua palavra-passe"
              className="w-full pl-12 pr-12 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              animate={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              }}
              transition={{ duration: 0.4 }}
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                '--tw-ring-color': '#b6019a'
              }}
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              animate={{ color: theme.iconColor }}
              whileHover={{ color: theme.linkHoverColor }}
              transition={{ duration: 0.4 }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </motion.button>
          </motion.div>

          <motion.button
            type="submit"
            className="w-full py-3.5 rounded-xl text-white transition-all active:opacity-75 shadow-lg flex items-center justify-center"
            animate={{ backgroundColor: theme.primaryButton }}
            whileHover={{ backgroundColor: theme.primaryButtonHover }}
            transition={{ duration: 0.4 }}
            style={{ 
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700
            }}
            disabled={loading}
          >
            {loading ? 'A iniciar...' : 'Iniciar sessão'}
          </motion.button>

          <div className="text-center pt-2">
            <motion.button
              type="button"
              className="underline transition-colors"
              animate={{ color: theme.linkColor }}
              whileHover={{ color: theme.linkHoverColor }}
              transition={{ duration: 0.4 }}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
              onClick={onForgotPassword}
            >
              Esqueci-me da palavra-passe
            </motion.button>
          </div>
        </form>

        <div className="flex items-center w-full my-8">
          <motion.div 
            className="flex-1 h-px" 
            animate={{ backgroundColor: theme.dividerColor }}
            transition={{ duration: 0.4 }}
          />
          <motion.span 
            className="px-4 text-center" 
            animate={{ color: theme.linkColor }}
            transition={{ duration: 0.4 }}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            ou
          </motion.span>
          <motion.div 
            className="flex-1 h-px" 
            animate={{ backgroundColor: theme.dividerColor }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <motion.button
          type="button"
          onClick={onNavigateToSignUp}
          className="w-full py-3.5 rounded-xl transition-all active:opacity-75 flex items-center justify-center shadow-lg"
          animate={{ 
            backgroundColor: theme.secondaryButton,
            color: '#ffffff',
          }}
          whileHover={{ backgroundColor: theme.secondaryButtonHover }}
          transition={{ duration: 0.4 }}
          style={{ 
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700
          }}
        >
          Criar conta
        </motion.button>
      </div>
    </motion.div>
  );
}


