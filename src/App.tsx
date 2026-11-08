import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { SlideBar } from './components/SlideBar';
import { FastPOS } from './components/FastPOS';
import { ClientTabsView } from './components/ClientTabsView';
import { InventoryView } from './components/InventoryView';
import { KardexView } from './components/KardexView';
import { AccountingView } from './components/AccountingView';
import { ReservationsView } from './components/ReservationsView';
import { UsersView } from './components/UsersView';
import { LoginModal } from './components/LoginModal';
import { 
  Product, 
  KardexMovement, 
  ClientTab, 
  Reservation, 
  AccountingTransaction, 
  BusinessExpense, 
  GameTrack,
  User, 
  CartItem, 
  ReservationStatus,
  TabItem
} from './types';
import { 
  storageService, 
  formatCurrency, 
  SYSTEM_USERS 
} from './services/storage';
import { 
  Wine, 
  Sparkles, 
  RotateCcw, 
  CheckCircle, 
  X
} from 'lucide-react';

export default function App() {
  // Navigation: Defaults to the primary module 'home' (Página Principal)
  const [activeTab, setActiveTab] = useState<
    'home' | 'pos' | 'tabs' | 'inventory' | 'kardex' | 'accounting' | 'reservations' | 'users'
  >('home');

  // Application Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [kardexMovements, setKardexMovements] = useState<KardexMovement[]>([]);
  const [clientTabs, setClientTabs] = useState<ClientTab[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [gameTracks, setGameTracks] = useState<GameTrack[]>([]);
  const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
  const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
  const [activeUser, setActiveUser] = useState<User>(storageService.getActiveUser());

  // UI Modals & Slide Bar
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    storageService.isAuthenticated()
  );
  const [slideBarOpen, setSlideBarOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedProductIdForKardex, setSelectedProductIdForKardex] = useState<string | undefined>(undefined);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('aura_pos_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_pos_theme', theme);
  }, [theme]);

  // Initialize data from localStorage
  useEffect(() => {
    setProducts(storageService.getProducts());
    setKardexMovements(storageService.getKardex());
    const rawTabs = storageService.getClientTabs();
    const cleanedTabs = rawTabs.map((t) => {
      if (t.location && t.clientName.startsWith(`${t.location} · `)) {
        return {
          ...t,
          clientName: t.clientName.slice(`${t.location} · `.length).trim() || t.location,
        };
      }
      return t;
    });
    storageService.saveClientTabs(cleanedTabs);
    setClientTabs(cleanedTabs);
    setTables(storageService.getTables());
    setUsers(storageService.getUsers());
    setReservations(storageService.getReservations());
    setGameTracks(storageService.getGameTracks());
    setTransactions(storageService.getTransactions());
    setExpenses(storageService.getExpenses());
    setActiveUser(storageService.getActiveUser());
  }, []);

  const showToast = (message: string) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  // Counts for Header
  const openTabsCount = useMemo(() => {
    return clientTabs.filter((t) => t.status === 'ABIERTA').length;
  }, [clientTabs]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.currentStock <= p.minStock).length;
  }, [products]);

  // 1. SALE HANDLER (FAST POS)
  const handleCompleteSale = (
    cart: CartItem[],
    paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA',
    customerName?: string,
    receivedCash?: number,
    change?: number
  ) => {
    const saleId = `#VTA-${Math.floor(10000 + Math.random() * 90000)}`;
    let totalSaleAmount = 0;
    let totalSaleCost = 0;

    // Deduct stock and register Kardex for each product
    const updatedProducts = products.map((prod) => {
      const cartEntry = cart.find((c) => c.product.id === prod.id);
      if (cartEntry) {
        const qty = cartEntry.quantity;
        const newStock = Math.max(0, prod.currentStock - qty);
        const itemTotal = prod.salePrice * qty;
        const itemCostTotal = prod.costPrice * qty;
        totalSaleAmount += itemTotal;
        totalSaleCost += itemCostTotal;

        // Record Kardex movement
        storageService.addKardexMovement({
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          type: 'VENTA_DIRECTA',
          quantity: -qty,
          previousStock: prod.currentStock,
          newStock,
          unitCost: prod.costPrice,
          totalCost: -itemCostTotal,
          unitPrice: prod.salePrice,
          totalPrice: itemTotal,
          referenceDoc: saleId,
          clientOrSupplier: customerName || 'Venta Mostrador / Barra',
          note: `Venta POS rápida (${qty} ${prod.unit})`,
          performedBy: activeUser.name,
          performedByRole: activeUser.role,
        });

        return {
          ...prod,
          currentStock: newStock,
          lastUpdated: new Date().toISOString(),
        };
      }
      return prod;
    });

    storageService.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    setKardexMovements(storageService.getKardex());

    const saleItems: TabItem[] = cart.map((c, idx) => ({
      id: `it-pos-${Date.now()}-${idx}`,
      productId: c.product.id,
      productName: c.product.name,
      category: c.product.category,
      unit: c.product.unit,
      unitPrice: c.product.salePrice,
      costPrice: c.product.costPrice,
      quantity: c.quantity,
      subtotal: c.product.salePrice * c.quantity,
      addedAt: new Date().toISOString(),
      addedBy: activeUser.name,
    }));

    // Record accounting transaction
    storageService.addTransaction({
      type: 'INGRESO_VENTA',
      category: 'Ventas POS Mostrador',
      amount: totalSaleAmount,
      costAmount: totalSaleCost,
      paymentMethod,
      reference: saleId,
      description: `Venta rápida de ${cart.reduce((a, b) => a + b.quantity, 0)} tragos (${cart.map((c) => `${c.quantity}x ${c.product.name}`).join(', ')})`,
      registeredBy: activeUser.name,
      location: 'Mostrador / POS',
      clientName: customerName || 'Venta Mostrador',
      items: saleItems,
    });

    setTransactions(storageService.getTransactions());
    showToast(`Venta ${saleId} registrada con éxito por ${formatCurrency(totalSaleAmount)}`);
  };

  // 2. CHARGE ITEMS FROM POS TO A CLIENT TAB
  const handleChargeToTab = (
    cart: CartItem[],
    tabId: string,
    newClientName?: string,
    location: string = 'Barra Principal'
  ) => {
    let targetTab: ClientTab | undefined;
    let updatedTabs: ClientTab[];

    // Deduct stock and register Kardex for each item
    const updatedProducts = products.map((prod) => {
      const cartEntry = cart.find((c) => c.product.id === prod.id);
      if (cartEntry) {
        const qty = cartEntry.quantity;
        const newStock = Math.max(0, prod.currentStock - qty);
        const itemTotal = prod.salePrice * qty;
        const itemCostTotal = prod.costPrice * qty;

        storageService.addKardexMovement({
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          type: 'VENTA_CUENTA',
          quantity: -qty,
          previousStock: prod.currentStock,
          newStock,
          unitCost: prod.costPrice,
          totalCost: -itemCostTotal,
          unitPrice: prod.salePrice,
          totalPrice: itemTotal,
          referenceDoc: `#CTA-${newClientName || 'CLIENTE'}`,
          clientOrSupplier: newClientName || 'Cuenta Cliente',
          note: `Tragos cargados a comanda de cliente`,
          performedBy: activeUser.name,
          performedByRole: activeUser.role,
        });

        return {
          ...prod,
          currentStock: newStock,
          lastUpdated: new Date().toISOString(),
        };
      }
      return prod;
    });

    storageService.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    setKardexMovements(storageService.getKardex());

    // Tab items to append
    const newItems: TabItem[] = cart.map((c) => ({
      id: `it-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: c.product.id,
      productName: c.product.name,
      category: c.product.category,
      unit: c.product.unit,
      unitPrice: c.product.salePrice,
      costPrice: c.product.costPrice,
      quantity: c.quantity,
      subtotal: c.product.salePrice * c.quantity,
      addedAt: new Date().toISOString(),
      addedBy: activeUser.name,
    }));

    if (tabId) {
      // Append to existing tab
      updatedTabs = clientTabs.map((t) => {
        if (t.id === tabId) {
          const combinedItems = [...t.items, ...newItems];
          const newSubtotal = combinedItems.reduce((acc, it) => acc + it.subtotal, 0);
          return {
            ...t,
            items: combinedItems,
            subtotal: newSubtotal,
            suggestedTip: 0,
            total: newSubtotal - (t.discount || 0),
          };
        }
        return t;
      });
      targetTab = updatedTabs.find((t) => t.id === tabId);
    } else {
      // Create brand new tab
      const newSubtotal = newItems.reduce((acc, it) => acc + it.subtotal, 0);
      const createdTab: ClientTab = {
        id: `tab-${Date.now()}`,
        clientName: newClientName || 'Cliente Barra',
        location,
        openedAt: new Date().toISOString(),
        status: 'ABIERTA',
        items: newItems,
        subtotal: newSubtotal,
        suggestedTip: 0,
        discount: 0,
        total: newSubtotal,
        waiterName: activeUser.name,
      };
      updatedTabs = [createdTab, ...clientTabs];
      targetTab = createdTab;
    }

    storageService.saveClientTabs(updatedTabs);
    setClientTabs(updatedTabs);
    showToast(`Tragos cargados a la cuenta de ${targetTab?.clientName || 'Cliente'}`);
  };

  // 3. UPDATE TAB (ADDING DRINKS INSIDE CLIENT TABS VIEW)
  const handleUpdateTab = (updatedTab: ClientTab) => {
    const updated = clientTabs.map((t) => (t.id === updatedTab.id ? updatedTab : t));
    storageService.saveClientTabs(updated);
    setClientTabs(updated);
  };

  // 4. CLOSE & SETTLE TAB (ONLY EFECTIVO OR TRANSFERENCIA)
  const handleCloseTab = (
    tab: ClientTab,
    paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA',
    finalTotal: number
  ) => {
    const updatedTabs = clientTabs.map((t) => {
      if (t.id === tab.id) {
        return {
          ...t,
          status: 'PAGADA' as const,
          closedAt: new Date().toISOString(),
          paymentMethod,
          suggestedTip: 0,
          total: finalTotal,
        };
      }
      return t;
    });

    storageService.saveClientTabs(updatedTabs);
    setClientTabs(updatedTabs);

    const totalCostOfTab = tab.items.reduce((acc, it) => acc + it.costPrice * it.quantity, 0);

    const itemsSummary = tab.items.length > 0
      ? ` (${tab.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')})`
      : '';

    // Register Accounting Transaction
    storageService.addTransaction({
      type: 'INGRESO_VENTA',
      category: 'Ventas Cuentas Bar & Mesas',
      amount: finalTotal,
      costAmount: totalCostOfTab,
      paymentMethod,
      reference: `#CTA-LIQ-${tab.id.slice(-4)}`,
      description: `Liquidación cuenta ${tab.clientName} (${tab.location})${itemsSummary}`,
      registeredBy: activeUser.name,
      location: tab.location,
      clientName: tab.clientName,
      items: tab.items,
    });

    setTransactions(storageService.getTransactions());
    showToast(`Cuenta de ${tab.clientName} cobrada con éxito: ${formatCurrency(finalTotal)} (${paymentMethod})`);
  };

  // 5. CREATE NEW TAB
  const handleCreateTab = (clientName: string, location: string, notes?: string) => {
    const newTab: ClientTab = {
      id: `tab-${Date.now()}`,
      clientName,
      location,
      openedAt: new Date().toISOString(),
      status: 'ABIERTA',
      items: [],
      subtotal: 0,
      suggestedTip: 0,
      discount: 0,
      total: 0,
      waiterName: activeUser.name,
      notes,
    };

    const updated = [newTab, ...clientTabs];
    storageService.saveClientTabs(updated);
    setClientTabs(updated);
    showToast(`Nueva cuenta abierta para: ${clientName}`);
  };

  const handleQuickCreateTab = (
    clientName: string,
    location: string,
    initialCart: CartItem[] = [],
    existingTabId?: string
  ) => {
    const finalClientName = clientName.trim() || location;
    if (initialCart.length > 0) {
      handleChargeToTab(initialCart, existingTabId || '', finalClientName, location);
      if (existingTabId) {
        setClientTabs((prev) => {
          const updated = prev.map((t) =>
            t.id === existingTabId ? { ...t, clientName: finalClientName } : t
          );
          storageService.saveClientTabs(updated);
          return updated;
        });
      }
    } else if (existingTabId) {
      const updated = clientTabs.map((t) =>
        t.id === existingTabId ? { ...t, clientName: finalClientName } : t
      );
      storageService.saveClientTabs(updated);
      setClientTabs(updated);
      showToast(`Mesa ${location} actualizada (${finalClientName})`);
    } else {
      handleCreateTab(finalClientName, location);
    }
  };

  const handleQuickPayTable = (
    clientName: string,
    location: string,
    newCart: CartItem[] = [],
    paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' = 'EFECTIVO',
    existingTab?: ClientTab
  ) => {
    const finalClientName = clientName.trim() || existingTab?.clientName || location;
    let additionalAmount = 0;
    let additionalCost = 0;

    if (newCart.length > 0) {
      const updatedProducts = products.map((prod) => {
        const cartEntry = newCart.find((c) => c.product.id === prod.id);
        if (cartEntry) {
          const qty = cartEntry.quantity;
          const newStock = Math.max(0, prod.currentStock - qty);
          const itemTotal = prod.salePrice * qty;
          const itemCostTotal = prod.costPrice * qty;
          additionalAmount += itemTotal;
          additionalCost += itemCostTotal;

          storageService.addKardexMovement({
            productId: prod.id,
            productName: prod.name,
            category: prod.category,
            type: 'VENTA_CUENTA',
            quantity: -qty,
            previousStock: prod.currentStock,
            newStock,
            unitCost: prod.costPrice,
            totalCost: -itemCostTotal,
            unitPrice: prod.salePrice,
            totalPrice: itemTotal,
            referenceDoc: `#CTA-${location}`,
            clientOrSupplier: finalClientName,
            note: `Consumo pagado en ${location}`,
            performedBy: activeUser.name,
            performedByRole: activeUser.role,
          });

          return {
            ...prod,
            currentStock: newStock,
            lastUpdated: new Date().toISOString(),
          };
        }
        return prod;
      });

      storageService.saveProducts(updatedProducts);
      setProducts(updatedProducts);
      setKardexMovements(storageService.getKardex());
    }

    const newItems: TabItem[] = newCart.map((c, idx) => ({
      id: `it-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      productId: c.product.id,
      productName: c.product.name,
      category: c.product.category,
      unit: c.product.unit,
      unitPrice: c.product.salePrice,
      costPrice: c.product.costPrice,
      quantity: c.quantity,
      subtotal: c.product.salePrice * c.quantity,
      addedAt: new Date().toISOString(),
      addedBy: activeUser.name,
    }));

    const combinedItems = existingTab ? [...existingTab.items, ...newItems] : newItems;
    const finalTotal = (existingTab?.total || 0) + additionalAmount;
    const totalCostOfTab =
      (existingTab
        ? existingTab.items.reduce((acc, it) => acc + it.costPrice * it.quantity, 0)
        : 0) + additionalCost;

    if (finalTotal <= 0) return;

    const nowIso = new Date().toISOString();
    const tabId = existingTab ? existingTab.id : `tab-${Date.now()}`;

    let updatedTabs: ClientTab[];
    if (existingTab) {
      updatedTabs = clientTabs.map((t) => {
        if (t.id === existingTab.id) {
          return {
            ...t,
            clientName: finalClientName,
            items: combinedItems,
            subtotal: existingTab.subtotal + additionalAmount,
            status: 'PAGADA' as const,
            closedAt: nowIso,
            paymentMethod,
            suggestedTip: 0,
            total: finalTotal,
          };
        }
        return t;
      });
    } else {
      const paidDirectTab: ClientTab = {
        id: tabId,
        clientName: finalClientName,
        location,
        openedAt: nowIso,
        closedAt: nowIso,
        status: 'PAGADA',
        items: combinedItems,
        subtotal: finalTotal,
        suggestedTip: 0,
        discount: 0,
        total: finalTotal,
        paymentMethod,
        waiterName: activeUser.name,
      };
      updatedTabs = [paidDirectTab, ...clientTabs];
    }

    storageService.saveClientTabs(updatedTabs);
    setClientTabs(updatedTabs);

    const itemsSummary =
      combinedItems.length > 0
        ? ` (${combinedItems.map((it) => `${it.quantity}x ${it.productName}`).join(', ')})`
        : '';

    storageService.addTransaction({
      type: 'INGRESO_VENTA',
      category: 'Ventas Cuentas Bar & Mesas',
      amount: finalTotal,
      costAmount: totalCostOfTab,
      paymentMethod,
      reference: `#CTA-LIQ-${tabId.slice(-4)}`,
      description: `Pago rápido ${location}${itemsSummary}`,
      registeredBy: activeUser.name,
      location,
      clientName: finalClientName,
      items: combinedItems,
    });

    setTransactions(storageService.getTransactions());
    showToast(
      `${location} pagada y registrada en Cerradas Hoy: ${formatCurrency(finalTotal)} (${paymentMethod})`
    );
  };

  const handleReleaseTable = (tabToRelease: ClientTab) => {
    if (tabToRelease.items.length > 0) {
      showToast(
        `No se puede liberar ${tabToRelease.location} sin pagar porque ya tiene productos registrados`
      );
      return;
    }

    const updatedTabs = clientTabs.filter((t) => t.id !== tabToRelease.id);
    storageService.saveClientTabs(updatedTabs);
    setClientTabs(updatedTabs);
    showToast(`${tabToRelease.location} liberada correctamente`);
  };

  // TABLES CRUD HANDLERS (AGREGAR, EDITAR, ELIMINAR MESAS)
  const handleAddTable = (newTableName: string) => {
    const clean = newTableName.trim();
    if (!clean) return;
    if (tables.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      showToast(`La mesa "${clean}" ya existe`);
      return;
    }
    const updated = [...tables, clean];
    storageService.saveTables(updated);
    setTables(updated);
    showToast(`Mesa "${clean}" agregada con éxito`);
  };

  const handleEditTable = (oldName: string, newName: string) => {
    const clean = newName.trim();
    if (!clean || clean === oldName) return;
    if (
      tables.some(
        (t) => t.toLowerCase() === clean.toLowerCase() && t.toLowerCase() !== oldName.toLowerCase()
      )
    ) {
      showToast(`Ya existe otra mesa con el nombre "${clean}"`);
      return;
    }
    const updatedTables = tables.map((t) => (t === oldName ? clean : t));
    storageService.saveTables(updatedTables);
    setTables(updatedTables);

    // Also update any open tabs at that table
    const updatedTabs = clientTabs.map((t) => {
      if (t.location.toLowerCase() === oldName.toLowerCase()) {
        return {
          ...t,
          location: clean,
          clientName: t.clientName.toLowerCase() === oldName.toLowerCase() ? clean : t.clientName,
        };
      }
      return t;
    });
    storageService.saveClientTabs(updatedTabs);
    setClientTabs(updatedTabs);
    showToast(`Mesa "${oldName}" actualizada a "${clean}"`);
  };

  const handleDeleteTable = (tableName: string) => {
    const occupiedWithItems = clientTabs.find(
      (t) =>
        t.status === 'ABIERTA' &&
        (t.location.toLowerCase() === tableName.toLowerCase() ||
          t.clientName.toLowerCase() === tableName.toLowerCase()) &&
        t.items.length > 0
    );
    if (occupiedWithItems) {
      showToast(`No puedes eliminar "${tableName}" porque tiene una cuenta abierta con consumo`);
      return;
    }

    // Remove any empty open tab on that table
    const cleanedTabs = clientTabs.filter(
      (t) =>
        !(
          t.status === 'ABIERTA' &&
          (t.location.toLowerCase() === tableName.toLowerCase() ||
            t.clientName.toLowerCase() === tableName.toLowerCase())
        )
    );
    storageService.saveClientTabs(cleanedTabs);
    setClientTabs(cleanedTabs);

    const updatedTables = tables.filter((t) => t !== tableName);
    storageService.saveTables(updatedTables);
    setTables(updatedTables);
    showToast(`Mesa "${tableName}" eliminada`);
  };

  // 6. INVENTORY CRUD HANDLERS
  const handleAddProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };

    const updated = [newProduct, ...products];
    storageService.saveProducts(updated);
    setProducts(updated);

    // Register initial entry into Kardex
    storageService.addKardexMovement({
      productId: newProduct.id,
      productName: newProduct.name,
      category: newProduct.category,
      type: 'ENTRADA_COMPRA',
      quantity: newProduct.currentStock,
      previousStock: 0,
      newStock: newProduct.currentStock,
      unitCost: newProduct.costPrice,
      totalCost: newProduct.costPrice * newProduct.currentStock,
      unitPrice: newProduct.salePrice,
      totalPrice: newProduct.salePrice * newProduct.currentStock,
      referenceDoc: `#INV-ALTA-${newProduct.sku}`,
      clientOrSupplier: newProduct.supplier,
      note: 'Ingreso inicial por alta de producto en sistema',
      performedBy: activeUser.name,
      performedByRole: activeUser.role,
    });

    setKardexMovements(storageService.getKardex());
    showToast(`Producto ${newProduct.name} creado y registrado en inventario`);
  };

  const handleEditProduct = (editedProd: Product) => {
    const updated = products.map((p) => (p.id === editedProd.id ? editedProd : p));
    storageService.saveProducts(updated);
    setProducts(updated);
    showToast(`Producto ${editedProd.name} actualizado`);
  };

  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    const updated = products.filter((p) => p.id !== productId);
    storageService.saveProducts(updated);
    setProducts(updated);
    showToast(`Producto ${target?.name || ''} eliminado del inventario`);
  };

  const handleQuickStockAdjust = (
    productId: string,
    type: 'ENTRADA_COMPRA' | 'AJUSTE_MERMA' | 'AJUSTE_INVENTARIO',
    quantityDelta: number,
    note: string
  ) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const previousStock = target.currentStock;
    const newStock = Math.max(0, previousStock + quantityDelta);

    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          currentStock: newStock,
          lastUpdated: new Date().toISOString(),
        };
      }
      return p;
    });

    storageService.saveProducts(updated);
    setProducts(updated);

    storageService.addKardexMovement({
      productId: target.id,
      productName: target.name,
      category: target.category,
      type,
      quantity: quantityDelta,
      previousStock,
      newStock,
      unitCost: target.costPrice,
      totalCost: target.costPrice * quantityDelta,
      unitPrice: target.salePrice,
      totalPrice: target.salePrice * quantityDelta,
      referenceDoc: `#AJUSTE-${Date.now().toString().slice(-4)}`,
      note,
      performedBy: activeUser.name,
      performedByRole: activeUser.role,
    });

    setKardexMovements(storageService.getKardex());
    showToast(`Ajuste de stock aplicado a ${target.name} (${quantityDelta > 0 ? '+' : ''}${quantityDelta})`);
  };

  // 7. BUSINESS EXPENSES & ACCOUNTING HANDLERS
  const handleAddExpense = (expenseData: Omit<BusinessExpense, 'id' | 'timestamp'>) => {
    const newExp = storageService.addExpense(expenseData);
    setExpenses(storageService.getExpenses());
    setTransactions(storageService.getTransactions());
    showToast(`Gasto registrado: ${newExp.description} (${formatCurrency(newExp.amount)})`);
  };

  const handleDeleteExpense = (expenseId: string) => {
    storageService.deleteExpense(expenseId);
    setExpenses(storageService.getExpenses());
    showToast('Gasto eliminado del registro');
  };

  // 8. JUEGOS: TEJO & BOLIRANA HANDLERS
  const handleAddGameTrack = (trackData: Omit<GameTrack, 'id'>) => {
    const newTrack: GameTrack = {
      ...trackData,
      id: `track-${Date.now()}`,
    };
    const updated = [...gameTracks, newTrack];
    storageService.saveGameTracks(updated);
    setGameTracks(updated);
    showToast(`Pista ${newTrack.name} creada exitosamente`);
  };

  const handleUpdateGameTrack = (editedTrack: GameTrack) => {
    const updated = gameTracks.map((t) => (t.id === editedTrack.id ? editedTrack : t));
    storageService.saveGameTracks(updated);
    setGameTracks(updated);
    showToast(`Pista ${editedTrack.name} actualizada`);
  };

  const handleDeleteGameTrack = (trackId: string) => {
    const target = gameTracks.find((t) => t.id === trackId);
    const updated = gameTracks.filter((t) => t.id !== trackId);
    storageService.saveGameTracks(updated);
    setGameTracks(updated);
    showToast(`Pista ${target?.name || ''} eliminada`);
  };

  const handleStartGameTrack = (trackId: string, clientName: string) => {
    const nowTime = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const updated = gameTracks.map((t) => {
      if (t.id === trackId) {
        return {
          ...t,
          status: 'EN_JUEGO' as const,
          activeClient: clientName,
          activeStartTime: nowTime,
        };
      }
      return t;
    });
    storageService.saveGameTracks(updated);
    setGameTracks(updated);
    showToast(`Partida iniciada para ${clientName}`);
  };

  const handleFinishGameTrack = (trackId: string) => {
    const target = gameTracks.find((t) => t.id === trackId);
    const updated = gameTracks.map((t) => {
      if (t.id === trackId) {
        return {
          ...t,
          status: 'DISPONIBLE' as const,
          activeClient: undefined,
          activeStartTime: undefined,
          activeTabId: undefined,
        };
      }
      return t;
    });
    storageService.saveGameTracks(updated);
    setGameTracks(updated);
    showToast(`Pista ${target?.name || ''} liberada y disponible`);
  };

  const handleOpenBarTabForTrack = (track: GameTrack) => {
    const clientName = track.activeClient || 'Jugadores ' + track.name;
    const existingTab = clientTabs.find((t) => t.location === track.name && t.status === 'ABIERTA');

    if (existingTab) {
      setActiveTab('tabs');
    } else {
      const newTab: ClientTab = {
        id: `tab-track-${Date.now()}`,
        clientName,
        location: track.name,
        openedAt: new Date().toISOString(),
        status: 'ABIERTA',
        items: [],
        subtotal: 0,
        suggestedTip: 0,
        discount: 0,
        total: 0,
        waiterName: activeUser.name,
        notes: `Comanda de juego: ${track.name}`,
      };

      const updatedTabs = [newTab, ...clientTabs];
      storageService.saveClientTabs(updatedTabs);
      setClientTabs(updatedTabs);

      const updatedTracks = gameTracks.map((t) =>
        t.id === track.id ? { ...t, activeTabId: newTab.id } : t
      );
      storageService.saveGameTracks(updatedTracks);
      setGameTracks(updatedTracks);

      setActiveTab('tabs');
      showToast(`Comanda de bar abierta para ${track.name}`);
    }
  };

  const handleAddReservation = (resData: Omit<Reservation, 'id' | 'createdAt'>) => {
    const newRes: Reservation = {
      ...resData,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRes, ...reservations];
    storageService.saveReservations(updated);
    setReservations(updated);

    // If deposit was paid, record it in accounting
    if (newRes.depositAmount > 0) {
      storageService.addTransaction({
        type: 'INGRESO_VENTA',
        category: 'Anticipos Reservas Canchas',
        amount: newRes.depositAmount,
        paymentMethod: newRes.depositPaymentMethod || 'TRANSFERENCIA',
        reference: `#RES-${newRes.id.slice(-4)}`,
        description: `Anticipo de reserva ${newRes.trackName || newRes.zoneName} (${newRes.clientName})`,
        registeredBy: activeUser.name,
      });
      setTransactions(storageService.getTransactions());
    }

    showToast(`Reserva para ${newRes.clientName} confirmada`);
  };

  const handleUpdateReservationStatus = (reservationId: string, newStatus: ReservationStatus) => {
    const updated = reservations.map((r) => {
      if (r.id === reservationId) {
        return { ...r, status: newStatus };
      }
      return r;
    });

    storageService.saveReservations(updated);
    setReservations(updated);
    showToast(`Estado de reserva actualizado a: ${newStatus}`);
  };

  const handleOpenBarTabForReservation = (reservation: Reservation) => {
    const locationName = reservation.trackName || reservation.zoneName || 'Cancha de Tejo';
    const existingTab = clientTabs.find(
      (t) => (t.id === reservation.linkedTabId || t.clientName.includes(reservation.clientName)) && t.status === 'ABIERTA'
    );

    if (existingTab) {
      setActiveTab('tabs');
    } else {
      const newTab: ClientTab = {
        id: `tab-res-${Date.now()}`,
        clientName: reservation.clientName,
        location: locationName,
        openedAt: new Date().toISOString(),
        status: 'ABIERTA',
        items: [],
        subtotal: 0,
        suggestedTip: 0,
        discount: 0,
        total: 0,
        waiterName: activeUser.name,
        linkedReservationId: reservation.id,
        notes: `Comanda de reserva: ${locationName}`,
      };

      const updatedTabs = [newTab, ...clientTabs];
      storageService.saveClientTabs(updatedTabs);
      setClientTabs(updatedTabs);

      const updatedReservations = reservations.map((r) =>
        r.id === reservation.id ? { ...r, linkedTabId: newTab.id } : r
      );
      storageService.saveReservations(updatedReservations);
      setReservations(updatedReservations);

      setActiveTab('tabs');
      showToast(`Comanda de bar abierta para ${reservation.clientName}`);
    }
  };

  const handleSelectProductForKardex = (productId: string) => {
    setSelectedProductIdForKardex(productId);
    setActiveTab('kardex');
  };

  const handleResetDemo = () => {
    if (window.confirm('¿Deseas restaurar todos los datos iniciales de prueba de la licorera?')) {
      storageService.resetToDemo();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    storageService.setAuthenticated(false);
    setIsAuthenticated(false);
    setSlideBarOpen(false);
    setLoginModalOpen(false);
  };

  // 9. USERS MANAGEMENT CRUD HANDLERS
  const handleAddUser = (newUserData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...newUserData,
      id: `user-${Date.now()}`,
    };
    const updated = [...users, newUser];
    storageService.saveUsers(updated);
    setUsers(updated);
    showToast(`Usuario ${newUser.name} (${newUser.roleTitle}) creado con éxito`);
  };

  const handleEditUser = (updatedUser: User) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    storageService.saveUsers(updated);
    setUsers(updated);
    if (activeUser.id === updatedUser.id) {
      setActiveUser(updatedUser);
      storageService.setActiveUser(updatedUser);
    }
    showToast(`Usuario ${updatedUser.name} actualizado`);
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      showToast('Debe existir al menos un usuario administrador en el sistema');
      return;
    }
    const target = users.find((u) => u.id === userId);
    const updated = users.filter((u) => u.id !== userId);
    storageService.saveUsers(updated);
    setUsers(updated);
    if (activeUser.id === userId && updated.length > 0) {
      setActiveUser(updated[0]);
      storageService.setActiveUser(updated[0]);
    }
    showToast(`Usuario ${target?.name || ''} eliminado`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
        <LoginModal
          isOpen={true}
          isFullScreen={true}
          currentUser={activeUser}
          users={users}
          onSelectUser={(u) => {
            setActiveUser(u);
            storageService.setActiveUser(u);
            storageService.setAuthenticated(true);
            setIsAuthenticated(true);
            showToast(`Bienvenido, ${u.name} (${u.roleTitle})`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Refined Header adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeUser={activeUser}
        onSwitchUser={(user) => {
          setActiveUser(user);
          storageService.setActiveUser(user);
          showToast(`Perfil cambiado a: ${user.name} (${user.roleTitle})`);
        }}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        openTabsCount={openTabsCount}
        lowStockCount={lowStockCount}
        onToggleSlideBar={() => setSlideBarOpen((prev) => !prev)}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />

      {/* Main Container Viewport (1440px wide baseline) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeTab === 'home' && (
          <HomeDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            products={products}
            clientTabs={clientTabs}
            tables={tables}
            users={users}
            reservations={reservations}
            gameTracks={gameTracks}
            transactions={transactions}
            expenses={expenses}
            activeUser={activeUser}
            onQuickCreateTab={handleQuickCreateTab}
            onQuickPayTable={handleQuickPayTable}
            onReleaseTable={handleReleaseTable}
            onAddTable={handleAddTable}
            onEditTable={handleEditTable}
            onDeleteTable={handleDeleteTable}
          />
        )}

        {activeTab === 'pos' && (
          <FastPOS
            products={products}
            clientTabs={clientTabs}
            transactions={transactions}
            activeUser={activeUser}
            onCompleteSale={handleCompleteSale}
            onChargeToTab={handleChargeToTab}
          />
        )}

        {activeTab === 'tabs' && (
          <ClientTabsView
            clientTabs={clientTabs}
            products={products}
            activeUser={activeUser}
            onUpdateTab={handleUpdateTab}
            onCloseTab={handleCloseTab}
            onCreateTab={handleCreateTab}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            activeUser={activeUser}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onQuickStockAdjust={handleQuickStockAdjust}
            onSelectProductForKardex={handleSelectProductForKardex}
          />
        )}

        {activeTab === 'kardex' && (
          <KardexView
            kardexMovements={kardexMovements}
            products={products}
            selectedProductId={selectedProductIdForKardex}
            onSelectProduct={(id) => setSelectedProductIdForKardex(id)}
          />
        )}

        {activeTab === 'accounting' && (
          <AccountingView
            transactions={transactions}
            expenses={expenses}
            products={products}
            kardexMovements={kardexMovements}
            activeUser={activeUser}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'reservations' && (
          <ReservationsView
            reservations={reservations}
            gameTracks={gameTracks}
            onAddReservation={handleAddReservation}
            onUpdateStatus={handleUpdateReservationStatus}
            onOpenBarTabForReservation={handleOpenBarTabForReservation}
            onAddGameTrack={handleAddGameTrack}
            onUpdateGameTrack={handleUpdateGameTrack}
            onDeleteGameTrack={handleDeleteGameTrack}
            onStartGameTrack={handleStartGameTrack}
            onFinishGameTrack={handleFinishGameTrack}
            onOpenBarTabForTrack={handleOpenBarTabForTrack}
          />
        )}

        {activeTab === 'users' && (
          <UsersView
            users={users}
            activeUser={activeUser}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onSelectActiveUser={(u) => {
              setActiveUser(u);
              storageService.setActiveUser(u);
              showToast(`Sesión activa cambiada a: ${u.name} (${u.roleTitle})`);
            }}
          />
        )}
      </main>

      {/* Luxury Footer (Quiet, clean single row) */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-4 px-4 sm:px-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-zinc-300">AURA · Licorera & Lounge</span>
            <span className="text-zinc-700 hidden sm:inline">·</span>
            <span className="hidden sm:inline">Sistema POS & Inventario de Alto Flujo</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer font-semibold"
            >
              Usuarios & Administradores
            </button>
            <span className="text-zinc-800">|</span>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              Cambiar Usuario
            </button>
            <span className="text-zinc-800">|</span>
            <button
              onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer font-semibold"
            >
              Cerrar Sesión
            </button>
            <span className="text-zinc-800">|</span>
            <button
              onClick={handleResetDemo}
              className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer Datos Demo</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Toast Feedback */}
      {toastNotification && (
        <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 bg-zinc-900 border border-amber-500/40 text-zinc-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between sm:justify-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">{toastNotification}</span>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-zinc-500 hover:text-zinc-300 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Login & Multi-Role Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        currentUser={activeUser}
        users={users}
        onSelectUser={(u) => {
          setActiveUser(u);
          storageService.setActiveUser(u);
          showToast(`Sesión iniciada como: ${u.name} (${u.roleTitle})`);
        }}
      />

      {/* Slide Bar (Slide-out Navigation Drawer) */}
      <SlideBar
        isOpen={slideBarOpen}
        onClose={() => setSlideBarOpen(false)}
        onToggle={() => setSlideBarOpen((prev) => !prev)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSlideBarOpen(false);
        }}
        openTabsCount={openTabsCount}
        lowStockCount={lowStockCount}
        activeGamesCount={gameTracks.filter((t) => t.status === 'EN_JUEGO').length}
        activeUser={activeUser}
        onOpenUserModal={() => setLoginModalOpen(true)}
      />
    </div>
  );
}
