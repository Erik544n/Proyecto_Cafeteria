from flask import Flask, render_template, request, redirect, url_for, session, flash
import requests
import os

app = Flask(__name__)
app.secret_key = "cafeteria_web_secret_2026"

API_BASE_URL = os.getenv("API_BASE_URL", "http://cafeteria_api:8000")


def auth_headers():
    token = session.get("token")
    return {"Authorization": f"Bearer {token}"}


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
    except Exception:
        resumen = {}
    return render_template("dashboard.html", resumen=resumen)


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
    payload = {
        "nombre":   request.form.get("nombre"),
        "apellido": request.form.get("apellido"),
        "email":    request.form.get("email"),
        "password": request.form.get("password"),
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
            flash(f"Error: {response.json().get('detail', 'No se pudo crear el usuario.')}")
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


# ─────────────────────────────────────────
# ESTADISTICAS
# ─────────────────────────────────────────
@app.route("/estadisticas")
def estadisticas():
    if not session.get("token"):
        return redirect(url_for("login"))
    try:
        resumen    = requests.get(f"{API_BASE_URL}/admin/estadisticas/resumen",               headers=auth_headers()).json()
        productos  = requests.get(f"{API_BASE_URL}/admin/estadisticas/productos-mas-vendidos", headers=auth_headers()).json()
        ventas_dia = requests.get(f"{API_BASE_URL}/admin/estadisticas/ventas-por-dia",         headers=auth_headers()).json()
        inventario = requests.get(f"{API_BASE_URL}/admin/estadisticas/inventario",             headers=auth_headers()).json()
    except Exception:
        resumen = {}; productos = []; ventas_dia = []; inventario = []
    return render_template("estadisticas.html",
        resumen=resumen, productos=productos,
        ventas_dia=ventas_dia, inventario=inventario
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)