import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  FileSpreadsheet, 
  SlidersHorizontal, 
  X, 
  Check, 
  ShieldAlert,
  ArrowUpDown,
  DollarSign,
  ImagePlus
} from 'lucide-react';
import { Product, Category, ProductUnit, User } from '../types';
import { formatCurrency, formatCOPInput, parseCOPInput } from '../services/storage';

interface InventoryViewProps {
  products: Product[];
  activeUser: User;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onQuickStockAdjust: (
    productId: string, 
    type: 'ENTRADA_COMPRA' | 'AJUSTE_MERMA' | 'AJUSTE_INVENTARIO', 
    quantityDelta: number, 
    note: string
  ) => void;
  onSelectProductForKardex: (productId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  activeUser,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onQuickStockAdjust,
  onSelectProductForKardex,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [adjustCandidate, setAdjustCandidate] = useState<Product | null>(null);

  // Quick adjust form state
  const [adjustType, setAdjustType] = useState<'ENTRADA_COMPRA' | 'AJUSTE_MERMA' | 'AJUSTE_INVENTARIO'>('ENTRADA_COMPRA');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState('');

  // Add/Edit Form State
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('Whisky');
  const [formUnit, setFormUnit] = useState<ProductUnit>('Botella');
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSalePrice, setFormSalePrice] = useState<number>(0);
  const [formCurrentStock, setFormCurrentStock] = useState<number>(10);
  const [formMinStock, setFormMinStock] = useState<number>(4);
  const [formSupplier, setFormSupplier] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 640;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          setFormImage(canvas.toDataURL('image/webp', 0.9));
        } else if (typeof event.target?.result === 'string') {
          setFormImage(event.target.result);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Metrics
  const metrics = useMemo(() => {
    let totalCostVal = 0;
    let totalSaleVal = 0;
    let lowStockItems = 0;

    products.forEach((p) => {
      totalCostVal += p.costPrice * p.currentStock;
      totalSaleVal += p.salePrice * p.currentStock;
      if (p.currentStock <= p.minStock) lowStockItems++;
    });

    const potentialGrossProfit = totalSaleVal - totalCostVal;
    const marginPercent = totalSaleVal > 0 ? (potentialGrossProfit / totalSaleVal) * 100 : 0;

    return {
      totalProducts: products.length,
      totalCostVal,
      totalSaleVal,
      potentialGrossProfit,
      marginPercent,
      lowStockItems,
    };
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLowStock = !showLowStockOnly || p.currentStock <= p.minStock;
      return matchesCategory && matchesSearch && matchesLowStock;
    });
  }, [products, categoryFilter, searchQuery, showLowStockOnly]);

  const openAddModal = () => {
    setFormSku(`LIC-${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormCategory('Whisky');
    setFormUnit('Botella');
    setFormCostPrice(0);
    setFormSalePrice(0);
    setFormCurrentStock(0);
    setFormMinStock(0);
    setFormSupplier('Distribuidor Autorizado');
    setFormDescription('');
    setFormImage('');
    setAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditProduct(p);
    setFormSku(p.sku);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormUnit(p.unit);
    setFormCostPrice(p.costPrice);
    setFormSalePrice(p.salePrice);
    setFormCurrentStock(p.currentStock);
    setFormMinStock(p.minStock);
    setFormSupplier(p.supplier);
    setFormDescription(p.description || '');
    setFormImage(p.image || '');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      sku: formSku,
      name: formName,
      category: formCategory,
      unit: formUnit,
      costPrice: formCostPrice,
      salePrice: formSalePrice,
      currentStock: formCurrentStock,
      minStock: formMinStock,
      supplier: formSupplier,
      description: formDescription,
      image: formImage.trim() || undefined,
      isAlcohol: true,
    });
    setAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    onEditProduct({
      ...editProduct,
      sku: formSku,
      name: formName,
      category: formCategory,
      unit: formUnit,
      costPrice: formCostPrice,
      salePrice: formSalePrice,
      currentStock: formCurrentStock,
      minStock: formMinStock,
      supplier: formSupplier,
      description: formDescription,
      image: formImage.trim() || undefined,
      lastUpdated: new Date().toISOString(),
    });
    setEditProduct(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    onDeleteProduct(deleteCandidate.id);
    setDeleteCandidate(null);
  };

  const handleExecuteAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustCandidate || adjustQty <= 0) return;

    onQuickStockAdjust(
      adjustCandidate.id,
      adjustType,
      adjustType === 'AJUSTE_MERMA' ? -adjustQty : adjustQty,
      adjustReason || (adjustType === 'ENTRADA_COMPRA' ? 'Ingreso por compra de stock' : 'Ajuste de inventario')
    );
    setAdjustCandidate(null);
    setAdjustQty(1);
    setAdjustReason('');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span>Módulo de Inventario & Stock</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Control de existencias, costos, precios, alertas de reposición y auditoría individual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium">Valor Inventario (Costo):</span>
          <p className="text-lg font-bold text-zinc-100 font-mono mt-1 tabular-nums">
            {formatCurrency(metrics.totalCostVal)}
          </p>
          <span className="text-[11px] text-zinc-500">{metrics.totalProducts} referencias activas</span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium">Valor Comercial (Venta):</span>
          <p className="text-lg font-bold text-amber-400 font-mono mt-1 tabular-nums">
            {formatCurrency(metrics.totalSaleVal)}
          </p>
          <span className="text-[11px] text-zinc-500">Total potencial en anaquel</span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium">Margen Bruto Proyectado:</span>
          <p className="text-lg font-bold text-emerald-400 font-mono mt-1 tabular-nums">
            {metrics.marginPercent.toFixed(1)}%
          </p>
          <span className="text-[11px] text-zinc-500">
            Utilidad: {formatCurrency(metrics.potentialGrossProfit)}
          </span>
        </div>

        <div
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            showLowStockOnly
              ? 'bg-rose-500/15 border-rose-500/60'
              : 'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800'
          }`}
        >
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Stock Bajo / Agotándose:
          </span>
          <p
            className={`text-lg font-bold font-mono mt-1 tabular-nums ${
              metrics.lowStockItems > 0 ? 'text-rose-400' : 'text-zinc-100'
            }`}
          >
            {metrics.lowStockItems} productos
          </p>
          <span className="text-[11px] text-amber-400/90 underline">
            {showLowStockOnly ? 'Mostrando solo alertas (clic para quitar)' : 'Filtrar stock crítico'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, código SKU o proveedor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'Whisky', 'Tequila & Mezcal', 'Ron & Aguardiente', 'Ginebra & Vodka', 'Cervezas', 'Coctelería de Autor', 'Pasantes & Snacks'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-zinc-950 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {cat === 'all' ? 'Todas las Categorías' : cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table of Inventory */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Producto & SKU</th>
                <th className="py-3 px-3">Categoría / Unidad</th>
                <th className="py-3 px-3 text-right">Costo Compra</th>
                <th className="py-3 px-3 text-right">Precio Venta</th>
                <th className="py-3 px-3 text-right">Margen</th>
                <th className="py-3 px-3 text-center">Stock Actual</th>
                <th className="py-3 px-3">Proveedor</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.currentStock <= 0;
                const isLow = p.currentStock <= p.minStock && !isOutOfStock;
                const marginPercent = p.salePrice > 0 ? ((p.salePrice - p.costPrice) / p.salePrice) * 100 : 0;

                return (
                  <tr key={p.id} className="hover:bg-zinc-850/60 transition-colors">
                    {/* Name & SKU */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-14 h-14 rounded-xl object-contain p-1 bg-zinc-950/80 border border-zinc-700/60 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0 text-amber-400 font-semibold text-sm">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-zinc-100">{p.name}</div>
                          <div className="font-mono text-[10px] text-zinc-500">{p.sku}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Unit */}
                    <td className="py-3 px-3">
                      <div className="text-zinc-300 font-medium">{p.category}</div>
                      <div className="text-[10px] text-zinc-500">{p.unit}</div>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-3 text-right font-mono text-zinc-400 tabular-nums">
                      {formatCurrency(p.costPrice)}
                    </td>

                    {/* Sale Price */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-400 tabular-nums">
                      {formatCurrency(p.salePrice)}
                    </td>

                    {/* Margin */}
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 tabular-nums">
                      {marginPercent.toFixed(0)}%
                    </td>

                    {/* Stock with visual badge */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold text-xs tabular-nums px-2 py-0.5 rounded-md ${
                            isOutOfStock
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isLow
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-200'
                          }`}
                        >
                          {p.currentStock} uds
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">mín: {p.minStock}</div>
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-3 text-zinc-400 text-[11px] truncate max-w-[140px]">
                      {p.supplier}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Ver Kardex button - exact user requirement */}
                        <button
                          onClick={() => onSelectProductForKardex(p.id)}
                          title="Ver Kardex y movimientos de este producto"
                          className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-300 text-zinc-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                          <span>Kardex</span>
                        </button>

                        {/* Quick stock adjustment */}
                        <button
                          onClick={() => {
                            setAdjustCandidate(p);
                            setAdjustQty(1);
                            setAdjustType('ENTRADA_COMPRA');
                          }}
                          title="Entrada o salida de stock"
                          className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() => openEditModal(p)}
                          title="Editar producto"
                          className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button (Admin only or confirm) */}
                        <button
                          onClick={() => setDeleteCandidate(p)}
                          title="Eliminar producto"
                          className="p-1.5 rounded-md hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD PRODUCT */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <form
            onSubmit={handleSaveAdd}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[92dvh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100">Agregar Nuevo Producto / Trago</h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-zinc-300 mb-1">Nombre Comercial del Trago:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej. Buchanan's 18 Años Special Reserve"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Código SKU / Referencia:</label>
                <input
                  type="text"
                  required
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Categoría:</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Whisky">Whisky</option>
                  <option value="Tequila & Mezcal">Tequila & Mezcal</option>
                  <option value="Ron & Aguardiente">Ron & Aguardiente</option>
                  <option value="Ginebra & Vodka">Ginebra & Vodka</option>
                  <option value="Cervezas">Cervezas</option>
                  <option value="Coctelería de Autor">Coctelería de Autor</option>
                  <option value="Pasantes & Snacks">Pasantes & Snacks</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Unidad de Venta:</label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value as ProductUnit)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Botella">Botella (Sellada)</option>
                  <option value="Shot / Trago">Shot / Trago (2 oz)</option>
                  <option value="Lata / Botellín">Lata / Botellín</option>
                  <option value="Coctel">Coctel Servido</option>
                  <option value="Unidad">Unidad / Snack</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Proveedor:</label>
                <input
                  type="text"
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  placeholder="Ej. Diageo, Bavaria, FLA..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Costo de Compra (COP):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formatCOPInput(formCostPrice)}
                  onChange={(e) => setFormCostPrice(parseCOPInput(e.target.value))}
                  placeholder="Ej. $ 50.000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Precio de Venta (COP):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formatCOPInput(formSalePrice)}
                  onChange={(e) => setFormSalePrice(parseCOPInput(e.target.value))}
                  placeholder="Ej. $ 90.000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Stock Inicial:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formCurrentStock > 0 ? String(formCurrentStock) : ''}
                  onChange={(e) => setFormCurrentStock(parseCOPInput(e.target.value))}
                  placeholder="Ej. 12"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Stock Mínimo (Alerta):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formMinStock > 0 ? String(formMinStock) : ''}
                  onChange={(e) => setFormMinStock(parseCOPInput(e.target.value))}
                  placeholder="Ej. 4"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-zinc-300 mb-1.5">
                  Imagen del Producto / Trago (Subir foto o URL):
                </label>
                <div className="flex items-center gap-3">
                  {formImage ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-500/40 bg-zinc-950 shrink-0 p-1">
                      <img src={formImage} alt="Preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-rose-400 hover:text-rose-300"
                        title="Quitar imagen"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex items-center justify-center text-zinc-500 shrink-0">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold text-[11px] cursor-pointer transition-colors">
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Seleccionar imagen desde tu equipo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={formImage.startsWith('data:') ? '' : formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="O pega el enlace (URL) de la imagen..."
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all"
              >
                Guardar en Inventario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[92dvh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100">Editar Producto: {editProduct.name}</h3>
              <button
                type="button"
                onClick={() => setEditProduct(null)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-zinc-300 mb-1">Nombre Comercial:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Código SKU:</label>
                <input
                  type="text"
                  required
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Categoría:</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Whisky">Whisky</option>
                  <option value="Tequila & Mezcal">Tequila & Mezcal</option>
                  <option value="Ron & Aguardiente">Ron & Aguardiente</option>
                  <option value="Ginebra & Vodka">Ginebra & Vodka</option>
                  <option value="Cervezas">Cervezas</option>
                  <option value="Coctelería de Autor">Coctelería de Autor</option>
                  <option value="Pasantes & Snacks">Pasantes & Snacks</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Costo Compra (COP):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formatCOPInput(formCostPrice)}
                  onChange={(e) => setFormCostPrice(parseCOPInput(e.target.value))}
                  placeholder="Ej. $ 50.000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Precio Venta (COP):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formatCOPInput(formSalePrice)}
                  onChange={(e) => setFormSalePrice(parseCOPInput(e.target.value))}
                  placeholder="Ej. $ 90.000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Stock Actual:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formCurrentStock > 0 ? String(formCurrentStock) : ''}
                  onChange={(e) => setFormCurrentStock(parseCOPInput(e.target.value))}
                  placeholder="Ej. 12"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Stock Mínimo:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formMinStock > 0 ? String(formMinStock) : ''}
                  onChange={(e) => setFormMinStock(parseCOPInput(e.target.value))}
                  placeholder="Ej. 4"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-zinc-300 mb-1.5">
                  Imagen del Producto / Trago (Subir foto o URL):
                </label>
                <div className="flex items-center gap-3">
                  {formImage ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-500/40 bg-zinc-950 shrink-0 p-1">
                      <img src={formImage} alt="Preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-rose-400 hover:text-rose-300"
                        title="Quitar imagen"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex items-center justify-center text-zinc-500 shrink-0">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold text-[11px] cursor-pointer transition-colors">
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Cambiar imagen desde tu equipo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={formImage.startsWith('data:') ? '' : formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="O pega el enlace (URL) de la imagen..."
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all"
              >
                Actualizar Datos
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: DELETE PRODUCT CONFIRMATION */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-100">¿Eliminar Producto?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                ¿Estás seguro de que deseas eliminar permanentemente{' '}
                <strong className="text-zinc-200">{deleteCandidate.name}</strong> del inventario?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: QUICK STOCK ADJUSTMENT & KARDEX TRIGGER */}
      {adjustCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleExecuteAdjust}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Ajuste de Stock & Auditoría</h3>
                <p className="text-xs text-zinc-400">{adjustCandidate.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustCandidate(null)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current status */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex justify-between items-center">
              <span className="text-zinc-400">Stock Actual en Sistema:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {adjustCandidate.currentStock} unidades
              </span>
            </div>

            {/* Adjust Type */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-zinc-300">Tipo de Movimiento:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('ENTRADA_COMPRA')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    adjustType === 'ENTRADA_COMPRA'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="font-medium">+ Entrada por Compra</div>
                  <div className="text-[10px] text-zinc-500">Suma al inventario</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType('AJUSTE_MERMA')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    adjustType === 'AJUSTE_MERMA'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-semibold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="font-medium">- Salida por Merma</div>
                  <div className="text-[10px] text-zinc-500">Botella rota o degustación</div>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="text-xs">
              <label className="block font-semibold text-zinc-300 mb-1">
                Cantidad de unidades:
              </label>
              <input
                type="number"
                min="1"
                required
                value={adjustQty}
                onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Reason */}
            <div className="text-xs">
              <label className="block font-semibold text-zinc-300 mb-1">
                Motivo / Justificación para Kardex:
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Ej. Factura proveedor #9920 o Rotura accidental en barra"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Projected result */}
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs flex justify-between items-center">
              <span className="text-zinc-400">Nuevo Stock Resultante:</span>
              <span className="font-mono font-bold text-zinc-100 tabular-nums">
                {adjustType === 'ENTRADA_COMPRA'
                  ? adjustCandidate.currentStock + adjustQty
                  : adjustCandidate.currentStock - adjustQty}{' '}
                unidades
              </span>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setAdjustCandidate(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all"
              >
                Aplicar y Registrar en Kardex
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
