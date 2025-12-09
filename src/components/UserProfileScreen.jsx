import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sun, Moon, Camera, Mail, Phone, Calendar as CalendarIcon, Edit2, Save, X } from 'lucide-react';
import logoImage from 'figma:asset/e5b6946d364d3f97bc93d1ee8c185d77858727d0.png';
import { apiUrl } from '../apiClient';

const DEFAULT_PROFILE = {
  name: 'Agente 007',
  email: '',
  phone: '',
  birthday: '',
  nationality: '',
  address: '',
  gender: '',
  profileType: 'individual',
  rank: 'Operação Ruby',
  role: 'Cliente mistério',
  xpProgress: 75,
  missions: { bronze: 0, prata: 0, ouro: 0 },
  achievements: [
    { id: 1, icon: '🎯', earned: true },
    { id: 2, icon: '🏆', earned: true },
    { id: 3, icon: '⭐', earned: true },
    { id: 4, icon: '💎', earned: false },
    { id: 5, icon: '🔥', earned: true },
    { id: 6, icon: '🎖️', earned: false },
  ],
};

function digitsOnly(value = '') {
  return String(value).replace(/\D/g, '');
}

function formatDateDisplay(iso = '') {
  if (!iso) return '';
  if (iso.includes('/')) return iso;
  const [y, m, d] = iso.split('-');
  if (y && m && d) return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  return iso;
}

function normalizeDateForApi(value = '') {
  if (value.includes('/')) {
    const [dd, mm, yyyy] = value.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }
  return value;
}

function formatPhoneDisplay(raw = '') {
  if (!raw) return '';
  const digits = digitsOnly(raw);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, -4)}-${digits.slice(-4)}`;
}

const UserProfileScreen = ({
  isDarkMode,
  onToggleTheme,
  onNavigateToSettings,
  userFullName,
  userEmail,
  userId,
  onChangePassword,
}) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    nacionalidade: '',
    endereco: '',
    genero: '',
  });

  const theme = useMemo(
    () => ({
      background: isDarkMode ? '#0d0d0d' : '#ffffff',
      surface: isDarkMode ? '#141414' : '#f3f3f3',
      border: isDarkMode ? '#2a2a2a' : '#e0e0e0',
      textPrimary: isDarkMode ? '#ffffff' : '#1b1715',
      textSecondary: isDarkMode ? '#c7c7c7' : '#4b5563',
      accent: '#e10209',
      accentSoft: 'rgba(225, 2, 9, 0.15)',
    }),
    [isDarkMode]
  );

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: userFullName || prev.name,
      email: userEmail || prev.email,
    }));
    setFormData((prev) => ({
      ...prev,
      nome: userFullName || prev.nome,
      email: userEmail || prev.email,
    }));
  }, [userFullName, userEmail]);

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;
      try {
        setLoadingProfile(true);
        const res = await fetch(apiUrl(`/api/users/${userId}`));
        if (!res.ok) throw new Error('Falha ao carregar perfil');
        const data = await res.json();
        const normalized = {
          name: data.fullName || DEFAULT_PROFILE.name,
          email: data.email || DEFAULT_PROFILE.email,
          phone: data.phone || '',
          birthday: data.birthDate || '',
          nationality: data.nationality || '',
          address: data.address || '',
          gender: data.gender || '',
          profileType: data.profileType || DEFAULT_PROFILE.profileType,
          rank: data.rank || DEFAULT_PROFILE.rank,
          role: data.role || DEFAULT_PROFILE.role,
          xpProgress: DEFAULT_PROFILE.xpProgress,
          missions: DEFAULT_PROFILE.missions,
          achievements: DEFAULT_PROFILE.achievements,
        };
        setProfile(normalized);
        setFormData({
          nome: normalized.name,
          email: normalized.email,
          telefone: formatPhoneDisplay(normalized.phone),
          dataNascimento: formatDateDisplay(normalized.birthday),
          nacionalidade: normalized.nationality,
          endereco: normalized.address,
          genero: normalized.gender,
        });
      } catch (_err) {
        // ignore, keep defaults
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [userId]);

  const handleSave = async () => {
    try {
      if (!userId) {
        setIsEditing(false);
        return;
      }
      const payload = {
        fullName: formData.nome,
        email: formData.email,
        phone: formData.telefone,
        birthDate: normalizeDateForApi(formData.dataNascimento),
        nationality: formData.nacionalidade,
        address: formData.endereco,
        gender: formData.genero,
      };
      const res = await fetch(apiUrl(`/api/users/${userId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      const data = await res.json();
      setProfile((prev) => ({
        ...prev,
        name: data.fullName || prev.name,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        birthday: data.birthDate || prev.birthday,
        nationality: data.nationality || prev.nationality,
        address: data.address || prev.address,
        gender: data.gender || prev.gender,
        profileType: data.profileType || prev.profileType,
      }));
      setIsEditing(false);
    } catch (_err) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      nome: profile.name,
      email: profile.email,
      telefone: profile.phone ? formatPhoneDisplay(profile.phone) : '',
      dataNascimento: profile.birthday ? formatDateDisplay(profile.birthday) : '',
      nacionalidade: profile.nationality,
      endereco: profile.address,
      genero: profile.gender || '',
    });
  };

  return (
    <motion.div
      className="min-h-screen pb-8"
      style={{
        background: theme.background,
        fontFamily: 'Montserrat, sans-serif',
        maxWidth: '430px',
        margin: '0 auto',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        className="sticky top-0 z-40 px-4 py-4 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(13, 13, 13, 0.95)' }}
      >
        <button
          onClick={onNavigateToSettings}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ color: theme.textPrimary, border: `1px solid ${theme.border}` }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ color: theme.textPrimary, fontWeight: 700 }}>Meu Perfil</h1>
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ color: theme.textPrimary, border: `1px solid ${theme.border}` }}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="px-4 py-6 space-y-6">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div
            className="rounded-full overflow-hidden flex items-center justify-center"
            style={{ width: '92px', height: '92px', border: `2px solid ${theme.border}`, padding: '4px' }}
          >
            <img src={logoImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />
          </div>

          <div className="flex flex-col items-center gap-1">
            <p style={{ color: theme.textPrimary, fontWeight: 700, fontSize: '20px' }}>{profile.name}</p>
            <span style={{ color: theme.textSecondary, fontSize: '13px' }}>{profile.role}</span>
          </div>

          <div
            className="px-4 py-2 rounded-full"
            style={{ border: `1px solid ${theme.border}`, color: theme.accent, fontWeight: 600 }}
          >
            {profile.rank}
          </div>

          <div className="w-full max-w-[280px]">
            <div className="flex items-center justify-between" style={{ color: theme.textSecondary, fontSize: '11px' }}>
              <span>XP Progress</span>
              <span style={{ color: theme.accent }}>{profile.xpProgress}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '999px', background: theme.border, marginTop: '8px' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile.xpProgress}%` }}
                transition={{ duration: 0.8 }}
                style={{ height: '6px', borderRadius: '999px', background: theme.accent }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {['Conquistas', 'Missões concluídas'].map((title, index) => (
            <div
              key={title}
              className="rounded-2xl text-center p-4"
              style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
            >
              <p style={{ color: theme.accent, fontWeight: 700, fontSize: '22px' }}>
                {index === 0 ? profile.achievements.filter((a) => a.earned).length : 25}
              </p>
              <p style={{ color: theme.textSecondary, fontSize: '13px' }}>{title}</p>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: theme.textPrimary, fontWeight: 700 }}>Dados de cadastro</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg flex items-center gap-2"
                style={{ background: theme.accent, color: '#fff', fontWeight: 700 }}
              >
                <Edit2 size={16} /> Editar
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="read"
                className="space-y-3 rounded-2xl p-4"
                style={{ border: `1px solid ${theme.border}`, background: theme.surface }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[
                  {
                    label: profile.profileType === 'business' ? 'Razão social' : 'Nome',
                    value: formData.nome || '—',
                    icon: Mail,
                  },
                  { label: 'E-mail', value: formData.email || '—', icon: Mail },
                  { label: 'Telefone', value: formData.telefone || '—', icon: Phone },
                  {
                    label: profile.profileType === 'business' ? 'Data de abertura' : 'Data de nascimento',
                    value: formData.dataNascimento || '—',
                    icon: CalendarIcon,
                  },
                  {
                    label: profile.profileType === 'business' ? 'País de constituição' : 'Nacionalidade',
                    value: formData.nacionalidade || '—',
                    icon: null,
                  },
                  {
                    label: profile.profileType === 'business' ? 'Natureza jurídica' : 'Gênero',
                    value: formData.genero || '—',
                    icon: null,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.05)] pb-2 last:border-b-0">
                      {Icon ? <Icon size={18} color={theme.textSecondary} /> : <div style={{ width: 18 }} />}
                      <div>
                        <p style={{ color: theme.textSecondary, fontSize: '11px', letterSpacing: '0.5px' }}>{item.label}</p>
                        <p style={{ color: theme.textPrimary, fontWeight: 600 }}>{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                className="space-y-3 rounded-2xl p-4"
                style={{ border: `1px solid ${theme.border}`, background: theme.surface }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[
                  {
                    label: profile.profileType === 'business' ? 'Razão social' : 'Nome',
                    value: formData.nome,
                    key: 'nome',
                    type: 'text',
                  },
                  { label: 'E-mail', value: formData.email, key: 'email', type: 'email' },
                  { label: 'Telefone', value: formData.telefone, key: 'telefone', type: 'text' },
                  {
                    label: profile.profileType === 'business' ? 'Data de abertura' : 'Data de nascimento',
                    value: normalizeDateForApi(formData.dataNascimento),
                    key: 'dataNascimento',
                    type: 'date',
                  },
                  {
                    label: profile.profileType === 'business' ? 'País de constituição' : 'Nacionalidade',
                    value: formData.nacionalidade,
                    key: 'nacionalidade',
                    type: 'text',
                  },
                  {
                    label: profile.profileType === 'business' ? 'Natureza jurídica' : 'Gênero',
                    value: formData.genero,
                    key: 'genero',
                    type: 'text',
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <p style={{ color: theme.textSecondary, fontSize: '11px', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      {field.label}
                    </p>
                    <input
                      type={field.type}
                      value={field.value || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: field.type === 'date' ? formatDateDisplay(e.target.value) : e.target.value })}
                      style={{
                        width: '100%',
                        borderRadius: '10px',
                        border: `1px solid ${theme.border}`,
                        background: theme.background,
                        color: theme.textPrimary,
                        padding: '10px 12px',
                      }}
                    />
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    style={{
                      flex: 1,
                      borderRadius: '12px',
                      background: theme.accent,
                      color: '#fff',
                      fontWeight: 700,
                      padding: '12px 0',
                    }}
                  >
                    Salvar
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      flex: 1,
                      borderRadius: '12px',
                      border: `1px solid ${theme.border}`,
                      color: theme.textPrimary,
                      padding: '12px 0',
                      fontWeight: 600,
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
          <button
            onClick={onChangePassword}
            className="w-full py-3 rounded-xl mb-3"
            style={{ background: theme.accentSoft, color: theme.accent, fontWeight: 700 }}
          >
            Alterar senha
          </button>
          {loadingProfile && (
            <p style={{ color: theme.textSecondary, fontSize: '12px', textAlign: 'center' }}>Sincronizando perfil...</p>
          )}
          <p style={{ color: theme.textSecondary, fontSize: '12px', textAlign: 'center' }}>My Spy v1.0.0</p>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileScreen;

