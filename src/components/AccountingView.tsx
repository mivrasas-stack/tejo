import React, { useState, useMemo, useEffect } from 'react';
import { 
  CircleDollarSign, 
  TrendingUp, 
  TrendingDown, 
  Banknote, 
  Smartphone, 
  Plus, 
  Trash2, 
  Download, 
  Receipt, 
  Search, 
  Wine, 
  Package, 
  ArrowUpRight, 
  Filter, 
  Calendar, 
  X,
  AlertCircle,
  Percent,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  AccountingTransaction, 
  BusinessExpense, 
  Product, 
  KardexMovement, 
  User, 
  PaymentMethod,
  Category 
} from '../types';
import { formatCurrency, formatShortDate, formatCOPInput, parseCOPInput } from '../services/storage';

interface AccountingViewProps {
  transactions: AccountingTransaction[];
  expenses: BusinessExpense[];
  products: Product[];
  kardexMovements: KardexMovement[];
  activeUser: User;
  onAddExpense: (expense: Omit<BusinessExpense, 'id' | 'timestamp'>) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  transactions,
  expenses,
  products,
  kardexMovements,
  activeUser,
  onAddExpense,
  onDeleteExpense,
}) => {
  // Navigation tabs within Accounting
  const [activeSubTab, setActiveSubTab] = useState<'MARGINS' | 'EXPENSES' | 'TRANSACTIONS'>('MARGINS');

  // Search & Filters for Margins
  const [marginSearch, setMarginSearch] = useState('');
  const [marginCategory, setMarginCategory] = useState<string>('all');
  const [marginPage, setMarginPage] = useState<number>(1);
  const MARGINS_PER_PAGE = 10;

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setMarginPage(1);
  }, [marginSearch, marginCategory]);

  // Search & Filters for Expenses
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [newExpenseModalOpen, setNewExpenseModalOpen] = useState(false);

  // New Expense Form State
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formCategory, setFormCategory] = useState<BusinessExpense['category']>('Compra de Licor Extra');
  const [formDescription, setFormDescription] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('TRANSFERENCIA');
  const [formInvoiceRef, setFormInvoiceRef] = useState('');

  // Transactions Filter
  const [txMethodFilter, setTxMethodFilter] = useState<string>('ALL');
  const [selectedTxDetail, setSelectedTxDetail] = useState<AccountingTransaction | null>(null);

  // 1. Calculate units sold per product from Kardex movements
  const unitsSoldMap = useMemo(() => {
    const map: Record<string, number> = {};
    kardexMovements.forEach((m) => {
      if (m.type === 'VENTA_DIRECTA' || m.type === 'VENTA_CUENTA') {
        const qtySold = Math.abs(m.quantity);
        map[m.productId] = (map[m.productId] || 0) + qtySold;
      }
    });
    return map;
  }, [kardexMovements]);

  // 2. Specific Profit Margins per Liquor
  const productMarginsList = useMemo(() => {
    return products.map((prod) => {
      const unitsSold = unitsSoldMap[prod.id] || 0;
      const unitCost = prod.costPrice;
      const unitSale = prod.salePrice;
      const unitProfit = unitSale - unitCost;
      const marginPercent = unitSale > 0 ? (unitProfit / unitSale) * 100 : 0;
      const totalRevenue = unitsSold * unitSale;
      const totalCost = unitsSold * unitCost;
      const totalProfit = unitsSold * unitProfit;

      return {
        productId: prod.id,
        productName: prod.name,
        category: prod.category,
        unit: prod.unit,
        sku: prod.sku,
        costPrice: unitCost,
        salePrice: unitSale,
        unitProfit,
        marginPercent,
        unitsSold,
        totalRevenue,
        totalCost,
        totalProfit,
      };
    });
  }, [products, unitsSoldMap]);

  // Filtered margins
  const filteredProductMargins = useMemo(() => {
    return productMarginsList.filter((item) => {
      const matchesCategory = marginCategory === 'all' || item.category === marginCategory;
      const matchesSearch =
        item.productName.toLowerCase().includes(marginSearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(marginSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [productMarginsList, marginCategory, marginSearch]);

  // Pagination for liquor margins (Limit: 10)
  const totalMarginPages = Math.max(1, Math.ceil(filteredProductMargins.length / MARGINS_PER_PAGE));
  const currentMarginPage = Math.min(marginPage, totalMarginPages);

  const paginatedProductMargins = useMemo(() => {
    const startIndex = (currentMarginPage - 1) * MARGINS_PER_PAGE;
    return filteredProductMargins.slice(startIndex, startIndex + MARGINS_PER_PAGE);
  }, [filteredProductMargins, currentMarginPage]);

  // 3. Global Financial Summary
  const financialTotals = useMemo(() => {
    let totalSales = 0;
    let totalCOGS = 0;
    let cashSales = 0;
    let transferSales = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'INGRESO_VENTA') {
        totalSales += tx.amount;
        if (tx.costAmount) totalCOGS += tx.costAmount;

        if (tx.paymentMethod === 'EFECTIVO') cashSales += tx.amount;
        else if (tx.paymentMethod === 'TRANSFERENCIA') transferSales += tx.amount;
      }
    });

    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const grossProfit = totalSales - totalCOGS;
    const globalGrossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
    const netProfit = grossProfit - totalExpenses;

    const extraLiquorExpenses = expenses
      .filter((e) => e.category === 'Compra de Licor Extra')
      .reduce((acc, e) => acc + e.amount, 0);

    const operationalExpenses = totalExpenses - extraLiquorExpenses;

    return {
      totalSales,
      totalCOGS,
      grossProfit,
      globalGrossMargin,
      totalExpenses,
      extraLiquorExpenses,
      operationalExpenses,
      netProfit,
      cashSales,
      transferSales,
    };
  }, [transactions, expenses]);

  // 4. Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesCat = expenseCategoryFilter === 'all' || e.category === expenseCategoryFilter;
      const matchesSearch =
        e.description.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        (e.supplierOrBeneficiary && e.supplierOrBeneficiary.toLowerCase().includes(expenseSearch.toLowerCase())) ||
        (e.invoiceRef && e.invoiceRef.toLowerCase().includes(expenseSearch.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [expenses, expenseCategoryFilter, expenseSearch]);

  // Handle submit expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (formAmount <= 0 || !formDescription.trim()) return;

    onAddExpense({
      amount: formAmount,
      category: formCategory,
      description: formDescription.trim(),
      supplierOrBeneficiary: formSupplier.trim() || undefined,
      paymentMethod: formPaymentMethod,
      registeredBy: activeUser.name,
      invoiceRef: formInvoiceRef.trim() || undefined,
    });

    setNewExpenseModalOpen(false);
    setFormAmount(0);
    setFormDescription('');
    setFormSupplier('');
    setFormInvoiceRef('');
  };

  const categories = [
    'all',
    'Whisky',
    'Tequila & Mezcal',
    'Ron & Aguardiente',
    'Ginebra & Vodka',
    'Cervezas',
    'Coctelería de Autor',
    'Pasantes & Snacks',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-amber-400" />
            <span>Contabilidad, Márgenes de Licor & Gastos</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Análisis exacto de margen de ganancia por licor vendido, desglose por Efectivo y Transferencia, y control de gastos.
          </p>
        </div>

        {/* Navigation Tabs between Margins, Expenses, and Transactions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveSubTab('MARGINS')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'MARGINS'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Márgenes por Licor
            </button>
            <button
              onClick={() => setActiveSubTab('EXPENSES')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'EXPENSES'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Gastos ({expenses.length})
            </button>
            <button
              onClick={() => setActiveSubTab('TRANSACTIONS')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'TRANSACTIONS'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Libro de Ventas
            </button>
          </div>

          {activeSubTab === 'EXPENSES' && (
            <button
              onClick={() => setNewExpenseModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Gasto</span>
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Sales */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium block">Ventas Totales:</span>
          <p className="text-xl font-bold text-zinc-100 font-mono mt-1 tabular-nums">
            {formatCurrency(financialTotals.totalSales)}
          </p>
          <span className="text-[11px] text-zinc-500">Costo inventario: {formatCurrency(financialTotals.totalCOGS)}</span>
        </div>

        {/* Gross Profit on Liquors */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-zinc-400 font-medium">Ganancia en Licor:</span>
            <span className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
              {financialTotals.globalGrossMargin.toFixed(1)}% margen
            </span>
          </div>
          <p className="text-xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
            {formatCurrency(financialTotals.grossProfit)}
          </p>
          <span className="text-[11px] text-zinc-500">Utilidad bruta de venta menos compra</span>
        </div>

        {/* Total Business Expenses */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium block">Gastos Totales Registrados:</span>
          <p className="text-xl font-bold text-rose-400 font-mono mt-1 tabular-nums">
            {formatCurrency(financialTotals.totalExpenses)}
          </p>
          <span className="text-[11px] text-zinc-500">
            Licor extra: {formatCurrency(financialTotals.extraLiquorExpenses)}
          </span>
        </div>

        {/* Net Profit */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/30">
          <span className="text-xs text-amber-300 font-semibold block">Ganancia Neta Final:</span>
          <p className="text-2xl font-bold text-amber-400 font-mono mt-1 tabular-nums">
            {formatCurrency(financialTotals.netProfit)}
          </p>
          <span className="text-[11px] text-zinc-400">Ganancia de licor menos gastos</span>
        </div>
      </div>

      {/* Recaudación por Canales de Pago (Únicamente Efectivo y Transferencia) */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-amber-400" />
          <span>Desglose de Ventas por Medio de Pago (Efectivo & Transferencia)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Efectivo */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-zinc-100">Ventas en Efectivo</h5>
                <p className="text-xs text-zinc-500">Dinero recibido en mano</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums block">
                {formatCurrency(financialTotals.cashSales)}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {financialTotals.totalSales > 0
                  ? ((financialTotals.cashSales / financialTotals.totalSales) * 100).toFixed(0)
                  : 0}
                % del total
              </span>
            </div>
          </div>

          {/* Transferencia */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-zinc-100">Ventas por Transferencia</h5>
                <p className="text-xs text-zinc-500">Nequi, Daviplata, Bancolombia QR</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-mono font-bold text-purple-400 tabular-nums block">
                {formatCurrency(financialTotals.transferSales)}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {financialTotals.totalSales > 0
                  ? ((financialTotals.transferSales / financialTotals.totalSales) * 100).toFixed(0)
                  : 0}
                % del total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: MÓDULO ESPECÍFICO DE MÁRGENES DE GANANCIA POR LICOR */}
      {activeSubTab === 'MARGINS' && (
        <div className="space-y-4">
          {/* Section banner */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={marginSearch}
                onChange={(e) => setMarginSearch(e.target.value)}
                placeholder="Buscar licor por nombre o SKU..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMarginCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    marginCategory === cat
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {cat === 'all' ? 'Todos los Licores' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table of Specific Profit Margins per Product */}
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Wine className="w-4 h-4 text-amber-400" />
                  <span>Márgenes y Ganancias Específicas por Licor</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Calcula la diferencia exacta entre el precio de compra al proveedor y el precio de venta al público.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-mono font-medium">
                  10 por página
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {filteredProductMargins.length} licores totales
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/90 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Licor / Bebida</th>
                    <th className="py-3 px-3">Categoría / Unidad</th>
                    <th className="py-3 px-3 text-right">Precio de Compra</th>
                    <th className="py-3 px-3 text-right">Precio de Venta</th>
                    <th className="py-3 px-3 text-right text-emerald-400 bg-emerald-950/10">Ganancia x Unidad</th>
                    <th className="py-3 px-3 text-center text-amber-300">Margen %</th>
                    <th className="py-3 px-3 text-center">Uds Vendidas</th>
                    <th className="py-3 px-4 text-right text-amber-400 font-bold">Ganancia Total Generada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {paginatedProductMargins.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500 font-sans">
                        No se encontraron licores registrados con los criterios seleccionados.
                      </td>
                    </tr>
                  ) : (
                    paginatedProductMargins.map((item) => (
                      <tr key={item.productId} className="hover:bg-zinc-850/50 transition-colors">
                        {/* Name & SKU */}
                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-zinc-100">{item.productName}</div>
                          <div className="font-mono text-[10px] text-zinc-500">{item.sku}</div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 font-sans text-zinc-300">
                          <div>{item.category}</div>
                          <div className="text-[10px] text-zinc-500">{item.unit}</div>
                        </td>

                        {/* Buy Cost */}
                        <td className="py-3 px-3 text-right text-zinc-400 tabular-nums">
                          {formatCurrency(item.costPrice)}
                        </td>

                        {/* Sale Price */}
                        <td className="py-3 px-3 text-right font-bold text-zinc-200 tabular-nums">
                          {formatCurrency(item.salePrice)}
                        </td>

                        {/* Profit per Unit */}
                        <td className="py-3 px-3 text-right font-bold text-emerald-400 bg-emerald-950/10 tabular-nums">
                          +{formatCurrency(item.unitProfit)}
                        </td>

                        {/* Margin % */}
                        <td className="py-3 px-3 text-center tabular-nums">
                          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {item.marginPercent.toFixed(1)}%
                          </span>
                        </td>

                        {/* Units Sold */}
                        <td className="py-3 px-3 text-center font-bold text-zinc-300 tabular-nums">
                          {item.unitsSold > 0 ? (
                            <span className="text-zinc-100 font-bold">{item.unitsSold} uds</span>
                          ) : (
                            <span className="text-zinc-600">0</span>
                          )}
                        </td>

                        {/* Total Profit Earned */}
                        <td className="py-3 px-4 text-right font-bold text-amber-400 text-sm tabular-nums">
                          {item.totalProfit > 0 ? formatCurrency(item.totalProfit) : '$0'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (Limit: 10 items) */}
            <div className="p-4 bg-zinc-950/90 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-zinc-400 font-sans flex items-center gap-1.5 flex-wrap">
                <span>Mostrando</span>
                <span className="font-semibold text-zinc-200 tabular-nums">
                  {filteredProductMargins.length === 0 ? 0 : (currentMarginPage - 1) * MARGINS_PER_PAGE + 1}
                </span>
                <span>a</span>
                <span className="font-semibold text-zinc-200 tabular-nums">
                  {Math.min(filteredProductMargins.length, currentMarginPage * MARGINS_PER_PAGE)}
                </span>
                <span>de</span>
                <span className="font-semibold text-amber-400 tabular-nums">
                  {filteredProductMargins.length}
                </span>
                <span>licores</span>
                {totalMarginPages > 1 && (
                  <span className="text-zinc-500 font-mono text-[11px] ml-1">
                    (Página {currentMarginPage} de {totalMarginPages})
                  </span>
                )}
              </div>

              {totalMarginPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMarginPage((p) => Math.max(1, p - 1))}
                    disabled={currentMarginPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Página Anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="text-xs">Anterior</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalMarginPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setMarginPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                          currentMarginPage === pageNum
                            ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setMarginPage((p) => Math.min(totalMarginPages, p + 1))}
                    disabled={currentMarginPage === totalMarginPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Página Siguiente"
                  >
                    <span className="text-xs">Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: APARTADO DE GASTOS DEL NEGOCIO */}
      {activeSubTab === 'EXPENSES' && (
        <div className="space-y-4">
          {/* Top Filter and Search Bar for Expenses */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                placeholder="Buscar gasto por detalle, proveedor o factura..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'all', label: 'Todos los Gastos' },
                { id: 'Compra de Licor Extra', label: 'Licor Extra / Pedidos Más' },
                { id: 'Insumos de Barra & Frutas', label: 'Insumos & Hielo' },
                { id: 'Nómina & Turnos', label: 'Nómina' },
                { id: 'Servicios & Arriendo', label: 'Servicios' },
                { id: 'Fletes & Domicilios', label: 'Fletes' },
                { id: 'Otros Gastos', label: 'Otros' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setExpenseCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    expenseCategoryFilter === c.id
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table of Business Expenses */}
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-rose-400" />
                  <span>Historial de Gastos y Compras Extra del Negocio</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Registro de pagos de licor extra, pedidos a proveedores, insumos de barra y gastos operativos.
                </p>
              </div>

              <button
                onClick={() => setNewExpenseModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Gasto</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Fecha & Hora</th>
                    <th className="py-3 px-3">Categoría</th>
                    <th className="py-3 px-3">Descripción / Motivo del Gasto</th>
                    <th className="py-3 px-3">Proveedor / Beneficiario</th>
                    <th className="py-3 px-3 text-center">Medio de Pago</th>
                    <th className="py-3 px-3 text-right">Monto Pagado</th>
                    <th className="py-3 px-3">Registrado Por</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {formatShortDate(exp.timestamp)}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                            exp.category === 'Compra de Licor Extra'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-zinc-200 font-medium">
                        <div>{exp.description}</div>
                        {exp.invoiceRef && (
                          <div className="font-mono text-[10px] text-zinc-500">Ref: {exp.invoiceRef}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-zinc-300">
                        {exp.supplierOrBeneficiary || 'Proveedor no especificado'}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            exp.paymentMethod === 'EFECTIVO'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-purple-500/10 text-purple-400'
                          }`}
                        >
                          {exp.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-sm text-rose-400 tabular-nums">
                        -{formatCurrency(exp.amount)}
                      </td>

                      <td className="py-3 px-3 text-zinc-400 text-xs">
                        {exp.registeredBy}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('¿Deseas eliminar este registro de gasto?')) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Eliminar gasto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredExpenses.length === 0 && (
              <div className="py-12 text-center text-zinc-500">
                <Receipt className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs">No hay gastos registrados en esta categoría.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: LIBRO DE VENTAS (TRANSACTIONS) */}
      {activeSubTab === 'TRANSACTIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-200">
              Historial de Ventas e Ingresos Contabilizados
            </h4>

            <div className="flex items-center gap-1.5 text-xs">
              {['ALL', 'EFECTIVO', 'TRANSFERENCIA'].map((m) => (
                <button
                  key={m}
                  onClick={() => setTxMethodFilter(m)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    txMethodFilter === m
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {m === 'ALL' ? 'Todos' : m}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-4">Fecha & Hora</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3">Detalle / Documento</th>
                    <th className="py-2.5 px-3 text-center">Medio de Pago</th>
                    <th className="py-2.5 px-3 text-right">Monto ($)</th>
                    <th className="py-2.5 px-4">Registrado Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {transactions
                    .filter((tx) => txMethodFilter === 'ALL' || tx.paymentMethod === txMethodFilter)
                    .map((tx) => {
                      const isIncome = tx.type === 'INGRESO_VENTA';
                      return (
                        <tr
                          key={tx.id}
                          onClick={() => setSelectedTxDetail(tx)}
                          className="hover:bg-amber-500/10 transition-colors cursor-pointer group"
                          title="Haz clic para ver el detalle completo del consumo"
                        >
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                            {formatShortDate(tx.timestamp)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                                isIncome
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {tx.location || tx.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-zinc-200">
                            <div className="font-medium group-hover:text-amber-300 transition-colors">
                              {tx.description}
                            </div>
                            <div className="font-mono text-[10px] text-amber-400/80 underline">
                              {tx.reference} · Clic para ver detalle →
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-xs text-zinc-300">
                            {tx.paymentMethod}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-mono font-bold text-sm tabular-nums ${
                              isIncome ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="py-3 px-4 text-zinc-400 text-xs">
                            {tx.registeredBy}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR GASTO DEL NEGOCIO */}
      {newExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <form
            onSubmit={handleCreateExpense}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[92dvh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Registrar Gasto del Negocio</h3>
                <p className="text-xs text-zinc-400">
                  Registra compras de licor extra, pedidos a proveedores o insumos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewExpenseModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-semibold text-zinc-300 mb-1">
                  Monto del Gasto (COP):
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formatCOPInput(formAmount)}
                  onChange={(e) => setFormAmount(parseCOPInput(e.target.value))}
                  placeholder="Ej. $ 120.000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-rose-400 font-bold font-mono text-base focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Categoría del Gasto:
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as BusinessExpense['category'])}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Compra de Licor Extra">Compra de Licor Extra (Se pidió trago de más)</option>
                  <option value="Insumos de Barra & Frutas">Insumos de Barra & Frutas (Hielo, limón, etc.)</option>
                  <option value="Nómina & Turnos">Nómina & Turnos de Personal</option>
                  <option value="Servicios & Arriendo">Servicios Públicos & Arriendo</option>
                  <option value="Fletes & Domicilios">Fletes & Domicilios Urgentes</option>
                  <option value="Mantenimiento & Aseo">Mantenimiento, Cristalería & Aseo</option>
                  <option value="Otros Gastos">Otros Gastos Operativos</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Medio de Pago Utilizado:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormPaymentMethod('EFECTIVO')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      formPaymentMethod === 'EFECTIVO'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPaymentMethod('TRANSFERENCIA')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      formPaymentMethod === 'TRANSFERENCIA'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Transferencia
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-zinc-300 mb-1">
                  Descripción Detallada del Gasto:
                </label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ej. Se pidieron 2 cajas de Whisky Buchanan's de más para el fin de semana"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Proveedor / Beneficiario (A quién se pagó):
                </label>
                <input
                  type="text"
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  placeholder="Ej. Diageo, Bavaria, Don Carlos..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  N° Factura / Soporte (Opcional):
                </label>
                <input
                  type="text"
                  value={formInvoiceRef}
                  onChange={(e) => setFormInvoiceRef(e.target.value)}
                  placeholder="Ej. #FAC-9921"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setNewExpenseModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
              >
                Guardar Gasto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE DETALLE DEL CONSUMO AL PULSAR UNA VENTA EN LIBRO DE VENTAS */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-100">
                    Detalle de Operación {selectedTxDetail.reference}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                    {selectedTxDetail.paymentMethod}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {selectedTxDetail.location || selectedTxDetail.category} · Registrado por{' '}
                  {selectedTxDetail.registeredBy}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxDetail(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 block">Fecha y Hora:</span>
                <span className="font-mono text-zinc-200 font-semibold">
                  {formatShortDate(selectedTxDetail.timestamp)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Mesa / Categoría:</span>
                <span className="font-semibold text-amber-400">
                  {selectedTxDetail.location || selectedTxDetail.clientName || selectedTxDetail.category}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Productos Consumidos / Detalle
              </span>

              {(() => {
                const matchedKardex = kardexMovements.filter(
                  (m) => m.referenceDoc === selectedTxDetail.reference
                );
                const detailItems =
                  selectedTxDetail.items && selectedTxDetail.items.length > 0
                    ? selectedTxDetail.items
                    : matchedKardex.map((m) => ({
                        id: m.id,
                        productId: m.productId,
                        productName: m.productName,
                        category: m.category,
                        unit: 'Unidad' as const,
                        unitPrice: m.unitPrice,
                        costPrice: m.unitCost,
                        quantity: Math.abs(m.quantity),
                        subtotal: m.totalPrice,
                        addedAt: m.timestamp,
                        addedBy: m.performedBy,
                      }));

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
                    {selectedTxDetail.description}
                  </div>
                );
              })()}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-300">Monto Total:</span>
              <span className="text-xl font-extrabold font-mono text-emerald-400">
                {formatCurrency(selectedTxDetail.amount)}
              </span>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTxDetail(null)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold cursor-pointer"
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
