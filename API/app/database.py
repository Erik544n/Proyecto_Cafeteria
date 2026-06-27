from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Lee la URL de la variable de entorno del docker-compose
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://cafe_user:cafe_password@db_postgres:5432/cafeteria_db"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia que se inyecta en cada endpoint
# Abre la sesión, la usa, y la cierra automáticamente
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()