from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models import Pedido, Insumo, Receta, MovimientoInventario, Notificacion, Usuario, ProductoMenu
from ..schemas import PedidoResponse, PedidoEstadoUpdate, InsumoResponse, InsumoCreate, InsumoUpdate, ProductoCreate, ProductoResponse
from .auth import get_current_user

router = APIRouter(prefix="/cocina", tags=["Cocina"])


# ─────────────────────────────────────────
# PEDIDOS EN COCINA
# ─────────────────────────────────────────
@router.get("/pedidos", response_model=List[PedidoResponse])
def pedidos_pendientes(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    Retorna pedidos que cocina debe atender.
    Estados: PENDIENTE y EN_PREPARACION ordenados por llegada.
    """
    return db.query(Pedido).filter(
        Pedido.estado.in_(["PENDIENTE", "EN_PREPARACION"])
    ).order_by(Pedido.creado_en.asc()).all()


@router.patch("/pedidos/{pedido_id}/estado")
def actualizar_estado(
    pedido_id: int,
    datos: PedidoEstadoUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    Cocina actualiza el estado del pedido:
    PENDIENTE → EN_PREPARACION → LISTO
    """
    estados_validos = ["PENDIENTE", "EN_PREPARACION", "LISTO", "CANCELADO"]
    if datos.estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Opciones: {estados_validos}"
        )

    pedido = db.query(Pedido).filter(Pedido.pedido_id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    estado_anterior   = pedido.estado
    pedido.estado     = datos.estado
    pedido.actualizado_en = datetime.utcnow()

    # Si el pedido quedó LISTO → descontar inventario y notificar al mesero
    if datos.estado == "LISTO" and estado_anterior != "LISTO":
        _descontar_inventario(pedido_id, usuario.usuario_id, db)
        _notificar_mesero(pedido, db)

    db.commit()
    return {
        "mensaje": f"Estado actualizado a {datos.estado}",
        "pedido_id": pedido_id,
        "estado": datos.estado
    }


@router.patch("/pedidos/{pedido_id}/preparar")
def iniciar_preparacion(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Atajo rápido: marca el pedido como EN_PREPARACION."""
    pedido = db.query(Pedido).filter(
        Pedido.pedido_id == pedido_id,
        Pedido.estado == "PENDIENTE"
    ).first()

    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado o ya no está pendiente"
        )

    pedido.estado         = "EN_PREPARACION"
    pedido.actualizado_en = datetime.utcnow()
    db.commit()

    return {"mensaje": "Preparación iniciada", "pedido_id": pedido_id}


@router.patch("/pedidos/{pedido_id}/listo")
def marcar_listo(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    Atajo rápido: marca el pedido como LISTO.
    Descuenta inventario y notifica al mesero automáticamente.
    """
    pedido = db.query(Pedido).filter(
        Pedido.pedido_id == pedido_id,
        Pedido.estado == "EN_PREPARACION"
    ).first()

    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado o no está en preparación"
        )

    pedido.estado         = "LISTO"
    pedido.actualizado_en = datetime.utcnow()

    _descontar_inventario(pedido_id, usuario.usuario_id, db)
    _notificar_mesero(pedido, db)

    db.commit()
    return {"mensaje": "Pedido marcado como listo. Mesero notificado.", "pedido_id": pedido_id}


# ─────────────────────────────────────────
# INVENTARIO
# ─────────────────────────────────────────
@router.get("/inventario", response_model=List[InsumoResponse])
def ver_inventario(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Lista todos los insumos con su stock actual."""
    return db.query(Insumo).filter(Insumo.activo == True).all()


@router.get("/inventario/bajo-stock")
def inventario_bajo_stock(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    Retorna insumos cuyo stock_actual está por debajo del stock_minimo.
    Útil para alertas de ingredientes faltantes.
    """
    insumos = db.query(Insumo).filter(
        Insumo.activo == True,
        Insumo.stock_actual <= Insumo.stock_minimo
    ).all()

    return [
        {
            "insumo_id": i.insumo_id,
            "nombre": i.nombre,
            "stock_actual": float(i.stock_actual),
            "stock_minimo": float(i.stock_minimo),
            "diferencia": float(i.stock_minimo) - float(i.stock_actual)
        }
        for i in insumos
    ]


# ─────────────────────────────────────────
# FUNCIONES INTERNAS
# ─────────────────────────────────────────
def _descontar_inventario(pedido_id: int, usuario_id: int, db: Session):
    """
    Descuenta los insumos usados según la receta de cada producto del pedido.
    Registra cada movimiento en movimientos_inventario.
    """
    pedido = db.query(Pedido).filter(Pedido.pedido_id == pedido_id).first()
    if not pedido:
        return

    for detalle in pedido.detalles:
        recetas = db.query(Receta).filter(
            Receta.producto_id == detalle.producto_id
        ).all()

        for receta in recetas:
            insumo = db.query(Insumo).filter(
                Insumo.insumo_id == receta.insumo_id
            ).first()

            if not insumo:
                continue

            cantidad_usar  = float(receta.cantidad) * detalle.cantidad
            stock_antes    = float(insumo.stock_actual)
            stock_despues  = max(0, stock_antes - cantidad_usar)

            insumo.stock_actual   = stock_despues
            insumo.actualizado_en = datetime.utcnow()

            # Registrar movimiento
            mov = MovimientoInventario(
                insumo_id     = insumo.insumo_id,
                tipo          = "SALIDA",
                cantidad      = cantidad_usar,
                stock_antes   = stock_antes,
                stock_despues = stock_despues,
                origen        = "VENTA",
                referencia_id = pedido_id,
                usuario_id    = usuario_id
            )
            db.add(mov)


def _notificar_mesero(pedido: Pedido, db: Session):
    """Crea una notificación para el mesero cuando el pedido está listo."""
    notif = Notificacion(
        pedido_id  = pedido.pedido_id,
        usuario_id = pedido.usuario_id,
        tipo       = "PEDIDO_LISTO",
        mensaje    = f"Pedido #{pedido.pedido_id} está listo para entregar"
                     + (f" — Mesa {pedido.mesa_id}" if pedido.mesa_id else " — Para llevar")
    )
    db.add(notif)


# ─────────────────────────────────────────
# GESTIÓN DE MENÚ (PRODUCTOS)
# ─────────────────────────────────────────
@router.post("/productos", response_model=ProductoResponse, status_code=201)
def crear_producto(
    datos: ProductoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    nuevo = ProductoMenu(
        categoria_id = datos.categoria_id,
        nombre       = datos.nombre,
        descripcion  = datos.descripcion,
        precio       = datos.precio,
        imagen_url   = datos.imagen_url,
        activo       = True,
        disponible   = True
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.get("/productos/{producto_id}", response_model=ProductoResponse)
def ver_detalle_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    prod = db.query(ProductoMenu).filter(ProductoMenu.producto_id == producto_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return prod

@router.put("/productos/{producto_id}", response_model=ProductoResponse)
def editar_producto(
    producto_id: int,
    datos: ProductoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    prod = db.query(ProductoMenu).filter(ProductoMenu.producto_id == producto_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    prod.categoria_id = datos.categoria_id
    prod.nombre = datos.nombre
    prod.descripcion = datos.descripcion
    prod.precio = datos.precio
    if datos.imagen_url is not None:
        prod.imagen_url = datos.imagen_url
    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/productos/{producto_id}")
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    prod = db.query(ProductoMenu).filter(ProductoMenu.producto_id == producto_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    prod.activo = False
    db.commit()
    return {"mensaje": "Producto desactivado del menu"}


# ─────────────────────────────────────────
# GESTIÓN DE SUMINISTROS (INSUMOS)
# ─────────────────────────────────────────
@router.post("/insumos", response_model=InsumoResponse, status_code=201)
def crear_insumo(
    datos: InsumoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    nuevo = Insumo(
        nombre = datos.nombre,
        unidad_id = datos.unidad_id,
        stock_actual = datos.stock_actual,
        stock_minimo = datos.stock_minimo,
        costo_unitario = datos.costo_unitario,
        activo = True
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/insumos/{insumo_id}", response_model=InsumoResponse)
def editar_insumo(
    insumo_id: int,
    datos: InsumoUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    ins = db.query(Insumo).filter(Insumo.insumo_id == insumo_id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    if datos.stock_actual is not None:
        ins.stock_actual = datos.stock_actual
    if datos.stock_minimo is not None:
        ins.stock_minimo = datos.stock_minimo
    if datos.costo_unitario is not None:
        ins.costo_unitario = datos.costo_unitario
    db.commit()
    db.refresh(ins)
    return ins

@router.delete("/insumos/{insumo_id}")
def eliminar_insumo(
    insumo_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    ins = db.query(Insumo).filter(Insumo.insumo_id == insumo_id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    ins.activo = False
    db.commit()
    return {"mensaje": "Insumo desactivado"}