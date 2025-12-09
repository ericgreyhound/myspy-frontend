import { useState } from "react";
import { Lock, Hash, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { apiUrl } from "../apiClient";

export default function ResetPasswordCodeScreen({ email, onBackToLogin }) {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = {
    background: '#1b1715', text: '#fff', inputBg: 'rgba(255,255,255,0.1)', inputBorder: 'rgba(255,255,255,0.2)',
    inputText: '#fff', iconColor: '#9ca3af', primaryButton: '#e10209', primaryButtonHover: 'rgba(225,2,9,0.9)',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!code || !newPassword || !confirmPassword) { setError("Preencha todos os campos."); return; }
    if (newPassword !== confirmPassword) { setError("As palavras-passe não coincidem."); return; }
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/users/password/reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Erro ${res.status}`);
      }
      if (onBackToLogin) onBackToLogin();
    } catch (err) {
      setError(err.message || 'Falha ao redefinir a palavra-passe.');
    } finally {
      setLoading(false);
    }
  };

  const maskCode = (v) => v.replace(/\D/g, '').slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, backgroundColor: theme.background }} className="min-h-screen flex items-center justify-center px-8">
      <button onClick={onBackToLogin} className="absolute top-6 left-6 w-8 h-8 rounded-full flex items-center justify-center" style={{ color: theme.text, border: '1px solid rgba(255,255,255,0.2)' }}>
        <ArrowLeft size={18} />
      </button>
      <div className="w-full max-w-sm">
        <h1 style={{ color: theme.text, fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }} className="mb-8">Introduza o código e redefina a palavra-passe</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 rounded-md" style={{ background: '#201b19', border: '1px solid #3a3a3a', color: '#ffb4b4' }}>{error}</div>}

          <motion.div className="relative" animate={{ opacity: 1 }}>
            <motion.div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" animate={{ color: theme.iconColor }}>
              <Hash size={20} />
            </motion.div>
            <motion.input
              type="text"
              value={code}
              onChange={(e) => setCode(maskCode(e.target.value))}
              placeholder="Código de 6 dígitos"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all"
              animate={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
              style={{ fontFamily: 'Montserrat, sans-serif', ['--tw-ring-color']: '#b6019a', letterSpacing: '4px' }}
            />
          </motion.div>

          <motion.div className="relative" animate={{ opacity: 1 }}>
            <motion.div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" animate={{ color: theme.iconColor }}>
              <Lock size={20} />
            </motion.div>
            <motion.input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nova palavra-passe"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all"
              animate={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
              style={{ fontFamily: 'Montserrat, sans-serif', ['--tw-ring-color']: '#b6019a' }}
            />
          </motion.div>

          <motion.div className="relative" animate={{ opacity: 1 }}>
            <motion.div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" animate={{ color: theme.iconColor }}>
              <Lock size={20} />
            </motion.div>
            <motion.input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar nova palavra-passe"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all"
              animate={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
              style={{ fontFamily: 'Montserrat, sans-serif', ['--tw-ring-color']: '#b6019a' }}
            />
          </motion.div>

          <motion.button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-white" animate={{ backgroundColor: theme.primaryButton }} whileHover={{ backgroundColor: theme.primaryButtonHover }} style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
            {loading ? 'A redefinir...' : 'Redefinir palavra-passe'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}


