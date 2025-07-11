// src/pages/PagamentoPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Importando componentes do MUI
import { 
    Container, 
    Typography, 
    Box, 
    Card, 
    CardContent, 
    Button, 
    CircularProgress, 
    Alert,
    TextField 
} from '@mui/material';

// Importando Ícones
import PixIcon from '@mui/icons-material/Pix';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Função auxiliar para corrigir o problema da data
const parseBrazilianDate = (dateString) => {
    if (!dateString || !dateString.includes(' ')) return new Date(0);
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const isoCompliantString = `${year}-${month}-${day}T${timePart}:00`;
    return new Date(isoCompliantString);
};

export default function PagamentoPage() {
    const [pixData, setPixData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pagamentoAprovado, setPagamentoAprovado] = useState(false);
    const navigate = useNavigate();
    const { user, refetchUser } = useAuth();

    const handleGeneratePix = async () => {
        setLoading(true);
        setError('');
        setPixData(null);
        try {
            const response = await api.post('/user/create-payment/');
            setPixData(response.data);
        } catch (err) {
            setError('Ocorreu um erro ao gerar o PIX. Verifique o servidor e tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        setLoading(true);
        try {
            const response = await api.get('/user/status/');
            const novaDataExpiracao = parseBrazilianDate(response.data.expira_em);
            const dataAntigaExpiracao = parseBrazilianDate(user.expira_em);

            if (novaDataExpiracao > dataAntigaExpiracao) {
                setPagamentoAprovado(true);
                if(refetchUser) await refetchUser();
            } else {
                alert("A confirmação do seu pagamento ainda não foi recebida. Tente novamente em alguns segundos.");
            }
        } catch (err) {
            alert("Ocorreu um erro ao verificar o status.");
        } finally {
            setLoading(false);
        }
    };

    // Tela de Pagamento Confirmado
    if (pagamentoAprovado) {
        return (
            <Container component="main" maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" component="h1" gutterBottom>
                    Pagamento Confirmado!
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    Sua assinatura foi renovada com sucesso. Obrigado!
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={() => navigate('/dashboard')}
                    startIcon={<ArrowBackIcon />}
                >
                    Voltar para o Dashboard
                </Button>
            </Container>
        );
    }

    // Tela Principal de Pagamento
    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
                Renovação da Assinatura
            </Typography>
            
            <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {!pixData ? (
                        <>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                Clique no botão abaixo para gerar sua cobrança PIX.
                            </Typography>
                            <Button 
                                variant="contained" 
                                size="large"
                                onClick={handleGeneratePix} 
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PixIcon />}
                            >
                                {loading ? 'Gerando...' : 'Gerar PIX'}
                            </Button>
                        </>
                    ) : (
                        <Box>
                            <Typography variant="h6" gutterBottom>Pagamento PIX Gerado!</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Escaneie o QR Code abaixo com o app do seu banco:
                            </Typography>
                            <img 
                                src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} 
                                alt="QR Code PIX" 
                                style={{ maxWidth: '250px', display: 'block', margin: '0 auto' }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                                Ou use o código "Copia e Cola":
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                readOnly
                                value={pixData.qr_code}
                                variant="outlined"
                            />
                            <Typography variant="h6" color="primary" sx={{ mt: 3 }}>
                                Aguardando confirmação de pagamento...
                            </Typography>
                            <Button 
                                variant="contained" 
                                onClick={handleCheckStatus} 
                                disabled={loading} 
                                sx={{ mt: 2 }}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                            >
                                {loading ? 'Verificando...' : 'Já Paguei, Verificar Status'}
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}