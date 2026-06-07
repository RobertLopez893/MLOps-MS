import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Alert, CircularProgress, Tabs, Tab, TextField } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

function CustomTabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

export default function DataHub({ setDatasetConfig, datasetConfig }) {
  const [tabValue, setTabValue] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Si regresa a sintético, actualizamos el estado de inmediato
    if (newValue === 2) setDatasetConfig({ tipo: 'sintetico' });
  };

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
        // Le avisamos a App.jsx que el archivo subió bien
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

  return (
    <Box sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>1. Ingesta de Datos (Data Hub)</Typography>
      <Paper elevation={3} sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
          <Tab icon={<CloudUploadIcon />} label="Archivo Local (CSV/JSON)" />
          <Tab icon={<LinkIcon />} label="URL Externa" />
          <Tab icon={<AutoFixHighIcon />} label="Dataset Sintético" />
        </Tabs>

        {/* PESTAÑA 0: ARCHIVO */}
        <CustomTabPanel value={tabValue} index={0}>
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

        {/* PESTAÑA 1: URL */}
        <CustomTabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="URL del Dataset (CSV/JSON)" variant="outlined" size="small" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
            <Button variant="contained" onClick={handleUrlSubmit}>Configurar</Button>
          </Box>
          {datasetConfig.tipo === 'url' && (
            <Alert severity="success" sx={{ mt: 2 }}>El clúster descargará los datos desde: <strong>{datasetConfig.url}</strong></Alert>
          )}
        </CustomTabPanel>

        {/* PESTAÑA 2: SINTÉTICO */}
        <CustomTabPanel value={tabValue} index={2}>
          <Alert severity="info">Se usarán datos generados aleatoriamente (1000 muestras). Ideal para pruebas de estrés.</Alert>
        </CustomTabPanel>

      </Paper>
    </Box>
  );
}
