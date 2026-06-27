# ── API / Dockerfile ──────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Instala dependencias primero (capa cacheada)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código
COPY . .

# Uvicorn en puerto 8000, reload activado para desarrollo
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]