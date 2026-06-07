FROM python:3.11-slim

WORKDIR /app

# Instalamos las dependencias pesadas (Scikit-Learn, Celery, etc.)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos la lógica del Worker
COPY . .

# Arrancamos el obrero de Celery apuntando a nuestro archivo tasks.py
CMD ["celery", "-A", "tasks", "worker", "--loglevel=info"]
