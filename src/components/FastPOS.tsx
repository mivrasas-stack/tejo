import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Users, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  ArrowRight,
  X,
  Wine,
  History,
  Clock,
  FileText
} from 'lucide-react';
import { Product, Category, CartItem, ClientTab, AccountingTransaction, User } from '../types';
import { formatCurrency, formatCOPInput, parseCOPInput, formatDate } from '../services/storage';

interface FastPOSProps {
  products: Product[];
  clientTabs: ClientTab[];
  transactions: AccountingTransaction[];
  activeUser: User;
  onCompleteSale: (
    cart: CartItem[], 
    paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA', 
    customerName?: string,
    receivedCash?: number,
    change?: number
  ) => void;
  onChargeToTab: (cart: CartItem[], tabId: string, newClientName?: string, location?: string) => void;
}

export const FastPOS: React.FC<FastPOSProps> = ({
  products,
  clientTabs,
  transactions,
  activeUser,
  onCompleteSale,
  onChargeToTab,
}) => {
  const [posSubTab, setPosSubTab] = useState<'terminal' | 'history'>('terminal');
  const [historySearch, setHistorySearch] = useState('');
  const [historyPaymentFilter, setHistoryPaymentFilter] = useState<'ALL' | 'EFECTIVO' | 'TRANSFERENCIA'>('ALL');
  const [selectedHistoryTx, setSelectedHistoryTx] = useState<AccountingTransaction | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA'>('EFECTIVO');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [clientNameQuick, setClientNameQuick] = useState('');
  
  // Charge to tab modal
  const [tabModalOpen, setTabModalOpen] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState<string>('');
  const [newTabClientName, setNewTabClientName] = useState('');
  const [newTabLocation, setNewTabLocation] = useState('Mesa 1');

  // Success ticket modal
  const [successReceipt, setSuccessReceipt] = useState<{
    id: string;
    items: CartItem[];
    total: number;
    paymentMethod: string;
    date: string;
    cashReceived?: number;
    change?: number;
    customerName?: string;
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Todos los Tragos' },
    { id: 'Whisky', label: 'Whisky' },
    { id: 'Tequila & Mezcal', label: 'Tequila & Mezcal' },
    { id: 'Ron & Aguardiente', label: 'Ron & Aguardiente' },
    { id: 'Ginebra & Vodka', label: 'Ginebra & Vodka' },
    { id: 'Cervezas', label: 'Cervezas' },
    { id: 'Coctelería de Autor', label: 'Cocteles & Shots' },
    { id: 'Pasantes & Snacks', label: 'Pasantes & Snacks' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesQuery = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) return prev; // Don't exceed stock
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.currentStock) return item;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);
  }, [cart]);

  const cartTotal = cartSubtotal;

  const changeDue = useMemo(() => {
    if (cashReceived < cartTotal) return 0;
    return cashReceived - cartTotal;
  }, [cashReceived, cartTotal]);

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashReceived(cartTotal);
    setCheckoutModalOpen(true);
  };

  const handleProcessSale = () => {
    if (cart.length === 0) return;
    const receiptData = {
      id: `VTA-${Math.floor(10000 + Math.random() * 90000)}`,
      items: [...cart],
      total: cartTotal,
      paymentMethod,
      date: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cashReceived: paymentMethod === 'EFECTIVO' ? cashReceived : undefined,
      change: paymentMethod === 'EFECTIVO' ? changeDue : undefined,
      customerName: clientNameQuick || undefined,
    };

    onCompleteSale(cart, paymentMethod, clientNameQuick, cashReceived, changeDue);
    setSuccessReceipt(receiptData);
    setCheckoutModalOpen(false);
    setCart([]);
    setClientNameQuick('');
  };

  const handleProcessChargeToTab = () => {
    if (cart.length === 0) return;
    if (!selectedTabId && !newTabClientName) return;

    onChargeToTab(cart, selectedTabId, newTabClientName, newTabLocation);
    setTabModalOpen(false);
    setCart([]);
    setSelectedTabId('');
    setNewTabClientName('');
  };

  // All sales history (every INGRESO_VENTA transaction recorded across POS, Quick Table Pay, and Closed Tabs)
  const salesHistory = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'INGRESO_VENTA')
      .filter((tx) => {
        const matchesPayment =
          historyPaymentFilter === 'ALL' || tx.paymentMethod === historyPaymentFilter;
        const matchesSearch =
          tx.description.toLowerCase().includes(historySearch.toLowerCase()) ||
          tx.reference.toLowerCase().includes(historySearch.toLowerCase()) ||
          tx.category.toLowerCase().includes(historySearch.toLowerCase()) ||
          tx.registeredBy.toLowerCase().includes(historySearch.toLowerCase());
        return matchesPayment && matchesSearch;
      });
  }, [transactions, historyPaymentFilter, historySearch]);

  const totalSalesAmount = useMemo(
    () => salesHistory.reduce((acc, tx) => acc + tx.amount, 0),
    [salesHistory]
  );
  const totalCashSales = useMemo(
    () =>
      salesHistory
        .filter((tx) => tx.paymentMethod === 'EFECTIVO')
        .reduce((acc, tx) => acc + tx.amount, 0),
    [salesHistory]
  );
  const totalTransferSales = useMemo(
    () =>
      salesHistory
        .filter((tx) => tx.paymentMethod === 'TRANSFERENCIA')
        .reduce((acc, tx) => acc + tx.amount, 0),
    [salesHistory]
  );

  return (
    <div className="space-y-5">
      {/* Top Sub-Tab Selector inside Sales Module: Terminal POS vs Historial de Ventas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800/80 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPosSubTab('terminal')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              posSubTab === 'terminal'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Terminal de Ventas (POS)</span>
          </button>

          <button
            type="button"
            onClick={() => setPosSubTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              posSubTab === 'history'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial de Ventas</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                posSubTab === 'history'
                  ? 'bg-zinc-950/20 text-zinc-950'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {transactions.filter((tx) => tx.type === 'INGRESO_VENTA').length}
            </span>
          </button>
        </div>

        <div className="px-3 text-xs text-zinc-400 font-mono flex items-center gap-2">
          <span>Total ventas registradas:</span>
          <strong className="text-emerald-400">
            {formatCurrency(
              transactions
                .filter((tx) => tx.type === 'INGRESO_VENTA')
                .reduce((a, b) => a + b.amount, 0)
            )}
          </strong>
        </div>
      </div>

      {posSubTab === 'terminal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Product Catalog & Fast Search (Col 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
        {/* Search bar & quick category bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar trago, botella, cerveza o código (presiona '/' para buscar)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs px-1"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Categories segmented controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-800/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid - Fast High Flow Clickable with Image + Category, Name, Stock & Price */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map((product) => {
            const inCart = cart.find((item) => item.product.id === product.id);
            const isOutOfStock = product.currentStock <= 0;
            const isLowStock = product.currentStock > 0 && product.currentStock <= product.minStock;

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={isOutOfStock}
                className={`relative group text-left p-3 rounded-2xl border transition-all duration-150 flex flex-col justify-between select-none overflow-hidden ${
                  isOutOfStock
                    ? 'opacity-40 cursor-not-allowed bg-zinc-900/40 border-zinc-800/40'
                    : inCart
                    ? 'bg-amber-500/15 border-amber-500/50 hover:bg-amber-500/20 shadow-lg shadow-amber-500/5'
                    : 'bg-zinc-900/75 border-zinc-800/80 hover:bg-zinc-800/90 hover:border-amber-500/40 active:scale-[0.98]'
                }`}
              >
                {/* Product Image Banner (Larger full-bottle showcase with object-contain) */}
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-zinc-950/90 border border-zinc-800/70 mb-2.5 flex items-center justify-center p-2">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-600">
                      <Wine className="w-9 h-9 text-amber-400/50" />
                    </div>
                  )}

                  {/* Stock Badge Overlay on top-right of image */}
                  <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80">
                    {isOutOfStock ? (
                      <span className="text-[10px] text-rose-400 font-semibold">Agotado</span>
                    ) : (
                      <span
                        className={`text-[10px] font-mono font-semibold tabular-nums ${
                          isLowStock ? 'text-amber-300' : 'text-emerald-400'
                        }`}
                      >
                        {product.currentStock} disp.
                      </span>
                    )}
                  </div>
                </div>

                {/* Category & Unit */}
                <div className="w-full">
                  <span className="text-[10px] text-zinc-400 font-medium block truncate">
                    {product.category} · {product.unit}
                  </span>
                </div>

                {/* Product Name */}
                <div className="my-1">
                  <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-tight">
                    {product.name}
                  </h4>
                </div>

                {/* Bottom: Price and in-cart count */}
                <div className="flex items-center justify-between w-full pt-1.5 mt-1 border-t border-zinc-800/60">
                  <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums">
                    {formatCurrency(product.salePrice)}
                  </span>
                  {inCart && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-xs font-bold font-mono">
                      {inCart.quantity}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl p-8">
            <p className="text-zinc-400 text-sm">No se encontraron productos con "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 text-xs text-amber-400 underline font-medium"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Live Ticket / Active Order (Col 4) */}
      <div id="pos-ticket-panel" className="lg:col-span-4 flex flex-col gap-4">
        <div className="sticky top-20 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-2xl p-4 flex flex-col h-auto max-h-[78dvh] lg:max-h-none lg:h-[calc(100vh-6.5rem)]">
          {/* Header Ticket */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold tracking-wide uppercase text-zinc-200">Comanda Actual</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <div className="w-12 h-12 rounded-full bg-zinc-800/60 flex items-center justify-center mb-3 text-zinc-600">
                  <Zap className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-zinc-400">Sin tragos seleccionados</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Toca cualquier producto a la izquierda para agregarlo de inmediato.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-amber-400/90 font-mono tabular-nums">
                      {formatCurrency(item.product.salePrice)} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-zinc-100 font-mono tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.currentStock}
                      className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 flex items-center justify-center transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Footer & Actions */}
          <div className="pt-3 border-t border-zinc-800 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Total de artículos:</span>
                <span className="font-mono text-zinc-200 tabular-nums">
                  {cart.reduce((a, b) => a + b.quantity, 0)} unidades
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-semibold text-zinc-100">Total a Pagar:</span>
                <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleOpenCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
              >
                <Banknote className="w-4 h-4" />
                <span>Cobrar Venta Rápida</span>
              </button>

              <button
                onClick={() => setTabModalOpen(true)}
                disabled={cart.length === 0}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 text-xs font-semibold border border-zinc-700/60 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>Cargar a Cuenta de Cliente</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Quick Checkout Bar when cart has items */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-3 right-3 z-30 p-3 rounded-2xl bg-zinc-900/95 border border-amber-500/50 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2">
          <div
            onClick={() => {
              document.getElementById('pos-ticket-panel')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="min-w-0 cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
              {cart.reduce((a, b) => a + b.quantity, 0)} productos en comanda
            </span>
            <span className="text-base font-extrabold font-mono text-zinc-100 tabular-nums">
              {formatCurrency(cartTotal)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                document.getElementById('pos-ticket-panel')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold"
            >
              Ver
            </button>
            <button
              type="button"
              onClick={handleOpenCheckout}
              className="px-3.5 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold flex items-center gap-1 shadow-lg shadow-amber-500/20"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Cobrar</span>
            </button>
          </div>
        </div>
      )}
        </div>
      ) : (
        /* PESTAÑA 2: HISTORIAL COMPLETO DE TODAS LAS VENTAS */
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Total Ventas (Filtro Actual)
              </span>
              <p className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
                {formatCurrency(totalSalesAmount)}
              </p>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                {salesHistory.length} transacciones registradas
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/25">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Ventas en Efectivo
              </span>
              <p className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
                {formatCurrency(totalCashSales)}
              </p>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Dinero recibido en caja
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-sky-500/25">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Ventas por Transferencia
              </span>
              <p className="text-2xl font-bold text-sky-400 font-mono tabular-nums mt-1">
                {formatCurrency(totalTransferSales)}
              </p>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Nequi / Daviplata / Bancos
              </span>
            </div>
          </div>

          {/* Search & Payment Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/70 border border-zinc-800 p-3.5 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar por producto vendido, mesa, cliente, #referencia o cajero..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(['ALL', 'EFECTIVO', 'TRANSFERENCIA'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setHistoryPaymentFilter(method)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    historyPaymentFilter === method
                      ? 'bg-amber-500 text-zinc-950'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {method === 'ALL' ? 'Todos' : method === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
                </button>
              ))}
            </div>
          </div>

          {/* Complete Sales History Table */}
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-zinc-100">
                  Registro Completo de Ventas Realizadas
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                Mostrando {salesHistory.length} registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-950/60">
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Referencia</th>
                    <th className="py-3 px-4">Origen</th>
                    <th className="py-3 px-4">Detalle de lo Vendido</th>
                    <th className="py-3 px-4">Método de Pago</th>
                    <th className="py-3 px-4">Registrado por</th>
                    <th className="py-3 px-4 text-right">Total Venta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {salesHistory.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedHistoryTx(tx)}
                      className="hover:bg-amber-500/10 transition-colors cursor-pointer group"
                      title="Haz clic para ver el detalle completo del consumo"
                    >
                      <td className="py-3.5 px-4 font-mono text-zinc-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{formatDate(tx.timestamp)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {tx.reference}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-[11px] font-medium">
                          {tx.location || tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-100 max-w-md">
                        <div className="font-medium group-hover:text-amber-300 transition-colors">
                          {tx.description}
                        </div>
                        <span className="text-[10px] text-amber-400/80 underline">
                          Clic para ver desglose detallado →
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            tx.paymentMethod === 'EFECTIVO'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                        {tx.registeredBy}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums whitespace-nowrap">
                        {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}

                  {salesHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        No se encontraron ventas con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Quick Payment Checkout */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Cobro de Venta Rápida</h3>
                <p className="text-xs text-zinc-400">Total: {formatCurrency(cartTotal)}</p>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Selector: ONLY Efectivo and Transferencia */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('EFECTIVO');
                  setCashReceived(cartTotal);
                }}
                className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'EFECTIVO'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Efectivo</span>
                <span className="text-[10px] text-zinc-500">Cobro en efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFERENCIA')}
                className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'TRANSFERENCIA'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Smartphone className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-sm">Transferencia</span>
                <span className="text-[10px] text-zinc-500">Nequi / Daviplata / QR</span>
              </button>
            </div>

            {/* Customer name (optional) */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Nombre del Cliente (Opcional):
              </label>
              <input
                type="text"
                value={clientNameQuick}
                onChange={(e) => setClientNameQuick(e.target.value)}
                placeholder="Ej. Juan Gómez o 'Barra Mostrador'"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Cash specific calculations */}
            {paymentMethod === 'EFECTIVO' && (
              <div className="space-y-3 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Efectivo Recibido (COP):</span>
                  <div className="relative w-44">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatCOPInput(cashReceived)}
                      onChange={(e) => setCashReceived(parseCOPInput(e.target.value))}
                      placeholder="Ej. $ 100.000"
                      className="w-full text-right px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Quick denomination pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setCashReceived(cartTotal)}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-zinc-200"
                  >
                    Exacto
                  </button>
                  {[50000, 100000, 200000, 300000, 500000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setCashReceived(val)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-amber-300"
                    >
                      ${val / 1000}k
                    </button>
                  ))}
                </div>

                {/* Change calculation */}
                <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80">
                  <span className="text-xs font-semibold text-zinc-300">Cambio / Vueltas:</span>
                  <span
                    className={`text-lg font-mono font-bold tabular-nums ${
                      cashReceived >= cartTotal ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {cashReceived >= cartTotal
                      ? formatCurrency(changeDue)
                      : `Faltan ${formatCurrency(cartTotal - cashReceived)}`}
                  </span>
                </div>
              </div>
            )}

            {/* Confirm sale CTA */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessSale}
                disabled={paymentMethod === 'EFECTIVO' && cashReceived < cartTotal}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all disabled:opacity-40"
              >
                Confirmar y Finalizar Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Charge to Client Tab */}
      {tabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Cargar a Cuenta de Cliente</h3>
                <p className="text-xs text-zinc-400">
                  Sumar {cart.reduce((a, b) => a + b.quantity, 0)} tragos ({formatCurrency(cartTotal)})
                </p>
              </div>
              <button onClick={() => setTabModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Option A: Select Existing Open Tab */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                1. Seleccionar Cuenta Abierta Existente:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {clientTabs
                  .filter((t) => t.status === 'ABIERTA')
                  .map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setSelectedTabId(tab.id);
                        setNewTabClientName('');
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                        selectedTabId === tab.id
                          ? 'bg-amber-500/15 border-amber-500/60 text-amber-200'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-zinc-100">{tab.clientName}</div>
                        <div className="text-[11px] text-zinc-400">{tab.location}</div>
                      </div>
                      <div className="text-right font-mono font-bold text-amber-400">
                        {formatCurrency(tab.total)}
                      </div>
                    </button>
                  ))}
                {clientTabs.filter((t) => t.status === 'ABIERTA').length === 0 && (
                  <p className="text-xs text-zinc-500 italic">No hay cuentas abiertas en este momento.</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 my-2 text-zinc-500 text-xs">
              <div className="h-px bg-zinc-800 flex-1" />
              <span>O abrir nueva cuenta</span>
              <div className="h-px bg-zinc-800 flex-1" />
            </div>

            {/* Option B: Create New Tab */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Nombre del Cliente / Persona:
                </label>
                <input
                  type="text"
                  value={newTabClientName}
                  onChange={(e) => {
                    setNewTabClientName(e.target.value);
                    if (e.target.value) setSelectedTabId('');
                  }}
                  placeholder="Ej. Dr. Mauricio Villa, Mesa 4, Cancha 1..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Ubicación en el Local:
                </label>
                <select
                  value={newTabLocation}
                  onChange={(e) => setNewTabLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Mesa 1">Mesa 1</option>
                  <option value="Mesa 2">Mesa 2</option>
                  <option value="Mesa 3">Mesa 3</option>
                  <option value="Mesa 4">Mesa 4</option>
                  <option value="Mesa 5">Mesa 5</option>
                  <option value="Mesa 6">Mesa 6</option>
                  <option value="Mesa 7">Mesa 7</option>
                  <option value="Mesa 8">Mesa 8</option>
                  <option value="Cancha de Tejo">Cancha de Tejo</option>
                </select>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setTabModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessChargeToTab}
                disabled={!selectedTabId && !newTabClientName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all disabled:opacity-40"
              >
                Cargar a la Cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Success Receipt / Comprobante Rápido */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-100">¡Venta Registrada!</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">Comprobante #{successReceipt.id}</p>
            </div>

            {/* Ticket Preview Box */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-left font-mono text-xs space-y-2">
              <div className="text-center pb-2 border-b border-dashed border-zinc-800">
                <p className="font-bold text-zinc-200">AURA · LICORERA & LOUNGE</p>
                <p className="text-[10px] text-zinc-500">NIT: 901.482.019-4 · Hora: {successReceipt.date}</p>
                {successReceipt.customerName && (
                  <p className="text-[10px] text-amber-400">Cliente: {successReceipt.customerName}</p>
                )}
              </div>

              <div className="space-y-1 py-1 max-h-36 overflow-y-auto">
                {successReceipt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-zinc-300">
                    <span className="truncate pr-2">
                      {it.quantity}x {it.product.name}
                    </span>
                    <span className="shrink-0 text-zinc-400">
                      {formatCurrency(it.product.salePrice * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-dashed border-zinc-800 space-y-1">
                <div className="flex justify-between font-bold text-zinc-100 text-sm">
                  <span>TOTAL:</span>
                  <span className="text-amber-400">{formatCurrency(successReceipt.total)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Pago ({successReceipt.paymentMethod}):</span>
                  <span>{formatCurrency(successReceipt.cashReceived || successReceipt.total)}</span>
                </div>
                {successReceipt.change !== undefined && (
                  <div className="flex justify-between text-[11px] text-emerald-400 font-bold">
                    <span>Cambio / Vueltas:</span>
                    <span>{formatCurrency(successReceipt.change)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                onClick={() => setSuccessReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold"
              >
                Siguiente Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Detalle Completo de Venta / Mesa al pulsar en el Historial */}
      {selectedHistoryTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-100">
                    Detalle de Venta {selectedHistoryTx.reference}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                    {selectedHistoryTx.paymentMethod}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {selectedHistoryTx.location || selectedHistoryTx.category} · Registrado por{' '}
                  {selectedHistoryTx.registeredBy}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryTx(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 block">Fecha y Hora:</span>
                <span className="font-mono text-zinc-200 font-semibold">
                  {formatDate(selectedHistoryTx.timestamp)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Mesa / Origen:</span>
                <span className="font-semibold text-amber-400">
                  {selectedHistoryTx.location || selectedHistoryTx.clientName || selectedHistoryTx.category}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Desglose Detallado del Consumo
              </span>

              {(() => {
                const matchedTab = clientTabs.find(
                  (t) =>
                    selectedHistoryTx.reference.endsWith(t.id.slice(-4)) ||
                    (selectedHistoryTx.location && t.location === selectedHistoryTx.location && t.total === selectedHistoryTx.amount)
                );
                const detailItems = selectedHistoryTx.items || matchedTab?.items || [];

                return detailItems.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800/70 rounded-2xl bg-zinc-950 border border-zinc-800 p-3">
                    {detailItems.map((it) => (
                      <div key={it.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-zinc-100">
                            {it.quantity}x {it.productName}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {formatCurrency(it.unitPrice)} c/u · {it.category}
                          </p>
                        </div>
                        <div className="text-right font-mono font-bold text-amber-400 shrink-0">
                          {formatCurrency(it.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200">
                    {selectedHistoryTx.description}
                  </div>
                );
              })()}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-300">Total Pagado:</span>
              <span className="text-xl font-extrabold font-mono text-emerald-400">
                {formatCurrency(selectedHistoryTx.amount)}
              </span>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedHistoryTx(null)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
