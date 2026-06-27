-- ============================================================
--  CAFETERÍA PRO  –  Script de inicialización de base de datos
--  Universidad Politécnica de Querétaro
--  Programación Móvil  –  Grupo S204
-- ============================================================

-- Extensión para UUIDs (usada en sesiones)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    rol_id      SERIAL PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Roles base del sistema
INSERT INTO roles (nombre, descripcion) VALUES
    ('ADMIN',   'Administrador general del sistema'),
    ('MESERO',  'Levantamiento y surtido de pedidos'),
    ('COCINA',  'Gestión del menú e inventario'),
    ('CAJERO',  'Gestión monetaria y cobros')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- 2. MESAS
-- ============================================================
CREATE TABLE IF NOT EXISTS mesas (
    mesa_id   SERIAL PRIMARY KEY,
    numero    INT          NOT NULL UNIQUE,
    capacidad SMALLINT     NOT NULL DEFAULT 4,
    estado    VARCHAR(20)  NOT NULL DEFAULT 'LIBRE'
                           CHECK (estado IN ('LIBRE','OCUPADA','RESERVADA')),
    ubicacion VARCHAR(100),
    creado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Mesas de ejemplo
INSERT INTO mesas (numero, capacidad, ubicacion) VALUES
    (1, 2, 'Terraza'),
    (2, 4, 'Terraza'),
    (3, 4, 'Salón principal'),
    (4, 6, 'Salón principal'),
    (5, 2, 'Barra'),
    (6, 4, 'Salón principal'),
    (7, 4, 'Salón principal'),
    (8, 6, 'Terraza')
ON CONFLICT (numero) DO NOTHING;

-- ============================================================
-- 3. CATEGORÍAS DEL MENÚ
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias_menu (
    categoria_id SERIAL PRIMARY KEY,
    nombre       VARCHAR(80)  NOT NULL UNIQUE,
    descripcion  VARCHAR(200),
    activo       BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO categorias_menu (nombre, descripcion) VALUES
    ('Cafetería',  'Bebidas calientes y frías de café'),
    ('Panadería',  'Pan, croissants y bollería'),
    ('Brunch',     'Platillos de desayuno y comida ligera'),
    ('Bebidas',    'Jugos, aguas y refrescos')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- 4. UNIDADES DE MEDIDA
-- ============================================================
CREATE TABLE IF NOT EXISTS unidades_medida (
    unidad_id   SERIAL PRIMARY KEY,
    nombre      VARCHAR(30) NOT NULL UNIQUE,
    abreviatura VARCHAR(10) NOT NULL
);

INSERT INTO unidades_medida (nombre, abreviatura) VALUES
    ('Kilogramo',  'kg'),
    ('Gramo',      'g'),
    ('Litro',      'l'),
    ('Mililitro',  'ml'),
    ('Pieza',      'pza'),
    ('Taza',       'tza')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- 5. CATEGORÍAS DE GASTO
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias_gasto (
    categoria_gasto_id SERIAL PRIMARY KEY,
    nombre             VARCHAR(80)  NOT NULL UNIQUE,
    descripcion        VARCHAR(200),
    activo             BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO categorias_gasto (nombre, descripcion) VALUES
    ('Insumos',         'Compra de ingredientes y materias primas'),
    ('Servicios',       'Agua, luz, internet'),
    ('Personal',        'Sueldos y salarios'),
    ('Mantenimiento',   'Reparaciones y equipo'),
    ('Marketing',       'Publicidad y promociones')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- 6. USUARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id     SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    apellido       VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password_hash  TEXT         NOT NULL,
    telefono       VARCHAR(20),
    rol_id         INT          NOT NULL REFERENCES roles(rol_id),
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_login   TIMESTAMPTZ,
    creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Usuario administrador por defecto
-- Contraseña: admin1234  (hash bcrypt)
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id) VALUES
    ('Admin', 'Cafeteria', 'admin@cafeteria.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2ypIJhjm2.',
     (SELECT rol_id FROM roles WHERE nombre = 'ADMIN'))
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 7. PRODUCTOS DEL MENÚ
-- ============================================================
CREATE TABLE IF NOT EXISTS productos_menu (
    producto_id    SERIAL PRIMARY KEY,
    categoria_id   INT             NOT NULL REFERENCES categorias_menu(categoria_id),
    nombre         VARCHAR(120)    NOT NULL,
    descripcion    TEXT,
    precio         NUMERIC(10,2)   NOT NULL CHECK (precio > 0),
    imagen_url     TEXT,
    activo         BOOLEAN         NOT NULL DEFAULT TRUE,
    disponible     BOOLEAN         NOT NULL DEFAULT TRUE,
    creado_en      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

INSERT INTO productos_menu (categoria_id, nombre, descripcion, precio) VALUES
    (1, 'Espresso',          'Espresso doble concentrado',          35.00),
    (1, 'Cappuccino',        'Espresso con leche vaporizada',       45.00),
    (1, 'Flat White',        'Espresso con leche sedosa',           48.00),
    (1, 'Café Latte',        'Espresso con leche al vapor',         50.00),
    (1, 'Cold Brew',         'Café frío de extracción lenta',       55.00),
    (2, 'Croissant',         'Croissant de mantequilla',            28.00),
    (2, 'Pan de Chocolate',  'Pan relleno de chocolate',            25.00),
    (3, 'Avocado Toast',     'Tostada con aguacate y huevo',        75.00),
    (3, 'Huevos Benedictinos','Huevos con salsa holandesa',         85.00),
    (4, 'Jugo de Naranja',   'Jugo natural de naranja',             40.00);

-- ============================================================
-- 8. INSUMOS (inventario)
-- ============================================================
CREATE TABLE IF NOT EXISTS insumos (
    insumo_id      SERIAL PRIMARY KEY,
    nombre         VARCHAR(120)  NOT NULL UNIQUE,
    unidad_id      INT           NOT NULL REFERENCES unidades_medida(unidad_id),
    stock_actual   NUMERIC(12,3) NOT NULL DEFAULT 0,
    stock_minimo   NUMERIC(12,3) NOT NULL DEFAULT 0,
    costo_unitario NUMERIC(10,2) NOT NULL DEFAULT 0,
    activo         BOOLEAN       NOT NULL DEFAULT TRUE,
    creado_en      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

INSERT INTO insumos (nombre, unidad_id, stock_actual, stock_minimo, costo_unitario) VALUES
    ('Café molido',       1,  5.000, 1.000, 180.00),
    ('Leche entera',      3, 10.000, 2.000,  22.00),
    ('Leche de almendras',3,  4.000, 1.000,  45.00),
    ('Azúcar',            1,  3.000, 0.500,  18.00),
    ('Harina',            1,  8.000, 1.000,  12.00),
    ('Mantequilla',       1,  2.000, 0.500,  55.00),
    ('Huevos',            5, 30.000, 6.000,   3.50),
    ('Aguacate',          5, 15.000, 4.000,   8.00),
    ('Naranja',           1,  5.000, 1.000,  15.00),
    ('Crema para batir',  3,  2.000, 0.500,  38.00);

-- ============================================================
-- 9. RECETAS (qué insumos usa cada producto)
-- ============================================================
CREATE TABLE IF NOT EXISTS recetas (
    receta_id   SERIAL PRIMARY KEY,
    producto_id INT           NOT NULL REFERENCES productos_menu(producto_id),
    insumo_id   INT           NOT NULL REFERENCES insumos(insumo_id),
    cantidad    NUMERIC(12,3) NOT NULL,
    UNIQUE (producto_id, insumo_id)
);

-- Espresso: 18g de café
INSERT INTO recetas (producto_id, insumo_id, cantidad) VALUES
    (1, 1, 0.018),
-- Cappuccino: 18g café + 120ml leche
    (2, 1, 0.018),
    (2, 2, 0.120),
-- Flat White: 18g café + 130ml leche
    (3, 1, 0.018),
    (3, 2, 0.130),
-- Café Latte: 18g café + 200ml leche
    (4, 1, 0.018),
    (4, 2, 0.200),
-- Avocado Toast: 1 aguacate + 2 huevos
    (8, 8, 1.000),
    (8, 7, 2.000),
-- Huevos Benedictinos: 3 huevos + crema
    (9, 7, 3.000),
    (9, 10, 0.050)
ON CONFLICT (producto_id, insumo_id) DO NOTHING;

-- ============================================================
-- 10. SESIONES (tokens JWT activos)
-- ============================================================
CREATE TABLE IF NOT EXISTS sesiones (
    sesion_id  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id INT          NOT NULL REFERENCES usuarios(usuario_id),
    token_hash TEXT         NOT NULL,
    plataforma VARCHAR(20)  CHECK (plataforma IN ('WEB','MOVIL')),
    ip_origen  INET,
    expira_en  TIMESTAMPTZ  NOT NULL,
    creado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. PEDIDOS
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
    pedido_id      SERIAL PRIMARY KEY,
    mesa_id        INT           REFERENCES mesas(mesa_id),  -- NULL = para llevar
    usuario_id     INT           NOT NULL REFERENCES usuarios(usuario_id),
    estado         VARCHAR(20)   NOT NULL DEFAULT 'PENDIENTE'
                                 CHECK (estado IN ('PENDIENTE','EN_PREPARACION','LISTO','ENTREGADO','CANCELADO')),
    observaciones  TEXT,
    total          NUMERIC(12,2) NOT NULL DEFAULT 0,
    creado_en      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. DETALLE DE PEDIDOS
-- ============================================================
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    detalle_id   SERIAL PRIMARY KEY,
    pedido_id    INT           NOT NULL REFERENCES pedidos(pedido_id) ON DELETE CASCADE,
    producto_id  INT           NOT NULL REFERENCES productos_menu(producto_id),
    cantidad     SMALLINT      NOT NULL CHECK (cantidad > 0),
    precio_unit  NUMERIC(10,2) NOT NULL,
    subtotal     NUMERIC(12,2) NOT NULL,
    observaciones TEXT
);

-- ============================================================
-- 13. VENTAS
-- ============================================================
CREATE TABLE IF NOT EXISTS ventas (
    venta_id     SERIAL PRIMARY KEY,
    pedido_id    INT           NOT NULL UNIQUE REFERENCES pedidos(pedido_id),
    cajero_id    INT           NOT NULL REFERENCES usuarios(usuario_id),
    metodo_pago  VARCHAR(20)   NOT NULL CHECK (metodo_pago IN ('EFECTIVO','TARJETA','TRANSFERENCIA')),
    monto_pagado NUMERIC(12,2) NOT NULL,
    cambio       NUMERIC(12,2) NOT NULL DEFAULT 0,
    subtotal     NUMERIC(12,2) NOT NULL,
    impuesto     NUMERIC(12,2) NOT NULL DEFAULT 0,
    descuento    NUMERIC(12,2) NOT NULL DEFAULT 0,
    total        NUMERIC(12,2) NOT NULL,
    anulada      BOOLEAN       NOT NULL DEFAULT FALSE,
    creado_en    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 14. GASTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS gastos (
    gasto_id           SERIAL PRIMARY KEY,
    categoria_gasto_id INT           NOT NULL REFERENCES categorias_gasto(categoria_gasto_id),
    usuario_id         INT           NOT NULL REFERENCES usuarios(usuario_id),
    concepto           VARCHAR(200)  NOT NULL,
    monto              NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    fecha_gasto        DATE          NOT NULL DEFAULT CURRENT_DATE,
    comprobante_url    TEXT,
    creado_en          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 15. MOVIMIENTOS DE INVENTARIO (auditoría de stock)
-- ============================================================
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    movimiento_id  SERIAL PRIMARY KEY,
    insumo_id      INT           NOT NULL REFERENCES insumos(insumo_id),
    tipo           VARCHAR(20)   NOT NULL CHECK (tipo IN ('ENTRADA','SALIDA','AJUSTE')),
    cantidad       NUMERIC(12,3) NOT NULL,
    stock_antes    NUMERIC(12,3) NOT NULL,
    stock_despues  NUMERIC(12,3) NOT NULL,
    origen         VARCHAR(30),  -- 'VENTA', 'COMPRA', 'AJUSTE_MANUAL'
    referencia_id  INT,          -- pedido_id o compra_id según origen
    usuario_id     INT           NOT NULL REFERENCES usuarios(usuario_id),
    creado_en      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 16. NOTIFICACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS notificaciones (
    notificacion_id SERIAL PRIMARY KEY,
    pedido_id       INT         REFERENCES pedidos(pedido_id),
    usuario_id      INT         NOT NULL REFERENCES usuarios(usuario_id),
    tipo            VARCHAR(30) NOT NULL CHECK (tipo IN ('PEDIDO_LISTO','PEDIDO_CANCELADO','STOCK_BAJO','NUEVO_PEDIDO')),
    mensaje         TEXT        NOT NULL,
    leida           BOOLEAN     NOT NULL DEFAULT FALSE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES  –  para acelerar las consultas más frecuentes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pedidos_estado     ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa        ON pedidos(mesa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario     ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido      ON detalle_pedidos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_ventas_cajero       ON ventas(cajero_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha        ON ventas(creado_en);
CREATE INDEX IF NOT EXISTS idx_notif_usuario       ON notificaciones(usuario_id, leida);
CREATE INDEX IF NOT EXISTS idx_mov_insumo          ON movimientos_inventario(insumo_id);