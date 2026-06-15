import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, TextField, Slider, FormControlLabel, Switch, Divider, Grid } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

export default function DataHub({ setDatasetConfig, datasetConfig }) {
  // Opciones globales de preprocesamiento
  const [testSize, setTestSize] = useState(20);
  const [balance, setBalance] = useState(false);

  // Parámetros sintéticos extendidos
  const [synthParams, setSynthParams] = useState({ n_samples: 1000, n_features: 10, n_classes: 2 });

  useEffect(() => {
    // Actualiza la configuración global cada vez que cambien los valores
    setDatasetConfig((prev) => ({
      ...prev,
      test_size: testSize / 100,
      balance: balance
    }));
  }, [testSize, balance, setDatasetConfig]);

  useEffect(() => {
    // Al iniciar, forzamos tipo sintético
    setDatasetConfig((prev) => ({
      ...prev,
      tipo: 'sintetico',
      params: synthParams
    }));
  }, []); // Solo on mount, los cambios posteriores se manejan en handleTabChange y handles específicos

  const handleSynthChange = (field, value) => {
    const newParams = { ...synthParams, [field]: Number(value) };
    setSynthParams(newParams);
    setDatasetConfig((prev) => ({ ...prev, tipo: 'sintetico', params: newParams }));
  };



  return (
    <Box sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        1. Ingesta de Datos (Data Hub)
      </Typography>
      <Paper elevation={3} sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AutoFixHighIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Dataset Sintético</Typography>
          </Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Generador Dinámico:</strong> Crea un dataset aleatorio sobre la marcha configurando sus propiedades matemáticas.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField 
                fullWidth label="Número de Muestras (Filas)" type="number" size="small"
                value={synthParams.n_samples} onChange={(e) => handleSynthChange('n_samples', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField 
                fullWidth label="Número de Características (Columnas)" type="number" size="small"
                value={synthParams.n_features} onChange={(e) => handleSynthChange('n_features', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField 
                fullWidth label="Cantidad de Clases (Etiquetas)" type="number" size="small"
                value={synthParams.n_classes} onChange={(e) => handleSynthChange('n_classes', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        {/* OPCIONES DE PREPROCESAMIENTO GLOBALES */}
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom color="primary">Opciones de Preprocesamiento Globales</Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Porcentaje para Pruebas (Test Size: {testSize}%)</Typography>
              <Slider 
                value={testSize} 
                onChange={(e, val) => setTestSize(val)} 
                aria-label="Test Size" 
                valueLabelDisplay="auto" 
                step={5} marks min={5} max={50} 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel 
                control={<Switch checked={balance} onChange={(e) => setBalance(e.target.checked)} color="secondary" />} 
                label="Balancear Dataset (Oversampling automático)" 
              />
            </Grid>
          </Grid>
        </Box>

      </Paper>
    </Box>
  );
}
