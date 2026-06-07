FROM python:3.11-slim

WORKDIR /app

# Instalamos las dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos la lógica
COPY . .

EXPOSE 8000

# Arrancamos FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
