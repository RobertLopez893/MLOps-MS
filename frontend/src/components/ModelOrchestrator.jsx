import React, { useState } from 'react';
import { Box, Typography, Card, CardHeader, CardContent, Checkbox, TextField, MenuItem, Grid, Button, Divider, CircularProgress } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

export default function ModelOrchestrator({ onDeploySuccess, datasetConfig }) {
  // 1. Estado de los modelos seleccionados
  const [selectedModels, setSelectedModels] = useState({ rf: true, svm: false, mlp: false });
  
  // 2. Estado de carga para el botón
  const [isDeploying, setIsDeploying] = useState(false);

  // 3. Estado para guardar los hiperparámetros de cada modelo
  const [params, setParams] = useState({
    rf: { n_estimators: 100, max_depth: 'None' },
    svm: { C: 1.0, kernel: 'rbf' },
    mlp: { hidden_layers: '(100,)', activation: 'relu' }
  });

  const handleToggle = (id) => {
    setSelectedModels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleParamChange = (modelo, campo, valor) => {
    setParams(prev => ({
      ...prev,
      [modelo]: { ...prev[modelo], [campo]: valor }
    }));
  };

  // 4. LA MAGIA: Función que dispara la petición al API Gateway (FastAPI)
  const handleDeploy = async () => {
    setIsDeploying(true);
    const modelosActivos = Object.keys(selectedModels).filter(k => selectedModels[k]);
    const parametrosActivos = {};
    modelosActivos.forEach(m => { parametrosActivos[m] = params[m]; });

    // AQUÍ ESTÁ EL CAMBIO: Enviamos la configuración real
    const payload = {
      modelos: modelosActivos,
      parametros: parametrosActivos,
      dataset_config: datasetConfig 
    };

    try {
      const response = await fetch('http://20.83.188.246:8000/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (onDeploySuccess) onDeploySuccess(data.tickets);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        2. Orquestación de Modelos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecciona y configura los algoritmos que deseas encolar en el bróker de mensajería (RabbitMQ) para su entrenamiento concurrente.
      </Typography>

      <Grid container spacing={3}>
        {/* Tarjeta Random Forest */}
        <Grid item xs={12} md={4}>
          <Card elevation={selectedModels.rf ? 6 : 1} sx={{ border: selectedModels.rf ? '1px solid #00e5ff' : '1px solid transparent', transition: '0.3s' }}>
            <CardHeader title="Random Forest" action={<Checkbox checked={selectedModels.rf} onChange={() => handleToggle('rf')} />} />
            {selectedModels.rf && (
              <CardContent sx={{ pt: 0 }}>
                <Divider sx={{ mb: 2 }} />
                <TextField 
                  fullWidth label="n_estimators" type="number" size="small" sx={{ mb: 2 }} 
                  value={params.rf.n_estimators} 
                  onChange={(e) => handleParamChange('rf', 'n_estimators', parseInt(e.target.value))}
                />
                <TextField 
                  fullWidth label="max_depth" size="small" 
                  value={params.rf.max_depth} 
                  onChange={(e) => handleParamChange('rf', 'max_depth', e.target.value)}
                />
              </CardContent>
            )}
          </Card>
        </Grid>

        {/* Tarjeta SVM */}
        <Grid item xs={12} md={4}>
          <Card elevation={selectedModels.svm ? 6 : 1} sx={{ border: selectedModels.svm ? '1px solid #00e5ff' : '1px solid transparent', transition: '0.3s' }}>
            <CardHeader title="SVM" subheader="Support Vector Machine" action={<Checkbox checked={selectedModels.svm} onChange={() => handleToggle('svm')} />} />
            {selectedModels.svm && (
              <CardContent sx={{ pt: 0 }}>
                <Divider sx={{ mb: 2 }} />
                <TextField 
                  fullWidth label="C (Regularización)" type="number" size="small" sx={{ mb: 2 }} 
                  value={params.svm.C} 
                  onChange={(e) => handleParamChange('svm', 'C', parseFloat(e.target.value))}
                />
                <TextField 
                  select fullWidth label="Kernel" size="small" 
                  value={params.svm.kernel} 
                  onChange={(e) => handleParamChange('svm', 'kernel', e.target.value)}
                >
                  <MenuItem value="linear">Linear</MenuItem>
                  <MenuItem value="poly">Poly</MenuItem>
                  <MenuItem value="rbf">RBF</MenuItem>
                  <MenuItem value="sigmoid">Sigmoid</MenuItem>
                </TextField>
              </CardContent>
            )}
          </Card>
        </Grid>

        {/* Tarjeta Red Neuronal (MLP) */}
        <Grid item xs={12} md={4}>
          <Card elevation={selectedModels.mlp ? 6 : 1} sx={{ border: selectedModels.mlp ? '1px solid #00e5ff' : '1px solid transparent', transition: '0.3s' }}>
            <CardHeader title="Red Neuronal" subheader="Multi-Layer Perceptron" action={<Checkbox checked={selectedModels.mlp} onChange={() => handleToggle('mlp')} />} />
            {selectedModels.mlp && (
              <CardContent sx={{ pt: 0 }}>
                <Divider sx={{ mb: 2 }} />
                <TextField 
                  fullWidth label="Capas Ocultas" size="small" sx={{ mb: 2 }} 
                  value={params.mlp.hidden_layers} 
                  onChange={(e) => handleParamChange('mlp', 'hidden_layers', e.target.value)}
                />
                <TextField 
                  select fullWidth label="Activación" size="small" 
                  value={params.mlp.activation} 
                  onChange={(e) => handleParamChange('mlp', 'activation', e.target.value)}
                >
                  <MenuItem value="identity">Identity</MenuItem>
                  <MenuItem value="logistic">Logistic (Sigmoid)</MenuItem>
                  <MenuItem value="tanh">Tanh</MenuItem>
                  <MenuItem value="relu">ReLU</MenuItem>
                </TextField>
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Botón de despliegue masivo */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          startIcon={isDeploying ? <CircularProgress size={20} color="inherit" /> : <RocketLaunchIcon />}
          onClick={handleDeploy}
          disabled={isDeploying || Object.values(selectedModels).every(v => !v)}
        >
          {isDeploying ? 'Encolando Tareas...' : 'Desplegar Clúster de Entrenamiento'}
        </Button>
      </Box>
    </Box>
  );
}
