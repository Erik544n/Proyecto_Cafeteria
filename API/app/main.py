from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, mesero, cocina, caja, admin

app = FastAPI(
    title="Cafeteria API",
    description="API REST para la administración integral de la cafetería — UPQ S204",
    version="1.0.0"
)

# ─────────────────────────────────────────
# CORS
# ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# ROUTERS
# ─────────────────────────────────────────
app.include_router(auth.router)
app.include_router(mesero.router)
app.include_router(cocina.router)
app.include_router(caja.router)
app.include_router(admin.router)

# ─────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "mensaje": "Cafeteria API funcionando ✓",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}