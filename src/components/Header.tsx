import React, { useState } from 'react';
import { 
  Wine, 
  Zap, 
  Users, 
  Package, 
  FileSpreadsheet, 
  CircleDollarSign, 
  Target, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  LogOut,
  AlertCircle,
  Home,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { User } from '../types';
import { SYSTEM_USERS } from '../services/storage';

interface HeaderProps {
  activeTab: 'home' | 'pos' | 'tabs' | 'inventory' | 'kardex' | 'accounting' | 'reservations';
  setActiveTab: (tab: 'home' | 'pos' | 'tabs' | 'inventory' | 'kardex' | 'accounting' | 'reservations') => void;
  activeUser: User;
  onSwitchUser: (user: User) => void;
  openTabsCount: number;
  lowStockCount: number;
  onToggleSlideBar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeUser,
  onSwitchUser,
  openTabsCount,
  lowStockCount,
  onToggleSlideBar,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getModuleTitle = () => {
    switch (activeTab) {
      case 'pos':
        return { label: 'Boleo Rápido / POS', icon: Zap };
      case 'tabs':
        return { label: 'Cuentas & Clientes', icon: Users };
      case 'inventory':
        return { label: 'Inventario de Licores', icon: Package };
      case 'kardex':
        return { label: 'Kardex & Auditoría', icon: FileSpreadsheet };
      case 'accounting':
        return { label: 'Contabilidad & Gastos', icon: CircleDollarSign };
      case 'reservations':
        return { label: 'Tejo & Bolirana', icon: Target };
      default:
        return { label: 'Página Principal', icon: Home };
    }
  };

  const currentMod = getModuleTitle();
  const CurrentIcon = currentMod.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strictly compliant Top Bar Contract: 3 zones separated by gap-8 */}
        <div className="flex items-center justify-between gap-4 sm:gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 shrink-0 text-left cursor-pointer hover:opacity-90 transition-opacity"
            title="Ir a Página Principal"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-600/10 to-zinc-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Wine className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-wide text-zinc-100 font-display flex items-center gap-2">
                AURA
                <span className="text-zinc-600 font-normal">/</span>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-medium">Licorera & Lounge</span>
              </span>
            </div>
          </button>

          {/* Zone 2: Empty on Home; Slide Bar & Navigation Trigger when inside any module */}
          <div className="flex items-center gap-2">
            {activeTab !== 'home' && (
              <div className="flex items-center gap-2">
                {/* Button to open Slide Bar */}
                <button
                  onClick={onToggleSlideBar}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  title="Abrir Slide Bar con todos los módulos"
                >
                  <Menu className="w-4 h-4 text-amber-400" />
                  <span>Módulos</span>
                  {(openTabsCount > 0 || lowStockCount > 0) && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>

                {/* Current module badge */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                  <CurrentIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">{currentMod.label}</span>
                </div>

                {/* Quick back to Home button */}
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs transition-colors cursor-pointer"
                  title="Volver a la Página Principal"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Inicio</span>
                </button>
              </div>
            )}
          </div>

          {/* Zone 3: Actions & Active User (Single-line controls) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* User switcher dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-semibold text-[11px] border border-amber-500/30">
                  {activeUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-medium text-zinc-200 leading-tight">{activeUser.name}</div>
                  <div className="text-[10px] text-zinc-500 capitalize">{activeUser.roleTitle}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                    <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Cambiar de Perfil / Rol</p>
                    <p className="text-xs text-zinc-200 font-semibold">{activeUser.name}</p>
                    <p className="text-[11px] text-amber-400">{activeUser.roleTitle}</p>
                  </div>

                  <div className="space-y-1">
                    {SYSTEM_USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSwitchUser(user);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                          activeUser.id === user.id
                            ? 'bg-amber-500/10 text-amber-300 font-medium border border-amber-500/20'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-left">
                          <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-[10px] text-zinc-500">{user.roleTitle}</div>
                          </div>
                        </div>
                        {activeUser.id === user.id && (
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar menú</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
