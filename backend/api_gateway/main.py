import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from celery import Celery
from celery.result import AsyncResult

app = FastAPI(title="MLOps API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

celery_client = Celery('ml_tasks', broker='amqp://guest:guest@rabbitmq:5672//', backend='rpc://')

# Directorio compartido en Docker
DATA_DIR = "/app/data"
os.makedirs(DATA_DIR, exist_ok=True)

class TrainingRequest(BaseModel):
    modelos: list[str]
    parametros: dict
    dataset_config: dict # Ejemplo: {"tipo": "archivo", "archivo": "dataset.csv"} o {"tipo": "sintetico"}

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(None), url: str = Form(None)):
    """Maneja subida de archivo local (CSV/JSON) o URL"""
    try:
        if file:
            file_location = f"{DATA_DIR}/{file.filename}"
            with open(file_location, "wb+") as file_object:
                shutil.copyfileobj(file.file, file_object)
            return {"status": "success", "fuente": "archivo", "archivo": file.filename}
        
        elif url:
            # En un entorno real aquí descargaríamos el archivo de la URL
            # Por ahora lo pasamos como string para que Celery lo descargue con Pandas
            return {"status": "success", "fuente": "url", "url": url}
            
        return {"status": "error", "message": "No se envió archivo ni URL"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/orchestrate")
async def orchestrate_training(request: TrainingRequest):
    tickets_generados = []
    for modelo in request.modelos:
        params = request.parametros.get(modelo, {})
        # Le enviamos a Celery el modelo, los parámetros Y la config del dataset
        task = celery_client.send_task('train_model_task', args=[modelo, params, request.dataset_config])
        tickets_generados.append({"modelo": modelo, "task_id": task.id})
        
    return {"status": "accepted", "tickets": tickets_generados}

@app.get("/api/status/{task_id}")
async def get_task_status(task_id: str):
    task = AsyncResult(task_id, app=celery_client)
    if task.ready():
        if task.successful():
            return {"status": "completed", "result": task.result}
        else:
            return {"status": "failed", "error": str(task.result)}
    return {"status": "processing"}
