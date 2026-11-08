import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  X, 
  Clock, 
  MapPin, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Trash2, 
  Printer, 
  CheckCircle,
  Wine,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ClientTab, Product, TabItem, User } from '../types';
import { formatCurrency, formatShortDate } from '../services/storage';

interface ClientTabsViewProps {
  clientTabs: ClientTab[];
  products: Product[];
  activeUser: User;
  onUpdateTab: (tab: ClientTab) => void;
  onCloseTab: (
    tab: ClientTab, 
    paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA',
    finalTotal: number
  ) => void;
  onCreateTab: (clientName: string, location: string, notes?: string) => void;
}

export const ClientTabsView: React.FC<ClientTabsViewProps> = ({
  clientTabs,
  products,
  activeUser,
  onUpdateTab,
  onCloseTab,
  onCreateTab,
}) => {
  // Modal for adding drinks to an active tab
  const [activeTabForDrinks, setActiveTabForDrinks] = useState<ClientTab | null>(null);
  
  // Dedicated modal for checking out / closing a tab
  const [tabToCheckout, setTabToCheckout] = useState<ClientTab | null>(null);
  const [selectedClosedTabDetail, setSelectedClosedTabDetail] = useState<ClientTab | null>(null);

  // New tab creation modal
  const [newTabModalOpen, setNewTabModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newLocation, setNewLocation] = useState('Mesa 1');
  const [newNotes, setNewNotes] = useState('');

  // Drink search inside the add drink modal
  const [drinkSearchQuery, setDrinkSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lastAddedFeedback, setLastAddedFeedback] = useState<string | null>(null);

  // Checkout modal form: ONLY Efectivo and Transferencia
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA'>('EFECTIVO');
  const [customDiscount, setCustomDiscount] = useState<number>(0);

  // Filter tabs in main list
  const [tabSearchFilter, setTabSearchFilter] = useState('');
  const [tabStatusFilter, setTabStatusFilter] = useState<'ALL' | 'ABIERTA' | 'PAGADA'>('ABIERTA');

  const filteredTabs = useMemo(() => {
    return clientTabs.filter((t) => {
      const matchesStatus = tabStatusFilter === 'ALL' || t.status === tabStatusFilter;
      const matchesSearch = 
        t.clientName.toLowerCase().includes(tabSearchFilter.toLowerCase()) ||
        t.location.toLowerCase().includes(tabSearchFilter.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [clientTabs, tabStatusFilter, tabSearchFilter]);

  // Keep activeTabForDrinks synced if clientTabs changes in background
  const currentTab = useMemo(() => {
    if (!activeTabForDrinks) return null;
    return clientTabs.find((t) => t.id === activeTabForDrinks.id) || activeTabForDrinks;
  }, [clientTabs, activeTabForDrinks]);

  // Filter drinks inside the add drinks modal
  const modalFilteredDrinks = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesQuery = 
        p.name.toLowerCase().includes(drinkSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(drinkSearchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, drinkSearchQuery]);

  // ADD DRINK TO TAB (DOES NOT OPEN PAYMENT - JUST ADDS DRINK WITH TIME)
  const handleAddDrinkToTab = (product: Product) => {
    if (!currentTab || product.currentStock <= 0) return;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });

    const existingItemIndex = currentTab.items.findIndex((it) => it.productId === product.id);
    let updatedItems: TabItem[];

    if (existingItemIndex > -1) {
      updatedItems = currentTab.items.map((it, idx) => {
        if (idx === existingItemIndex) {
          const newQty = it.quantity + 1;
          return {
            ...it,
            quantity: newQty,
            subtotal: newQty * it.unitPrice,
            addedAt: now.toISOString(), // Updated to current time
          };
        }
        return it;
      });
    } else {
      const newItem: TabItem = {
        id: `it-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: product.id,
        productName: product.name,
        category: product.category,
        unit: product.unit,
        unitPrice: product.salePrice,
        costPrice: product.costPrice,
        quantity: 1,
        subtotal: product.salePrice,
        addedAt: now.toISOString(),
        addedBy: activeUser.name,
      };
      updatedItems = [...currentTab.items, newItem];
    }

    const newSubtotal = updatedItems.reduce((acc, it) => acc + it.subtotal, 0);
    const updatedTab: ClientTab = {
      ...currentTab,
      items: updatedItems,
      subtotal: newSubtotal,
      suggestedTip: 0,
      total: newSubtotal - (currentTab.discount || 0),
    };

    onUpdateTab(updatedTab);
    setActiveTabForDrinks(updatedTab);

    // Visual confirmation of exact time added
    setLastAddedFeedback(`+1 ${product.name} sumado a las ${timeFormatted}`);
    setTimeout(() => {
      setLastAddedFeedback(null);
    }, 2800);
  };

  // Modify quantity of item already in tab
  const handleModifyQuantity = (itemId: string, delta: number) => {
    if (!currentTab) return;

    const updatedItems = currentTab.items
      .map((it) => {
        if (it.id === itemId) {
          const newQty = it.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...it,
            quantity: newQty,
            subtotal: newQty * it.unitPrice,
          };
        }
        return it;
      })
      .filter(Boolean) as TabItem[];

    const newSubtotal = updatedItems.reduce((acc, it) => acc + it.subtotal, 0);
    const updatedTab: ClientTab = {
      ...currentTab,
      items: updatedItems,
      subtotal: newSubtotal,
      suggestedTip: 0,
      total: newSubtotal - (currentTab.discount || 0),
    };

    onUpdateTab(updatedTab);
    setActiveTabForDrinks(updatedTab);
  };

  // Remove item completely from tab
  const handleRemoveItem = (itemId: string) => {
    if (!currentTab) return;

    const updatedItems = currentTab.items.filter((it) => it.id !== itemId);
    const newSubtotal = updatedItems.reduce((acc, it) => acc + it.subtotal, 0);
    const updatedTab: ClientTab = {
      ...currentTab,
      items: updatedItems,
      subtotal: newSubtotal,
      suggestedTip: 0,
      total: newSubtotal - (currentTab.discount || 0),
    };

    onUpdateTab(updatedTab);
    setActiveTabForDrinks(updatedTab);
  };

  // Create new tab
  const handleCreateNewTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    onCreateTab(newClientName.trim(), newLocation, newNotes.trim() || undefined);
    setNewClientName('');
    setNewLocation('Mesa 1');
    setNewNotes('');
    setNewTabModalOpen(false);
  };

  // Final settlement of a tab (no tip, just subtotal minus optional discount)
  const handleConfirmCloseTab = () => {
    if (!tabToCheckout) return;
    const finalTotal = Math.max(0, tabToCheckout.subtotal - customDiscount);

    onCloseTab(tabToCheckout, paymentMethod, finalTotal);
    setTabToCheckout(null);
  };

  return (
    <div className="space-y-6">
      {/* View Header with Filters and 'Nueva Cuenta' CTA */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Cuentas Abiertas & Clientes</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Anota personas o mesas, suma tragos sobre la marcha y cobra cuando el cliente se retire.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setTabStatusFilter('ABIERTA')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                tabStatusFilter === 'ABIERTA'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Abiertas ({clientTabs.filter((t) => t.status === 'ABIERTA').length})
            </button>
            <button
              onClick={() => setTabStatusFilter('PAGADA')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                tabStatusFilter === 'PAGADA'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Cerradas Hoy ({clientTabs.filter((t) => t.status === 'PAGADA').length})
            </button>
            <button
              onClick={() => setTabStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                tabStatusFilter === 'ALL'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todas
            </button>
          </div>

          <button
            onClick={() => setNewTabModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Nueva Cuenta</span>
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={tabSearchFilter}
          onChange={(e) => setTabSearchFilter(e.target.value)}
          placeholder="Buscar por nombre de cliente, mesa o cancha..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Grid of Client Tabs Cards with SIDE ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTabs.map((tab) => {
          const isOpen = tab.status === 'ABIERTA';
          const itemsCount = tab.items.reduce((acc, it) => acc + it.quantity, 0);

          return (
            <div
              key={tab.id}
              onClick={() => {
                if (!isOpen) setSelectedClosedTabDetail(tab);
              }}
              className={`p-5 rounded-2xl border transition-all duration-150 flex flex-col justify-between select-none relative overflow-hidden ${
                isOpen
                  ? 'bg-zinc-900/90 border-zinc-800 shadow-lg'
                  : 'bg-zinc-900/75 border-zinc-800/80 hover:border-amber-500/50 cursor-pointer shadow-md'
              }`}
            >
              {/* Subtle top indicator bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isOpen ? 'bg-amber-500' : 'bg-zinc-700'
                }`}
              />

              <div className="space-y-3">
                {/* Top Row: Client Name, Location & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">{tab.clientName}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      <span>{tab.location}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wider ${
                      isOpen
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tab.status}
                  </span>
                </div>

                {/* Middle: Items Consumed with Exact Timestamps */}
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800/80 pb-1">
                    <span>{itemsCount} tragos consumidos</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Abierta {formatShortDate(tab.openedAt)}
                    </span>
                  </div>

                  <div className="space-y-1 max-h-28 overflow-y-auto pt-1">
                    {tab.items.map((it) => {
                      const itemTime = it.addedAt
                        ? new Date(it.addedAt).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : '';

                      return (
                        <div key={it.id} className="flex justify-between items-center text-xs text-zinc-300">
                          <div className="truncate pr-2">
                            <span className="font-semibold text-zinc-200">
                              {it.quantity}x {it.productName}
                            </span>
                            {itemTime && (
                              <span className="text-[10px] text-amber-400/80 font-mono ml-1.5">
                                ({itemTime})
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-zinc-400 shrink-0 tabular-nums">
                            {formatCurrency(it.subtotal)}
                          </span>
                        </div>
                      );
                    })}

                    {tab.items.length === 0 && (
                      <p className="text-xs text-zinc-500 italic py-1">Sin tragos añadidos aún.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom: Total & DEDICATED SIDE/ACTION BUTTONS */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col gap-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-400">Total Acumulado:</span>
                  <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                    {formatCurrency(tab.total)}
                  </span>
                </div>

                {/* Side/Action Buttons (Sumar Trago vs Cobrar Cuenta) */}
                {isOpen ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setActiveTabForDrinks(tab)}
                      className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-zinc-700/60 active:scale-[0.98] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sumar Trago</span>
                    </button>

                    <button
                      onClick={() => setTabToCheckout(tab)}
                      disabled={tab.items.length === 0}
                      className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/10 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Cobrar Cuenta</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClosedTabDetail(tab);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-semibold text-xs flex items-center justify-between transition-all border border-zinc-700/60 cursor-pointer"
                  >
                    <span>
                      Pagada ({tab.paymentMethod || 'EFECTIVO'}) · Ver Detalle
                    </span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTabs.length === 0 && (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl p-8">
          <Users className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-300 text-sm font-semibold">No hay cuentas que coincidan con el filtro</p>
          <p className="text-xs text-zinc-500 mt-1">
            Abre una nueva cuenta con el botón superior para empezar a sumar tragos.
          </p>
        </div>
      )}

      {/* POPUP / VENTANA PARA SUMAR TRAGOS (NO COBRA, SOLO SUMA CON HORA) */}
      {currentTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-5xl h-[92vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base border border-amber-500/30">
                  {currentTab.clientName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-100">
                      Sumar Tragos: {currentTab.clientName}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                      CUENTA ABIERTA
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {currentTab.location} · Toca cualquier trago para sumarlo de inmediato a la comanda con su hora.
                  </p>
                </div>
              </div>

              {/* Top right side: Total & Direct 'Cobrar Esta Cuenta' button */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Total en comanda</span>
                  <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">
                    {formatCurrency(currentTab.total)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setTabToCheckout(currentTab);
                    setActiveTabForDrinks(null);
                  }}
                  disabled={currentTab.items.length === 0}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cobrar Cuenta</span>
                </button>

                <button
                  onClick={() => setActiveTabForDrinks(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification feedback when drink is added */}
            {lastAddedFeedback && (
              <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 text-xs font-semibold text-amber-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>{lastAddedFeedback}</span>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden min-h-0">
              {/* LEFT: Clickable Drink Catalog (Col 7) */}
              <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col gap-3 border-b lg:border-b-0 lg:border-r border-zinc-800 lg:overflow-hidden bg-zinc-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Catálogo de Tragos Disponibles (1 Toque para Sumar)
                  </span>
                </div>

                {/* Search bar inside modal */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={drinkSearchQuery}
                    onChange={(e) => setDrinkSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre o trago..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {['all', 'Whisky', 'Tequila & Mezcal', 'Ron & Aguardiente', 'Cervezas', 'Coctelería de Autor', 'Pasantes & Snacks'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                          selectedCategory === cat
                            ? 'bg-amber-500 text-zinc-950 font-semibold'
                            : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        {cat === 'all' ? 'Todos' : cat}
                      </button>
                    )
                  )}
                </div>

                {/* Clickable Drink Grid with Product Image + Category, Name, Price & Stock */}
                <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 pr-1 max-h-[260px] sm:max-h-[340px] lg:max-h-none lg:flex-1">
                  {modalFilteredDrinks.map((product) => {
                    const isOutOfStock = product.currentStock <= 0;
                    return (
                      <button
                        key={product.id}
                        disabled={isOutOfStock}
                        onClick={() => handleAddDrinkToTab(product)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between group relative cursor-pointer ${
                          isOutOfStock
                            ? 'opacity-40 cursor-not-allowed bg-zinc-950 border-zinc-900'
                            : 'bg-zinc-950/80 border-zinc-800/80 hover:border-amber-500/50 hover:bg-zinc-850 active:scale-[0.97]'
                        }`}
                      >
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800/70 mb-2 flex items-center justify-center p-1.5">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Wine className="w-7 h-7 text-amber-400/50" />
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-400 block truncate">
                            {product.category} · {product.unit}
                          </span>
                          <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-amber-300 leading-tight mt-0.5 line-clamp-2">
                            {product.name}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800/60 mt-2">
                          <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                            {formatCurrency(product.salePrice)}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {product.currentStock} disp.
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Consumed List with Exact Time Recorded (Col 5) */}
              <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between overflow-hidden bg-zinc-950/40">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Tragos Cargados a {currentTab.clientName}
                    </span>
                    <span className="text-xs text-amber-400 font-mono">
                      {currentTab.items.reduce((a, b) => a + b.quantity, 0)} unidades
                    </span>
                  </div>

                  {/* Consumed list with TIME OF CONSUMPTION */}
                  <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
                    {currentTab.items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                        <Wine className="w-8 h-8 text-zinc-700 mb-2" />
                        <p className="text-xs font-medium text-zinc-400">Sin tragos en esta cuenta aún</p>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Toca cualquier trago del catálogo para sumarlo con su hora exacta.
                        </p>
                      </div>
                    ) : (
                      currentTab.items.map((it) => {
                        const itemTime = it.addedAt
                          ? new Date(it.addedAt).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true,
                            })
                          : 'Ahora';

                        return (
                          <div
                            key={it.id}
                            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-zinc-200 truncate">
                                {it.productName}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-amber-400/90 font-mono tabular-nums">
                                  {formatCurrency(it.unitPrice)}
                                </span>
                                <span className="text-[10px] text-zinc-500">·</span>
                                <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                                  <Clock className="w-2.5 h-2.5 text-zinc-500" />
                                  Hora: {itemTime}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleModifyQuantity(it.id, -1)}
                                className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs"
                              >
                                -
                              </button>
                              <span className="w-6 text-center text-xs font-bold font-mono text-zinc-100 tabular-nums">
                                {it.quantity}
                              </span>
                              <button
                                onClick={() => handleModifyQuantity(it.id, 1)}
                                className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs"
                              >
                                +
                              </button>
                              <button
                                onClick={() => handleRemoveItem(it.id)}
                                className="w-6 h-6 rounded-md hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 flex items-center justify-center ml-1 text-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Bottom: Subtotal & Dedicated 'Cobrar Cuenta' button */}
                  <div className="pt-3 border-t border-zinc-800 space-y-2 mt-auto">
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Subtotal de tragos:</span>
                        <span className="font-mono text-zinc-200 tabular-nums">
                          {formatCurrency(currentTab.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-zinc-800/80">
                        <span className="text-sm font-bold text-zinc-100">Total a Cobrar:</span>
                        <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">
                          {formatCurrency(currentTab.total)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setActiveTabForDrinks(null)}
                        className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                      >
                        Cerrar y Seguir Atendiendo
                      </button>
                      <button
                        onClick={() => {
                          setTabToCheckout(currentTab);
                          setActiveTabForDrinks(null);
                        }}
                        disabled={currentTab.items.length === 0}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Cobrar Cuenta Ahora</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR NUEVA CUENTA DE CLIENTE */}
      {newTabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateNewTab}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100">Abrir Nueva Cuenta de Cliente</h3>
              <button
                type="button"
                onClick={() => setNewTabModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nombre del Cliente / Persona:
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ej. Dr. Mauricio Villa, Alejandro Morales, Mesa 4..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Ubicación / Mesa / Cancha:
                </label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Notas / Preferencias (Opcional):
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ej. Prefiere vaso bajo con hielo esfera..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setNewTabModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all"
              >
                Abrir Cuenta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DEDICATED MODAL: COBRAR Y LIQUIDAR CUENTA DE CLIENTE */}
      {tabToCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Cobrar y Cerrar Cuenta</h3>
                <p className="text-xs text-amber-400 font-semibold">{tabToCheckout.clientName} ({tabToCheckout.location})</p>
              </div>
              <button
                onClick={() => setTabToCheckout(null)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Consumed drinks list preview */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs space-y-1.5 max-h-36 overflow-y-auto">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                Detalle de consumos realizados:
              </span>
              {tabToCheckout.items.map((it) => (
                <div key={it.id} className="flex justify-between text-zinc-300">
                  <span className="truncate pr-2">
                    {it.quantity}x {it.productName}
                  </span>
                  <span className="font-mono text-zinc-400 shrink-0">
                    {formatCurrency(it.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal de Consumos:</span>
                <span className="font-mono text-zinc-200 tabular-nums">
                  {formatCurrency(tabToCheckout.subtotal)}
                </span>
              </div>

              {customDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento Aplicado:</span>
                  <span className="font-mono tabular-nums">
                    -{formatCurrency(customDiscount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-zinc-800 font-bold">
                <span className="text-sm text-zinc-100">Total a Cobrar:</span>
                <span className="text-2xl text-amber-400 font-mono tabular-nums">
                  {formatCurrency(Math.max(0, tabToCheckout.subtotal - customDiscount))}
                </span>
              </div>
            </div>

            {/* Payment Method Selector: ONLY Efectivo and Transferencia */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Selecciona Medio de Pago:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('EFECTIVO')}
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'EFECTIVO'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm">Efectivo</span>
                  <span className="text-[10px] text-zinc-500">Caja física / Gaveta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('TRANSFERENCIA')}
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'TRANSFERENCIA'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-sm">Transferencia</span>
                  <span className="text-[10px] text-zinc-500">Nequi / Daviplata / Bancolombia</span>
                </button>
              </div>
            </div>

            {/* Confirmation actions */}
            <div className="flex gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setTabToCheckout(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseTab}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10"
              >
                Confirmar y Cobrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE COMPLETO DE CUENTA CERRADA / PAGADA */}
      {selectedClosedTabDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-100">
                    Detalle de Consumo: {selectedClosedTabDetail.location}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                    PAGADA ({selectedClosedTabDetail.paymentMethod || 'EFECTIVO'})
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Cliente / Mesa: {selectedClosedTabDetail.clientName} · Atendido por {selectedClosedTabDetail.waiterName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClosedTabDetail(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 block">Hora de Apertura:</span>
                <span className="font-mono text-zinc-200 font-semibold">
                  {formatShortDate(selectedClosedTabDetail.openedAt)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Hora de Cierre / Pago:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {selectedClosedTabDetail.closedAt
                    ? formatShortDate(selectedClosedTabDetail.closedAt)
                    : 'Liquidada hoy'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                <span>Productos Consumidos en la Mesa</span>
                <span className="font-mono text-amber-400">
                  {selectedClosedTabDetail.items.reduce((a, b) => a + b.quantity, 0)} unidades
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800/70 rounded-2xl bg-zinc-950 border border-zinc-800 p-3">
                {selectedClosedTabDetail.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-zinc-100">
                        {item.quantity}x {item.productName}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {formatCurrency(item.unitPrice)} c/u · {item.category}
                      </p>
                    </div>
                    <div className="text-right font-mono font-bold text-amber-400 shrink-0">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-300">Total Pagado:</span>
              <span className="text-xl font-extrabold font-mono text-emerald-400">
                {formatCurrency(selectedClosedTabDetail.total)}
              </span>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprobante</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedClosedTabDetail(null)}
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
