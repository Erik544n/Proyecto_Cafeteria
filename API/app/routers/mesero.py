from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models import Pedido, DetallePedido, ProductoMenu, Mesa, Notificacion, Usuario
from ..schemas import PedidoCreate, PedidoResponse, PedidoEstadoUpdate, MesaResponse, ProductoResponse
from .auth import get_current_user, require_rol

router = APIRouter(prefix="/mesero", tags=["Mesero"])


# ─────────────────────────────────────────
# MESAS
# ─────────────────────────────────────────
@router.get("/mesas", response_model=List[MesaResponse])
def listar_mesas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Retorna todas las mesas con su estado actual."""
    return db.query(Mesa).order_by(Mesa.numero).all()


@router.get("/mesas/{mesa_id}", response_model=MesaResponse)
def obtener_mesa(
    mesa_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    mesa = db.query(Mesa).filter(Mesa.mesa_id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    return mesa


# ─────────────────────────────────────────
# MENÚ / PRODUCTOS
# ─────────────────────────────────────────
@router.get("/productos", response_model=List[ProductoResponse])
def listar_productos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Retorna productos activos y disponibles para armar el pedido."""
    return db.query(ProductoMenu).filter(
        ProductoMenu.activo == True,
        ProductoMenu.disponible == True
    ).all()


# ─────────────────────────────────────────
# PEDIDOS
# ─────────────────────────────────────────
@router.post("/pedidos", response_model=PedidoResponse, status_code=201)
def crear_pedido(
    datos: PedidoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    Crea un nuevo pedido con sus productos.
    El mesero selecciona la mesa y los productos.
    """
    if not datos.detalles:
        raise HTTPException(status_code=400, detail="El pedido debe tener al menos un producto")

    # Calcular total
    total = 0
    detalles_db = []

    for item in datos.detalles:
        producto = db.query(ProductoMenu).filter(
            ProductoMenu.producto_id == item.producto_id,
            ProductoMenu.activo == True,
            ProductoMenu.disponible == True
        ).first()

        if not producto:
            raise HTTPException(
                status_code=404,
                detail=f"Producto {item.producto_id} no encontrado o no disponible"
            )

        subtotal = float(producto.precio) * item.cantidad
        total   += subtotal

        detalles_db.append(DetallePedido(
            producto_id   = item.producto_id,
            cantidad      = item.cantidad,
            precio_unit   = producto.precio,
            subtotal      = subtotal,
            observaciones = item.observaciones
        ))

    # Crear pedido
    pedido = Pedido(
        mesa_id       = datos.mesa_id,
        usuario_id    = usuario.usuario_id,
        estado        = "PENDIENTE",
        observaciones = datos.observaciones,
        total         = total
    )
    db.add(pedido)
    db.flush()  # obtiene el pedido_id sin hacer commit

    # Asociar detalles al pedido
    for detalle in detalles_db:
        detalle.pedido_id = pedido.pedido_id
        db.add(detalle)

    # Marcar mesa como ocupada
    if datos.mesa_id:
        mesa = db.query(Mesa).filter(Mesa.mesa_id == datos.mesa_id).first()
        if mesa:
            mesa.estado = "OCUPADA"

    db.commit()
    db.refresh(pedido)
    return pedido


@router.get("/pedidos", response_model=List[PedidoResponse])
def listar_pedidos_mesero(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    Retorna los pedidos activos del mesero autenticado.
    Excluye ENTREGADO y CANCELADO.
    """
    return db.query(Pedido).filter(
        Pedido.usuario_id == usuario.usuario_id,
        Pedido.estado.notin_(["ENTREGADO", "CANCELADO"])
    ).order_by(Pedido.creado_en.desc()).all()


@router.get("/pedidos/{pedido_id}", response_model=PedidoResponse)
def obtener_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Ver el detalle y estado actual de un pedido."""
    pedido = db.query(Pedido).filter(Pedido.pedido_id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


@router.patch("/pedidos/{pedido_id}/entregar")
def entregar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    El mesero confirma que entregó el pedido al cliente.
    Cambia estado a ENTREGADO y libera la mesa.
    """
    pedido = db.query(Pedido).filter(Pedido.pedido_id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido.estado != "LISTO":
        raise HTTPException(
            status_code=400,
            detail=f"El pedido no está listo. Estado actual: {pedido.estado}"
        )

    pedido.estado         = "ENTREGADO"
    pedido.actualizado_en = datetime.utcnow()

    # Liberar mesa
    if pedido.mesa_id:
        mesa = db.query(Mesa).filter(Mesa.mesa_id == pedido.mesa_id).first()
        if mesa:
            # Verificar si hay otros pedidos activos en la mesa
            otros_pedidos = db.query(Pedido).filter(
                Pedido.mesa_id == pedido.mesa_id,
                Pedido.pedido_id != pedido_id,
                Pedido.estado.notin_(["ENTREGADO", "CANCELADO"])
            ).count()
            if otros_pedidos == 0:
                mesa.estado = "LIBRE"

    db.commit()
    return {"mensaje": "Pedido entregado exitosamente", "pedido_id": pedido_id}


@router.get("/notificaciones")
def ver_notificaciones(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Notificaciones no leídas del mesero (pedidos listos, cancelaciones)."""
    notifs = db.query(Notificacion).filter(
        Notificacion.usuario_id == usuario.usuario_id,
        Notificacion.leida == False
    ).order_by(Notificacion.creado_en.desc()).all()

    # Marcar como leídas
    for n in notifs:
        n.leida = True
    db.commit()

    return notifs