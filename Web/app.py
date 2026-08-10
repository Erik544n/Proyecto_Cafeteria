from flask import Flask, render_template, request, redirect, url_for, session, flash, Response
import requests
import os
from datetime import date

app = Flask(__name__)
app.secret_key = "cafeteria_web_secret_2026"

API_BASE_URL = os.getenv("API_BASE_URL", "http://cafeteria_api:8000")


def auth_headers():
    return {"Authorization": f"Bearer {session.get('token')}"}


# ─────────────────────────────────────────
# LOGIN / LOGOUT
# ─────────────────────────────────────────
@app.route("/", methods=["GET", "POST"])
def login():
    if session.get("token"):
        return redirect(url_for("dashboard"))
    if request.method == "POST":
        email    = request.form.get("email")
        password = request.form.get("password")
        try:
            response = requests.post(
                f"{API_BASE_URL}/auth/login",
                params={"email": email, "password": password}
            )
            if response.status_code == 200:
                data = response.json()
                if data["rol"] != "ADMIN":
                    flash("Solo los administradores pueden acceder.")
                    return render_template("login.html")
                session["token"]      = data["access_token"]
                session["nombre"]     = data["nombre"]
                session["rol"]        = data["rol"]
                session["usuario_id"] = data["usuario_id"]
                return redirect(url_for("dashboard"))
            else:
                flash("Correo o contrasena incorrectos.")
        except Exception:
            flash("No se pudo conectar con la API.")
    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ─────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────
@app.route("/dashboard")
def dashboard():
    if not session.get("token"):
        return redirect(url_for("login"))
    try:
        resumen = requests.get(
            f"{API_BASE_URL}/admin/estadisticas/resumen",
            headers=auth_headers()
        ).json()
        productos = requests.get(
            f"{API_BASE_URL}/admin/estadisticas/productos-mas-vendidos",
            params={"dias": 30, "limite": 1},
            headers=auth_headers()
        ).json()
        producto_estrella = productos[0]["nombre"] if (isinstance(productos, list) and len(productos) > 0) else "Sin ventas aún"
    except Exception:
        resumen = {}
        producto_estrella = "Sin ventas aún"
    return render_template("dashboard.html", resumen=resumen, producto_estrella=producto_estrella)


# ─────────────────────────────────────────
# USUARIOS
# ─────────────────────────────────────────
@app.route("/usuarios")
def usuarios():
    if not session.get("token"):
        return redirect(url_for("login"))
    
    try:
        data  = requests.get(f"{API_BASE_URL}/admin/usuarios", headers=auth_headers()).json()
        roles = requests.get(f"{API_BASE_URL}/admin/roles",    headers=auth_headers()).json()
    except Exception:
        data  = []
        roles = []
    return render_template("usuarios.html", usuarios=data, roles=roles)


@app.route("/usuarios/crear", methods=["POST"])
def crear_usuario():
    if not session.get("token"):
        return redirect(url_for("login"))
    
    password = request.form.get("password")
    if not password or len(password) < 9:
        flash("La contrasena debe ser mayor a 8 caracteres (minimo 9).")
        return redirect(url_for("usuarios"))

    payload = {
        "nombre":   request.form.get("nombre"),
        "apellido": request.form.get("apellido"),
        "email":    request.form.get("email"),
        "password": password,
        "telefono": request.form.get("telefono"),
        "rol_id":   int(request.form.get("rol_id"))
    }
    try:
        response = requests.post(
            f"{API_BASE_URL}/admin/usuarios",
            json=payload,
            headers=auth_headers()
        )
        if response.status_code == 201:
            flash("Usuario creado correctamente.")
        else:
            detail = response.json().get('detail', 'No se pudo crear el usuario.')
            # Translate Pydantic validation error if it occurs
            if 'min_length' in str(detail):
                detail = "La contrasena debe ser mayor a 8 caracteres (minimo 9)."
            flash(f"Error: {detail}")
    except Exception:
        flash("Error al conectar con la API.")
    return redirect(url_for("usuarios"))


@app.route("/usuarios/<int:usuario_id>/editar", methods=["POST"])
def editar_usuario(usuario_id):
    if not session.get("token"):
        return redirect(url_for("login"))
    
    payload = {
        "nombre":   request.form.get("nombre"),
        "apellido": request.form.get("apellido"),
        "telefono": request.form.get("telefono"),
        "rol_id":   int(request.form.get("rol_id")),
        "activo":   request.form.get("activo") == "true"
    }
    
    try:
        response = requests.put(
            f"{API_BASE_URL}/admin/usuarios/{usuario_id}",
            json=payload,
            headers=auth_headers()
        )
        if response.status_code == 200:
            flash("Usuario actualizado correctamente.")
        else:
            flash(f"Error: {response.json().get('detail', 'No se pudo actualizar el usuario.')}")
    except Exception:
        flash("Error al conectar con la API.")
    return redirect(url_for("usuarios"))


@app.route("/usuarios/<int:usuario_id>/eliminar")
def eliminar_usuario(usuario_id):
    if not session.get("token"):
        return redirect(url_for("login"))
    try:
        response = requests.delete(
            f"{API_BASE_URL}/admin/usuarios/{usuario_id}",
            headers=auth_headers()
        )
        if response.status_code == 200:
            flash("Usuario eliminado permanentemente.")
        else:
            flash("Error: No se pudo eliminar el usuario.")
    except Exception:
        flash("Error al conectar con la API.")
    return redirect(url_for("usuarios"))


@app.route("/usuarios/<int:usuario_id>/desactivar")
def desactivar_usuario(usuario_id):
    if not session.get("token"):
        return redirect(url_for("login"))
    try:
        requests.patch(
            f"{API_BASE_URL}/admin/usuarios/{usuario_id}/desactivar",
            headers=auth_headers()
        )
        flash("Usuario desactivado.")
    except Exception:
        flash("Error al desactivar usuario.")
    return redirect(url_for("usuarios"))


@app.route("/exportar_reporte", methods=["POST"])
def exportar_reporte():
    if not session.get("token"):
        return {"error": "Unauthorized"}, 401
    
    payload = request.json
    formato = payload.get("formato", "pdf")
    
    try:
        # Peticion POST a la API de FastAPI con todo el JSON (fechas, booleanos, filtros)
        if formato == "excel":
            response = requests.post(
                f"{API_BASE_URL}/reportes/xlsx", 
                headers=auth_headers(),
                json=payload
            )
            return Response(response.content, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        else:
            response = requests.post(
                f"{API_BASE_URL}/reportes/pdf", 
                headers=auth_headers(),
                json=payload
            )
            return Response(response.content, mimetype="application/pdf")
    except Exception as e:
        return {"error": str(e)}, 500

# ─────────────────────────────────────────
# ESTADISTICAS
# ─────────────────────────────────────────
@app.route("/estadisticas")
def estadisticas():
    if not session.get("token"):
        return redirect(url_for("login"))

    # ── Filtros de query string
    fecha_inicio  = request.args.get("fecha_inicio", str(date.today()))
    fecha_fin     = request.args.get("fecha_fin", str(date.today()))
    categoria_sel = request.args.get("categoria", "")
    metodo_pago_sel = request.args.get("metodo_pago", "")
    pagina_actual = int(request.args.get("pagina", 1))
    por_pagina    = 10

    try:
        # ── Resumen general
        resumen = requests.get(
            f"{API_BASE_URL}/admin/estadisticas/resumen",
            headers=auth_headers()
        ).json()

        # ── Productos más vendidos (últimos 30 días)
        productos = requests.get(
            f"{API_BASE_URL}/admin/estadisticas/productos-mas-vendidos",
            params={"dias": 30, "limite": 10},
            headers=auth_headers()
        ).json()

        # ── Todas las ventas filtradas (para la tabla de transacciones)
        ventas_raw = requests.get(
            f"{API_BASE_URL}/admin/estadisticas/ventas",
            params={"fecha_inicio": fecha_inicio, "fecha_fin": fecha_fin},
            headers=auth_headers()
        ).json()
        ventas_list = ventas_raw.get("ventas", [])

        # ── Categorías del menú (para el filtro)
        categorias = requests.get(
            f"{API_BASE_URL}/admin/estadisticas/inventario",
            headers=auth_headers()
        ).json()

    except Exception:
        resumen = {}
        productos = []
        ventas_list = []
        categorias = []

    # ── Obtener categorías del menú para el select de filtros
    try:
        # Intentamos obtener las categorías. Si no hay endpoint, dejamos vacío
        categorias_menu = []
        # Usamos un enfoque simple: categorías fijas del sistema
        categorias_menu = [
            {"categoria_id": 1, "nombre": "Cafeteria"},
            {"categoria_id": 2, "nombre": "Panaderia"},
            {"categoria_id": 3, "nombre": "Brunch"},
            {"categoria_id": 4, "nombre": "Bebidas"},
        ]
    except Exception:
        categorias_menu = []

    # ── Enriquecer cada venta con datos de pedido (mesa, productos, hora)
    ventas_detalle = []
    for v in ventas_list:
        pedido_id = v.get("pedido_id")
        mesa_num = None
        productos_texto = ""

        try:
            pedido_data = requests.get(
                f"{API_BASE_URL}/caja/pedidos/{pedido_id}",
                headers=auth_headers()
            ).json()

            mesa_num = pedido_data.get("mesa_id")
            detalles = pedido_data.get("detalles", [])
            nombres = []
            for d in detalles:
                prod_id = d.get("producto_id")
                cantidad = d.get("cantidad", 1)
                # Buscar nombre del producto
                try:
                    prod_resp = requests.get(
                        f"{API_BASE_URL}/cocina/productos/{prod_id}",
                        headers=auth_headers()
                    ).json()
                    nombre_prod = prod_resp.get("nombre", f"Producto #{prod_id}")
                except Exception:
                    nombre_prod = f"Producto #{prod_id}"
                nombres.append(f"{cantidad}x {nombre_prod}")
            productos_texto = ", ".join(nombres) if nombres else "—"
        except Exception:
            productos_texto = "—"

        # Formatear hora
        creado_en = v.get("creado_en", "")
        if creado_en:
            try:
                from datetime import datetime
                if isinstance(creado_en, str):
                    # Intentar parsear diferentes formatos
                    for fmt in ["%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"]:
                        try:
                            dt = datetime.fromisoformat(creado_en.replace("Z", "+00:00")) if "T" in creado_en else datetime.strptime(creado_en, fmt)
                            hora = dt.strftime("%H:%M")
                            break
                        except Exception:
                            continue
                    else:
                        hora = str(creado_en)[:5]
                else:
                    hora = str(creado_en)
            except Exception:
                hora = str(creado_en)[:16]
        else:
            hora = "—"

        # Filtro por método de pago
        if metodo_pago_sel and v.get("metodo_pago") != metodo_pago_sel:
            continue

        ventas_detalle.append({
            "venta_id": v.get("venta_id"),
            "pedido_id": pedido_id,
            "hora": hora,
            "mesa_num": mesa_num,
            "productos_texto": productos_texto,
            "metodo_pago": v.get("metodo_pago", "—"),
            "total": float(v.get("total", 0)),
        })

    # ── Calcular porcentajes salon vs takeaway
    total_count = len(ventas_detalle) or 1
    salon_count = sum(1 for v in ventas_detalle if v.get("mesa_num"))
    takeaway_count = total_count - salon_count
    pct_salon = round((salon_count / total_count) * 100)
    pct_takeaway = 100 - pct_salon

    # ── Paginación
    total_ventas_count = len(ventas_detalle)
    total_paginas = max(1, -(-total_ventas_count // por_pagina))  # ceil division
    pagina_actual = max(1, min(pagina_actual, total_paginas))
    inicio = (pagina_actual - 1) * por_pagina
    fin = inicio + por_pagina
    ventas_paginadas = ventas_detalle[inicio:fin]

    fecha_hoy = date.today().strftime("%d/%m/%Y")

    return render_template("estadisticas.html",
        resumen=resumen,
        productos=productos,
        ventas=ventas_paginadas,
        total_ventas_count=total_ventas_count,
        pagina_actual=pagina_actual,
        total_paginas=total_paginas,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        categoria_sel=categoria_sel,
        metodo_pago_sel=metodo_pago_sel,
        categorias=categorias_menu,
        pct_salon=pct_salon,
        pct_takeaway=pct_takeaway,
        fecha_hoy=fecha_hoy,
    )


# ─────────────────────────────────────────
# VISTA PREVIA DEL REPORTE
# ─────────────────────────────────────────
@app.route("/estadisticas/preview")
def reporte_preview():
    if not session.get("token"):
        return redirect(url_for("login"))

    periodo  = request.args.get("periodo", "diario")
    dias_map = {"diario": 1, "semanal": 7, "mensual": 30}
    dias     = dias_map.get(periodo, 1)

    try:
        resumen    = requests.get(f"{API_BASE_URL}/admin/estadisticas/resumen",                headers=auth_headers()).json()
        productos  = requests.get(f"{API_BASE_URL}/admin/estadisticas/productos-mas-vendidos", params={"dias": dias}, headers=auth_headers()).json()
        ventas_dia = requests.get(f"{API_BASE_URL}/admin/estadisticas/ventas-por-dia",         params={"dias": dias}, headers=auth_headers()).json()

        # Obtener detalle de ventas reales
        from datetime import date, timedelta
        ventas_raw = requests.get(
            f"{API_BASE_URL}/caja/ventas/hoy",
            headers=auth_headers()
        ).json()
        ventas = ventas_raw.get("ventas", [])

    except Exception:
        resumen = {}; productos = []; ventas = []

    # Convertir resumen a objeto accesible con punto
    class Resumen:
        def __init__(self, d):
            self.ventas_totales  = d.get("ventas_totales", 0)
            self.gastos_totales  = d.get("gastos_totales", 0)
            self.ganancias_netas = d.get("ganancias_netas", 0)
            self.total_pedidos   = d.get("total_pedidos", 0)
            self.pedidos_activos = d.get("pedidos_activos", 0)

    class Producto:
        def __init__(self, d):
            self.nombre        = d.get("nombre", "")
            self.total_vendido = d.get("total_vendido", 0)
            self.ingresos      = d.get("ingresos", 0)

    class Venta:
        def __init__(self, d):
            self.venta_id   = d.get("venta_id", "")
            self.pedido_id  = d.get("pedido_id", "")
            self.metodo_pago = d.get("metodo_pago", "")
            self.subtotal   = d.get("total", 0) / 1.16
            self.impuesto   = d.get("total", 0) - (d.get("total", 0) / 1.16)
            self.total      = d.get("total", 0)
            self.creado_en  = d.get("creado_en", "")

    return render_template("reporte_preview.html",
        resumen     = Resumen(resumen),
        productos   = [Producto(p) for p in productos],
        ventas      = [Venta(v) for v in ventas],
        periodo     = periodo,
        fecha_hoy   = date.today().strftime("%d/%m/%Y"),
        admin_nombre = session.get("nombre", "Administrador")
    )


# ─────────────────────────────────────────
# EXPORTAR
# ─────────────────────────────────────────
@app.route("/estadisticas/exportar/pdf")
def exportar_pdf():
    if not session.get("token"):
        return redirect(url_for("login"))
    periodo  = request.args.get("periodo", "diario")
    dias_map = {"diario": 1, "semanal": 7, "mensual": 30}
    dias     = dias_map.get(periodo, 1)
    try:
        response = requests.get(
            f"{API_BASE_URL}/reportes/pdf",
            params={"dias": dias},
            headers=auth_headers()
        )
        return Response(
            response.content,
            mimetype="application/pdf",
            headers={"Content-Disposition": response.headers.get("Content-Disposition", "attachment; filename=reporte.pdf")}
        )
    except Exception:
        flash("Error al generar el PDF.")
        return redirect(url_for("estadisticas", periodo=periodo))


@app.route("/estadisticas/exportar/xlsx")
def exportar_xlsx():
    if not session.get("token"):
        return redirect(url_for("login"))
    periodo  = request.args.get("periodo", "diario")
    dias_map = {"diario": 1, "semanal": 7, "mensual": 30}
    dias     = dias_map.get(periodo, 1)
    try:
        response = requests.get(
            f"{API_BASE_URL}/reportes/xlsx",
            params={"dias": dias},
            headers=auth_headers()
        )
        return Response(
            response.content,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": response.headers.get("Content-Disposition", "attachment; filename=reporte.xlsx")}
        )
    except Exception:
        flash("Error al generar el Excel.")
        return redirect(url_for("estadisticas", periodo=periodo))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)