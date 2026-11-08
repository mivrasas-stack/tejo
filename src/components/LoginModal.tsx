import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wine, 
  Lock, 
  KeyRound, 
  UserCheck, 
  ChevronRight, 
  X,
  AlertCircle
} from 'lucide-react';
import { User, UserRole } from '../types';
import { SYSTEM_USERS } from '../services/storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<User>(currentUser);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      setPinError(false);

      if (next.length === 4) {
        if (next === selectedUser.pin) {
          onSelectUser(selectedUser);
          onClose();
          setPinInput('');
        } else {
          setPinError(true);
          setTimeout(() => {
            setPinInput('');
            setPinError(false);
          }, 800);
        }
      }
    }
  };

  const handleQuickLogin = (user: User) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Lockup */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-600/10 to-zinc-900 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <Wine className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 font-display">AURA Licorera & Lounge</h2>
          <p className="text-xs text-zinc-400">Control de Acceso y Selección de Rol de Operación</p>
        </div>

        {/* Users Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Seleccionar Perfil / Empleado:
          </label>
          <div className="space-y-1.5">
            {SYSTEM_USERS.map((u) => {
              const isSelected = selectedUser.id === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    setPinInput('');
                    setPinError(false);
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

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono">PIN: {u.pin}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin(u);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-200 transition-colors"
                    >
                      Acceso Rápido
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIN Pad Simulator */}
        <div className="space-y-3 pt-2 border-t border-zinc-800">
          <div className="text-center">
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Ingresa el PIN de seguridad (4 dígitos)
            </label>
            {/* PIN Dots */}
            <div className="flex justify-center items-center gap-3">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                      pinError
                        ? 'bg-rose-500 scale-110'
                        : filled
                        ? 'bg-amber-400 scale-110'
                        : 'bg-zinc-800 border border-zinc-700'
                    }`}
                  />
                );
              })}
            </div>
            {pinError && (
              <p className="text-xs text-rose-400 mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>PIN incorrecto. Intenta de nuevo.</span>
              </p>
            )}
          </div>

          {/* Num pad */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'C') {
                    setPinInput('');
                    setPinError(false);
                  } else if (key === '✓') {
                    if (pinInput === selectedUser.pin) {
                      onSelectUser(selectedUser);
                      onClose();
                    } else {
                      setPinError(true);
                    }
                  } else {
                    handleDigit(key);
                  }
                }}
                className={`h-11 rounded-xl text-sm font-mono font-bold transition-all ${
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
    </div>
  );
};
