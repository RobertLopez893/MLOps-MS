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
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import RandomOverSampler
app = Celery('ml_tasks', broker='amqp://guest:guest@rabbitmq:5672//', backend='rpc://')
DATA_DIR = "/app/data"

@app.task(name='train_model_task')
def train_model_task(modelo: str, parametros: dict, dataset_config: dict):
    print(f"🚀 [WORKER] Entrenando {modelo} con fuente: {dataset_config.get('tipo')}")
    start_time = time.time()
    
    try:
        # --- LÓGICA DE INGESTA DE DATOS (Solo Sintético) ---
        test_size = dataset_config.get('test_size', 0.2)
        balance = dataset_config.get('balance', False)
        
        synth_params = dataset_config.get('params', {})
        n_samples = int(synth_params.get('n_samples', 1000))
        n_features = int(synth_params.get('n_features', 10))
        n_classes = int(synth_params.get('n_classes', 2))
        
        # Scikit-learn requiere que n_informative sea lo suficientemente grande para alojar n_classes
        # Matemáticamente: n_classes * n_clusters_per_class <= 2**n_informative
        # Por defecto n_clusters_per_class es 2.
        import math
        n_informative_min = math.ceil(math.log2(n_classes * 2))
        n_informative = max(2, n_informative_min)
        
        # También aseguramos que haya suficientes n_features para cubrir n_informative
        n_features = max(n_features, n_informative)
        
        X, y = make_classification(
            n_samples=n_samples, 
            n_features=n_features, 
            n_informative=n_informative,
            n_classes=n_classes,
            random_state=42
        )

        # Aplicamos balanceo si el usuario lo solicita
        if balance:
            print("⚖️ [WORKER] Aplicando Random Oversampling para balancear las clases...")
            ros = RandomOverSampler(random_state=42)
            X, y = ros.fit_resample(X, y)

        # Dividimos los datos usando el test_size configurado
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
        
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
    