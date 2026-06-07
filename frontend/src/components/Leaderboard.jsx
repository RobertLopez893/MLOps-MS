import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, IconButton, Chip } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Mapeo estético de nombres
const nombresModelos = { rf: 'Random Forest', svm: 'SVM', mlp: 'Red Neuronal (MLP)' };

function FilaExpandible({ row, rank }) {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: open ? 'rgba(144, 202, 249, 0.08)' : 'inherit', transition: '0.3s' }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {rank === 1 ? <EmojiEventsIcon sx={{ color: '#ffd700', verticalAlign: 'middle', mr: 1 }} /> : null}
          <strong>#{rank}</strong>
        </TableCell>
        <TableCell>{nombresModelos[row.modelo] || row.modelo}</TableCell>
        <TableCell>
          <Chip label={(row.accuracy * 100).toFixed(2) + '%'} color={rank === 1 ? "success" : "primary"} variant={rank === 1 ? "filled" : "outlined"} size="small" />
        </TableCell>
        <TableCell>{row.tiempo_segundos}s</TableCell>
      </TableRow>
      
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.2)', borderRadius: 1, borderLeft: '4px solid #00e5ff' }}>
              <Typography variant="subtitle2" gutterBottom component="div" sx={{ color: '#00e5ff' }}>
                Hiperparámetros Utilizados
              </Typography>
              <Typography variant="body2" component="pre" sx={{ m: 0, fontFamily: 'monospace' }}>
                {JSON.stringify(row.parametros, null, 2)}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function Leaderboard({ resultados = [] }) {
  // Ordenamos los resultados de mayor a menor precisión dinámicamente
  const resultadosOrdenados = [...resultados].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <Box sx={{ mt: 6, mb: 8 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        3. Resultados y Telemetría
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Monitor de evaluación global del clúster. Los resultados aparecerán automáticamente conforme los nodos finalicen el entrenamiento.
      </Typography>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table aria-label="leaderboard table">
          <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
            <TableRow>
              <TableCell />
              <TableCell><strong>Rank</strong></TableCell>
              <TableCell><strong>Modelo Clasificador</strong></TableCell>
              <TableCell><strong>Precisión (Accuracy)</strong></TableCell>
              <TableCell><strong>Tiempo de Cómputo</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resultadosOrdenados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Esperando despliegue en RabbitMQ...
                </TableCell>
              </TableRow>
            ) : (
              resultadosOrdenados.map((row, index) => (
                <FilaExpandible key={row.modelo + index} row={row} rank={index + 1} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
