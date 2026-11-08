import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  Package, 
  User, 
  FileText,
  Clock,
  Layers
} from 'lucide-react';
import { KardexMovement, Product, KardexMovementType } from '../types';
import { formatCurrency, formatShortDate } from '../services/storage';

interface KardexViewProps {
  kardexMovements: KardexMovement[];
  products: Product[];
  selectedProductId?: string;
  onSelectProduct: (productId: string) => void;
}

export const KardexView: React.FC<KardexViewProps> = ({
  kardexMovements,
  products,
  selectedProductId,
  onSelectProduct,
}) => {
  const [viewMode, setViewMode] = useState<'AUDIT_GENERAL' | 'PRODUCT_KARDEX'>(
    selectedProductId ? 'PRODUCT_KARDEX' : 'AUDIT_GENERAL'
  );

  const [activeProductId, setActiveProductId] = useState<string>(
    selectedProductId || products[0]?.id || ''
  );

  // Filters for General Audit
  const [generalSearch, setGeneralSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Selected product object
  const currentProduct = useMemo(() => {
    return products.find((p) => p.id === activeProductId) || products[0];
  }, [products, activeProductId]);

  // Movements for individual product kardex (chronological ascending for balance accumulation)
  const productMovementsAsc = useMemo(() => {
    if (!currentProduct) return [];
    return [...kardexMovements]
      .filter((m) => m.productId === currentProduct.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [kardexMovements, currentProduct]);

  // Product Kardex computed rows with rolling balances
  const productKardexLedger = useMemo(() => {
    let runningStock = 0;
    let runningValuation = 0;

    return productMovementsAsc.map((m) => {
      const isEntry = m.type === 'ENTRADA_COMPRA' || (m.type === 'AJUSTE_INVENTARIO' && m.quantity > 0);
      const isExit = m.quantity < 0 || m.type === 'VENTA_DIRECTA' || m.type === 'VENTA_CUENTA' || m.type === 'AJUSTE_MERMA';

      const entryQty = isEntry ? Math.abs(m.quantity) : 0;
      const entryUnitCost = isEntry ? m.unitCost : 0;
      const entryTotalCost = isEntry ? Math.abs(m.totalCost) : 0;

      const exitQty = isExit ? Math.abs(m.quantity) : 0;
      const exitUnitCost = isExit ? m.unitCost : 0;
      const exitTotalCost = isExit ? Math.abs(m.totalCost) : 0;

      runningStock = m.newStock;
      runningValuation = runningStock * m.unitCost;

      return {
        ...m,
        entryQty,
        entryUnitCost,
        entryTotalCost,
        exitQty,
        exitUnitCost,
        exitTotalCost,
        runningStock,
        runningValuation,
      };
    });
  }, [productMovementsAsc]);

  // Filtered general audit list (descending)
  const filteredGeneralMovements = useMemo(() => {
    return kardexMovements.filter((m) => {
      const matchesType = typeFilter === 'ALL' || m.type === typeFilter;
      const matchesSearch =
        m.productName.toLowerCase().includes(generalSearch.toLowerCase()) ||
        m.referenceDoc.toLowerCase().includes(generalSearch.toLowerCase()) ||
        (m.clientOrSupplier && m.clientOrSupplier.toLowerCase().includes(generalSearch.toLowerCase())) ||
        m.performedBy.toLowerCase().includes(generalSearch.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [kardexMovements, typeFilter, generalSearch]);

  const movementTypeLabels: Record<KardexMovementType, { label: string; color: string }> = {
    VENTA_DIRECTA: { label: 'Venta Directa', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    VENTA_CUENTA: { label: 'Venta Cuenta Cliente', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    ENTRADA_COMPRA: { label: 'Entrada Compra', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    AJUSTE_MERMA: { label: 'Salida por Merma', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    AJUSTE_INVENTARIO: { label: 'Ajuste de Conteo', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    DEVOLUCION: { label: 'Devolución', color: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20' },
  };

  const exportCSV = () => {
    const headers = 'Fecha,Tipo,Producto,Referencia,Cantidad,Stock_Ant,Stock_Nuevo,Costo_Unit,Total,Responsable\n';
    const rows = filteredGeneralMovements
      .map(
        (m) =>
          `"${m.timestamp}","${m.type}","${m.productName}","${m.referenceDoc}","${m.quantity}","${m.previousStock}","${m.newStock}","${m.unitCost}","${m.totalPrice || m.totalCost}","${m.performedBy}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kardex_auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <span>Kardex & Auditoría Integral de Movimientos</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Trazabilidad completa: entradas, salidas, ventas en barra, consumos de cuentas y mermas.
          </p>
        </div>

        {/* View Switcher: Auditoría General vs Kardex Individual */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setViewMode('AUDIT_GENERAL')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'AUDIT_GENERAL'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Auditoría General
            </button>
            <button
              onClick={() => setViewMode('PRODUCT_KARDEX')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'PRODUCT_KARDEX'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Kardex por Producto
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: AUDITORÍA GENERAL */}
      {viewMode === 'AUDIT_GENERAL' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={generalSearch}
                onChange={(e) => setGeneralSearch(e.target.value)}
                placeholder="Buscar por producto, factura, doc o cliente..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'VENTA_DIRECTA', label: 'Venta Directa' },
                { id: 'VENTA_CUENTA', label: 'Cuenta Cliente' },
                { id: 'ENTRADA_COMPRA', label: 'Compras' },
                { id: 'AJUSTE_MERMA', label: 'Mermas' },
                { id: 'AJUSTE_INVENTARIO', label: 'Ajustes' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTypeFilter(tf.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    typeFilter === tf.id
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Movements Table */}
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Fecha & Hora</th>
                    <th className="py-3 px-3">Tipo Movimiento</th>
                    <th className="py-3 px-3">Producto</th>
                    <th className="py-3 px-3">Doc / Cliente</th>
                    <th className="py-3 px-3 text-center">Cantidad</th>
                    <th className="py-3 px-3 text-center">Stock (Ant → Nuevo)</th>
                    <th className="py-3 px-3 text-right">Importe Total</th>
                    <th className="py-3 px-4">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredGeneralMovements.map((m) => {
                    const badge = movementTypeLabels[m.type] || {
                      label: m.type,
                      color: 'bg-zinc-800 text-zinc-300',
                    };
                    const isPositive = m.quantity > 0;

                    return (
                      <tr key={m.id} className="hover:bg-zinc-850/60 transition-colors">
                        <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                          {formatShortDate(m.timestamp)}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              setActiveProductId(m.productId);
                              setViewMode('PRODUCT_KARDEX');
                            }}
                            className="font-semibold text-zinc-100 hover:text-amber-300 text-left transition-colors"
                          >
                            {m.productName}
                          </button>
                          <div className="text-[10px] text-zinc-500">{m.category}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-mono text-zinc-300 font-medium">{m.referenceDoc}</div>
                          {m.clientOrSupplier && (
                            <div className="text-[10px] text-zinc-400 truncate max-w-[150px]">
                              {m.clientOrSupplier}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold tabular-nums">
                          <span className={isPositive ? 'text-blue-400' : 'text-amber-400'}>
                            {isPositive ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-zinc-400 tabular-nums">
                          {m.previousStock} →{' '}
                          <span className="text-zinc-100 font-bold">{m.newStock}</span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-400 tabular-nums">
                          {formatCurrency(Math.abs(m.totalPrice || m.totalCost))}
                        </td>

                        <td className="py-3 px-4 text-zinc-300">
                          <div>{m.performedBy}</div>
                          <div className="text-[10px] text-zinc-500 capitalize">{m.performedByRole}</div>
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

      {/* VIEW 2: KARDEX INDIVIDUAL POR PRODUCTO */}
      {viewMode === 'PRODUCT_KARDEX' && currentProduct && (
        <div className="space-y-5">
          {/* Product selector dropdown bar */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Seleccionar Producto para ver su Kardex Oficial:
              </label>
              <select
                value={currentProduct.id}
                onChange={(e) => {
                  setActiveProductId(e.target.value);
                  onSelectProduct(e.target.value);
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-sm font-semibold text-amber-300 focus:outline-none focus:border-amber-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · Stock: {p.currentStock} {p.unit} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Product Card Quick Stats */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Stock Actual</span>
                <span className="text-sm font-bold text-amber-400 tabular-nums">
                  {currentProduct.currentStock} {currentProduct.unit}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Costo Promedio</span>
                <span className="text-sm font-bold text-zinc-200 tabular-nums">
                  {formatCurrency(currentProduct.costPrice)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Valorización Total</span>
                <span className="text-sm font-bold text-emerald-400 tabular-nums">
                  {formatCurrency(currentProduct.costPrice * currentProduct.currentStock)}
                </span>
              </div>
            </div>
          </div>

          {/* Official Standard Kardex Table (Entradas - Salidas - Saldos) */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <span>Tarjeta Kardex Oficial: {currentProduct.name}</span>
                  <span className="text-zinc-500 text-xs">({currentProduct.sku})</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Método de Valoración: Promedio Ponderado / PEPS · Moneda: COP
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Kardex</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  {/* Two-level header row */}
                  <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                    <th colSpan={3} className="py-2.5 px-3 border-r border-zinc-800">
                      Datos de la Transacción
                    </th>
                    <th colSpan={3} className="py-2.5 px-3 text-center border-r border-zinc-800 text-blue-400 bg-blue-950/20">
                      ENTRADAS
                    </th>
                    <th colSpan={3} className="py-2.5 px-3 text-center border-r border-zinc-800 text-amber-400 bg-amber-950/20">
                      SALIDAS
                    </th>
                    <th colSpan={3} className="py-2.5 px-3 text-center text-emerald-400 bg-emerald-950/20">
                      SALDOS EN EXISTENCIA
                    </th>
                  </tr>
                  <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] uppercase text-zinc-500 font-semibold">
                    <th className="py-2 px-3">Fecha</th>
                    <th className="py-2 px-3">Detalle / Tipo</th>
                    <th className="py-2 px-3 border-r border-zinc-800">Doc. Ref</th>

                    {/* Entradas */}
                    <th className="py-2 px-2 text-right">Cant.</th>
                    <th className="py-2 px-2 text-right">C. Unit</th>
                    <th className="py-2 px-2 text-right border-r border-zinc-800">Total</th>

                    {/* Salidas */}
                    <th className="py-2 px-2 text-right">Cant.</th>
                    <th className="py-2 px-2 text-right">C. Unit</th>
                    <th className="py-2 px-2 text-right border-r border-zinc-800">Total</th>

                    {/* Saldos */}
                    <th className="py-2 px-2 text-right">Cant.</th>
                    <th className="py-2 px-2 text-right">C. Prom</th>
                    <th className="py-2 px-3 text-right">Total Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {productKardexLedger.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap text-[11px]">
                        {formatShortDate(row.timestamp)}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-200 font-sans text-xs whitespace-nowrap">
                        {row.note || row.type}
                      </td>
                      <td className="py-2.5 px-3 text-amber-300 border-r border-zinc-800 text-[11px]">
                        {row.referenceDoc}
                      </td>

                      {/* Entradas */}
                      <td className="py-2.5 px-2 text-right text-blue-400 tabular-nums">
                        {row.entryQty > 0 ? row.entryQty : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-zinc-400 tabular-nums">
                        {row.entryQty > 0 ? formatCurrency(row.entryUnitCost) : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-blue-300 font-bold border-r border-zinc-800 tabular-nums">
                        {row.entryQty > 0 ? formatCurrency(row.entryTotalCost) : '-'}
                      </td>

                      {/* Salidas */}
                      <td className="py-2.5 px-2 text-right text-amber-400 tabular-nums">
                        {row.exitQty > 0 ? row.exitQty : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-zinc-400 tabular-nums">
                        {row.exitQty > 0 ? formatCurrency(row.exitUnitCost) : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-amber-300 font-bold border-r border-zinc-800 tabular-nums">
                        {row.exitQty > 0 ? formatCurrency(row.exitTotalCost) : '-'}
                      </td>

                      {/* Saldos */}
                      <td className="py-2.5 px-2 text-right font-bold text-zinc-100 tabular-nums">
                        {row.runningStock}
                      </td>
                      <td className="py-2.5 px-2 text-right text-zinc-400 tabular-nums">
                        {formatCurrency(row.unitCost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(row.runningValuation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {productKardexLedger.length === 0 && (
              <div className="py-12 text-center text-zinc-500">
                <p>No se registran movimientos para este producto aún.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
