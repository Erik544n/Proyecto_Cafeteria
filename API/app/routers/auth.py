from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

from ..database import get_db
from ..models import Usuario
from ..schemas import TokenResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# ─────────────────────────────────────────
# Configuración JWT
# ─────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "cafeteria_secret")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 — le dice a Swagger donde está el endpoint de login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


# ─────────────────────────────────────────
# Funciones internas
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
# Dependencias reutilizables
# ─────────────────────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    return obtener_usuario_actual(token, db)

def require_rol(*roles_permitidos: str):
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

# Este endpoint es el que usa el candado de Swagger (OAuth2)
@router.post("/token", response_model=TokenResponse, include_in_schema=False)
def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Endpoint OAuth2 para el candado de Swagger."""
    usuario = db.query(Usuario).filter(
        Usuario.email == form_data.username,
        Usuario.activo == True
    ).first()

    if not usuario or not verificar_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    usuario.ultimo_login = datetime.utcnow()
    db.commit()

    token = crear_token({"sub": str(usuario.usuario_id)})

    return TokenResponse(
        access_token=token,
        usuario_id=usuario.usuario_id,
        nombre=f"{usuario.nombre} {usuario.apellido}",
        rol=usuario.rol.nombre
    )


# Este endpoint es el que usa la app movil y web (JSON body)
@router.post("/login", response_model=TokenResponse)
def login(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    """Login para App Movil y App Web."""
    usuario = db.query(Usuario).filter(
        Usuario.email == email,
        Usuario.activo == True
    ).first()

    if not usuario or not verificar_password(password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

    usuario.ultimo_login = datetime.utcnow()
    db.commit()

    token = crear_token({"sub": str(usuario.usuario_id)})

    return TokenResponse(
        access_token=token,
        usuario_id=usuario.usuario_id,
        nombre=f"{usuario.nombre} {usuario.apellido}",
        rol=usuario.rol.nombre
    )


@router.get("/me")
def get_me(usuario: Usuario = Depends(get_current_user)):
    """Retorna los datos del usuario autenticado."""
    return {
        "usuario_id": usuario.usuario_id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email,
        "rol": usuario.rol.nombre,
        "activo": usuario.activo
    }
