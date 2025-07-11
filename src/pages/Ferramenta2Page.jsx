// src/pages/Ferramenta1Page.jsx
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Ferramenta1Page() {
    // A lógica da sua ferramenta (inputs, chamadas de API, exibição de resultados) virá aqui.

    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Ferramenta de Análise Mesa Multiplicador
                </Typography>
                <Button 
                    component={Link}
                    to="/dashboard"
                    variant="outlined" 
                    startIcon={<ArrowBackIcon />}
                >
                    Voltar ao Dashboard
                </Button>
            </Box>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6">Interface da Ferramenta</Typography>
                <Typography paragraph color="text.secondary">
                    Este é o espaço onde a interface da sua primeira ferramenta de análise será construída.
                    Você pode adicionar formulários, botões e gráficos aqui.
                </Typography>
                {/* Exemplo: <SeuComponenteDeInput /> */}
                {/* Exemplo: <BotaoParaAnalisar /> */}
                {/* Exemplo: <GraficoDeResultados /> */}
            </Paper>
        </Container>
    );
}