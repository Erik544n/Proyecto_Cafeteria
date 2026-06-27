from sqlalchemy import Column, Integer, String, Boolean, Numeric, SmallInteger, Text, Date, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Rol(Base):
    __tablename__ = "roles"

    rol_id      = Column(Integer, primary_key=True, index=True)
    nombre      = Column(String(50), unique=True, nullable=False)
    descripcion = Column(String(200))
    activo      = Column(Boolean, default=True)
    creado_en   = Column(TIMESTAMP(timezone=True), server_default=func.now())

    usuarios = relationship("Usuario", back_populates="rol")


class Mesa(Base):
    __tablename__ = "mesas"

    mesa_id   = Column(Integer, primary_key=True, index=True)
    numero    = Column(Integer, unique=True, nullable=False)
    capacidad = Column(SmallInteger, default=4)
    estado    = Column(String(20), default="LIBRE")
    ubicacion = Column(String(100))
    creado_en = Column(TIMESTAMP(timezone=True), server_default=func.now())

    pedidos = relationship("Pedido", back_populates="mesa")


class CategoriaMenu(Base):
    __tablename__ = "categorias_menu"

    categoria_id = Column(Integer, primary_key=True, index=True)
    nombre       = Column(String(80), unique=True, nullable=False)
    descripcion  = Column(String(200))
    activo       = Column(Boolean, default=True)
    creado_en    = Column(TIMESTAMP(timezone=True), server_default=func.now())

    productos = relationship("ProductoMenu", back_populates="categoria")


class UnidadMedida(Base):
    __tablename__ = "unidades_medida"

    unidad_id   = Column(Integer, primary_key=True, index=True)
    nombre      = Column(String(30), unique=True, nullable=False)
    abreviatura = Column(String(10), nullable=False)

    insumos = relationship("Insumo", back_populates="unidad")


class CategoriaGasto(Base):
    __tablename__ = "categorias_gasto"

    categoria_gasto_id = Column(Integer, primary_key=True, index=True)
    nombre             = Column(String(80), unique=True, nullable=False)
    descripcion        = Column(String(200))
    activo             = Column(Boolean, default=True)

    gastos = relationship("Gasto", back_populates="categoria_gasto")


class Usuario(Base):
    __tablename__ = "usuarios"

    usuario_id     = Column(Integer, primary_key=True, index=True)
    nombre         = Column(String(100), nullable=False)
    apellido       = Column(String(100), nullable=False)
    email          = Column(String(150), unique=True, nullable=False)
    password_hash  = Column(Text, nullable=False)
    telefono       = Column(String(20))
    rol_id         = Column(Integer, ForeignKey("roles.rol_id"), nullable=False)
    activo         = Column(Boolean, default=True)
    ultimo_login   = Column(TIMESTAMP(timezone=True))
    creado_en      = Column(TIMESTAMP(timezone=True), server_default=func.now())
    actualizado_en = Column(TIMESTAMP(timezone=True), server_default=func.now())

    rol      = relationship("Rol", back_populates="usuarios")
    pedidos  = relationship("Pedido", back_populates="usuario")
    ventas   = relationship("Venta", back_populates="cajero")
    gastos   = relationship("Gasto", back_populates="usuario")
    sesiones = relationship("Sesion", back_populates="usuario")
    notificaciones = relationship("Notificacion", back_populates="usuario")


class ProductoMenu(Base):
    __tablename__ = "productos_menu"

    producto_id    = Column(Integer, primary_key=True, index=True)
    categoria_id   = Column(Integer, ForeignKey("categorias_menu.categoria_id"), nullable=False)
    nombre         = Column(String(120), nullable=False)
    descripcion    = Column(Text)
    precio         = Column(Numeric(10, 2), nullable=False)
    imagen_url     = Column(Text)
    activo         = Column(Boolean, default=True)
    disponible     = Column(Boolean, default=True)
    creado_en      = Column(TIMESTAMP(timezone=True), server_default=func.now())
    actualizado_en = Column(TIMESTAMP(timezone=True), server_default=func.now())

    categoria = relationship("CategoriaMenu", back_populates="productos")
    recetas   = relationship("Receta", back_populates="producto")
    detalles  = relationship("DetallePedido", back_populates="producto")


class Insumo(Base):
    __tablename__ = "insumos"

    insumo_id      = Column(Integer, primary_key=True, index=True)
    nombre         = Column(String(120), unique=True, nullable=False)
    unidad_id      = Column(Integer, ForeignKey("unidades_medida.unidad_id"), nullable=False)
    stock_actual   = Column(Numeric(12, 3), default=0)
    stock_minimo   = Column(Numeric(12, 3), default=0)
    costo_unitario = Column(Numeric(10, 2), default=0)
    activo         = Column(Boolean, default=True)
    creado_en      = Column(TIMESTAMP(timezone=True), server_default=func.now())
    actualizado_en = Column(TIMESTAMP(timezone=True), server_default=func.now())

    unidad    = relationship("UnidadMedida", back_populates="insumos")
    recetas   = relationship("Receta", back_populates="insumo")
    movimientos = relationship("MovimientoInventario", back_populates="insumo")


class Receta(Base):
    __tablename__ = "recetas"

    receta_id   = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos_menu.producto_id"), nullable=False)
    insumo_id   = Column(Integer, ForeignKey("insumos.insumo_id"), nullable=False)
    cantidad    = Column(Numeric(12, 3), nullable=False)

    producto = relationship("ProductoMenu", back_populates="recetas")
    insumo   = relationship("Insumo", back_populates="recetas")


class Sesion(Base):
    __tablename__ = "sesiones"

    sesion_id  = Column(UUID(as_uuid=True), primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.usuario_id"), nullable=False)
    token_hash = Column(Text, nullable=False)
    plataforma = Column(String(20))
    ip_origen  = Column(INET)
    expira_en  = Column(TIMESTAMP(timezone=True), nullable=False)
    creado_en  = Column(TIMESTAMP(timezone=True), server_default=func.now())

    usuario = relationship("Usuario", back_populates="sesiones")


class Pedido(Base):
    __tablename__ = "pedidos"

    pedido_id      = Column(Integer, primary_key=True, index=True)
    mesa_id        = Column(Integer, ForeignKey("mesas.mesa_id"))
    usuario_id     = Column(Integer, ForeignKey("usuarios.usuario_id"), nullable=False)
    estado         = Column(String(20), default="PENDIENTE")
    observaciones  = Column(Text)
    total          = Column(Numeric(12, 2), default=0)
    creado_en      = Column(TIMESTAMP(timezone=True), server_default=func.now())
    actualizado_en = Column(TIMESTAMP(timezone=True), server_default=func.now())

    mesa     = relationship("Mesa", back_populates="pedidos")
    usuario  = relationship("Usuario", back_populates="pedidos")
    detalles = relationship("DetallePedido", back_populates="pedido", cascade="all, delete")
    venta    = relationship("Venta", back_populates="pedido", uselist=False)
    notificaciones = relationship("Notificacion", back_populates="pedido")


class DetallePedido(Base):
    __tablename__ = "detalle_pedidos"

    detalle_id    = Column(Integer, primary_key=True, index=True)
    pedido_id     = Column(Integer, ForeignKey("pedidos.pedido_id"), nullable=False)
    producto_id   = Column(Integer, ForeignKey("productos_menu.producto_id"), nullable=False)
    cantidad      = Column(SmallInteger, nullable=False)
    precio_unit   = Column(Numeric(10, 2), nullable=False)
    subtotal      = Column(Numeric(12, 2), nullable=False)
    observaciones = Column(Text)

    pedido   = relationship("Pedido", back_populates="detalles")
    producto = relationship("ProductoMenu", back_populates="detalles")


class Venta(Base):
    __tablename__ = "ventas"

    venta_id     = Column(Integer, primary_key=True, index=True)
    pedido_id    = Column(Integer, ForeignKey("pedidos.pedido_id"), unique=True, nullable=False)
    cajero_id    = Column(Integer, ForeignKey("usuarios.usuario_id"), nullable=False)
    metodo_pago  = Column(String(20), nullable=False)
    monto_pagado = Column(Numeric(12, 2), nullable=False)
    cambio       = Column(Numeric(12, 2), default=0)
    subtotal     = Column(Numeric(12, 2), nullable=False)
    impuesto     = Column(Numeric(12, 2), default=0)
    descuento    = Column(Numeric(12, 2), default=0)
    total        = Column(Numeric(12, 2), nullable=False)
    anulada      = Column(Boolean, default=False)
    creado_en    = Column(TIMESTAMP(timezone=True), server_default=func.now())

    pedido = relationship("Pedido", back_populates="venta")
    cajero = relationship("Usuario", back_populates="ventas")


class Gasto(Base):
    __tablename__ = "gastos"

    gasto_id           = Column(Integer, primary_key=True, index=True)
    categoria_gasto_id = Column(Integer, ForeignKey("categorias_gasto.categoria_gasto_id"), nullable=False)
    usuario_id         = Column(Integer, ForeignKey("usuarios.usuario_id"), nullable=False)
    concepto           = Column(String(200), nullable=False)
    monto              = Column(Numeric(12, 2), nullable=False)
    fecha_gasto        = Column(Date, server_default=func.current_date())
    comprobante_url    = Column(Text)
    creado_en          = Column(TIMESTAMP(timezone=True), server_default=func.now())

    categoria_gasto = relationship("CategoriaGasto", back_populates="gastos")
    usuario         = relationship("Usuario", back_populates="gastos")


class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"

    movimiento_id  = Column(Integer, primary_key=True, index=True)
    insumo_id      = Column(Integer, ForeignKey("insumos.insumo_id"), nullable=False)
    tipo           = Column(String(20), nullable=False)
    cantidad       = Column(Numeric(12, 3), nullable=False)
    stock_antes    = Column(Numeric(12, 3), nullable=False)
    stock_despues  = Column(Numeric(12, 3), nullable=False)
    origen         = Column(String(30))
    referencia_id  = Column(Integer)
    usuario_id     = Column(Integer, ForeignKey("usuarios.usuario_id"), nullable=False)
    creado_en      = Column(TIMESTAMP(timezone=True), server_default=func.now())

    insumo  = relationship("Insumo", back_populates="movimientos")
    usuario = relationship("Usuario")


class Notificacion(Base):
    __tablename__ = "notificaciones"

    notificacion_id = Column(Integer, primary_key=True, index=True)
    pedido_id       = Column(Integer, ForeignKey("pedidos.pedido_id"))
    usuario_id      = Column(Integer, ForeignKey("usuarios.usuario_id"), nullable=False)
    tipo            = Column(String(30), nullable=False)
    mensaje         = Column(Text, nullable=False)
    leida           = Column(Boolean, default=False)
    creado_en       = Column(TIMESTAMP(timezone=True), server_default=func.now())

    pedido  = relationship("Pedido", back_populates="notificaciones")
    usuario = relationship("Usuario", back_populates="notificaciones")