// src/pages/DashboardPage.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Importando componentes do MUI
import { 
    Container, 
    Typography, 
    Box, 
    Card, 
    CardContent, 
    CardActions, 
    Button, 
    CircularProgress, // Um spinner de carregamento
    Grid 
} from '@mui/material';

// Importando Ícones
import UpdateIcon from '@mui/icons-material/Update';
import LogoutIcon from '@mui/icons-material/Logout';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Enquanto o 'user' não for carregado, mostramos um spinner de carregamento
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Painel do Jogador
        </Typography>
        <Button 
          variant="outlined" 
          onClick={handleLogout} 
          startIcon={<LogoutIcon />}
        >
          Sair
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Card de Boas-Vindas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5">
                Bem-vindo, <strong>{user.username}</strong>!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Aqui você pode gerenciar sua assinatura e acessar as ferramentas.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card da Assinatura */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status da sua Assinatura
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Situação:</strong> {user.status_assinatura}
              </Typography>
              <Typography variant="body2">
                <strong>Expira em:</strong> {user.expira_em}
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={Link} 
                to="/pagamento" 
                variant="contained" 
                startIcon={<UpdateIcon />}
              >
                Renovar Assinatura
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Card das Ferramentas (preparando para o futuro) */}
        <Grid item xs={12} md={6}>
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Ferramentas de Análise
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Acesse aqui suas ferramentas exclusivas para análise de roleta.
      </Typography>
    </CardContent>
    <CardActions>
      {/* Habilitando os botões com links */}
      <Button component={Link} to="/ferramenta1">
        Acessar Análise Mesa 36x
      </Button>
      <Button component={Link} to="/ferramenta2">
        Acessar Análise Mesa Multiplicador
      </Button>
    </CardActions>
  </Card>
</Grid>
      </Grid>
    </Container>
  );
}