import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Moon, Sun, Phone, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "motion/react";
import logoImage from "figma:asset/e5b6946d364d3f97bc93d1ee8c185d77858727d0.png";
import noImage from "../assets/no-image.jpeg";
import { apiUrl } from "../apiClient";

export function SignUpScreen({ onNavigateToLogin, onNavigateToHome, onUserCreated }) {
  const [name, setName] = useState("");
  const [taxIdMasked, setTaxIdMasked] = useState("");
  const [taxIdDigits, setTaxIdDigits] = useState("");
  const [taxIdType, setTaxIdType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessImage, setBusinessImage] = useState("");
  const [businessImagePreview, setBusinessImagePreview] = useState(noImage);

  const detectTaxType = (digits) => {
    if (digits.length !== 9) return "";
    const first = digits[0];
    if (["5", "6", "8", "9"].includes(first)) return "NIPC";
    if (["1", "2", "3"].includes(first)) return "NIF";
    return "";
  };

  const formatTaxId = (digits) => {
    if (!digits) return "";
    const parts = [];
    for (let i = 0; i < digits.length; i += 3) {
      parts.push(digits.slice(i, i + 3));
    }
    return parts.join(" ").trim();
  };

  const handleTaxIdChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 9);
    setTaxIdDigits(digits);
    setTaxIdMasked(formatTaxId(digits));
    setTaxIdType(detectTaxType(digits));
  };

  const digitsOnly = (value = "") => value.replace(/\D/g, "");

  const formatPhoneDisplay = (raw = "") => {
    const digits = digitsOnly(raw).slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, digits.length - 4)}-${digits.slice(-4)}`;
  };

  const formatDateDisplay = (value = "") => {
    const digits = digitsOnly(value).slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const normalizeDateForApi = (value = "") => {
    if (!value) return "";
    const [dd, mm, yyyy] = value.split("/");
    if (dd && mm && yyyy) return `${yyyy}-${mm}-${dd}`;
    return value;
  };

  const handlePhoneChange = (event) => {
    const next = formatPhoneDisplay(event.target.value);
    setPhone(next);
  };

  const handleBirthDateChange = (event) => {
    const next = formatDateDisplay(event.target.value);
    setBirthDate(next);
  };

  const handleBusinessImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setBusinessImage("");
      setBusinessImagePreview(noImage);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setBusinessImage(result);
        setBusinessImagePreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    const isBusiness = taxIdType === "NIPC";
    if (!taxIdDigits || taxIdDigits.length !== 9) {
      setError("Indique um NIF ou NIPC válido com 9 dígitos.");
      return;
    }
    if (!taxIdType) {
      setError("Não conseguimos identificar se é NIF ou NIPC. Confirme o número.");
      return;
    }
    if (!name || !email || !password || !phone || (!isBusiness && !birthDate)) {
      setError(
        isBusiness
          ? "Preencha todos os campos obrigatórios, incluindo telefone."
          : "Preencha todos os campos obrigatórios, incluindo telefone e data de nascimento."
      );
      return;
    }
    try {
      setLoading(true);
      const payload = {
        fullName: name,
        email,
        password,
        taxId: taxIdDigits,
        phone: digitsOnly(phone),
        ...(isBusiness ? {} : { birthDate: normalizeDateForApi(birthDate) }),
        ...(isBusiness ? { image: businessImage || noImage } : {}),
      };
      const res = await fetch(apiUrl("/api/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Erro ${res.status}`);
      }
      const data = await res.json();
      if (onUserCreated) {
        onUserCreated({
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          taxId: data.taxId,
          taxIdType: data.taxIdType,
          profileType: data.profileType,
        });
      }
      // sucesso: direciona para Home
      if (onNavigateToHome) onNavigateToHome();
    } catch (err) {
      setError(err.message || "Falha ao criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    background: isDarkMode ? "#1b1715" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#1b1715",
    inputBg: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#f3f3f3",
    inputBorder: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "#dcdcdc",
    inputText: isDarkMode ? "#ffffff" : "#1b1715",
    placeholderText: isDarkMode ? "#9ca3af" : "#6b7280",
    iconColor: isDarkMode ? "#9ca3af" : "#6b7280",
    primaryButton: "#e10209",
    primaryButtonHover: isDarkMode ? "rgba(225, 2, 9, 0.9)" : "#c10108",
    secondaryLink: isDarkMode ? "#b6019a" : "#e10209",
    linkColor: isDarkMode ? "#9ca3af" : "#6b7280",
    linkHoverColor: isDarkMode ? "#ffffff" : "#1b1715",
    toggleBg: isDarkMode ? "#1b1715" : "#f5f5f5",
    toggleBorder: isDarkMode ? "#2a2a2a" : "#e0e0e0",
    toggleIcon: isDarkMode ? "#ffffff" : "#1b1715",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backgroundColor: theme.background }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col items-center justify-center min-h-screen px-8 relative overflow-hidden"
    >
      <motion.div
        className="absolute top-10 right-8 w-40 h-40 rounded-full blur-3xl"
        animate={{ opacity: isDarkMode ? 0.05 : 0.03 }}
        transition={{ duration: 0.4 }}
        style={{ backgroundColor: "#b6019a" }}
      />
      <motion.div
        className="absolute bottom-32 left-8 w-32 h-32 rounded-full blur-2xl"
        animate={{ opacity: isDarkMode ? 0.05 : 0.03 }}
        transition={{ duration: 0.4 }}
        style={{ backgroundColor: "#f9ed06" }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-20 h-20 rotate-45"
        animate={{ opacity: isDarkMode ? 0.05 : 0.03 }}
        transition={{ duration: 0.4 }}
        style={{ backgroundColor: "#e10209" }}
      />

      <motion.button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
        animate={{
          backgroundColor: theme.toggleBg,
          borderColor: theme.toggleBorder,
        }}
        transition={{ duration: 0.4 }}
        style={{ border: "1px solid" }}
      >
        <motion.div
          initial={false}
          animate={{
            rotate: isDarkMode ? 0 : 180,
            color: theme.toggleIcon,
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
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: "22px",
              color: theme.text,
              textAlign: "center",
            }}
          >
            My Spy
          </p>
        </div>

        <form onSubmit={handleSignUp} className="w-full space-y-6">
          {error && (
            <div
              className="w-full rounded-md p-3"
              style={{ backgroundColor: "#201b19", border: "1px solid #3a3a3a", color: "#ffb4b4", fontFamily: "Montserrat, sans-serif" }}
            >
              {error}
            </div>
          )}
          <motion.div
            className="relative w-full"
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <label
              htmlFor="tax-id"
              className="block mb-2 text-sm"
              style={{
                color: theme.placeholderText,
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
              }}
            >
              Identificação fiscal (NIF / NIPC)
            </label>
            <motion.input
              id="tax-id"
              type="text"
              inputMode="numeric"
              value={taxIdMasked}
              onChange={handleTaxIdChange}
              placeholder="000 000 000"
              className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              animate={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              }}
              transition={{ duration: 0.4 }}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.08em",
                '--tw-ring-color': "#b6019a",
              }}
            />
            <div
              className="mt-2 text-xs"
              style={{
                color: taxIdType ? theme.secondaryLink : theme.placeholderText,
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              {taxIdDigits.length === 0 && "Indique 9 dígitos. Identificamos o tipo automaticamente."}
              {taxIdDigits.length > 0 && !taxIdType && "A validar... aguarde até completar os 9 dígitos."}
              {taxIdType &&
                (taxIdType === "NIF"
                  ? "Detectámos NIF — perfil individual (espião)."
                  : "Detectámos NIPC — perfil empresarial (estabelecimento).")}
            </div>
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
            <Phone size={20} />
          </motion.div>
          <motion.input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="Introduza o seu telefone"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
            animate={{
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.inputText,
            }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: "Montserrat, sans-serif",
              "--tw-ring-color": "#b6019a",
            }}
          />
        </motion.div>

        {taxIdType === "NIPC" && (
          <motion.div
            className="w-full rounded-xl border p-4 flex gap-4 items-center"
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.inputText,
            }}
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden border" style={{ borderColor: theme.inputBorder }}>
              <img src={businessImagePreview} alt="Imagem do estabelecimento" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold" style={{ color: theme.inputText, fontFamily: "Montserrat, sans-serif" }}>
                Imagem do estabelecimento (opcional)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleBusinessImageChange}
                className="block w-full text-sm"
                style={{ color: theme.inputText, fontFamily: "Montserrat, sans-serif" }}
              />
              <p className="text-xs" style={{ color: theme.placeholderText, fontFamily: "Montserrat, sans-serif" }}>
                Se não enviar, usaremos a imagem padrão.
              </p>
            </div>
          </motion.div>
        )}

        {taxIdType !== "NIPC" && (
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
              <CalendarIcon size={20} />
            </motion.div>
            <motion.input
              type="text"
              value={birthDate}
              onChange={handleBirthDateChange}
              placeholder="Data de nascimento (dd/mm/aaaa)"
              className="w-full pl-12 pr-12 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              animate={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              }}
              transition={{ duration: 0.4 }}
              style={{
                fontFamily: "Montserrat, sans-serif",
                "--tw-ring-color": "#b6019a",
              }}
            />
          </motion.div>
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
              <User size={20} />
            </motion.div>
            <motion.input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={taxIdType === "NIPC" ? "Introduza a denominação social" : "Introduza o seu nome"}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              animate={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              }}
              transition={{ duration: 0.4 }}
              style={{
                fontFamily: "Montserrat, sans-serif",
                '--tw-ring-color': "#b6019a",
              }}
            />
            <span
              className="absolute left-12 -top-3 text-xs px-1"
              style={{ color: theme.placeholderText, backgroundColor: theme.background, fontFamily: "Montserrat, sans-serif" }}
            >
            </span>
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
              <Mail size={20} />
            </motion.div>
            <motion.input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Introduza o seu email"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              animate={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              }}
              transition={{ duration: 0.4 }}
              style={{
                fontFamily: "Montserrat, sans-serif",
                '--tw-ring-color': "#b6019a",
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
              type={showPassword ? "text" : "password"}
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
                fontFamily: "Montserrat, sans-serif",
                '--tw-ring-color': "#b6019a",
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
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
            }}
            disabled={loading}
          >
            {loading ? "A criar..." : "Criar conta"}
          </motion.button>

          <div className="text-center pt-2">
            <motion.button
              type="button"
              onClick={onNavigateToLogin}
              className="transition-colors hover:underline"
              animate={{ color: theme.secondaryLink }}
              transition={{ duration: 0.4 }}
              style={{
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Já tenho conta
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}


