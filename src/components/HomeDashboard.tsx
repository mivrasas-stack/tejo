import React from 'react';
import { 
  Zap, 
  Users, 
  Package, 
  CircleDollarSign, 
  Target, 
  ArrowUpRight, 
  Wine, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  Product, 
  ClientTab, 
  Reservation, 
  AccountingTransaction, 
  BusinessExpense, 
  GameTrack,
  User 
} from '../types';
import { formatCurrency } from '../services/storage';

interface HomeDashboardProps {
  onNavigate: (tab: 'home' | 'pos' | 'tabs' | 'inventory' | 'kardex' | 'accounting' | 'reservations') => void;
  products: Product[];
  clientTabs: ClientTab[];
  reservations: Reservation[];
  gameTracks: GameTrack[];
  transactions: AccountingTransaction[];
  expenses: BusinessExpense[];
  activeUser: User;
  onQuickCreateTab: (clientName: string, location: string) => void;
}

const QUICK_PRESETS = [
  'Mesa 1',
  'Mesa 2',
  'Mesa 3',
  'Mesa 4',
  'Mesa 5',
  'Mesa 6',
  'Mesa 7',
  'Mesa 8',
  'Barra 1',
  'Barra 2',
  'Barra 3',
  'Terraza VIP',
  'Cancha Tejo 1',
  'Bolirana 1',
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  products,
  clientTabs,
  reservations,
  gameTracks,
  transactions,
  expenses,
  activeUser,
  onQuickCreateTab,
}) => {
  const [quickTabInput, setQuickTabInput] = React.useState('');

  const handleQuickCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTabInput.trim()) return;
    onQuickCreateTab(quickTabInput.trim(), quickTabInput.trim());
    setQuickTabInput('');
  };

  // Calculated live vitals
  const todaySales = transactions
    .filter((tx) => tx.type === 'INGRESO_VENTA')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const openTabs = clientTabs.filter((t) => t.status === 'ABIERTA');
  const openTabsAmount = openTabs.reduce((acc, t) => acc + t.total, 0);

  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock);
  const totalInventoryValue = products.reduce((acc, p) => acc + p.salePrice * p.currentStock, 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const activeGamesCount = gameTracks.filter((t) => t.status === 'EN_JUEGO').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Apple Glass Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/80 via-zinc-950/90 to-zinc-900/60 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Panel de Control Principal
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">
                Turno activo con <strong className="text-zinc-200">{activeUser.name}</strong> ({activeUser.roleTitle})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100 font-display">
              AURA <span className="text-amber-400 font-normal">/</span> Licorera, Lounge & Canchas de Tejo
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Bienvenido al centro de operaciones. Accede directamente a los módulos de gestión con diseño exclusivo Apple Glass, métricas en tiempo real y flujo optimizado.
            </p>
          </div>

          {/* Quick Metrics Bar: Full width, plenty of space, no number overflow */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-4 border-t border-zinc-800/70">
            {/* Ventas Hoy */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block truncate">
                Ventas de Hoy
              </span>
              <div className="mt-1">
                <p 
                  className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-400 font-mono tabular-nums tracking-tight truncate"
                  title={formatCurrency(todaySales)}
                >
                  {formatCurrency(todaySales)}
                </p>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Recaudado en caja</span>
            </div>

            {/* Cuentas Bar */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block truncate">
                Cuentas en Bar
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-300 font-mono tabular-nums tracking-tight">
                  {openTabs.length}
                </span>
                <span className="text-xs text-zinc-500">abiertas</span>
              </div>
              <span className="text-[10px] text-amber-400/80 font-mono mt-1 block truncate">
                {formatCurrency(openTabsAmount)} por cobrar
              </span>
            </div>

            {/* Pistas en Juego */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block truncate">
                Tejo & Boliranas
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400 font-mono tabular-nums tracking-tight">
                  {activeGamesCount}
                </span>
                <span className="text-xs text-zinc-500">en juego</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block truncate">
                {gameTracks.filter((t) => t.status === 'DISPONIBLE').length} pistas libres
              </span>
            </div>

            {/* Alertas de Stock */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block truncate">
                Alertas de Stock
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className={`text-lg sm:text-xl lg:text-2xl font-bold font-mono tabular-nums tracking-tight ${lowStockProducts.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {lowStockProducts.length}
                </span>
                <span className="text-xs text-zinc-500">reordenar</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block truncate">
                {products.length} licores en catálogo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MÓDULO RÁPIDO DE APERTURA DE CUENTAS / MESAS (1 Ó 2 CLICS) */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900/90 to-zinc-950 p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-inner">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span>Abrir Cuenta o Mesa al Instante</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                    1 ó 2 Clics
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Pulsa cualquier mesa libre para abrir comanda en 1 solo clic, o escribe el nombre y abre con [Enter].
                </p>
              </div>
            </div>

            <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
              <span className="text-amber-300 font-semibold">{openTabs.length}</span> cuentas abiertas ahora
            </div>
          </div>

          {/* Input rápido para abrir con 1 Clic o [Enter] */}
          <form onSubmit={handleQuickCustomSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={quickTabInput}
                onChange={(e) => setQuickTabInput(e.target.value)}
                placeholder="Escribe el nombre del cliente o número de mesa (ej. Mesa 5, Familia Gómez, Juan)..."
                className="w-full px-4 py-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={!quickTabInput.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-40 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Abrir Cuenta Ya (1 Clic)</span>
            </button>
          </form>

          {/* Presets de 1 Solo Clic (Mesas y Puntos Frecuentes) */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <span>Mesas y Puntos Directos (Pulsa 1 Clic para Abrir o Ver):</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_PRESETS.map((preset) => {
                const existingTab = openTabs.find(
                  (t) => t.location.toLowerCase() === preset.toLowerCase() || t.clientName.toLowerCase() === preset.toLowerCase()
                );
                const isOccupied = Boolean(existingTab);

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      if (isOccupied && existingTab) {
                        onNavigate('tabs');
                      } else {
                        onQuickCreateTab(preset, preset);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                      isOccupied
                        ? 'bg-zinc-900/90 text-amber-300 border-amber-500/40 hover:bg-zinc-850'
                        : 'bg-zinc-950/70 text-zinc-200 border-zinc-800 hover:border-amber-500/60 hover:text-amber-300 hover:bg-zinc-900'
                    }`}
                  >
                    {isOccupied ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>{preset}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">({formatCurrency(existingTab?.total || 0)})</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{preset}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* The 4 Core Modules in Apple Glass Luxury Cards */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Módulos de Gestión Operativa</span>
            </h2>
            <p className="text-xs text-zinc-500">Selecciona el módulo para ingresar directamente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* MÓDULO 1: BOLEO RÁPIDO (POS) */}
          <div 
            onClick={() => onNavigate('pos')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-6 backdrop-blur-xl hover:border-amber-500/50 hover:bg-zinc-900/70 transition-all duration-300 shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 text-zinc-600 group-hover:text-amber-400 transition-colors">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Punto de Venta Express</span>
                <h3 className="text-xl font-bold text-zinc-100 group-hover:text-amber-200 transition-colors mt-0.5">
                  Boleo Rápido / POS
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Venta ultrarrápida a un toque para mostrador con alto flujo. Cobro exclusivo en Efectivo y Transferencia con cálculo automático de vueltas.
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Total recaudado hoy:</span>
                <span className="text-emerald-400 font-bold tabular-nums">{formatCurrency(todaySales)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-800/50">
              <span className="text-xs font-medium text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Abrir Terminal de Ventas
                <ChevronRight className="w-4 h-4" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                1-Tap Flow
              </span>
            </div>
          </div>

          {/* MÓDULO 2: CUENTAS & CLIENTES */}
          <div 
            onClick={() => onNavigate('tabs')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-6 backdrop-blur-xl hover:border-purple-500/50 hover:bg-zinc-900/70 transition-all duration-300 shadow-xl hover:shadow-purple-500/5 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 text-zinc-600 group-hover:text-purple-400 transition-colors">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Comandas & Clientes</span>
                <h3 className="text-xl font-bold text-zinc-100 group-hover:text-purple-200 transition-colors mt-0.5">
                  Cuentas & Mesas
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Suma de tragos con hora y minuto exacto sin interrumpir con cobros inmediatos. Botón lateral para liquidar solo al finalizar la cuenta (sin propinas).
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Saldo por cobrar:</span>
                <span className="text-purple-300 font-bold tabular-nums">{formatCurrency(openTabsAmount)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-800/50">
              <span className="text-xs font-medium text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Ver {openTabs.length} Comandas Abiertas
                <ChevronRight className="w-4 h-4" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                {openTabs.length} Activas
              </span>
            </div>
          </div>

          {/* MÓDULO 3: INVENTARIO & KARDEX */}
          <div 
            onClick={() => onNavigate('inventory')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-6 backdrop-blur-xl hover:border-emerald-500/50 hover:bg-zinc-900/70 transition-all duration-300 shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 text-zinc-600 group-hover:text-emerald-400 transition-colors">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Stock & Auditoría</span>
                <h3 className="text-xl font-bold text-zinc-100 group-hover:text-emerald-200 transition-colors mt-0.5">
                  Inventario & Kardex
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  CRUD completo de licores (agregar, editar, eliminar), ajustes inmediatos por merma/compra y Kardex continuo con trazabilidad individual por botella.
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Valor en inventario:</span>
                <span className="text-emerald-300 font-bold tabular-nums">{formatCurrency(totalInventoryValue)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-800/50">
              <span className="text-xs font-medium text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Administrar {products.length} Licores
                <ChevronRight className="w-4 h-4" />
              </span>
              {lowStockProducts.length > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {lowStockProducts.length} Reordenar
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Stock Óptimo
                </span>
              )}
            </div>
          </div>

          {/* MÓDULO 4: CONTABILIDAD & GASTOS */}
          <div 
            onClick={() => onNavigate('accounting')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-6 backdrop-blur-xl hover:border-amber-500/50 hover:bg-zinc-900/70 transition-all duration-300 shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 text-zinc-600 group-hover:text-amber-400 transition-colors">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <CircleDollarSign className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Finanzas & Utilidad</span>
                <h3 className="text-xl font-bold text-zinc-100 group-hover:text-amber-200 transition-colors mt-0.5">
                  Contabilidad & Ganancias
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Margen exacto por licor con límite de 10 por página, desglose exclusivo Efectivo/Transferencia y módulo de gastos del negocio (licor extra, nómina, etc.).
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Gastos registrados:</span>
                <span className="text-rose-400 font-bold tabular-nums">-{formatCurrency(totalExpenses)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-800/50">
              <span className="text-xs font-medium text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Ver Márgenes y Gastos
                <ChevronRight className="w-4 h-4" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                10 x Página
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MÓDULO DESTACADO 5: RESERVAS DE CANCHAS DE TEJO & BOLIRANA */}
      <div 
        onClick={() => onNavigate('reservations')}
        className="group relative cursor-pointer overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-r from-zinc-900/60 via-zinc-900/40 to-zinc-950/80 p-6 sm:p-7 backdrop-blur-2xl hover:border-amber-500/50 hover:bg-zinc-900/80 transition-all duration-300 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <Target className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Juegos Tradicionales</span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-400">Canchas de Tejo, Mini Tejo y Boliranas</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-100 group-hover:text-amber-200 transition-colors mt-0.5">
                Canchas de Tejo & Boliranas
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Control en vivo de pistas de tejo y boliranas electrónicas/clásicas, cobro por hora o por chico, reservas con abono y apertura directa de comanda de cerveza y trago.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-zinc-800">
            <div className="text-right">
              <div className="text-xs text-zinc-400 font-mono">
                <strong className="text-amber-300">{activeGamesCount}</strong> de {gameTracks.length} en juego
              </div>
              <div className="text-[11px] text-zinc-500">
                {gameTracks.filter((t) => t.status === 'DISPONIBLE').length} disponibles ahora
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/10 group-hover:bg-amber-400 transition-colors">
              <span>Gestionar Pistas</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
