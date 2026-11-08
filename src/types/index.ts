export type UserRole = 'admin' | 'bartender' | 'mesero';

export interface User {
  id: string;
  username?: string;
  password?: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  email: string;
  pin: string;
  avatar?: string;
}

export type Category = 
  | 'Whisky'
  | 'Tequila & Mezcal'
  | 'Ron & Aguardiente'
  | 'Ginebra & Vodka'
  | 'Vinos & Champagnes'
  | 'Cervezas'
  | 'Coctelería de Autor'
  | 'Pasantes & Snacks';

export type ProductUnit = 'Botella' | 'Shot / Trago' | 'Lata / Botellín' | 'Coctel' | 'Unidad';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: Category;
  unit: ProductUnit;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  supplier: string;
  image?: string;
  description?: string;
  isAlcohol: boolean;
  volumeMl?: number;
  lastUpdated?: string;
}

export type KardexMovementType = 
  | 'VENTA_DIRECTA' 
  | 'VENTA_CUENTA' 
  | 'ENTRADA_COMPRA' 
  | 'AJUSTE_MERMA' 
  | 'AJUSTE_INVENTARIO' 
  | 'DEVOLUCION';

export interface KardexMovement {
  id: string;
  timestamp: string; // ISO string
  productId: string;
  productName: string;
  category: Category;
  type: KardexMovementType;
  quantity: number; // positive for entries, negative for exits
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalCost: number;
  unitPrice: number;
  totalPrice: number;
  referenceDoc: string; // e.g. #VTA-0481, #CTA-DON-JULIO, #CMP-102
  clientOrSupplier?: string;
  note?: string;
  performedBy: string;
  performedByRole: UserRole;
}

export interface TabItem {
  id: string;
  productId: string;
  productName: string;
  category: Category;
  unit: ProductUnit;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
  addedAt: string;
  addedBy: string;
}

export type TabStatus = 'ABIERTA' | 'PAGADA' | 'CANCELADA';

export interface ClientTab {
  id: string;
  clientName: string;
  location: string; // e.g. 'Mesa VIP 2', 'Barra Principal', 'Cancha Sintética 1'
  openedAt: string;
  closedAt?: string;
  status: TabStatus;
  items: TabItem[];
  subtotal: number;
  suggestedTip: number;
  discount: number;
  total: number;
  paymentMethod?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO';
  notes?: string;
  waiterName: string;
  linkedReservationId?: string;
}

export type GameType = 'CANCHA_TEJO' | 'BOLIRANA' | 'MINI_TEJO';
export type ZoneType = GameType;

export interface GameTrack {
  id: string;
  name: string;
  gameType: GameType;
  trackNumber: number;
  hourlyRate: number;
  pricePerGame?: number;
  status: 'DISPONIBLE' | 'EN_JUEGO' | 'RESERVADA' | 'MANTENIMIENTO';
  activeClient?: string;
  activeStartTime?: string;
  activeTabId?: string;
  notes?: string;
}

export type VenueZone = GameTrack;

export type ReservationStatus = 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA';

export interface Reservation {
  id: string;
  clientName: string;
  phone: string;
  trackId: string;
  trackName: string;
  gameType: GameType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  hourlyRate: number;
  peopleCount: number;
  depositAmount: number;
  depositPaymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA';
  totalEstimated: number;
  status: ReservationStatus;
  notes?: string;
  linkedTabId?: string;
  createdAt: string;
  // Backward compatibility alias
  zoneId?: string;
  zoneName?: string;
  zoneType?: ZoneType;
}

export type TransactionType = 'INGRESO_VENTA' | 'EGRESO_GASTO';
export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA';

export interface BusinessExpense {
  id: string;
  timestamp: string;
  category: 
    | 'Compra de Licor Extra'
    | 'Insumos de Barra & Frutas'
    | 'Nómina & Turnos'
    | 'Servicios & Arriendo'
    | 'Fletes & Domicilios'
    | 'Mantenimiento & Aseo'
    | 'Otros Gastos';
  amount: number;
  description: string;
  supplierOrBeneficiary?: string;
  paymentMethod: PaymentMethod;
  registeredBy: string;
  invoiceRef?: string;
}

export interface AccountingTransaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  category: string;
  amount: number;
  costAmount?: number;
  paymentMethod: PaymentMethod;
  reference: string;
  description: string;
  registeredBy: string;
  expenseCategory?: string;
  location?: string;
  clientName?: string;
  items?: TabItem[];
}

export interface ProductProfitMargin {
  productId: string;
  productName: string;
  category: Category;
  unit: ProductUnit;
  costPrice: number;
  salePrice: number;
  unitsSold: number;
  unitProfit: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  marginPercent: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
