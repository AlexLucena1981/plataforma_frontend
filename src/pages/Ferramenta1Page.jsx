// src/pages/Ferramenta1Page.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button, TextField, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Delete as DeleteIcon, RestartAlt as RestartAltIcon } from '@mui/icons-material';

// --- Imports da Lógica e Gráficos ---
import { useAnalisadorRoleta, getNumberColor, getEstatisticas } from '../hooks/useAnalisadorRoleta';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// 1. Importe o plugin de datalabels
import ChartDataLabels from 'chartjs-plugin-datalabels';
// 2. Registre o novo plugin junto com os outros
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);


// --- Componente do Placar (para organizar o código) ---
const PlacarEstrategias = ({ placarStats }) => {
    const placarArray = Object.values(placarStats);
    const totais = placarArray.reduce((acc, stats) => {
        const green = stats['1'] + stats['2'] + stats['3'];
        acc.green += green;
        acc.loss += stats.loss;
        return acc;
    }, { green: 0, loss: 0 });

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h5" gutterBottom>Placar de Estratégias</Typography>
            <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                <Box>
                    <Typography variant="overline">TOTAL GREEN</Typography>
                    <Typography variant="h4" color="success.main">{totais.green}</Typography>
                </Box>
                <Box>
                    <Typography variant="overline">TOTAL LOSS</Typography>
                    <Typography variant="h4" color="error.main">{totais.loss}</Typography>
                </Box>
            </Box>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Estratégia</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>1ª Tent.</TableCell>
                            <TableCell>2ª Tent.</TableCell>
                            <TableCell>3ª Tent.</TableCell>
                            <TableCell>TOTAL GREEN</TableCell>
                            <TableCell>TOTAL LOSS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {placarArray.sort((a,b) => a.nome.localeCompare(b.nome)).map(item => {
                            const currentGreen = item['1'] + item['2'] + item['3'];
                            return (
                                <TableRow key={item.nome}>
                                    <TableCell>{item.nome}</TableCell>
                                    <TableCell>{item.status === 'validando' ? '🔴' : '🟢'}</TableCell>
                                    <TableCell>{item['1']}</TableCell>
                                    <TableCell>{item['2']}</TableCell>
                                    <TableCell>{item['3']}</TableCell>
                                    <TableCell sx={{ color: 'success.main' }}>{currentGreen}</TableCell>
                                    <TableCell sx={{ color: 'error.main' }}>{item.loss}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

// --- Componente dos Gráficos ---
const AnaliseDetalhada = ({ jogadas }) => {
    const estatisticas = getEstatisticas(jogadas);
    if (!estatisticas) return null;

    // 3. Crie a configuração para os labels (rótulos)
    const pieOptionsWithDataLabels = {
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            // Configuração específica do plugin datalabels
            datalabels: {
                // A função formatter decide o que será escrito em cada fatia do gráfico
                formatter: (value, context) => {
                    // Se o valor for 0, não exibe nada
                    if (value === 0) return null;
                    
                    // Calcula o total de todos os valores no gráfico
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    
                    // Calcula o percentual
                    const percentage = total > 0 ? (value / total) * 100 : 0;
                    
                    // Retorna o percentual formatado com uma casa decimal
                    return `${percentage.toFixed(1)}%`;
                },
                color: '#fff', // Cor do texto
                font: {
                    weight: 'bold', // Texto em negrito
                    size: 14,
                },
            }
        }
    };

    const chartData = {
        cores: { labels: ['Vermelhos', 'Pretos', 'Verde'], datasets: [{ data: [estatisticas.reds, estatisticas.blacks, estatisticas.greens], backgroundColor: ['#d32f2f', '#212121', '#2e7d32'] }] },
        duzias: { labels: ['1ª', '2ª', '3ª'], datasets: [{ data: [estatisticas.dozen1, estatisticas.dozen2, estatisticas.dozen3], backgroundColor: ['#1976d2', '#ed6c02', '#d32f2f'] }] },
        colunas: { labels: ['1ª', '2ª', '3ª'], datasets: [{ data: [estatisticas.col1, estatisticas.col2, estatisticas.col3], backgroundColor: ['#7b1fa2', '#00796b', '#c2185b'] }] },
        parImpar: { labels: ['Pares', 'Ímpares'], datasets: [{ data: [estatisticas.evens, estatisticas.odds], backgroundColor: ['#42a5f5', '#bdbdbd'] }] }
    };
    
    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Análise Detalhada</Typography>
            <Grid container spacing={2}>
                {/* 4. Passe as novas opções para cada gráfico */}
                <Grid item xs={12} sm={6} md={3}><Typography variant="h6" align="center">Cores</Typography><Pie data={chartData.cores} options={pieOptionsWithDataLabels} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Typography variant="h6" align="center">Dúzias</Typography><Pie data={chartData.duzias} options={pieOptionsWithDataLabels} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Typography variant="h6" align="center">Colunas</Typography><Pie data={chartData.colunas} options={pieOptionsWithDataLabels} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Typography variant="h6" align="center">Pares/Ímpares</Typography><Pie data={chartData.parImpar} options={pieOptionsWithDataLabels} /></Grid>
            </Grid>
        </Paper>
    );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function Ferramenta1Page() {
    const [numeroInput, setNumeroInput] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const { jogadas, placarStats, sugestoes, adicionarNumero, removerUltimoNumero, resetarTudo } = useAnalisadorRoleta();

    const handleAddClick = () => {
        adicionarNumero(numeroInput);
        setNumeroInput('');
    };
    
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleAddClick();
        }
    };

    const getSugestaoColor = (type) => {
        if (type === 'sucesso') return 'success';
        if (type === 'fracasso') return 'error';
        if (type === 'sugestao') return 'warning';
        return 'info';
    }

    return (
        <Container component="main" maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">Analisador de Roleta Avançado</Typography>
                <Button component={Link} to="/dashboard" variant="outlined" startIcon={<ArrowBackIcon />}>Voltar ao Dashboard</Button>
            </Box>

            <Paper elevation={3} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField type="number" label="Insira o número..." variant="outlined" size="small" value={numeroInput} onChange={(e) => setNumeroInput(e.target.value)} onKeyPress={handleKeyPress} inputProps={{ min: 0, max: 36 }} autoFocus />
                <Button variant="contained" onClick={handleAddClick} startIcon={<AddIcon />}>Adicionar</Button>
                <Button variant="outlined" color="warning" onClick={removerUltimoNumero} startIcon={<DeleteIcon />}>Remover Último</Button>
                <Button variant="outlined" color="error" onClick={resetarTudo} startIcon={<RestartAltIcon />}>Resetar</Button>
            </Paper>

            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">Números Inseridos ({jogadas.length}):</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {jogadas.length > 0 ? jogadas.map((n, index) => {
                        const color = getNumberColor(n);
                        return <Chip key={index} label={n} sx={{ 
                            backgroundColor: color, 
                            color: color === 'black' ? 'white' : 'white', 
                            fontWeight: 'bold' 
                        }} />;
                    }) : <Typography variant="body2" color="text.secondary">Nenhum número adicionado.</Typography>}
                </Box>
            </Paper>

            {sugestoes && (
                <Alert severity={getSugestaoColor(sugestoes.type)} sx={{ mb: 2 }}>
                    <Typography variant="h6">{sugestoes.title}</Typography>
                    <Box dangerouslySetInnerHTML={{ __html: sugestoes.message }} />
                    {/* AQUI ESTÁ A LÓGICA CORRIGIDA PARA A IMAGEM */}
        {sugestoes.type === 'sugestao' && sugestoes.targetTerminal !== undefined && (
            <Box mt={2} textAlign="center">
                <img 
                    src={`/img/T${sugestoes.targetTerminal}.png`} 
                    alt={`Visualização da aposta para ${sugestoes.title}`}
                    style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}
                />
            </Box>
        )}
                </Alert>
            )}

            <PlacarEstrategias placarStats={placarStats} />
            
            <Box sx={{ textAlign: 'center', my: 2 }}>
                <Button variant="contained" onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? 'Ocultar Análise Detalhada' : 'Exibir Análise Detalhada'}
                </Button>
            </Box>

            {showDetails && <AnaliseDetalhada jogadas={jogadas} />}
        </Container>
    );
}