import { useState } from "react";
import { Mail, ArrowLeft, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";
import logoImage from "figma:asset/e5b6946d364d3f97bc93d1ee8c185d77858727d0.png";
import { apiUrl } from "../apiClient";

export default function ForgotPasswordEmailScreen({ onBack, onNext }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = {
    background: isDarkMode ? '#1b1715' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#1b1715',
    inputBg: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f3f3',
    inputBorder: isDarkMode ? 'rgba(255,255,255,0.2)' : '#dcdcdc',
    inputText: isDarkMode ? '#ffffff' : '#1b1715',
    iconColor: isDarkMode ? '#9ca3af' : '#6b7280',
    primaryButton: '#e10209',
    primaryButtonHover: isDarkMode ? 'rgba(225,2,9,0.9)' : '#c10108',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Introduza o seu email."); return; }
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/users/password/forgot'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Erro ${res.status}`);
      }
      if (onNext) onNext(email);
    } catch (err) {
      setError(err.message || 'Falha ao enviar o código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, backgroundColor: theme.background }} className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Theme toggle no topo, mesmo lugar do Login */}
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
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden flex items-center justify-center">
            <img src={logoImage} alt="My Spy Logo" className="w-full h-full object-cover" />
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
        <h1 style={{ color: theme.text, fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }} className="mb-6">Recuperar palavra-passe</h1>
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {error && <div className="p-3 rounded-md" style={{ background: '#201b19', border: '1px solid #3a3a3a', color: '#ffb4b4' }}>{error}</div>}
          <motion.div className="relative w-full" animate={{ opacity: 1 }}>
            <motion.div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" animate={{ color: theme.iconColor }}>
              <Mail size={20} />
            </motion.div>
            <motion.input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Introduza o seu email"
              className="w-full pl-12 pr-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              animate={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
              style={{ fontFamily: 'Montserrat, sans-serif', ['--tw-ring-color']: '#b6019a', height: '52px', paddingTop: '14px', paddingBottom: '14px' }}
            />
          </motion.div>
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white transition-all active:opacity-75 shadow-lg flex items-center justify-center"
            animate={{ backgroundColor: theme.primaryButton }}
            whileHover={{ backgroundColor: theme.primaryButtonHover }}
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, height: '52px' }}
          >
            {loading ? 'A enviar...' : 'Enviar código'}
          </motion.button>
        </form>
      </div>
      {/* Botão voltar no estilo do 'Sair' do Settings, na parte de baixo */}
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


