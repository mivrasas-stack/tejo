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
  Plus,
  Minus,
  Search,
  X,
  Trash2,
  Edit3,
  Settings,
  ShieldCheck,
  UserPlus,
  Trophy
} from 'lucide-react';
import { 
  Product, 
  ClientTab, 
  Reservation, 
  AccountingTransaction, 
  BusinessExpense, 
  GameTrack,
  CartItem,
  User 
} from '../types';
import { formatCurrency } from '../services/storage';

interface HomeDashboardProps {
  onNavigate: (tab: 'home' | 'pos' | 'tabs' | 'inventory' | 'kardex' | 'accounting' | 'reservations' | 'users' | 'championships') => void;
  products: Product[];
  clientTabs: ClientTab[];
  tables: string[];
  users?: User[];
  reservations: Reservation[];
  gameTracks: GameTrack[];
  transactions: AccountingTransaction[];
  expenses: BusinessExpense[];
  activeUser: User;
  onQuickCreateTab: (
    clientName: string,
    location: string,
    initialCart?: CartItem[],
    existingTabId?: string
  ) => void;
  onQuickPayTable: (
    clientName: string,
    location: string,
    newCart: CartItem[],
    paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA',
    existingTab?: ClientTab
  ) => void;
  onReleaseTable: (tab: ClientTab) => void;
  onAddTable: (name: string) => void;
  onEditTable: (oldName: string, newName: string) => void;
  onDeleteTable: (name: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  products,
  clientTabs,
  tables,
  users = [],
  reservations,
  gameTracks,
  transactions,
  expenses,
  activeUser,
  onQuickCreateTab,
  onQuickPayTable,
  onReleaseTable,
  onAddTable,
  onEditTable,
  onDeleteTable,
}) => {
  // Quick Table Open Modal State (Consumption + Instant Pay in 1 step)
  const [selectedTableModal, setSelectedTableModal] = React.useState<{
    location: string;
    existingTab?: ClientTab;
  } | null>(null);
  const [modalCart, setModalCart] = React.useState<CartItem[]>([]);
  const [modalSearch, setModalSearch] = React.useState('');
  const [modalCategory, setModalCategory] = React.useState<string>('all');
  const [modalPaymentMethod, setModalPaymentMethod] = React.useState<'EFECTIVO' | 'TRANSFERENCIA'>('EFECTIVO');

  // Table Management CRUD Modal State (Agregar, Editar, Eliminar Mesas)
  const [manageTablesModalOpen, setManageTablesModalOpen] = React.useState(false);
  const [newTableInput, setNewTableInput] = React.useState('');
  const [editingTableTarget, setEditingTableTarget] = React.useState<string | null>(null);
  const [editingTableValue, setEditingTableValue] = React.useState('');

  const openTableQuickModal = (locationName: string) => {
    const existingTab = openTabs.find(
      (t) =>
        t.location.toLowerCase() === locationName.toLowerCase() ||
        t.clientName.toLowerCase() === locationName.toLowerCase()
    );
    setSelectedTableModal({ location: locationName, existingTab });
    setModalCart([]);
    setModalSearch('');
    setModalCategory('all');
    setModalPaymentMethod('EFECTIVO');
  };

  const addDrinkToModalCart = (product: Product) => {
    if (product.currentStock <= 0) return;
    setModalCart((prev) => {
      const found = prev.find((c) => c.product.id === product.id);
      if (found) {
        if (found.quantity >= product.currentStock) return prev;
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateModalCartQty = (productId: string, delta: number) => {
    setModalCart((prev) =>
      prev
        .map((c) => {
          if (c.product.id === productId) {
            const nextQty = c.quantity + delta;
            if (nextQty > c.product.currentStock) return c;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleConfirmOpenTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableModal) return;
    onQuickCreateTab(
      selectedTableModal.location,
      selectedTableModal.location,
      modalCart,
      selectedTableModal.existingTab?.id
    );
    setSelectedTableModal(null);
  };

  const handleQuickPayNow = () => {
    if (!selectedTableModal) return;
    const existingTotal = selectedTableModal.existingTab?.total || 0;
    if (existingTotal + modalOrderSubtotal <= 0) return;

    onQuickPayTable(
      selectedTableModal.location,
      selectedTableModal.location,
      modalCart,
      modalPaymentMethod,
      selectedTableModal.existingTab
    );
    setSelectedTableModal(null);
  };

  const filteredModalProducts = products.filter((p) => {
    const matchesCat = modalCategory === 'all' || p.category === modalCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(modalSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const modalOrderSubtotal = modalCart.reduce(
    (acc, item) => acc + item.product.salePrice * item.quantity,
    0
  );
  const existingTableTotal = selectedTableModal?.existingTab?.total || 0;
  const totalTablePayAmount = existingTableTotal + modalOrderSubtotal;

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
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-zinc-900/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        {/* Vibrant Apple Aurora Studio Glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

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

            {/* Cuentas Bar (Azul Cian) */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-sky-500/20 backdrop-blur-xl flex flex-col justify-between min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block truncate">
                Cuentas en Bar
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-sky-400 font-mono tabular-nums tracking-tight">
                  {openTabs.length}
                </span>
                <span className="text-xs text-zinc-500">abiertas</span>
              </div>
              <span className="text-[10px] text-sky-400/80 font-mono mt-1 block truncate">
                {formatCurrency(openTabsAmount)} por cobrar
              </span>
            </div>

            {/* Pistas en Juego (Rojo Coral) */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-rose-500/20 backdrop-blur-xl flex flex-col justify-between min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block truncate">
                Tejo & Boliranas
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-rose-400 font-mono tabular-nums tracking-tight">
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

      {/* MÓDULO RÁPIDO DE APERTURA DE MESAS (1 SOLO CLIC, SIN PEDIR NOMBRE) */}
      <div className="rounded-3xl border border-amber-400/35 bg-gradient-to-br from-amber-500/12 via-zinc-900/90 to-zinc-950 p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-inner">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span>Mesas y Puntos de Atención al Instante</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                    1 Clic
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Pulsa cualquier mesa para cargar productos o cobrar de inmediato.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-zinc-400 font-mono">
                <span className="text-amber-300 font-semibold">{openTabs.length}</span> mesas ocupadas
              </div>

              <button
                type="button"
                onClick={() => setManageTablesModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/35 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Administrar Mesas</span>
              </button>
            </div>
          </div>

          {/* Grid directo de Mesas (Sin campo de texto de nombre) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
            {tables.map((preset) => {
              const existingTab = openTabs.find(
                (t) =>
                  t.location.toLowerCase() === preset.toLowerCase() ||
                  t.clientName.toLowerCase() === preset.toLowerCase()
              );
              const isOccupied = Boolean(existingTab);

              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => openTableQuickModal(preset)}
                  className={`flex items-center justify-between gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    isOccupied
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/50 hover:bg-amber-500/25 shadow-md shadow-amber-500/5'
                      : 'bg-zinc-950/80 text-zinc-100 border-zinc-800 hover:border-amber-500/60 hover:text-amber-300 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isOccupied ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate">{preset}</span>
                  </div>

                  {isOccupied ? (
                    <span className="text-[11px] text-amber-300 font-mono shrink-0">
                      {formatCurrency(existingTab?.total || 0)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400/80 font-medium shrink-0">
                      Libre
                    </span>
                  )}
                </button>
              );
            })}
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
          {/* MÓDULO 1: BOLEO RÁPIDO (POS) — COLOR NARANJA / ÁMBAR APPLE */}
          <div 
            onClick={() => onNavigate('pos')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] via-zinc-900/70 to-zinc-950 p-6 backdrop-blur-xl hover:border-amber-400/60 hover:from-amber-500/[0.14] transition-all duration-300 shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 text-zinc-600 group-hover:text-amber-400 transition-colors">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
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
                <span className="text-amber-300 font-bold tabular-nums">{formatCurrency(todaySales)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-800/50">
              <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Abrir Terminal de Ventas
                <ChevronRight className="w-4 h-4" />
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                1-Tap Flow
              </span>
            </div>
          </div>

          {/* MÓDULO 2: CUENTAS & CLIENTES — COLOR AZUL CIAN APPLE */}
          <div 
            onClick={() => onNavigate('tabs')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-sky-500/25 bg-gradient-to-br from-sky-500/[0.08] via-zinc-900/70 to-zinc-950 p-6 backdrop-blur-xl hover:border-sky-400/60 hover:from-sky-500/[0.14] transition-all duration-300 shadow-xl hover:shadow-sky-500/10 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 text-zinc-600 group-hover:text-sky-400 transition-colors">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/35 text-sky-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Comandas & Clientes</span>
                <h3 className="text-xl font-bold text-zinc-100 group-hover:text-sky-200 transition-colors mt-0.5">
                  Cuentas & Mesas
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Suma de tragos con hora y minuto exacto sin interrumpir con cobros inmediatos. Botón lateral para liquidar solo al finalizar la cuenta (sin propinas).
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Saldo por cobrar:</span>
                <span className="text-sky-300 font-bold tabular-nums">{formatCurrency(openTabsAmount)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-800/50">
              <span className="text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Ver {openTabs.length} Comandas Abiertas
                <ChevronRight className="w-4 h-4" />
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                {openTabs.length} Activas
              </span>
            </div>
          </div>

          {/* MÓDULO 3: INVENTARIO & KARDEX — COLOR VERDE ESMERALDA APPLE */}
          <div 
            onClick={() => onNavigate('inventory')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.08] via-zinc-900/70 to-zinc-950 p-6 backdrop-blur-xl hover:border-emerald-400/60 hover:from-emerald-500/[0.14] transition-all duration-300 shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 text-zinc-600 group-hover:text-emerald-400 transition-colors">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
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
              <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Administrar {products.length} Licores
                <ChevronRight className="w-4 h-4" />
              </span>
              {lowStockProducts.length > 0 ? (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {lowStockProducts.length} Reordenar
                </span>
              ) : (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Stock Óptimo
                </span>
              )}
            </div>
          </div>

          {/* MÓDULO 4: CONTABILIDAD & GASTOS — COLOR VIOLETA ÍNDIGO APPLE */}
          <div 
            onClick={() => onNavigate('accounting')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.08] via-zinc-900/70 to-zinc-950 p-6 backdrop-blur-xl hover:border-violet-400/60 hover:from-violet-500/[0.14] transition-all duration-300 shadow-xl hover:shadow-violet-500/10 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 text-zinc-600 group-hover:text-violet-400 transition-colors">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/35 text-violet-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <CircleDollarSign className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Finanzas & Utilidad</span>
                <h3 className="text-xl font-bold text-zinc-100 group-hover:text-violet-200 transition-colors mt-0.5">
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
              <span className="text-xs font-semibold text-violet-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Ver Márgenes y Gastos
                <ChevronRight className="w-4 h-4" />
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">
                10 x Página
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MÓDULO DESTACADO 5 Y 6: CANCHAS DE TEJO & GESTIÓN DE USUARIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* MÓDULO 5: RESERVAS DE CANCHAS DE TEJO & BOLIRANA — COLOR ROJO CORAL APPLE */}
        <div 
          onClick={() => onNavigate('reservations')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-500/[0.1] via-zinc-900/70 to-zinc-950/90 p-6 backdrop-blur-2xl hover:border-rose-400/60 hover:from-rose-500/[0.16] transition-all duration-300 shadow-xl hover:shadow-rose-500/10 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-6 text-zinc-600 group-hover:text-rose-400 transition-colors">
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <Target className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Juegos Tradicionales</span>
              <h3 className="text-xl font-bold text-zinc-100 group-hover:text-rose-200 transition-colors mt-0.5">
                Canchas de Tejo & Boliranas
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Control en vivo de pistas de tejo y boliranas electrónicas/clásicas, cobro por hora o por chico, reservas con abono y apertura directa de comanda.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Estado de pistas:</span>
              <span className="text-rose-300 font-bold">{activeGamesCount} de {gameTracks.length} en juego</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-800/50">
            <span className="text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Gestionar Pistas y Reservas
              <ChevronRight className="w-4 h-4" />
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
              {gameTracks.filter((t) => t.status === 'DISPONIBLE').length} Libres
            </span>
          </div>
        </div>

        {/* MÓDULO 6: GESTIÓN DE USUARIOS & ADMINISTRADORES — COLOR ÍNDIGO / AZUL PROFUNDO APPLE */}
        <div 
          onClick={() => onNavigate('users')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-indigo-500/35 bg-gradient-to-br from-indigo-500/[0.12] via-zinc-900/75 to-zinc-950/90 p-6 backdrop-blur-2xl hover:border-indigo-400/65 hover:from-indigo-500/[0.18] transition-all duration-300 shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-6 text-zinc-600 group-hover:text-indigo-400 transition-colors">
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <UserPlus className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Accesos & Seguridad</span>
              <h3 className="text-xl font-bold text-zinc-100 group-hover:text-indigo-200 transition-colors mt-0.5">
                Usuarios & Administradores
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Agrega nuevos usuarios de forma sencilla, asigna contraseñas, PIN de 4 dígitos y rol de Administrador o Cajero sin complicaciones.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Usuarios registrados:</span>
              <span className="text-indigo-300 font-bold tabular-nums">{users.length || 3} cuentas activas</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-800/50">
            <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Agregar o Administrar Usuarios
              <ChevronRight className="w-4 h-4" />
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              Administradores
            </span>
          </div>
        </div>
      </div>

      {/* MÓDULO 7: CAMPEONATOS DE TEJO, A BALAZOS & BOLIRANA — COLOR ORO / ÁMBAR TROFEO */}
      <div 
        onClick={() => onNavigate('championships')}
        className="group relative cursor-pointer overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/[0.15] via-rose-500/[0.08] to-zinc-950/90 p-5 sm:p-6 backdrop-blur-2xl hover:border-amber-400/70 hover:from-amber-500/[0.22] transition-all duration-300 shadow-xl hover:shadow-amber-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/45 text-amber-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Torneos Oficiales del Local</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/35 font-mono font-bold">
                Tejo · A Balazos · Bolirana
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-amber-200 transition-colors mt-0.5">
              Campeonatos de Tejo, A Balazos & Bolirana
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-2xl">
              Tablero marcador en vivo con llaves eliminatorias, puntaje meta libre (27 ptos o el que elijas), modalidad relámpago A Balazos (mechas) y figuras de Bolirana.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60 shrink-0">
          <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Abrir Tablero de Campeonatos
            <ChevronRight className="w-4 h-4" />
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* MODAL RÁPIDO 1-CLIC: ABRIR MESA + LO QUE VAN A CONSUMIR */}
      {selectedTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-5">
          <form
            onSubmit={handleConfirmOpenTable}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92dvh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/35 flex items-center justify-center font-bold text-sm shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-lg font-bold text-zinc-100 truncate">
                      {selectedTableModal.existingTab
                        ? `Agregar Consumo a ${selectedTableModal.location}`
                        : `Abrir ${selectedTableModal.location}`}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase hidden sm:inline">
                      Apertura Rápida
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
                    Selecciona las bebidas a consumir para abrir la mesa o cobrar al instante.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {selectedTableModal.existingTab &&
                  selectedTableModal.existingTab.items.length === 0 &&
                  modalCart.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTableModal.existingTab) {
                          onReleaseTable(selectedTableModal.existingTab);
                          setSelectedTableModal(null);
                        }
                      }}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Cerrar y liberar esta mesa vacía abierta por error"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Liberar Mesa</span>
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => setSelectedTableModal(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drink Selection + Order Summary (Scrollable on Mobile, Split on Desktop) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden min-h-0">
              {/* Left: Drink Catalog (Col 7) */}
              <div className="lg:col-span-7 p-3.5 sm:p-4 flex flex-col gap-3 border-b lg:border-b-0 lg:border-r border-zinc-800 lg:overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">
                    ¿Qué van a consumir en {selectedTableModal.location}? (Toca para sumar)
                  </span>
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      placeholder="Buscar bebida o licor..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {['all', 'Cervezas', 'Whisky', 'Ron & Aguardiente', 'Tequila & Mezcal', 'Ginebra & Vodka', 'Coctelería de Autor', 'Pasantes & Snacks'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setModalCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                          modalCategory === cat
                            ? 'bg-amber-500 text-zinc-950 font-semibold'
                            : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        {cat === 'all' ? 'Todos' : cat}
                      </button>
                    )
                  )}
                </div>

                {/* Product Grid */}
                <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 pr-1 max-h-[260px] sm:max-h-[340px]">
                  {filteredModalProducts.map((product) => {
                    const inCart = modalCart.find((c) => c.product.id === product.id);
                    const isOut = product.currentStock <= 0;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        disabled={isOut}
                        onClick={() => addDrinkToModalCart(product)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between group relative cursor-pointer ${
                          isOut
                            ? 'opacity-40 cursor-not-allowed bg-zinc-950 border-zinc-900'
                            : inCart
                            ? 'bg-amber-500/15 border-amber-500/50'
                            : 'bg-zinc-950/80 border-zinc-800 hover:border-amber-500/40 active:scale-[0.98]'
                        }`}
                      >
                        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800/70 mb-1.5 flex items-center justify-center p-1">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Wine className="w-6 h-6 text-amber-400/50" />
                          )}
                          {inCart && (
                            <span className="absolute top-1 right-1 px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold font-mono">
                              {inCart.quantity}x
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-400 block truncate">
                            {product.category}
                          </span>
                          <h4 className="text-xs font-semibold text-zinc-100 line-clamp-1 mt-0.5">
                            {product.name}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-1 mt-1 border-t border-zinc-800/60">
                          <span className="text-[11px] font-mono font-bold text-amber-400">
                            {formatCurrency(product.salePrice)}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {product.currentStock} disp.
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Selected Consumption List & Open / Quick Pay Buttons (Col 5) */}
              <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-zinc-950/40">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Cuenta de {selectedTableModal.location}
                    </span>
                    <span className="text-xs font-mono text-amber-400">
                      {(selectedTableModal.existingTab?.items.reduce((a, b) => a + b.quantity, 0) || 0) +
                        modalCart.reduce((a, b) => a + b.quantity, 0)}{' '}
                      uds
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto py-3 space-y-2 max-h-[230px]">
                    {/* Existing consumed items on the table */}
                    {selectedTableModal.existingTab && selectedTableModal.existingTab.items.length > 0 && (
                      <div className="space-y-1.5 pb-2 border-b border-zinc-800/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                          Consumo actual en mesa ({formatCurrency(selectedTableModal.existingTab.total)}):
                        </span>
                        {selectedTableModal.existingTab.items.map((it) => (
                          <div
                            key={it.id}
                            className="p-2 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-zinc-200 truncate">
                                {it.quantity}x {it.productName}
                              </p>
                            </div>
                            <span className="text-xs font-mono font-semibold text-sky-400 shrink-0">
                              {formatCurrency(it.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Newly added items in modal */}
                    {modalCart.length === 0 &&
                    (!selectedTableModal.existingTab || selectedTableModal.existingTab.items.length === 0) ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-8 text-zinc-500">
                        <Wine className="w-7 h-7 text-zinc-700 mb-1.5" />
                        <p className="text-xs text-zinc-400 font-medium">
                          Selecciona bebidas a la izquierda
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Puedes abrir la mesa o cobrar al instante desde aquí.
                        </p>
                      </div>
                    ) : (
                      modalCart.map((item) => (
                        <div
                          key={item.product.id}
                          className="p-2.5 rounded-xl bg-zinc-900 border border-amber-500/30 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-zinc-100 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[10px] font-mono text-amber-400">
                              {formatCurrency(item.product.salePrice * item.quantity)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateModalCartQty(item.product.id, -1)}
                              className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center text-xs cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold font-mono text-zinc-100">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateModalCartQty(item.product.id, 1)}
                              className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center text-xs cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-zinc-400">Total de la mesa:</span>
                    <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                      {formatCurrency(totalTablePayAmount)}
                    </span>
                  </div>

                  {/* Quick Payment Section right inside the modal */}
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <CircleDollarSign className="w-3.5 h-3.5" />
                        Pago Rápido:
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setModalPaymentMethod('EFECTIVO')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                            modalPaymentMethod === 'EFECTIVO'
                              ? 'bg-emerald-500 text-zinc-950'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          Efectivo
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalPaymentMethod('TRANSFERENCIA')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                            modalPaymentMethod === 'TRANSFERENCIA'
                              ? 'bg-sky-500 text-zinc-950'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          Transferencia
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={totalTablePayAmount <= 0}
                      onClick={handleQuickPayNow}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <CircleDollarSign className="w-4 h-4" />
                      <span>
                        Pagar Ahora {totalTablePayAmount > 0 ? `(${formatCurrency(totalTablePayAmount)})` : ''}
                      </span>
                    </button>
                  </div>

                  {/* Open / Save Table Action */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTableModal(null)}
                      className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    {selectedTableModal.existingTab &&
                      selectedTableModal.existingTab.items.length === 0 &&
                      modalCart.length === 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedTableModal.existingTab) {
                              onReleaseTable(selectedTableModal.existingTab);
                              setSelectedTableModal(null);
                            }
                          }}
                          className="px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Liberar</span>
                        </button>
                      )}
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {selectedTableModal.existingTab
                          ? 'Solo Guardar en Mesa'
                          : 'Abrir Mesa (Cobrar Después)'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CRUD DE MESAS: AGREGAR, EDITAR Y ELIMINAR MESAS */}
      {manageTablesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/35 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Administrar Mesas y Puntos
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Agrega nuevas mesas, edita su nombre o elimina las que no uses.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setManageTablesModalOpen(false);
                  setEditingTableTarget(null);
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form to Add New Table */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTableInput.trim()) return;
                onAddTable(newTableInput.trim());
                setNewTableInput('');
              }}
              className="p-5 bg-zinc-950/50 border-b border-zinc-800 flex items-center gap-2.5"
            >
              <input
                type="text"
                value={newTableInput}
                onChange={(e) => setNewTableInput(e.target.value)}
                placeholder="Nombre de la nueva mesa (ej. Mesa 9, Terraza, Barra)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!newTableInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Mesa</span>
              </button>
            </form>

            {/* List of Existing Tables with Edit and Delete */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {tables.map((tableName) => {
                const existingTab = openTabs.find(
                  (t) =>
                    t.location.toLowerCase() === tableName.toLowerCase() ||
                    t.clientName.toLowerCase() === tableName.toLowerCase()
                );
                const isOccupied = Boolean(existingTab);
                const isEditing = editingTableTarget === tableName;

                return (
                  <div
                    key={tableName}
                    className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          autoFocus
                          value={editingTableValue}
                          onChange={(e) => setEditingTableValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              onEditTable(tableName, editingTableValue);
                              setEditingTableTarget(null);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-500 text-xs text-zinc-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onEditTable(tableName, editingTableValue);
                            setEditingTableTarget(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold cursor-pointer"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTableTarget(null)}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              isOccupied ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                            }`}
                          />
                          <span className="text-sm font-bold text-zinc-100 truncate">
                            {tableName}
                          </span>
                          {isOccupied && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                              Ocupada ({formatCurrency(existingTab?.total || 0)})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTableTarget(tableName);
                              setEditingTableValue(tableName);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteTable(tableName)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/70 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setManageTablesModalOpen(false);
                  setEditingTableTarget(null);
                }}
                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
