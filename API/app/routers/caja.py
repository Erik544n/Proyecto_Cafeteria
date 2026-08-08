from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, date
from decimal import Decimal

from ..database import get_db
from ..models import Pedido, Venta, Mesa, Notificacion, Usuario, Gasto
from ..schemas import VentaCreate, VentaResponse, PedidoResponse, GastoCreate, GastoResponse
from .auth import get_current_user

router = APIRouter(prefix="/caja", tags=["Caja"])

TASA_IMPUESTO = Decimal("0.16")   # IVA 16%


# ─────────────────────────────────────────
# PEDIDOS PENDIENTES DE COBRO
# ─────────────────────────────────────────
@router.get("/pedidos", response_model=List[PedidoResponse])
def pedidos_por_cobrar(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    Retorna pedidos que no han sido cobrados (no tienen venta activa).
    Caja puede procesar pagos para pedidos en cualquier estado excepto CANCELADO.
    """
    return db.query(Pedido).outerjoin(Venta, Pedido.pedido_id == Venta.pedido_id).filter(
        Pedido.estado != "CANCELADO",
        (Venta.venta_id == None) | (Venta.anulada == True)
    ).order_by(Pedido.creado_en.asc()).all()


@router.get("/pedidos/{pedido_id}", response_model=PedidoResponse)
def detalle_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Ver el detalle completo de un pedido antes de cobrarlo."""
    pedido = db.query(Pedido).filter(Pedido.pedido_id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


# ─────────────────────────────────────────
# PROCESAR PAGO
# ─────────────────────────────────────────
@router.post("/ventas", response_model=VentaResponse, status_code=201)
def procesar_pago(
    datos: VentaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    Procesa el cobro de un pedido:
    1. Valida el pedido
    2. Calcula subtotal, impuesto y total
    3. Registra la venta
    4. Envía el pedido a cocina (cambia estado a EN_PREPARACION)
    5. Genera el ticket (respuesta con todos los datos)
    """
    # Validar pedido
    pedido = db.query(Pedido).filter(Pedido.pedido_id == datos.pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido.estado == "CANCELADO":
        raise HTTPException(
            status_code=400,
            detail="El pedido está cancelado y no puede cobrarse."
        )

    # Verificar que no tenga ya una venta activa
    venta_existente = db.query(Venta).filter(Venta.pedido_id == datos.pedido_id, Venta.anulada == False).first()
    if venta_existente:
        raise HTTPException(status_code=400, detail="Este pedido ya fue cobrado")

    # Validar método de pago
    metodos_validos = ["EFECTIVO", "TARJETA", "TRANSFERENCIA"]
    if datos.metodo_pago not in metodos_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Método de pago inválido. Opciones: {metodos_validos}"
        )

    # Calcular montos
    subtotal  = Decimal(str(pedido.total))
    descuento = datos.descuento
    base      = subtotal - descuento
    impuesto  = (base * TASA_IMPUESTO).quantize(Decimal("0.01"))
    total     = base + impuesto

    # Validar que el monto pagado sea suficiente
    if datos.monto_pagado < total:
        raise HTTPException(
            status_code=400,
            detail=f"Monto insuficiente. Total a pagar: {total}"
        )

    cambio = datos.monto_pagado - total

    # Registrar venta
    venta = Venta(
        pedido_id    = datos.pedido_id,
        cajero_id    = usuario.usuario_id,
        metodo_pago  = datos.metodo_pago,
        monto_pagado = datos.monto_pagado,
        cambio       = cambio,
        subtotal     = subtotal,
        impuesto     = impuesto,
        descuento    = descuento,
        total        = total,
        anulada      = False
    )
    db.add(venta)

    # Si el pago es por adelantado (estado PENDIENTE), se manda a cocina
    if pedido.estado == "PENDIENTE":
        pedido.estado         = "EN_PREPARACION"
        pedido.actualizado_en = datetime.utcnow()

        # Notificar a cocina
        notif_cocina = Notificacion(
            pedido_id  = pedido.pedido_id,
            usuario_id = usuario.usuario_id,
            tipo       = "NUEVO_PEDIDO",
            mensaje    = f"Nuevo pedido #{pedido.pedido_id} pagado — listo para preparar"
                         + (f" — Mesa {pedido.mesa_id}" if pedido.mesa_id else " — Para llevar")
        )
        db.add(notif_cocina)
    else:
        # Solo actualizamos el timestamp si el pago se hace después (ej: pedido ya Entregado o Listo)
        pedido.actualizado_en = datetime.utcnow()

    db.commit()
    db.refresh(venta)
    return venta


# ─────────────────────────────────────────
# CANCELAR PEDIDO
# ─────────────────────────────────────────
@router.patch("/pedidos/{pedido_id}/cancelar")
def cancelar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    Cancela un pedido si el pago no fue exitoso.
    Solo se puede cancelar si está en PENDIENTE.
    """
    pedido = db.query(Pedido).filter(Pedido.pedido_id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido.estado != "PENDIENTE":
        raise HTTPException(
            status_code=400,
            detail=f"No se puede cancelar. Estado actual: {pedido.estado}"
        )

    pedido.estado         = "CANCELADO"
    pedido.actualizado_en = datetime.utcnow()

    # Liberar mesa si aplica
    if pedido.mesa_id:
        mesa = db.query(Mesa).filter(Mesa.mesa_id == pedido.mesa_id).first()
        if mesa:
            mesa.estado = "LIBRE"

    # Notificar al mesero
    notif = Notificacion(
        pedido_id  = pedido.pedido_id,
        usuario_id = pedido.usuario_id,
        tipo       = "PEDIDO_CANCELADO",
        mensaje    = f"Pedido #{pedido_id} fue cancelado en caja"
    )
    db.add(notif)

    db.commit()
    return {"mensaje": "Pedido cancelado", "pedido_id": pedido_id}


# ─────────────────────────────────────────
# HISTORIAL DE VENTAS DEL DÍA
# ─────────────────────────────────────────
@router.get("/ventas/hoy")
def ventas_hoy(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Resumen de ventas del día actual para el cajero."""
    hoy = date.today()

    ventas = db.query(Venta).filter(
        func.date(Venta.creado_en) == hoy,
        Venta.anulada == False
    ).all()

    total_dia = sum(float(v.total) for v in ventas)

    return {
        "fecha": str(hoy),
        "total_ventas": len(ventas),
        "total_dia": total_dia,
        "ventas": [
            {
                "venta_id": v.venta_id,
                "pedido_id": v.pedido_id,
                "metodo_pago": v.metodo_pago,
                "total": float(v.total),
                "creado_en": v.creado_en
            }
            for v in ventas
        ]
    }


@router.get("/ventas/{venta_id}", response_model=VentaResponse)
def obtener_ticket(
    venta_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Obtiene el ticket de una venta específica."""
    venta = db.query(Venta).filter(Venta.venta_id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta


# ─────────────────────────────────────────
# GASTOS / COMPRAS
# ─────────────────────────────────────────
@router.get("/gastos", response_model=List[GastoResponse])
def listar_gastos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Lista todos los gastos y compras registrados."""
    return db.query(Gasto).order_by(Gasto.creado_en.desc()).all()


@router.post("/gastos", response_model=GastoResponse, status_code=201)
def registrar_gasto(
    datos: GastoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    Registra un gasto o compra del local.
    Ejemplo: compra de insumos, servicios, etc.
    """
    gasto = Gasto(
        categoria_gasto_id = datos.categoria_gasto_id,
        concepto           = datos.concepto,
        monto              = datos.monto,
        fecha_gasto        = date.today(),
        usuario_id         = usuario.usuario_id
    )
    db.add(gasto)
    db.commit()
    db.refresh(gasto)
    return gasto


@router.get("/gastos/{gasto_id}", response_model=GastoResponse)
def obtener_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Obtiene el detalle de un gasto específico."""
    gasto = db.query(Gasto).filter(Gasto.gasto_id == gasto_id).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    return gasto


@router.delete("/gastos/{gasto_id}")
def eliminar_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """Elimina un gasto registrado por error."""
    gasto = db.query(Gasto).filter(Gasto.gasto_id == gasto_id).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    db.delete(gasto)
    db.commit()
    return {"mensaje": "Gasto eliminado", "gasto_id": gasto_id}


# ─────────────────────────────────────────
# ANULAR VENTA
# ─────────────────────────────────────────
@router.patch("/ventas/{venta_id}/anular")
def anular_venta(
    venta_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    """
    Anula una venta ya procesada.
    Solo para correcciones administrativas.
    """
    venta = db.query(Venta).filter(Venta.venta_id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    if venta.anulada:
        raise HTTPException(status_code=400, detail="La venta ya está anulada")
    venta.anulada = True
    db.commit()
    return {"mensaje": "Venta anulada", "venta_id": venta_id}