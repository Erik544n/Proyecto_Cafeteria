from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# ─────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario_id: int
    nombre: str
    rol: str


# ─────────────────────────────────────────
# USUARIOS
# ─────────────────────────────────────────
class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    telefono: Optional[str] = None
    rol_id: int

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    rol_id: Optional[int] = None
    activo: Optional[bool] = None

class UsuarioResponse(BaseModel):
    usuario_id: int
    nombre: str
    apellido: str
    email: str
    telefono: Optional[str]
    rol_id: int
    activo: bool
    creado_en: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────
# MESAS
# ─────────────────────────────────────────
class MesaResponse(BaseModel):
    mesa_id: int
    numero: int
    capacidad: int
    estado: str
    ubicacion: Optional[str]

    class Config:
        from_attributes = True


# ─────────────────────────────────────────
# PRODUCTOS
# ─────────────────────────────────────────
class ProductoResponse(BaseModel):
    producto_id: int
    categoria_id: int
    nombre: str
    descripcion: Optional[str]
    precio: Decimal
    disponible: bool
    activo: bool

    class Config:
        from_attributes = True

class ProductoCreate(BaseModel):
    categoria_id: int
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    imagen_url: Optional[str] = None


# ─────────────────────────────────────────
# PEDIDOS
# ─────────────────────────────────────────
class DetallePedidoCreate(BaseModel):
    producto_id: int
    cantidad: int
    observaciones: Optional[str] = None

class PedidoCreate(BaseModel):
    mesa_id: Optional[int] = None       # None = para llevar
    observaciones: Optional[str] = None
    detalles: List[DetallePedidoCreate]

class DetallePedidoResponse(BaseModel):
    detalle_id: int
    producto_id: int
    cantidad: int
    precio_unit: Decimal
    subtotal: Decimal
    observaciones: Optional[str]

    class Config:
        from_attributes = True

class PedidoResponse(BaseModel):
    pedido_id: int
    mesa_id: Optional[int]
    usuario_id: int
    estado: str
    observaciones: Optional[str]
    total: Decimal
    creado_en: datetime
    detalles: List[DetallePedidoResponse] = []

    class Config:
        from_attributes = True

class PedidoEstadoUpdate(BaseModel):
    estado: str   # PENDIENTE | EN_PREPARACION | LISTO | ENTREGADO | CANCELADO


# ─────────────────────────────────────────
# VENTAS / CAJA
# ─────────────────────────────────────────
class VentaCreate(BaseModel):
    pedido_id: int
    metodo_pago: str        # EFECTIVO | TARJETA | TRANSFERENCIA
    monto_pagado: Decimal
    descuento: Decimal = Decimal("0")

class VentaResponse(BaseModel):
    venta_id: int
    pedido_id: int
    cajero_id: int
    metodo_pago: str
    monto_pagado: Decimal
    cambio: Decimal
    subtotal: Decimal
    impuesto: Decimal
    descuento: Decimal
    total: Decimal
    anulada: bool
    creado_en: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────
# INSUMOS / INVENTARIO
# ─────────────────────────────────────────
class InsumoResponse(BaseModel):
    insumo_id: int
    nombre: str
    stock_actual: Decimal
    stock_minimo: Decimal
    costo_unitario: Decimal
    activo: bool

    class Config:
        from_attributes = True

class InsumoUpdate(BaseModel):
    stock_actual: Optional[Decimal] = None
    stock_minimo: Optional[Decimal] = None
    costo_unitario: Optional[Decimal] = None


# ─────────────────────────────────────────
# NOTIFICACIONES
# ─────────────────────────────────────────
class NotificacionResponse(BaseModel):
    notificacion_id: int
    pedido_id: Optional[int]
    tipo: str
    mensaje: str
    leida: bool
    creado_en: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────
# ESTADÍSTICAS (admin)
# ─────────────────────────────────────────
class ResumenDia(BaseModel):
    ventas_totales: Decimal
    gastos_totales: Decimal
    ganancias_netas: Decimal
    total_pedidos: int
    pedidos_activos: int

class ProductoVendido(BaseModel):
    producto_id: int
    nombre: str
    total_vendido: int
    ingresos: Decimal