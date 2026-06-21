import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, AppBar, Toolbar, Container } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import DataHub from './components/DataHub';
import ModelOrchestrator from './components/ModelOrchestrator';
import Leaderboard from './components/Leaderboard';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#00e5ff' }, secondary: { main: '#d500f9' }, background: { default: 'transparent', paper: 'rgba(10, 25, 41, 0.6)' } },
  typography: { fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif' },
});

function App() {
  const [resultadosClouder, setResultadosClouder] = useState([]);
  
  // NUEVO: Estado global que guarda de dónde vienen los datos
  const [datasetConfig, setDatasetConfig] = useState({ tipo: 'sintetico' });

  const iniciarMonitoreo = (tickets) => {
    tickets.forEach((ticket) => {
      const intervalId = setInterval(async () => {
        try {
          const res = await fetch(`http://20.83.188.246:8000/api/status/${ticket.task_id}`);
          const data = await res.json();
          if (data.status === 'completed') {
            clearInterval(intervalId);
            setResultadosClouder((prev) => [...prev, data.result]);
          } else if (data.status === 'failed') {
            clearInterval(intervalId);
            console.error(`Error en el modelo ${ticket.modelo}:`, data.error);
          }
        } catch (error) {
          clearInterval(intervalId);
        }
      }, 2000);
    });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(0, 20, 40, 0.5)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(0, 229, 255, 0.3)' }}>
        <Toolbar>
          <StorageIcon sx={{ mr: 2, color: '#00e5ff' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>MLOps Command Center</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ pt: 6, pb: 8, flexGrow: 1 }}>
          
          {/* Le pasamos la función para actualizar los datos elegidos */}
          <DataHub setDatasetConfig={setDatasetConfig} datasetConfig={datasetConfig} />
          
          {/* Le pasamos la configuración al orquestador para que la envíe al backend */}
          <ModelOrchestrator onDeploySuccess={iniciarMonitoreo} datasetConfig={datasetConfig} />
          
          <Leaderboard resultados={resultadosClouder} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
