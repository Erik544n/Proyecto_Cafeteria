// Datos de ejemplo (mock) para las interfaces de Cocina
// Sin conexión real a la API - solo para mostrar interfaces

export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'URGENTE';

export interface ProductoDetalle {
  cantidad: number;
  nombre: string;
  observaciones?: string;
}

export interface Pedido {
  id: number;
  mesa: string | null;  // null = para llevar
  ticket: number;
  estado: EstadoPedido;
  tiempoEspera: string;
  productos: ProductoDetalle[];
  urgente?: boolean;
  barra?: boolean;
  tiempoInicio?: string;
}

export interface Insumo {
  nombre: string;
  disponible: string;
  necesario: string;
  estado: 'sin_stock' | 'stock_bajo';
}

export interface PedidoBloqueado {
  ticket: number;
  mesa: string;
  motivo: string;
  tiempo: string;
  productos: ProductoDetalle[];
  insumosFaltantes: Insumo[];
}

// ─── PEDIDOS MOCK ────────────────────────────────────────────────────────────
export const PEDIDOS_MOCK: Pedido[] = [
  {
    id: 1,
    ticket: 402,
    mesa: 'Mesa 04',
    estado: 'URGENTE',
    tiempoEspera: 'Hace 12 min',
    urgente: true,
    productos: [
      { cantidad: 2, nombre: 'Huevos Benedictinos' },
      { cantidad: 1, nombre: 'Sándwich de Salmón', observaciones: '"Sin cebolla en el sándwich, por favor."' },
    ],
  },
  {
    id: 2,
    ticket: 405,
    mesa: 'Mesa 12',
    estado: 'EN_PREPARACION',
    tiempoEspera: 'Hace 5 min',
    productos: [
      { cantidad: 1, nombre: 'Waffles con Frutas' },
      { cantidad: 1, nombre: 'Bowl de Açaí' },
    ],
  },
  {
    id: 3,
    ticket: 401,
    mesa: 'Barra',
    estado: 'EN_PREPARACION',
    tiempoEspera: '',
    barra: true,
    tiempoInicio: 'Iniciado: 10:42 AM',
    productos: [
      { cantidad: 3, nombre: 'Croissant de Mantequilla' },
      { cantidad: 2, nombre: 'Avocado Toast' },
    ],
  },
  {
    id: 4,
    ticket: 408,
    mesa: 'Mesa 01',
    estado: 'PENDIENTE',
    tiempoEspera: 'Hace 2 min',
    productos: [
      { cantidad: 1, nombre: 'Omelette de Champiñones' },
    ],
  },
  {
    id: 5,
    ticket: 395,
    mesa: null,
    estado: 'URGENTE',
    tiempoEspera: 'Hace 25 min',
    urgente: true,
    productos: [
      { cantidad: 4, nombre: 'Tostadas Francesas' },
    ],
  },
];

// ─── PEDIDO BLOQUEADO MOCK ────────────────────────────────────────────────────
export const PEDIDO_BLOQUEADO_MOCK: PedidoBloqueado = {
  ticket: 408,
  mesa: 'Mesa 01',
  motivo: 'Ingredientes Insuficientes',
  tiempo: 'Hace 2 min',
  productos: [
    { cantidad: 1, nombre: 'Omelette de Champiñones', observaciones: 'Nota: Con queso extra' },
  ],
  insumosFaltantes: [
    { nombre: 'Champiñones frescos', disponible: '0 unid.', necesario: '150g', estado: 'sin_stock' },
    { nombre: 'Queso Manchego', disponible: '20g', necesario: '30g', estado: 'stock_bajo' },
    { nombre: 'Crema para cocinar', disponible: '30ml', necesario: '80ml', estado: 'stock_bajo' },
  ],
};

// ─── INVENTARIO MOCK ─────────────────────────────────────────────────────────
export const INVENTARIO_MOCK = [
  { id: 1, nombre: 'Huevos', stock: 48, minimo: 12, unidad: 'pzas', estado: 'ok' },
  { id: 2, nombre: 'Champiñones frescos', stock: 0, minimo: 200, unidad: 'g', estado: 'sin_stock' },
  { id: 3, nombre: 'Queso Manchego', stock: 20, minimo: 100, unidad: 'g', estado: 'sin_stock' },
  { id: 4, nombre: 'Crema para cocinar', stock: 30, minimo: 200, unidad: 'ml', estado: 'stock_bajo' },
  { id: 5, nombre: 'Pan para sándwich', stock: 12, minimo: 8, unidad: 'pzas', estado: 'ok' },
  { id: 6, nombre: 'Aguacate', stock: 5, minimo: 10, unidad: 'pzas', estado: 'stock_bajo' },
  { id: 7, nombre: 'Salmón ahumado', stock: 250, minimo: 100, unidad: 'g', estado: 'ok' },
  { id: 8, nombre: 'Leche entera', stock: 2, minimo: 5, unidad: 'L', estado: 'stock_bajo' },
  { id: 9, nombre: 'Harina', stock: 2000, minimo: 500, unidad: 'g', estado: 'ok' },
  { id: 10, nombre: 'Mantequilla', stock: 400, minimo: 200, unidad: 'g', estado: 'ok' },
];

// ─── MENU MOCK ────────────────────────────────────────────────────────────────
export const MENU_MOCK = [
  { id: 1, nombre: 'Huevos Benedictinos', categoria: 'Brunch', precio: 185, disponible: true },
  { id: 2, nombre: 'Omelette de Champiñones', categoria: 'Brunch', precio: 145, disponible: false },
  { id: 3, nombre: 'Waffles con Frutas', categoria: 'Desayunos', precio: 120, disponible: true },
  { id: 4, nombre: 'Bowl de Açaí', categoria: 'Saludable', precio: 155, disponible: true },
  { id: 5, nombre: 'Avocado Toast', categoria: 'Brunch', precio: 130, disponible: true },
  { id: 6, nombre: 'Sándwich de Salmón', categoria: 'Sandwiches', precio: 175, disponible: true },
  { id: 7, nombre: 'Croissant de Mantequilla', categoria: 'Panadería', precio: 65, disponible: true },
  { id: 8, nombre: 'Tostadas Francesas', categoria: 'Desayunos', precio: 115, disponible: true },
];


// ─── MESAS MOCK ──────────────────────────────────────────────────────────────
export interface MesaDetalle {
  id: string;
  numero: string;
  estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA';
  capacidad: number;
  area: 'PLANTA_BAJA' | 'TERRAZA' | 'SEGUNDO_PISO';
  // Posiciones relativas para renderizar un mapa visual interactivo
  x: number; // porcentaje horizontal (0-100)
  y: number; // porcentaje vertical (0-100)
}

export const MESAS_MOCK: MesaDetalle[] = [
  { id: '1', numero: '01', estado: 'LIBRE', capacidad: 4, area: 'PLANTA_BAJA', x: 15, y: 15 },
  { id: '2', numero: '02', estado: 'LIBRE', capacidad: 4, area: 'PLANTA_BAJA', x: 45, y: 15 },
  { id: '3', numero: '03', estado: 'LIBRE', capacidad: 2, area: 'PLANTA_BAJA', x: 75, y: 15 },
  { id: '4', numero: '04', estado: 'OCUPADA', capacidad: 4, area: 'PLANTA_BAJA', x: 15, y: 45 },
  { id: '5', numero: '05', estado: 'LIBRE', capacidad: 6, area: 'PLANTA_BAJA', x: 45, y: 45 },
  { id: '6', numero: '06', estado: 'RESERVADA', capacidad: 4, area: 'PLANTA_BAJA', x: 75, y: 45 },
  { id: '7', numero: '07', estado: 'LIBRE', capacidad: 4, area: 'PLANTA_BAJA', x: 15, y: 75 },
  { id: '8', numero: '08', estado: 'OCUPADA', capacidad: 2, area: 'PLANTA_BAJA', x: 45, y: 75 },
  { id: '9', numero: '09', estado: 'LIBRE', capacidad: 4, area: 'PLANTA_BAJA', x: 75, y: 75 },
  { id: '10', numero: '10', estado: 'LIBRE', capacidad: 4, area: 'TERRAZA', x: 20, y: 25 },
  { id: '11', numero: '11', estado: 'LIBRE', capacidad: 4, area: 'TERRAZA', x: 60, y: 25 },
  { id: '12', numero: '12', estado: 'LIBRE', capacidad: 2, area: 'TERRAZA', x: 40, y: 65 },
];


// ─── CATALOGO MESERO MOCK ─────────────────────────────────────────────────────
export interface ProductoCatalogo {
  id: string;
  nombre: string;
  precio: number;
  categoria: 'Cafeteria' | 'Panaderia' | 'Brunch';
  imagenUrl: string; // URL de placeholder/fallback o emoji
}

export const CATALOGO_MOCK: ProductoCatalogo[] = [
  // ── Cafetería ──
  {
    id: 'c1',
    nombre: 'Flat White',
    precio: 68,
    categoria: 'Cafeteria',
    imagenUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c2',
    nombre: 'Espresso',
    precio: 45,
    categoria: 'Cafeteria',
    imagenUrl: 'https://images.unsplash.com/photo-1510707577719-ee7c2470acb4?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c3',
    nombre: 'Café Americano',
    precio: 52,
    categoria: 'Cafeteria',
    imagenUrl: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c4',
    nombre: 'V60 Colombia',
    precio: 85,
    categoria: 'Cafeteria',
    imagenUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c5',
    nombre: 'Cappuccino',
    precio: 62,
    categoria: 'Cafeteria',
    imagenUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c6',
    nombre: 'Matcha Latte',
    precio: 75,
    categoria: 'Cafeteria',
    imagenUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
  },
  // ── Panadería ──
  {
    id: 'p1',
    nombre: 'Croissant Mantequilla',
    precio: 55,
    categoria: 'Panaderia',
    imagenUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'p2',
    nombre: 'Muffin de Blueberry',
    precio: 48,
    categoria: 'Panaderia',
    imagenUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'p3',
    nombre: 'Pain au Chocolat',
    precio: 62,
    categoria: 'Panaderia',
    imagenUrl: 'https://images.unsplash.com/photo-1623334044303-241021148842?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'p4',
    nombre: 'Bagel con Queso Crema',
    precio: 78,
    categoria: 'Panaderia',
    imagenUrl: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=400&auto=format&fit=crop&q=80',
  },
  // ── Brunch ──
  {
    id: 'b1',
    nombre: 'Toast de Aguacate',
    precio: 115,
    categoria: 'Brunch',
    imagenUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'b2',
    nombre: 'Huevos Benedictinos',
    precio: 175,
    categoria: 'Brunch',
    imagenUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'b3',
    nombre: 'Bowl de Açaí',
    precio: 135,
    categoria: 'Brunch',
    imagenUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'b4',
    nombre: 'Waffles con Frutas',
    precio: 120,
    categoria: 'Brunch',
    imagenUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&auto=format&fit=crop&q=80',
  },
];


// ─── PEDIDOS EN CURSO MOCK ────────────────────────────────────────────────────
export interface PedidoEnCurso {
  id: string;
  mesa: string;
  resumen: string;
  estado: 'LISTO' | 'EN_PREPARACION';
  tiempo: string;
}

export const PEDIDOS_EN_CURSO_MOCK: PedidoEnCurso[] = [
  {
    id: 'pec1',
    mesa: 'Mesa 04',
    resumen: '2x Flat White, 1x Bagel',
    estado: 'LISTO',
    tiempo: 'Hace 2m',
  },
  {
    id: 'pec2',
    mesa: 'Mesa 08',
    resumen: '1x V60 Colombia, 1x Cheesecake',
    estado: 'EN_PREPARACION',
    tiempo: 'Hace 8m',
  },
];

