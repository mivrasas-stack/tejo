import React from 'react';
import { 
  Home, 
  Zap, 
  Users, 
  Package, 
  FileSpreadsheet, 
  CircleDollarSign, 
  Target, 
  X, 
  ChevronLeft, 
  Wine, 
  AlertCircle, 
  ChevronRight,
  PanelLeftOpen,
  PanelLeftClose,
  ShieldCheck,
  Trophy
} from 'lucide-react';
import { User } from '../types';

interface SlideBarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  activeTab: 'home' | 'pos' | 'tabs' | 'inventory' | 'kardex' | 'accounting' | 'reservations' | 'users' | 'championships';
  onSelectTab: (tab: 'home' | 'pos' | 'tabs' | 'inventory' | 'kardex' | 'accounting' | 'reservations' | 'users' | 'championships') => void;
  openTabsCount: number;
  lowStockCount: number;
  activeGamesCount: number;
  activeUser: User;
  onOpenUserModal: () => void;
}

export const SlideBar: React.FC<SlideBarProps> = ({
  isOpen,
  onClose,
  onToggle,
  activeTab,
  onSelectTab,
  openTabsCount,
  lowStockCount,
  activeGamesCount,
  activeUser,
  onOpenUserModal,
}) => {
  const menuItems = [
    {
      id: 'pos' as const,
      label: 'Boleo Rápido / POS',
      sublabel: 'Ventas directas en mostrador',
      icon: Zap,
      iconStyle: 'bg-amber-500/15 border-amber-500/35 text-amber-400',
    },
    {
      id: 'tabs' as const,
      label: 'Cuentas & Clientes',
      sublabel: 'Comandas y consumo en mesa',
      icon: Users,
      badge: openTabsCount > 0 ? openTabsCount : undefined,
      iconStyle: 'bg-sky-500/15 border-sky-500/35 text-sky-400',
    },
    {
      id: 'inventory' as const,
      label: 'Inventario de Licores',
      sublabel: 'Catálogo de botellas y stock',
      icon: Package,
      warning: lowStockCount > 0 ? lowStockCount : undefined,
      iconStyle: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400',
    },
    {
      id: 'kardex' as const,
      label: 'Kardex & Auditoría',
      sublabel: 'Movimientos y saldo continuo',
      icon: FileSpreadsheet,
      iconStyle: 'bg-teal-500/15 border-teal-500/35 text-teal-400',
    },
    {
      id: 'accounting' as const,
      label: 'Contabilidad & Gastos',
      sublabel: 'Márgenes de ganancia y egresos',
      icon: CircleDollarSign,
      iconStyle: 'bg-violet-500/15 border-violet-500/35 text-violet-400',
    },
    {
      id: 'reservations' as const,
      label: 'Tejo & Bolirana',
      sublabel: 'Pistas en juego y reservas',
      icon: Target,
      infoBadge: activeGamesCount > 0 ? `${activeGamesCount} en juego` : undefined,
      iconStyle: 'bg-rose-500/15 border-rose-500/35 text-rose-400',
    },
    {
      id: 'championships' as const,
      label: 'Campeonatos Tejo & Bolirana',
      sublabel: 'Torneos por puntos, A Balazos y Rana',
      icon: Trophy,
      infoBadge: 'Torneos',
      iconStyle: 'bg-amber-500/15 border-amber-500/35 text-amber-400',
    },
    {
      id: 'users' as const,
      label: 'Usuarios & Administradores',
      sublabel: 'Crear usuarios, claves y roles',
      icon: ShieldCheck,
      iconStyle: 'bg-indigo-500/15 border-indigo-500/35 text-indigo-400',
    },
  ];

  return (
    <>
      {/* Left-side floating toggle button when SlideBar is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-0 top-24 z-40 flex items-center gap-2 pl-2.5 pr-3.5 py-3 rounded-r-2xl bg-zinc-900/95 hover:bg-zinc-800 text-amber-300 border border-l-0 border-amber-500/40 shadow-2xl backdrop-blur-xl transition-all hover:pl-4 cursor-pointer group"
          title="Abrir menú lateral"
        >
          <PanelLeftOpen className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-wide text-zinc-100 hidden sm:inline">
            Menú
          </span>
          {(openTabsCount > 0 || lowStockCount > 0) && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      )}

      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

      {/* Slide-out Sidebar Panel on the Left */}
      {isOpen && (
        <aside className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-zinc-950/95 border-r border-zinc-800/90 backdrop-blur-2xl shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200 font-sans">
          {/* Lateral Close Handle on the edge of the open SlideBar */}
          <button
            onClick={onClose}
            className="absolute -right-11 top-24 flex items-center justify-center w-11 h-11 rounded-r-2xl bg-zinc-900/95 hover:bg-zinc-800 text-amber-400 border border-l-0 border-amber-500/40 shadow-xl cursor-pointer transition-colors"
            title="Cerrar menú lateral"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>

          {/* Top Header */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-600/10 to-zinc-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Wine className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-zinc-100 font-display flex items-center gap-1.5">
                  AURA
                  <span className="text-zinc-600 font-normal">/</span>
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-medium">Slide Bar</span>
                </span>
                <p className="text-[10px] text-zinc-500">Módulos del Sistema</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Cerrar barra lateral"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Quick Button: VOLVER AL INICIO */}
          <div className="p-3">
            <button
              onClick={() => {
                onSelectTab('home');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-zinc-900 border border-amber-500/30 text-amber-300 hover:border-amber-500/60 hover:bg-amber-500/25 transition-all shadow-md group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 group-hover:scale-105 transition-transform">
                  <Home className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-zinc-100 block group-hover:text-amber-200">
                    Página Principal
                  </span>
                  <span className="text-[10px] text-zinc-400">Ver todos los 4 módulos</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Section List: MÓDULOS */}
          <div className="px-3 py-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-3 py-1.5">
              Navegación entre Módulos
            </div>

            <div className="space-y-1 mt-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold shadow-inner'
                        : 'text-zinc-300 hover:bg-zinc-900/80 hover:text-zinc-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${item.iconStyle}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className={`font-medium truncate ${isActive ? 'text-amber-200 font-semibold' : 'text-zinc-200'}`}>
                          {item.label}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">{item.sublabel}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 tabular-nums">
                          {item.badge}
                        </span>
                      )}
                      {item.warning !== undefined && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 tabular-nums flex items-center gap-0.5">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {item.warning}
                        </span>
                      )}
                      {item.infoBadge && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {item.infoBadge}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950">
          <div 
            onClick={() => {
              onOpenUserModal();
              onClose();
            }}
            className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs cursor-pointer hover:bg-zinc-850 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                {activeUser.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-semibold text-zinc-200 text-xs leading-tight">{activeUser.name}</div>
                <div className="text-[10px] text-amber-400 capitalize">{activeUser.roleTitle}</div>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500 hover:text-zinc-300">Cambiar</span>
          </div>
        </div>
      </aside>
      )}
    </>
  );
};
