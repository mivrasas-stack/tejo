import { 
  Product, 
  KardexMovement, 
  ClientTab, 
  Reservation, 
  VenueZone, 
  AccountingTransaction, 
  BusinessExpense,
  User 
} from '../types';

export const SYSTEM_USERS: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'Admin2026*',
    name: 'Fernando Gómez',
    role: 'admin',
    roleTitle: 'Administrador General',
    email: 'admin@aura.com',
    pin: '1234',
  },
  {
    id: 'user-bartender',
    username: 'barra',
    password: 'Barra2026*',
    name: 'Mateo Barrientos',
    role: 'bartender',
    roleTitle: 'Jefe de Barra & POS',
    email: 'barra@aura.com',
    pin: '2222',
  },
  {
    id: 'user-mesero',
    username: 'mesero',
    password: 'Mesas2026*',
    name: 'Sebastián Mora',
    role: 'mesero',
    roleTitle: 'Capitán de Servicio & Canchas',
    email: 'mesero@aura.com',
    pin: '3333',
  },
];

import { GameTrack } from '../types';

export const INITIAL_GAME_TRACKS: GameTrack[] = [
  {
    id: 'track-tejo-1',
    name: 'Cancha de Tejo #1 (La Mecha)',
    gameType: 'CANCHA_TEJO',
    trackNumber: 1,
    hourlyRate: 35000,
    pricePerGame: 5000,
    status: 'EN_JUEGO',
    activeClient: 'Los Compadres del Tejo',
    activeStartTime: '19:15',
    activeTabId: 'tab-002',
    notes: 'Greda oficial, mechas y bocín de acero',
  },
  {
    id: 'track-tejo-2',
    name: 'Cancha de Tejo #2 (Bocín de Oro)',
    gameType: 'CANCHA_TEJO',
    trackNumber: 2,
    hourlyRate: 35000,
    pricePerGame: 5000,
    status: 'DISPONIBLE',
    notes: 'Pista reglamentaria con tablero de puntaje e iluminación',
  },
  {
    id: 'track-mini-1',
    name: 'Pista Mini Tejo #1 (Campestre)',
    gameType: 'MINI_TEJO',
    trackNumber: 1,
    hourlyRate: 28000,
    pricePerGame: 4000,
    status: 'DISPONIBLE',
    notes: 'Greda corta especial para grupos y parejas',
  },
  {
    id: 'track-bolirana-1',
    name: 'Bolirana Electrónica Pro #1 (Digital)',
    gameType: 'BOLIRANA',
    trackNumber: 1,
    hourlyRate: 25000,
    pricePerGame: 3000,
    status: 'EN_JUEGO',
    activeClient: 'Grupo Amigos de Carlos',
    activeStartTime: '20:10',
    notes: 'Puntuación digital automática con sensores y audio',
  },
  {
    id: 'track-bolirana-2',
    name: 'Bolirana Electrónica #2 (Pantalla HD)',
    gameType: 'BOLIRANA',
    trackNumber: 2,
    hourlyRate: 25000,
    pricePerGame: 3000,
    status: 'DISPONIBLE',
    notes: 'Ruleta y sapo iluminado con luces LED',
  },
  {
    id: 'track-bolirana-3',
    name: 'Bolirana Clásica de Madera #3',
    gameType: 'BOLIRANA',
    trackNumber: 3,
    hourlyRate: 20000,
    pricePerGame: 2500,
    status: 'RESERVADA',
    notes: 'Diseño artesanal tradicional en cedro',
  },
];

export const VENUE_ZONES = INITIAL_GAME_TRACKS;

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'WHS-BUCH-12',
    name: "Buchanan's De Luxe 12 Años",
    category: 'Whisky',
    unit: 'Botella',
    costPrice: 98000,
    salePrice: 155000,
    currentStock: 34,
    minStock: 12,
    supplier: 'Diageo Colombia S.A.',
    volumeMl: 750,
    isAlcohol: true,
    description: 'Blended Scotch Whisky suave, notas cítricas y miel de brezo.',
    image: '/src/assets/images/luxury_whisky_bottle_1794121345043.jpg',
  },
  {
    id: 'prod-002',
    sku: 'WHS-BUCH-MAS',
    name: "Buchanan's Master Reserve",
    category: 'Whisky',
    unit: 'Botella',
    costPrice: 120000,
    salePrice: 195000,
    currentStock: 18,
    minStock: 8,
    supplier: 'Diageo Colombia S.A.',
    volumeMl: 750,
    isAlcohol: true,
    description: 'Edición especial añejada en barricas de roble noble.',
    image: '/src/assets/images/luxury_whisky_bottle_1794121345043.jpg',
  },
  {
    id: 'prod-003',
    sku: 'WHS-JW-BLUE',
    name: 'Johnnie Walker Blue Label Rare Cask',
    category: 'Whisky',
    unit: 'Botella',
    costPrice: 780000,
    salePrice: 1190000,
    currentStock: 4,
    minStock: 2,
    supplier: 'Diageo Colombia S.A.',
    volumeMl: 750,
    isAlcohol: true,
    description: 'Obra maestra de whiskies raros y añejos de destilerías cerradas.',
    image: '/src/assets/images/luxury_whisky_bottle_1794121345043.jpg',
  },
  {
    id: 'prod-004',
    sku: 'WHS-OLD-PARR',
    name: 'Old Parr 12 Años Gran Reserva',
    category: 'Whisky',
    unit: 'Botella',
    costPrice: 94000,
    salePrice: 148000,
    currentStock: 26,
    minStock: 10,
    supplier: 'Diageo Colombia S.A.',
    volumeMl: 750,
    isAlcohol: true,
    description: 'Aroma afrutado, caramelo y sutil humo característico.',
  },
  {
    id: 'prod-005',
    sku: 'WHS-SHOT-BUCH',
    name: "Trago / Shot Buchanan's 12 (2 oz)",
    category: 'Whisky',
    unit: 'Shot / Trago',
    costPrice: 6500,
    salePrice: 22000,
    currentStock: 78,
    minStock: 25,
    supplier: 'Consumo Interno Barra',
    volumeMl: 60,
    isAlcohol: true,
    description: 'Servido en vaso rocks con hielo cristalino esfera.',
  },
  {
    id: 'prod-006',
    sku: 'TEQ-DJ-70',
    name: 'Don Julio 70 Cristalino Añejo',
    category: 'Tequila & Mezcal',
    unit: 'Botella',
    costPrice: 215000,
    salePrice: 345000,
    currentStock: 14,
    minStock: 6,
    supplier: 'Casa Cuervo / Diageo',
    volumeMl: 700,
    isAlcohol: true,
    description: 'Tequila blanco con la profundidad de un añejo filtrado en carbón.',
  },
  {
    id: 'prod-007',
    sku: 'TEQ-1800-ANJ',
    name: 'Tequila 1800 Añejo Reserva Antigua',
    category: 'Tequila & Mezcal',
    unit: 'Botella',
    costPrice: 165000,
    salePrice: 260000,
    currentStock: 12,
    minStock: 5,
    supplier: 'Casa Cuervo',
    volumeMl: 750,
    isAlcohol: true,
    description: 'Añejado en barricas de roble francés y americano.',
  },
  {
    id: 'prod-008',
    sku: 'MEZ-400-CON',
    name: 'Mezcal 400 Conejos Espadín Joven',
    category: 'Tequila & Mezcal',
    unit: 'Botella',
    costPrice: 122000,
    salePrice: 185000,
    currentStock: 15,
    minStock: 6,
    supplier: 'Mezcales de Oaxaca',
    volumeMl: 750,
    isAlcohol: true,
    description: 'Artesanal ahumado suave, cocido en leña de encino.',
  },
  {
    id: 'prod-009',
    sku: 'TEQ-SHOT-DJ70',
    name: 'Shot Don Julio 70 con Naranja & Sal Marina',
    category: 'Tequila & Mezcal',
    unit: 'Shot / Trago',
    costPrice: 15000,
    salePrice: 38000,
    currentStock: 55,
    minStock: 20,
    supplier: 'Consumo Interno Barra',
    volumeMl: 60,
    isAlcohol: true,
    description: 'Shot de tequila premium servido frío.',
  },
  {
    id: 'prod-010',
    sku: 'AGU-ANT-AZUL',
    name: 'Aguardiente Antioqueño Azul (Sin Azúcar)',
    category: 'Ron & Aguardiente',
    unit: 'Botella',
    costPrice: 36000,
    salePrice: 58000,
    currentStock: 52,
    minStock: 24,
    supplier: 'Fábrica de Licores de Antioquia',
    volumeMl: 750,
    isAlcohol: true,
    description: 'El clásico indiscutible con anís natural y cero azúcar.',
  },
  {
    id: 'prod-011',
    sku: 'RON-ZAC-23',
    name: 'Ron Zacapa Centenario 23 Solera',
    category: 'Ron & Aguardiente',
    unit: 'Botella',
    costPrice: 185000,
    salePrice: 295000,
    currentStock: 9,
    minStock: 4,
    supplier: 'Diageo Guatemala Reserve',
    volumeMl: 750,
    isAlcohol: true,
    description: 'Añejado en las alturas sobre las nubes, miel de caña virgen.',
  },
  {
    id: 'prod-012',
    sku: 'GIN-HENDRICKS',
    name: "Ginebra Hendrick's Botanical Original",
    category: 'Ginebra & Vodka',
    unit: 'Botella',
    costPrice: 152000,
    salePrice: 240000,
    currentStock: 11,
    minStock: 5,
    supplier: 'William Grant & Sons',
    volumeMl: 750,
    isAlcohol: true,
    description: 'Infusionada con pepino y pétalos de rosa búlgara.',
  },
  {
    id: 'prod-013',
    sku: 'VOD-GREY-GOOSE',
    name: 'Vodka Grey Goose Francia',
    category: 'Ginebra & Vodka',
    unit: 'Botella',
    costPrice: 135000,
    salePrice: 210000,
    currentStock: 10,
    minStock: 4,
    supplier: 'Bacardi Spirits',
    volumeMl: 750,
    isAlcohol: true,
    description: 'Trigo blando de invierno y agua de manantial de Gensac.',
  },
  {
    id: 'prod-014',
    sku: 'CER-CORONA',
    name: 'Cerveza Corona Extra 355ml',
    category: 'Cervezas',
    unit: 'Lata / Botellín',
    costPrice: 5200,
    salePrice: 13500,
    currentStock: 110,
    minStock: 40,
    supplier: 'Bavaria Colombia',
    volumeMl: 355,
    isAlcohol: true,
    description: 'Servida con rodaja fresca de limón.',
  },
  {
    id: 'prod-015',
    sku: 'CER-STELLA',
    name: 'Cerveza Stella Artois Premium Lager',
    category: 'Cervezas',
    unit: 'Lata / Botellín',
    costPrice: 5800,
    salePrice: 15000,
    currentStock: 84,
    minStock: 30,
    supplier: 'Bavaria Colombia',
    volumeMl: 330,
    isAlcohol: true,
    description: 'Lager belga de tradición.',
  },
  {
    id: 'prod-016',
    sku: 'CER-CLUB-COL',
    name: 'Cerveza Club Colombia Dorada',
    category: 'Cervezas',
    unit: 'Lata / Botellín',
    costPrice: 3800,
    salePrice: 10000,
    currentStock: 95,
    minStock: 36,
    supplier: 'Bavaria Colombia',
    volumeMl: 330,
    isAlcohol: true,
    description: 'Malta tostada y lúpulo aromático colombiano.',
  },
  {
    id: 'prod-017',
    sku: 'COC-OLD-FASH',
    name: 'Smoked Bourbon Old Fashioned',
    category: 'Coctelería de Autor',
    unit: 'Coctel',
    costPrice: 13500,
    salePrice: 42000,
    currentStock: 50,
    minStock: 15,
    supplier: 'Barra AURA Signature',
    isAlcohol: true,
    description: 'Bourbon añejo ahumado con astillas de roble, bitter de angostura y piel de naranja.',
    image: '/src/assets/images/cocktail_signature_bar_1794121344638.jpg',
  },
  {
    id: 'prod-018',
    sku: 'COC-GIN-TONIC',
    name: "Gin Tonic Hendrick's Supreme Copa Balón",
    category: 'Coctelería de Autor',
    unit: 'Coctel',
    costPrice: 14000,
    salePrice: 38000,
    currentStock: 45,
    minStock: 15,
    supplier: 'Barra AURA Signature',
    isAlcohol: true,
    description: 'Hendricks, tónica premium Fever-Tree, pepino holandés y bayas de enebro.',
  },
  {
    id: 'prod-019',
    sku: 'PAS-RED-BULL',
    name: 'Red Bull Energy Drink 250ml',
    category: 'Pasantes & Snacks',
    unit: 'Lata / Botellín',
    costPrice: 6900,
    salePrice: 16000,
    currentStock: 64,
    minStock: 24,
    supplier: 'Red Bull Colombia',
    volumeMl: 250,
    isAlcohol: false,
    description: 'Vitaliza cuerpo y mente, pasante ideal para licores.',
  },
  {
    id: 'prod-020',
    sku: 'PAS-TABLA-QUESO',
    name: 'Tabla Charcutería & Quesos Madurados',
    category: 'Pasantes & Snacks',
    unit: 'Unidad',
    costPrice: 32000,
    salePrice: 78000,
    currentStock: 16,
    minStock: 6,
    supplier: 'Cocina AURA Lounge',
    isAlcohol: false,
    description: 'Jamón serrano, salami italiano, queso manchego, uvas y frutos secos.',
  },
];

const INITIAL_KARDEX: KardexMovement[] = [
  {
    id: 'kdx-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    productId: 'prod-001',
    productName: "Buchanan's De Luxe 12 Años",
    category: 'Whisky',
    type: 'ENTRADA_COMPRA',
    quantity: 40,
    previousStock: 0,
    newStock: 40,
    unitCost: 98000,
    totalCost: 3920000,
    unitPrice: 155000,
    totalPrice: 6200000,
    referenceDoc: '#FAC-PROV-8821',
    clientOrSupplier: 'Diageo Colombia S.A.',
    note: 'Recepción pedido semanal licores importados',
    performedBy: 'Fernando Gómez',
    performedByRole: 'admin',
  },
  {
    id: 'kdx-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    productId: 'prod-001',
    productName: "Buchanan's De Luxe 12 Años",
    category: 'Whisky',
    type: 'VENTA_DIRECTA',
    quantity: -2,
    previousStock: 40,
    newStock: 38,
    unitCost: 98000,
    totalCost: -196000,
    unitPrice: 155000,
    totalPrice: 310000,
    referenceDoc: '#VTA-10492',
    clientOrSupplier: 'Cliente Mostrador / Efectivo',
    note: 'Venta rápida 2 botellas selladas para llevar',
    performedBy: 'Mateo Barrientos',
    performedByRole: 'bartender',
  },
  {
    id: 'kdx-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    productId: 'prod-001',
    productName: "Buchanan's De Luxe 12 Años",
    category: 'Whisky',
    type: 'VENTA_CUENTA',
    quantity: -4,
    previousStock: 38,
    newStock: 34,
    unitCost: 98000,
    totalCost: -392000,
    unitPrice: 155000,
    totalPrice: 620000,
    referenceDoc: '#CTA-MESA-VIP2',
    clientOrSupplier: 'Dr. Alejandro Morales',
    note: 'Consumo de mesa VIP para agasajo empresarial',
    performedBy: 'Sebastián Mora',
    performedByRole: 'mesero',
  },
  {
    id: 'kdx-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    productId: 'prod-006',
    productName: 'Don Julio 70 Cristalino Añejo',
    category: 'Tequila & Mezcal',
    type: 'ENTRADA_COMPRA',
    quantity: 16,
    previousStock: 0,
    newStock: 16,
    unitCost: 215000,
    totalCost: 3440000,
    unitPrice: 345000,
    totalPrice: 5520000,
    referenceDoc: '#FAC-PROV-8822',
    clientOrSupplier: 'Casa Cuervo / Diageo',
    note: 'Lote tequila cristalino premium',
    performedBy: 'Fernando Gómez',
    performedByRole: 'admin',
  },
  {
    id: 'kdx-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    productId: 'prod-006',
    productName: 'Don Julio 70 Cristalino Añejo',
    category: 'Tequila & Mezcal',
    type: 'VENTA_DIRECTA',
    quantity: -2,
    previousStock: 16,
    newStock: 14,
    unitCost: 215000,
    totalCost: -430000,
    unitPrice: 345000,
    totalPrice: 690000,
    referenceDoc: '#VTA-10510',
    clientOrSupplier: 'Carlos Arturo Restrepo',
    note: 'Pago tarjeta de crédito',
    performedBy: 'Mateo Barrientos',
    performedByRole: 'bartender',
  },
  {
    id: 'kdx-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    productId: 'prod-010',
    productName: 'Aguardiente Antioqueño Azul (Sin Azúcar)',
    category: 'Ron & Aguardiente',
    type: 'ENTRADA_COMPRA',
    quantity: 60,
    previousStock: 0,
    newStock: 60,
    unitCost: 36000,
    totalCost: 2160000,
    unitPrice: 58000,
    totalPrice: 3480000,
    referenceDoc: '#FAC-FLA-449',
    clientOrSupplier: 'Fábrica de Licores de Antioquia',
    note: 'Recepción canasta 60 botellas',
    performedBy: 'Fernando Gómez',
    performedByRole: 'admin',
  },
  {
    id: 'kdx-007',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    productId: 'prod-010',
    productName: 'Aguardiente Antioqueño Azul (Sin Azúcar)',
    category: 'Ron & Aguardiente',
    type: 'VENTA_CUENTA',
    quantity: -8,
    previousStock: 60,
    newStock: 52,
    unitCost: 36000,
    totalCost: -288000,
    unitPrice: 58000,
    totalPrice: 464000,
    referenceDoc: '#CTA-CANCHA-1',
    clientOrSupplier: 'Los Galácticos FC',
    note: 'Post-partido en cancha de fútbol sintética',
    performedBy: 'Sebastián Mora',
    performedByRole: 'mesero',
  },
  {
    id: 'kdx-008',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    productId: 'prod-014',
    productName: 'Cerveza Corona Extra 355ml',
    category: 'Cervezas',
    type: 'ENTRADA_COMPRA',
    quantity: 120,
    previousStock: 0,
    newStock: 120,
    unitCost: 5200,
    totalCost: 624000,
    unitPrice: 13500,
    totalPrice: 1620000,
    referenceDoc: '#FAC-BAV-9921',
    clientOrSupplier: 'Bavaria Colombia',
    note: 'Cajas x 24 unidades',
    performedBy: 'Fernando Gómez',
    performedByRole: 'admin',
  },
  {
    id: 'kdx-009',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    productId: 'prod-014',
    productName: 'Cerveza Corona Extra 355ml',
    category: 'Cervezas',
    type: 'VENTA_DIRECTA',
    quantity: -10,
    previousStock: 120,
    newStock: 110,
    unitCost: 5200,
    totalCost: -52000,
    unitPrice: 13500,
    totalPrice: 135000,
    referenceDoc: '#VTA-10525',
    clientOrSupplier: 'Grupo Terraza',
    note: 'Cubeta de coronas frías con limón',
    performedBy: 'Mateo Barrientos',
    performedByRole: 'bartender',
  },
];

const INITIAL_CLIENT_TABS: ClientTab[] = [
  {
    id: 'tab-001',
    clientName: 'Dr. Alejandro Morales',
    location: 'Zona VIP Black Lounge',
    openedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    status: 'ABIERTA',
    items: [
      {
        id: 'item-1',
        productId: 'prod-001',
        productName: "Buchanan's De Luxe 12 Años",
        category: 'Whisky',
        unit: 'Botella',
        unitPrice: 155000,
        costPrice: 98000,
        quantity: 2,
        subtotal: 310000,
        addedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        addedBy: 'Sebastián Mora',
      },
      {
        id: 'item-2',
        productId: 'prod-019',
        productName: 'Red Bull Energy Drink 250ml',
        category: 'Pasantes & Snacks',
        unit: 'Lata / Botellín',
        unitPrice: 16000,
        costPrice: 6900,
        quantity: 4,
        subtotal: 64000,
        addedAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
        addedBy: 'Sebastián Mora',
      },
      {
        id: 'item-3',
        productId: 'prod-020',
        productName: 'Tabla Charcutería & Quesos Madurados',
        category: 'Pasantes & Snacks',
        unit: 'Unidad',
        unitPrice: 78000,
        costPrice: 32000,
        quantity: 1,
        subtotal: 78000,
        addedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        addedBy: 'Sebastián Mora',
      },
    ],
    subtotal: 452000,
    suggestedTip: 0,
    discount: 0,
    total: 452000,
    waiterName: 'Sebastián Mora',
    notes: 'Cliente frecuente VIP. Pide hielo cristalino constante.',
    linkedReservationId: 'res-002',
  },
  {
    id: 'tab-002',
    clientName: 'Los Galácticos (Cancha 1)',
    location: 'Cancha Sintética 1 (Fútbol 5)',
    openedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: 'ABIERTA',
    items: [
      {
        id: 'item-4',
        productId: 'prod-010',
        productName: 'Aguardiente Antioqueño Azul (Sin Azúcar)',
        category: 'Ron & Aguardiente',
        unit: 'Botella',
        unitPrice: 58000,
        costPrice: 36000,
        quantity: 2,
        subtotal: 116000,
        addedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        addedBy: 'Mateo Barrientos',
      },
      {
        id: 'item-5',
        productId: 'prod-014',
        productName: 'Cerveza Corona Extra 355ml',
        category: 'Cervezas',
        unit: 'Lata / Botellín',
        unitPrice: 13500,
        costPrice: 5200,
        quantity: 8,
        subtotal: 108000,
        addedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        addedBy: 'Mateo Barrientos',
      },
    ],
    subtotal: 224000,
    suggestedTip: 0,
    discount: 0,
    total: 224000,
    waiterName: 'Mateo Barrientos',
    notes: 'Cuenta de cancha. Capitán de equipo Juan Esteban.',
    linkedReservationId: 'res-001',
  },
  {
    id: 'tab-003',
    clientName: 'Carlos Restrepo',
    location: 'Barra Principal & Coctelería',
    openedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: 'ABIERTA',
    items: [
      {
        id: 'item-6',
        productId: 'prod-017',
        productName: 'Smoked Bourbon Old Fashioned',
        category: 'Coctelería de Autor',
        unit: 'Coctel',
        unitPrice: 42000,
        costPrice: 13500,
        quantity: 2,
        subtotal: 84000,
        addedAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
        addedBy: 'Mateo Barrientos',
      },
    ],
    subtotal: 84000,
    suggestedTip: 0,
    discount: 0,
    total: 84000,
    waiterName: 'Mateo Barrientos',
    notes: 'Degustando tragos de autor en barra.',
  },
];

const todayStr = new Date().toISOString().split('T')[0];

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-001',
    clientName: 'Juan Esteban (Los Compadres del Tejo)',
    phone: '312 884 9201',
    trackId: 'track-tejo-1',
    trackName: 'Cancha de Tejo #1 (La Mecha)',
    gameType: 'CANCHA_TEJO',
    date: todayStr,
    startTime: '19:00',
    endTime: '21:00',
    durationMinutes: 120,
    hourlyRate: 35000,
    peopleCount: 8,
    depositAmount: 30000,
    depositPaymentMethod: 'TRANSFERENCIA',
    totalEstimated: 70000,
    status: 'EN_CURSO',
    notes: 'Partida de tejo nocturno con comanda de cerveza en pista.',
    linkedTabId: 'tab-002',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    zoneId: 'track-tejo-1',
    zoneName: 'Cancha de Tejo #1 (La Mecha)',
    zoneType: 'CANCHA_TEJO',
  },
  {
    id: 'res-002',
    clientName: 'Alejandro Morales & Amigos',
    phone: '300 762 1190',
    trackId: 'track-bolirana-1',
    trackName: 'Bolirana Electrónica Pro #1 (Digital)',
    gameType: 'BOLIRANA',
    date: todayStr,
    startTime: '20:30',
    endTime: '22:30',
    durationMinutes: 120,
    hourlyRate: 25000,
    peopleCount: 6,
    depositAmount: 25000,
    depositPaymentMethod: 'EFECTIVO',
    totalEstimated: 50000,
    status: 'EN_CURSO',
    notes: 'Torneo relámpago de bolirana con canasta de cerveza.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    zoneId: 'track-bolirana-1',
    zoneName: 'Bolirana Electrónica Pro #1 (Digital)',
    zoneType: 'BOLIRANA',
  },
  {
    id: 'res-003',
    clientName: 'Mauricio Arango',
    phone: '315 440 2933',
    trackId: 'track-tejo-2',
    trackName: 'Cancha de Tejo #2 (Bocín de Oro)',
    gameType: 'CANCHA_TEJO',
    date: todayStr,
    startTime: '21:30',
    endTime: '23:00',
    durationMinutes: 90,
    hourlyRate: 35000,
    peopleCount: 10,
    depositAmount: 35000,
    depositPaymentMethod: 'TRANSFERENCIA',
    totalEstimated: 52500,
    status: 'CONFIRMADA',
    notes: 'Solicitan mechas extras y balde de cerveza fría listo.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    zoneId: 'track-tejo-2',
    zoneName: 'Cancha de Tejo #2 (Bocín de Oro)',
    zoneType: 'CANCHA_TEJO',
  },
  {
    id: 'res-004',
    clientName: 'Camila Saldarriaga',
    phone: '320 651 8844',
    trackId: 'track-bolirana-3',
    trackName: 'Bolirana Clásica de Madera #3',
    gameType: 'BOLIRANA',
    date: todayStr,
    startTime: '22:00',
    endTime: '23:30',
    durationMinutes: 90,
    hourlyRate: 20000,
    peopleCount: 5,
    depositAmount: 20000,
    depositPaymentMethod: 'TRANSFERENCIA',
    totalEstimated: 30000,
    status: 'CONFIRMADA',
    notes: 'Reserva para integración de fin de semana.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    zoneId: 'track-bolirana-3',
    zoneName: 'Bolirana Clásica de Madera #3',
    zoneType: 'BOLIRANA',
  },
];

const INITIAL_TRANSACTIONS: AccountingTransaction[] = [
  {
    id: 'tx-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    type: 'INGRESO_VENTA',
    category: 'Ventas POS Mostrador',
    amount: 310000,
    costAmount: 196000,
    paymentMethod: 'EFECTIVO',
    reference: '#VTA-10492',
    description: "Venta directa de 2 botellas Buchanan's 12 Años",
    registeredBy: 'Mateo Barrientos',
  },
  {
    id: 'tx-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    type: 'INGRESO_VENTA',
    category: 'Ventas POS Mostrador',
    amount: 690000,
    costAmount: 430000,
    paymentMethod: 'TRANSFERENCIA',
    reference: '#VTA-10510',
    description: 'Venta Don Julio 70 Cristalino (Transferencia Bancolombia)',
    registeredBy: 'Mateo Barrientos',
  },
  {
    id: 'tx-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: 'INGRESO_VENTA',
    category: 'Ventas POS Mostrador',
    amount: 135000,
    costAmount: 52000,
    paymentMethod: 'TRANSFERENCIA',
    reference: '#VTA-10525',
    description: 'Cubeta de Cerveza Corona (Transferencia Nequi)',
    registeredBy: 'Mateo Barrientos',
  },
  {
    id: 'tx-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    type: 'INGRESO_VENTA',
    category: 'Anticipos Reservas Canchas',
    amount: 190000,
    paymentMethod: 'TRANSFERENCIA',
    reference: '#RES-ABONOS',
    description: 'Anticipos recibidos de reservas de canchas y VIP',
    registeredBy: 'Sebastián Mora',
  },
  {
    id: 'tx-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    type: 'EGRESO_GASTO',
    category: 'Insumos de Barra & Frutas',
    amount: 65000,
    paymentMethod: 'EFECTIVO',
    reference: '#EGR-0089',
    description: 'Compra urgente de limones tahití, hierbabuena fresca y hielo',
    registeredBy: 'Mateo Barrientos',
  },
];

const INITIAL_EXPENSES: BusinessExpense[] = [
  {
    id: 'exp-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    category: 'Compra de Licor Extra',
    amount: 1128000,
    description: 'Pedido adicional de 1 caja (12 botellas) Whisky Old Parr para fin de semana',
    supplierOrBeneficiary: 'Diageo Colombia S.A.',
    paymentMethod: 'TRANSFERENCIA',
    registeredBy: 'Fernando Gómez',
    invoiceRef: '#PED-EXT-4402',
  },
  {
    id: 'exp-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    category: 'Insumos de Barra & Frutas',
    amount: 65000,
    description: 'Compra de limones frescos, hierbabuena y tónicas Fever-Tree para coctelería',
    supplierOrBeneficiary: 'Mercado Central / Distribuidor Local',
    paymentMethod: 'EFECTIVO',
    registeredBy: 'Mateo Barrientos',
    invoiceRef: '#INS-091',
  },
  {
    id: 'exp-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    category: 'Compra de Licor Extra',
    amount: 260000,
    description: 'Pedido adicional urgente de 2 cajas cerveza Corona por alta afluencia en canchas',
    supplierOrBeneficiary: 'Bavaria Colombia',
    paymentMethod: 'TRANSFERENCIA',
    registeredBy: 'Fernando Gómez',
    invoiceRef: '#FAC-BAV-1029',
  },
  {
    id: 'exp-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    category: 'Insumos de Barra & Frutas',
    amount: 45000,
    description: '15 bolsas de hielo esfera artesanal para servicio en barra',
    supplierOrBeneficiary: 'Hielo Cristalino del Valle',
    paymentMethod: 'EFECTIVO',
    registeredBy: 'Mateo Barrientos',
    invoiceRef: '#HIE-332',
  },
];

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'aura_pos_products',
  KARDEX: 'aura_pos_kardex',
  CLIENT_TABS: 'aura_pos_client_tabs',
  RESERVATIONS: 'aura_pos_reservations',
  TRANSACTIONS: 'aura_pos_transactions',
  EXPENSES: 'aura_pos_expenses',
  ACTIVE_USER: 'aura_pos_active_user',
  GAME_TRACKS: 'aura_pos_game_tracks',
  TABLES: 'aura_pos_tables',
  USERS: 'aura_pos_users',
};

export const INITIAL_TABLES: string[] = [
  'Mesa 1',
  'Mesa 2',
  'Mesa 3',
  'Mesa 4',
  'Mesa 5',
  'Mesa 6',
  'Mesa 7',
  'Mesa 8',
  'Cancha de Tejo',
];

export const storageService = {
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SYSTEM_USERS));
      return SYSTEM_USERS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : SYSTEM_USERS;
    } catch {
      return SYSTEM_USERS;
    }
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getTables(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TABLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
      return INITIAL_TABLES;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  },

  saveTables(tables: string[]): void {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  },
  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getKardex(): KardexMovement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.KARDEX);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.KARDEX, JSON.stringify(INITIAL_KARDEX));
      return INITIAL_KARDEX;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_KARDEX;
    }
  },

  addKardexMovement(movement: Omit<KardexMovement, 'id' | 'timestamp'>): KardexMovement {
    const movements = this.getKardex();
    const newMovement: KardexMovement = {
      ...movement,
      id: `kdx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newMovement, ...movements];
    localStorage.setItem(STORAGE_KEYS.KARDEX, JSON.stringify(updated));
    return newMovement;
  },

  getClientTabs(): ClientTab[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_TABS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CLIENT_TABS, JSON.stringify(INITIAL_CLIENT_TABS));
      return INITIAL_CLIENT_TABS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLIENT_TABS;
    }
  },

  saveClientTabs(tabs: ClientTab[]): void {
    localStorage.setItem(STORAGE_KEYS.CLIENT_TABS, JSON.stringify(tabs));
  },

  getReservations(): Reservation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
      return INITIAL_RESERVATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_RESERVATIONS;
    }
  },

  saveReservations(reservations: Reservation[]): void {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  },

  getGameTracks(): GameTrack[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME_TRACKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GAME_TRACKS, JSON.stringify(INITIAL_GAME_TRACKS));
      return INITIAL_GAME_TRACKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_GAME_TRACKS;
    }
  },

  saveGameTracks(tracks: GameTrack[]): void {
    localStorage.setItem(STORAGE_KEYS.GAME_TRACKS, JSON.stringify(tracks));
  },

  getTransactions(): AccountingTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  addTransaction(tx: Omit<AccountingTransaction, 'id' | 'timestamp'>): AccountingTransaction {
    const transactions = this.getTransactions();
    const newTx: AccountingTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newTx, ...transactions];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
    return newTx;
  },

  getExpenses(): BusinessExpense[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXPENSES;
    }
  },

  saveExpenses(expenses: BusinessExpense[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  addExpense(expense: Omit<BusinessExpense, 'id' | 'timestamp'>): BusinessExpense {
    const expenses = this.getExpenses();
    const newExp: BusinessExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newExp, ...expenses];
    this.saveExpenses(updated);

    // Also register in AccountingTransaction as EGRESO_GASTO
    this.addTransaction({
      type: 'EGRESO_GASTO',
      category: newExp.category,
      amount: newExp.amount,
      paymentMethod: newExp.paymentMethod,
      reference: newExp.invoiceRef || `#EGR-${newExp.id.slice(-4)}`,
      description: newExp.description + (newExp.supplierOrBeneficiary ? ` (${newExp.supplierOrBeneficiary})` : ''),
      registeredBy: newExp.registeredBy,
      expenseCategory: newExp.category,
    });

    return newExp;
  },

  deleteExpense(expenseId: string): void {
    const expenses = this.getExpenses();
    const updated = expenses.filter((e) => e.id !== expenseId);
    this.saveExpenses(updated);
  },

  getActiveUser(): User {
    const users = this.getUsers();
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const found = users.find((u) => u.id === parsed.id);
        return found || parsed;
      } catch {
        // fallback
      }
    }
    return users[0] || SYSTEM_USERS[0]; // Admin by default
  },

  setActiveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return localStorage.getItem('aura_pos_authenticated') === 'true';
  },

  setAuthenticated(auth: boolean): void {
    localStorage.setItem('aura_pos_authenticated', auth ? 'true' : 'false');
  },

  resetToDemo(): void {
    localStorage.clear();
  }
};

export const formatCurrency = (amount: number): string => {
  return (
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount) + ' COP'
  );
};

export const formatCOPInput = (value: number | string): string => {
  const digits = String(value ?? '').replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return '';
  return '$ ' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(digits));
};

export const parseCOPInput = (raw: string): number => {
  const digits = raw.replace(/\D/g, '').replace(/^0+/, '');
  return digits ? Number(digits) : 0;
};

export const formatShortDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
};

export const formatDate = formatShortDate;
