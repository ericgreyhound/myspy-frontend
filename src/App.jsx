import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { LoginScreen } from './components/LoginScreen.jsx';
import { SignUpScreen } from './components/SignUpScreen.jsx';
import { HomeScreen } from './components/HomeScreen.jsx';
import { SettingsScreen } from './components/SettingsScreen.jsx';
import UserProfileScreen from './components/UserProfileScreen.jsx';
import ChangePasswordScreen from './components/ChangePasswordScreen.jsx';
import ForgotPasswordEmailScreen from './components/ForgotPasswordEmailScreen.jsx';
import ResetPasswordCodeScreen from './components/ResetPasswordCodeScreen.jsx';
import WizardFlow from './components/WizardFlow.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import { UserProfileProvider } from './context/userProfileContext.jsx';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null); // { id, fullName, email }
  const [prevScreen, setPrevScreen] = useState(null);
  const [resetEmail, setResetEmail] = useState('');
  const [settingsReturnScreen, setSettingsReturnScreen] = useState('home');

  const goToSettings = (from) => {
    setSettingsReturnScreen(from);
    setCurrentScreen('settings');
  };

  const handleAdminLogin = () => {
    setUser({
      id: 'admin-mock-id',
      fullName: 'Administrador',
      email: 'admin@evot.com.br',
      profileType: 'admin',
    });
    setCurrentScreen('admin');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1b1715' }}>
      <div className="w-full max-w-[430px] min-h-screen">
        <UserProfileProvider initialUserId={user?.id}>
        <AnimatePresence mode="wait">
          {currentScreen === 'login' && (
            <LoginScreen 
              key="login"
              onNavigateToSignUp={() => setCurrentScreen('signup')}
              onNavigateToHome={() => setCurrentScreen('home')}
              onUserAuthenticated={(u) => setUser(u)}
              onForgotPassword={() => {
                setPrevScreen('login');
                setCurrentScreen('forgotPassword');
              }}
              onAdminLogin={handleAdminLogin}
            />
          )}
          {currentScreen === 'signup' && (
            <SignUpScreen 
              key="signup"
              onNavigateToLogin={() => setCurrentScreen('login')} 
              onNavigateToHome={() => setCurrentScreen('home')}
              onUserCreated={(u) => setUser(u)}
            />
          )}
          {currentScreen === 'home' && (
            <HomeScreen 
              key="home"
              onNavigateToSettings={() => goToSettings('home')}
              onNavigateToProfile={() => setCurrentScreen('profile')}
              onNavigateToWizard={() => setCurrentScreen('wizard')}
              userFullName={user?.fullName}
              userId={user?.id}
            />
          )}
          {currentScreen === 'settings' && (
            <SettingsScreen 
              key="settings"
              onNavigateBack={() => setCurrentScreen(settingsReturnScreen)}
              onNavigateToProfile={() => setCurrentScreen('profile')}
              onLogout={handleLogout}
            />
          )}
          {currentScreen === 'wizard' && (
            <WizardFlow
              key="wizard"
              userId={user?.id}
              profileType={user?.profileType}
              onDone={() => setCurrentScreen('home')}
            />
          )}
          {currentScreen === 'profile' && (
            <UserProfileScreen 
              key="profile"
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              onNavigateToSettings={() => setCurrentScreen('settings')}
              onChangePassword={() => { setPrevScreen('profile'); setCurrentScreen('changePassword'); }}
              userFullName={user?.fullName}
              userEmail={user?.email}
              userId={user?.id}
            />
          )}
          {currentScreen === 'changePassword' && (
            <ChangePasswordScreen
              key="changePassword"
              mode={prevScreen === 'login' ? 'login' : 'profile'}
              userId={user?.id}
              onBack={() => setCurrentScreen(prevScreen || 'profile')}
              onDone={() => setCurrentScreen(prevScreen || 'profile')}
            />
          )}
          {currentScreen === 'forgotPassword' && (
            <ForgotPasswordEmailScreen
              key="forgotPassword"
              onBack={() => setCurrentScreen('login')}
              onNext={(email) => { setResetEmail(email); setCurrentScreen('resetPassword'); }}
            />
          )}
          {currentScreen === 'resetPassword' && (
            <ResetPasswordCodeScreen
              key="resetPassword"
              email={resetEmail}
              onBackToLogin={() => setCurrentScreen('login')}
            />
          )}
          {currentScreen === 'admin' && (
            <AdminDashboard
              key="admin"
              onNavigateToSettings={() => goToSettings('admin')}
              userFullName={user?.fullName}
            />
          )}
        </AnimatePresence>
        </UserProfileProvider>
      </div>
    </div>
  );
}


