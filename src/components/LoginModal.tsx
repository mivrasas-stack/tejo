import React, { useState } from 'react';
import { 
  Wine, 
  Lock, 
  KeyRound, 
  UserCheck, 
  X,
  AlertCircle,
  LogIn,
  Eye,
  EyeOff
} from 'lucide-react';
import { User } from '../types';
import { SYSTEM_USERS, storageService } from '../services/storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: User;
  users?: User[];
  onSelectUser: (user: User) => void;
  isFullScreen?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onSelectUser,
  isFullScreen = false,
}) => {
  const availableUsers = users && users.length > 0 ? users : storageService.getUsers();
  const [loginMode, setLoginMode] = useState<'credentials' | 'pin'>('credentials');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>(currentUser || availableUsers[0] || SYSTEM_USERS[0]);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    const matchedUser = availableUsers.find(
      (u) =>
        (u.username?.toLowerCase() === cleanUser ||
          u.email.toLowerCase() === cleanUser ||
          u.name.toLowerCase() === cleanUser) &&
        (u.password === cleanPass || u.pin === cleanPass)
    );

    if (matchedUser) {
      setAuthError(null);
      setUsernameOrEmail('');
      setPasswordInput('');
      onSelectUser(matchedUser);
      if (onClose) onClose();
    } else {
      setAuthError('Usuario o contraseña incorrectos. Verifica tus credenciales.');
    }
  };

  const handleDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      setAuthError(null);

      if (next.length === 4) {
        if (next === selectedUser.pin) {
          onSelectUser(selectedUser);
          setPinInput('');
          if (onClose) onClose();
        } else {
          setAuthError('PIN de 4 dígitos incorrecto.');
          setTimeout(() => {
            setPinInput('');
          }, 700);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-2xl p-4">
      {/* Subtle Apple ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md max-h-[92dvh] overflow-y-auto p-5 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative z-10">
        {!isFullScreen && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Lockup */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-600/10 to-zinc-900 border border-amber-500/35 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <Wine className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-100 font-display tracking-tight">
            AURA <span className="text-amber-400 font-normal">/</span> Licorera & Lounge
          </h2>
          <p className="text-xs text-zinc-400">
            Inicia sesión para ingresar al sistema POS y gestión operativa
          </p>
        </div>

        {/* Mode Switcher: Usuario y Contraseña vs PIN de Turno */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setLoginMode('credentials');
              setAuthError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              loginMode === 'credentials'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Usuario y Clave</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('pin');
              setAuthError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              loginMode === 'pin'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PIN de Turno</span>
          </button>
        </div>

        {loginMode === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Usuario o Correo Electrónico
              </label>
              <input
                type="text"
                autoFocus
                required
                value={usernameOrEmail}
                onChange={(e) => {
                  setUsernameOrEmail(e.target.value);
                  setAuthError(null);
                }}
                placeholder="Ingresa tu usuario o correo..."
                className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Users Selection without exposing PINs */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Selecciona tu Perfil:
              </label>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {availableUsers.map((u) => {
                  const isSelected = selectedUser.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u);
                        setPinInput('');
                        setAuthError(null);
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/60 shadow-md'
                          : 'bg-zinc-950 border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-amber-500 text-zinc-950'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-100">{u.name}</h4>
                          <p className="text-[10px] text-amber-400/90 font-medium">{u.roleTitle}</p>
                        </div>
                      </div>

                      {isSelected && <UserCheck className="w-4 h-4 text-amber-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PIN Pad */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="text-center">
                <label className="text-xs font-semibold text-zinc-300 block mb-2">
                  Ingresa tu PIN de seguridad (4 dígitos)
                </label>
                <div className="flex justify-center items-center gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const filled = pinInput.length > idx;
                    return (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                          authError
                            ? 'bg-rose-500 scale-110'
                            : filled
                            ? 'bg-amber-400 scale-110'
                            : 'bg-zinc-800 border border-zinc-700'
                        }`}
                      />
                    );
                  })}
                </div>
                {authError && (
                  <p className="text-xs text-rose-400 mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{authError}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (key === 'C') {
                        setPinInput('');
                        setAuthError(null);
                      } else if (key === '✓') {
                        if (pinInput === selectedUser.pin) {
                          onSelectUser(selectedUser);
                          if (onClose) onClose();
                        } else {
                          setAuthError('PIN de 4 dígitos incorrecto.');
                        }
                      } else {
                        handleDigit(key);
                      }
                    }}
                    className={`h-11 rounded-xl text-sm font-mono font-bold transition-all cursor-pointer ${
                      key === '✓'
                        ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                        : key === 'C'
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                        : 'bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
