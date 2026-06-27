from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date, timedelta
from decimal import Decimal

from ..database import get_db
from ..models import Usuario, Rol, Venta, Gasto, Pedido, ProductoMenu, DetallePedido, Insumo
from ..schemas import (
    UsuarioCreate, UsuarioUpdate, UsuarioResponse,
    ResumenDia, ProductoVendido
)
from .auth import get_current_user, require_rol, hashear_password

router = APIRouter(prefix="/admin", tags=["Administrador"])


# ─────────────────────────────────────────
# USUARIOS
# ─────────────────────────────────────────
@router.get("/usuarios", response_model=List[UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_rol("ADMIN"))
):
    """Lista todos los usuarios del sistema."""
    return db.query(Usuario).order_by(Usuario.creado_en.desc()).all()


@router.post("/usuarios", response_model=UsuarioResponse, status_code=201)
def crear_usuario(
    datos: UsuarioCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_rol("ADMIN"))
):
    """Crea un nuevo usuario y le asigna un rol."""
    # Verificar email único
    existe = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # Verificar que el rol exista
    rol = db.query(Rol).filter(Rol.rol_id == datos.rol_id).first()
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")

    nuevo = Usuario(
        nombre        = datos.nombre,
        apellido      = datos.apellido,
        email         = datos.email,
        password_hash = hashear_password(datos.password),
        telefono      = datos.telefono,
        rol_id        = datos.rol_id
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_rol("ADMIN"))
):
    usuario = db.query(Usuario).filter(Usuario.usuario_id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def editar_usuario(
    usuario_id: int,
    datos: UsuarioUpdate,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_rol("ADMIN"))
):
    """Edita información o rol de un usuario."""
    usuario = db.query(Usuario).filter(Usuario.usuario_id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if datos.nombre    is not None: usuario.nombre    = datos.nombre
    if datos.apellido  is not None: usuario.apellido  = datos.apellido
    if datos.telefono  is not None: usuario.telefono  = datos.telefono
    if datos.rol_id    is not None: usuario.rol_id    = datos.rol_id
    if datos.activo    is not None: usuario.activo    = datos.activo

    db.commit()
    db.refresh(usuario)
    return usuario


@router.patch("/usuarios/{usuario_id}/desactivar")
def desactivar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_rol("ADMIN"))
):
    """Desactiva la cuenta de un usuario sin eliminarla."""
    usuario = db.query(Usuario).filter(Usuario.usuario_id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.activo = False
    db.commit()
    return {"mensaje": f"Usuario {usuario.email} desactivado"}


@router.delete("/usuarios/{usuario_id}")
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_rol("ADMIN"))
):
    """Elimina permanentemente un usuario."""
    usuario = db.query(Usuario).filter(Usuario.usuario_id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado"}


# ─────────────────────────────────────────
# ROLES
# ─────────────────────────────────────────
@router.get("/roles")
def listar_roles(
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_rol("ADMIN"))
):
    return db.query(Rol).all()


# ─────────────────────────────────────────
# ESTADÍSTICAS
# ─────────────────────────────────────────
@router.get("/estadisticas/resumen")
def resumen_dia(
    fecha: date = None,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_rol("ADMIN"))
):
    """Dashboard general: ventas, gastos y ganancias del día."""
    if not fecha:
        fecha = date.today()

    # Ventas del día
    ventas = db.query(func.sum(Venta.total)).filter(
        func.date(Venta.creado_en) == fecha,
        Venta.anulada == False
    ).scalar() or 0

    # Gastos del día
    gastos = db.query(func.sum(Gasto.monto)).filter(
        Gasto.fecha_gasto == fecha
    ).scalar() or 0

    # Pedidos del día
    total_pedidos = db.query(func.count(Pedido.pedido_id)).filter(
        func.date(Pedido.creado_en) == fecha
    ).scalar() or 0

    # Pedidos activos ahora
    pedidos_activos = db.query(func.count(Pedido.pedido_id)).filter(
        Pedido.estado.in_(["PENDIENTE", "EN_PREPARACION", "LISTO"])
    ).scalar() or 0

    return {
        "fecha": str(fecha),
        "ventas_totales": float(ventas),
        "gastos_totales": float(gastos),
        "ganancias_netas": float(ventas) - float(gastos),
        "total_pedidos": total_pedidos,
        "pedidos_activos": pedidos_activos
    }


@router.get("/estadisticas/productos-mas-vendidos")
def productos_mas_vendidos(
    dias: int = 30,
    limite: int = 10,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_rol("ADMIN"))
):
    """Top productos más vendidos en los últimos N días."""
    desde = date.today() - timedelta(days=dias)

    resultados = db.query(
        ProductoMenu.producto_id,
        ProductoMenu.nombre,
        func.sum(DetallePedido.cantidad).label("total_vendido"),
        func.sum(DetallePedido.subtotal).label("ingresos")
    ).join(
        DetallePedido, ProductoMenu.producto_id == DetallePedido.producto_id
    ).join(
        Pedido, DetallePedido.pedido_id == Pedido.pedido_id
    ).filter(
        func.date(Pedido.creado_en) >= desde,
        Pedido.estado.notin_(["CANCELADO"])
    ).group_by(
        ProductoMenu.producto_id, ProductoMenu.nombre
    ).order_by(
        func.sum(DetallePedido.cantidad).desc()
    ).limit(limite).all()

    return [
        {
            "producto_id": r.producto_id,
            "nombre": r.nombre,
            "total_vendido": int(r.total_vendido or 0),
            "ingresos": float(r.ingresos or 0)
        }
        for r in resultados
    ]


@router.get("/estadisticas/ventas-por-dia")
def ventas_por_dia(
    dias: int = 7,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_rol("ADMIN"))
):
    """Ventas diarias de los últimos N días para las gráficas."""
    desde = date.today() - timedelta(days=dias)

    resultados = db.query(
        func.date(Venta.creado_en).label("fecha"),
        func.count(Venta.venta_id).label("num_ventas"),
        func.sum(Venta.total).label("total")
    ).filter(
        func.date(Venta.creado_en) >= desde,
        Venta.anulada == False
    ).group_by(
        func.date(Venta.creado_en)
    ).order_by(
        func.date(Venta.creado_en).asc()
    ).all()

    return [
        {
            "fecha": str(r.fecha),
            "num_ventas": r.num_ventas,
            "total": float(r.total or 0)
        }
        for r in resultados
    ]


@router.get("/estadisticas/inventario")
def inventario_completo(
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_rol("ADMIN"))
):
    """Estado actual del inventario con alertas de stock bajo."""
    insumos = db.query(Insumo).filter(Insumo.activo == True).all()

    return [
        {
            "insumo_id": i.insumo_id,
            "nombre": i.nombre,
            "stock_actual": float(i.stock_actual),
            "stock_minimo": float(i.stock_minimo),
            "costo_unitario": float(i.costo_unitario),
            "alerta": float(i.stock_actual) <= float(i.stock_minimo)
        }
        for i in insumos
    ]