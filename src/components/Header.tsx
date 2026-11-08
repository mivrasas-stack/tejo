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
  ChevronLeft,
  Sun,
  Moon,
  Trophy
} from 'lucide-react';
import { User } from '../types';
import { SYSTEM_USERS } from '../services/storage';

interface HeaderProps {
  activeTab: 'home' | 'pos' | 'tabs' | 'inventory' | 'kardex' | 'accounting' | 'reservations' | 'users' | 'championships';
  setActiveTab: (tab: 'home' | 'pos' | 'tabs' | 'inventory' | 'kardex' | 'accounting' | 'reservations' | 'users' | 'championships') => void;
  activeUser: User;
  onSwitchUser: (user: User) => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  openTabsCount: number;
  lowStockCount: number;
  onToggleSlideBar: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeUser,
  onSwitchUser,
  onOpenLoginModal,
  onLogout,
  openTabsCount,
  lowStockCount,
  onToggleSlideBar,
  theme,
  onToggleTheme,
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
      case 'championships':
        return { label: 'Campeonatos Tejo & Bolirana', icon: Trophy };
      case 'users':
        return { label: 'Usuarios & Administradores', icon: ShieldCheck };
      default:
        return { label: 'Página Principal', icon: Home };
    }
  };

  const currentMod = getModuleTitle();
  const CurrentIcon = currentMod.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Strictly compliant Top Bar Contract: 3 zones separated by gap-8 */}
        <div className="flex items-center justify-between gap-2 sm:gap-6 h-14 sm:h-16">
          {/* Left Zone: Navigation controls + Brand wordmark on the left side (never in the middle) */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {/* Button to open/close Slide Bar always on the far left */}
            <button
              onClick={onToggleSlideBar}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm shrink-0"
              title="Abrir o cerrar Slide Bar"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span>Módulos</span>
              {(openTabsCount > 0 || lowStockCount > 0) && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {activeTab !== 'home' && (
              <>
                {/* Quick back to Home button on the left */}
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs transition-colors cursor-pointer shrink-0"
                  title="Volver a la Página Principal"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Inicio</span>
                </button>

                {/* Current module badge on the left */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 shrink-0">
                  <CurrentIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">{currentMod.label}</span>
                </div>
              </>
            )}

            <div className="h-5 w-px bg-zinc-800 hidden sm:block shrink-0" />

            <button 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 shrink-0 text-left cursor-pointer hover:opacity-90 transition-opacity"
              title="Ir a Página Principal"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-600/10 to-zinc-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Wine className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold tracking-wide text-zinc-100 font-display flex items-center gap-1.5">
                  AURA
                  <span className="text-zinc-600 font-normal">/</span>
                  <span className="text-[11px] uppercase tracking-widest text-amber-400 font-medium">Licorera & Lounge</span>
                </span>
              </div>
            </button>
          </div>

          {/* Right Zone: Championships Button, Users Module Button, Theme Toggle & Active User */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Direct Quick Button to Championships Module */}
            <button
              onClick={() => setActiveTab('championships')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                activeTab === 'championships'
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/35'
              }`}
              title="Abrir Campeonatos de Tejo y Bolirana"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden md:inline">Campeonatos</span>
            </button>

            {/* Direct Quick Button to Users Management Module */}
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                activeTab === 'users'
                  ? 'bg-indigo-500 text-white border-indigo-400'
                  : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/35'
              }`}
              title="Administrar Usuarios y Roles"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden md:inline">Usuarios</span>
            </button>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-all cursor-pointer shadow-sm"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline">Oscuro</span>
                </>
              )}
            </button>

            {/* User switcher dropdown & Direct Logout */}
            <div className="relative flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-semibold text-[11px] border border-amber-500/30">
                  {activeUser.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="font-medium text-zinc-200 leading-tight">{activeUser.name}</div>
                  <div className="text-[10px] text-zinc-500 capitalize">{activeUser.roleTitle}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                    <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Sesión Activa</p>
                    <p className="text-xs text-zinc-200 font-semibold">{activeUser.name}</p>
                    <p className="text-[11px] text-amber-400">{activeUser.roleTitle}</p>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab('users');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-indigo-300 hover:bg-indigo-500/15 transition-colors cursor-pointer font-semibold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Gestionar Usuarios & Claves</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenLoginModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cambiar de Usuario / Turno</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
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
