from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

from ..database import get_db
from ..models import Usuario
from ..schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# ─────────────────────────────────────────
# Configuración JWT
# ─────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "cafeteria_secret")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─────────────────────────────────────────
# Funciones internas reutilizables
# ─────────────────────────────────────────
def verificar_password(password_plano: str, password_hash: str) -> bool:
    return pwd_context.verify(password_plano, password_hash)

def hashear_password(password: str) -> str:
    return pwd_context.hash(password)

def crear_token(data: dict) -> str:
    payload = data.copy()
    expira  = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    payload.update({"exp": expira})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def obtener_usuario_actual(token: str, db: Session) -> Usuario:
    """
    Valida el token JWT y retorna el usuario.
    Se usa como dependencia en los demás routers.
    """
    credencial_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload    = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id = payload.get("sub")
        if usuario_id is None:
            raise credencial_error
    except JWTError:
        raise credencial_error

    usuario = db.query(Usuario).filter(
        Usuario.usuario_id == int(usuario_id),
        Usuario.activo == True
    ).first()

    if not usuario:
        raise credencial_error
    return usuario


# ─────────────────────────────────────────
# Dependencia reutilizable para los routers
# ─────────────────────────────────────────
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    return obtener_usuario_actual(credentials.credentials, db)

def require_rol(*roles_permitidos: str):
    """
    Uso:  Depends(require_rol("ADMIN", "CAJERO"))
    """
    def _check(usuario: Usuario = Depends(get_current_user)):
        if usuario.rol.nombre not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere rol: {', '.join(roles_permitidos)}"
            )
        return usuario
    return _check


# ─────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Inicia sesión y retorna el token JWT.
    Usado por App Móvil y App Web.
    """
    usuario = db.query(Usuario).filter(
        Usuario.email == request.email,
        Usuario.activo == True
    ).first()

    if not usuario or not verificar_password(request.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

    # Actualiza último login
    usuario.ultimo_login = datetime.utcnow()
    db.commit()

    token = crear_token({"sub": str(usuario.usuario_id)})

    return TokenResponse(
        access_token=token,
        usuario_id=usuario.usuario_id,
        nombre=f"{usuario.nombre} {usuario.apellido}",
        rol=usuario.rol.nombre
    )


@router.get("/me", tags=["Autenticación"])
def get_me(usuario: Usuario = Depends(get_current_user)):
    """
    Retorna los datos del usuario autenticado.
    """
    return {
        "usuario_id": usuario.usuario_id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email,
        "rol": usuario.rol.nombre,
        "activo": usuario.activo
    }