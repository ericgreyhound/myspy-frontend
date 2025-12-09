import { useState } from "react";
import { Mail, Lock, ArrowLeft, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";
import logoImage from "figma:asset/e5b6946d364d3f97bc93d1ee8c185d77858727d0.png";
import { apiUrl } from "../apiClient";

export default function ChangePasswordScreen({ mode = "profile", onBack, onDone, userId }) {
  // mode: "profile" -> current + new password
  // mode: "login"   -> email + new password
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const isLoginMode = mode === "login";

  const theme = {
    background: isDarkMode ? '#1b1715' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#1b1715',
    inputBg: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f3f3f3',
    inputBorder: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#dcdcdc',
    inputText: isDarkMode ? '#ffffff' : '#1b1715',
    iconColor: isDarkMode ? '#9ca3af' : '#6b7280',
    primaryButton: '#e10209',
    primaryButtonHover: isDarkMode ? 'rgba(225, 2, 9, 0.9)' : '#c10108',
    linkColor: isDarkMode ? '#9ca3af' : '#6b7280',
    linkHoverColor: isDarkMode ? '#ffffff' : '#1b1715',
    dividerColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (isLoginMode) {
      if (!email || !newPassword) {
        setError("Preencha o email e a nova palavra-passe.");
        return;
      }
      // Futuro: endpoint de reset de senha (com verificação)
    } else {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("Preencha a palavra-passe atual, a nova palavra-passe e a confirmação.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("A confirmação da nova palavra-passe não coincide.");
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(apiUrl(`/api/users/${userId}/password/change`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `Erro ${res.status}`);
        }
      } catch (err) {
        setLoading(false);
        setError(err.message || 'Falha ao alterar a palavra-passe.');
        return;
      } finally {
        setLoading(false);
      }
    }
    if (onDone) onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backgroundColor: theme.background }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden"
    >
      {/* Toggle de tema no topo, como no Login */}
      <motion.button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
        animate={{ backgroundColor: isDarkMode ? '#1b1715' : '#f5f5f5', borderColor: isDarkMode ? '#2a2a2a' : '#e0e0e0' }}
        transition={{ duration: 0.4 }}
        style={{ border: '1px solid' }}
      >
        <motion.div initial={false} animate={{ rotate: isDarkMode ? 0 : 180, color: isDarkMode ? '#ffffff' : '#1b1715' }} transition={{ duration: 0.4 }}>
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </motion.div>
      </motion.button>

      <div className="w-full z-10 flex flex-col items-center" style={{ maxWidth: '430px', margin: '0 auto' }}>
        {/* Logo central como no Login */}
        <div className="mb-8 flex justify-center">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden flex items-center justify-center">
            <img src={logoImage} alt="My Spy Logo" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="mb-8">
          <h1
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: theme.text
            }}
          >
            {isLoginMode ? 'Redefinir palavra-passe' : 'Alterar palavra-passe'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {error && (
            <div
              className="w-full rounded-md p-3"
              style={{ backgroundColor: "#201b19", border: "1px solid #3a3a3a", color: "#ffb4b4", fontFamily: "Montserrat, sans-serif" }}
            >
              {error}
            </div>
          )}

          {isLoginMode && (
            <motion.div className="relative w-full" animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <motion.div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" animate={{ color: theme.iconColor }} transition={{ duration: 0.4 }}>
                <Mail size={20} />
              </motion.div>
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Introduza o seu email"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                animate={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
                transition={{ duration: 0.4 }}
                style={{ fontFamily: 'Montserrat, sans-serif', ['--tw-ring-color']: '#b6019a', height: '52px' }}
              />
            </motion.div>
          )}

          {!isLoginMode && (
            <motion.div className="relative w-full" animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <motion.div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" animate={{ color: theme.iconColor }} transition={{ duration: 0.4 }}>
                <Lock size={20} />
              </motion.div>
              <motion.input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Palavra-passe atual"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                animate={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
                transition={{ duration: 0.4 }}
                style={{ fontFamily: 'Montserrat, sans-serif', ['--tw-ring-color']: '#b6019a', height: '52px' }}
              />
            </motion.div>
          )}

          <motion.div className="relative w-full" animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <motion.div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" animate={{ color: theme.iconColor }} transition={{ duration: 0.4 }}>
              <Lock size={20} />
            </motion.div>
            <motion.input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nova palavra-passe"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              animate={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
              transition={{ duration: 0.4 }}
              style={{ fontFamily: 'Montserrat, sans-serif', ['--tw-ring-color']: '#b6019a', height: '52px' }}
            />
          </motion.div>

          {!isLoginMode && (
            <motion.div className="relative w-full" animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <motion.div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" animate={{ color: theme.iconColor }} transition={{ duration: 0.4 }}>
                <Lock size={20} />
              </motion.div>
              <motion.input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar nova palavra-passe"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                animate={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
                transition={{ duration: 0.4 }}
                style={{ fontFamily: 'Montserrat, sans-serif', ['--tw-ring-color']: '#b6019a', height: '52px' }}
              />
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="w-full py-3.5 rounded-xl text-white transition-all active:opacity-75 shadow-lg flex items-center justify-center"
            animate={{ backgroundColor: theme.primaryButton }}
            whileHover={{ backgroundColor: theme.primaryButtonHover }}
            transition={{ duration: 0.4 }}
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, height: '52px' }}
            disabled={loading}
          >
            {loading ? (isLoginMode ? 'A enviar...' : 'A guardar...') : (isLoginMode ? 'Redefinir palavra-passe' : 'Alterar palavra-passe')}
          </motion.button>
        </form>
      </div>
      {/* Botão voltar no estilo do 'Sair' do Settings, fixo na parte de baixo */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4"
        style={{
          background: isDarkMode ? 'linear-gradient(to top, #1b1715 70%, transparent)' : 'linear-gradient(to top, #ffffff 70%, transparent)',
          maxWidth: '430px',
          margin: '0 auto',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.button
          onClick={onBack}
          className="w-full rounded-xl flex items-center justify-center gap-3"
          style={{
            backgroundColor: '#b6019a',
            color: '#ffffff',
            height: '52px',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)',
          }}
          whileHover={{ backgroundColor: '#9e0182', scale: 1.02 }}
          whileTap={{ scale: 0.98, opacity: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowLeft size={20} />
          Voltar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}


