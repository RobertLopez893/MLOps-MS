import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, Tabs, Tab } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

// Importaciones comentadas para evitar warnings de consola
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import LinkIcon from '@mui/icons-material/Link';
// import { Button, CircularProgress, TextField } from '@mui/material';

function CustomTabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

export default function DataHub({ setDatasetConfig, datasetConfig }) {
  // Iniciamos directamente en el index 0 (que ahora es el sintético)
  const [tabValue, setTabValue] = useState(0);

  // Aseguramos que el estado global inicie y se mantenga en 'sintetico'
  useEffect(() => {
    setDatasetConfig({ tipo: 'sintetico' });
  }, [setDatasetConfig]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  /* =====================================================================
     LÓGICA COMENTADA PARA FUTURA IMPLEMENTACIÓN (ARCHIVOS Y URL)
     =====================================================================
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (data.status === 'success') {
        setDatasetConfig({ tipo: 'archivo', archivo: data.archivo });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if(urlInput) setDatasetConfig({ tipo: 'url', url: urlInput });
  };
  ===================================================================== */

  return (
    <Box sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        1. Ingesta de Datos (Data Hub)
      </Typography>
      <Paper elevation={3} sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
          {/* Pestañas comentadas para ocultarlas de la interfaz gráfica */}
          {/* <Tab icon={<CloudUploadIcon />} label="Archivo Local (CSV/JSON)" /> */}
          {/* <Tab icon={<LinkIcon />} label="URL Externa" /> */}
          <Tab icon={<AutoFixHighIcon />} label="Dataset Sintético" />
        </Tabs>

        {/* ================================================================
            PANELES COMENTADOS
            ================================================================ */}
        {/* PESTAÑA 0 ORIGINAL: ARCHIVO */}
        {/* <CustomTabPanel value={tabValue} index={0}>
          <Box sx={{ textAlign: 'center', p: 2, border: '2px dashed rgba(0,229,255,0.3)', borderRadius: 2 }}>
            <input accept=".csv,.json" style={{ display: 'none' }} id="file-upload" type="file" onChange={handleFileUpload} />
            <label htmlFor="file-upload">
              <Button variant="outlined" component="span" startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />} disabled={isUploading}>
                {isUploading ? 'Subiendo al volumen...' : 'Seleccionar Archivo Local'}
              </Button>
            </label>
            {datasetConfig.tipo === 'archivo' && (
              <Alert severity="success" sx={{ mt: 2 }}>Archivo <strong>{datasetConfig.archivo}</strong> listo para el clúster.</Alert>
            )}
          </Box>
        </CustomTabPanel>
        */}

        {/* PESTAÑA 1 ORIGINAL: URL */}
        {/*
        <CustomTabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="URL del Dataset (CSV/JSON)" variant="outlined" size="small" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
            <Button variant="contained" onClick={handleUrlSubmit}>Configurar</Button>
          </Box>
          {datasetConfig.tipo === 'url' && (
            <Alert severity="success" sx={{ mt: 2 }}>El clúster descargará los datos desde: <strong>{datasetConfig.url}</strong></Alert>
          )}
        </CustomTabPanel>
        */}

        {/* ================================================================
            PANEL ACTIVO
            ================================================================ */}
        {/* PESTAÑA ÚNICA ACTIVA: SINTÉTICO (Ahora responde al index 0) */}
        <CustomTabPanel value={tabValue} index={0}>
          <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
            <strong>Modo de demostración activo:</strong> Se usarán datos generados aleatoriamente mediante Scikit-Learn (1000 muestras). Ideal para pruebas de estrés y concurrencia en los nodos del clúster.
          </Alert>
        </CustomTabPanel>

      </Paper>
    </Box>
  );
}
