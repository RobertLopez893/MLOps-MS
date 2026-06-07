import time
import os
import pandas as pd
from celery import Celery
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score

app = Celery('ml_tasks', broker='amqp://guest:guest@rabbitmq:5672//', backend='rpc://')
DATA_DIR = "/app/data"

@app.task(name='train_model_task')
def train_model_task(modelo: str, parametros: dict, dataset_config: dict):
    print(f"🚀 [WORKER] Entrenando {modelo} con fuente: {dataset_config.get('tipo')}")
    start_time = time.time()
    
    try:
        # --- LÓGICA DE INGESTA DE DATOS SEGÚN TU ESPECIFICACIÓN ---
        tipo_datos = dataset_config.get('tipo', 'sintetico')
        
        if tipo_datos == 'sintetico':
            X, y = make_classification(n_samples=1000, n_features=10, random_state=42)
            
        elif tipo_datos == 'archivo':
            archivo = dataset_config.get('archivo')
            ruta = os.path.join(DATA_DIR, archivo)
            
            if archivo.endswith('.csv'):
                df = pd.read_csv(ruta)
            elif archivo.endswith('.json'):
                df = pd.read_json(ruta)
            else:
                raise ValueError("Formato no soportado. Usa CSV o JSON.")
                
            X = df.iloc[:, :-1]
            y = df.iloc[:, -1]
            
        elif tipo_datos == 'url':
            url = dataset_config.get('url')
            # Pandas es lo suficientemente inteligente para descargar el CSV/JSON directo de la URL
            df = pd.read_csv(url) if '.csv' in url else pd.read_json(url)
            X = df.iloc[:, :-1]
            y = df.iloc[:, -1]

        # Dividimos los datos
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # --- LÓGICA DE ENTRENAMIENTO ---
        if modelo == 'rf':
            depth = None if parametros.get('max_depth') in ['None', '', None] else int(parametros.get('max_depth'))
            clf = RandomForestClassifier(n_estimators=int(parametros.get('n_estimators', 100)), max_depth=depth, n_jobs=-1)
        elif modelo == 'svm':
            clf = SVC(C=float(parametros.get('C', 1.0)), kernel=parametros.get('kernel', 'rbf'))
        elif modelo == 'mlp':
            clf = MLPClassifier(hidden_layer_sizes=(100,), activation=parametros.get('activation', 'relu'), max_iter=500)
            
        clf.fit(X_train, y_train)
        accuracy = accuracy_score(y_test, clf.predict(X_test))
        
        exec_time = time.time() - start_time
        return {
            "modelo": modelo,
            "status": "success",
            "accuracy": float(accuracy),
            "tiempo_segundos": round(exec_time, 2),
            "parametros": parametros
        }
    except Exception as e:
        return {"modelo": modelo, "status": "error", "error": str(e)}
    