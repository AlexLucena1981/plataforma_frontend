// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PagamentoPage from './pages/PagamentoPage'; // 1. Importe a nova página
import ProtectedRoute from './components/ProtectedRoute';

// 1. Importe os novos componentes de ferramenta
import Ferramenta1Page from './pages/Ferramenta1Page';
import Ferramenta2Page from './pages/Ferramenta2Page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        

        {/* 2. Adicione as rotas para as ferramentas aqui dentro */}
         <Route 
          path="/ferramenta1" 
          element={
            <ProtectedRoute>
              <Ferramenta1Page />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ferramenta2" 
          element={
            <ProtectedRoute>
              <Ferramenta2Page />
            </ProtectedRoute>
          } 
        /> 

        {/* Adicione a rota de pagamento dentro das rotas protegidas */}
        <Route 
          path="/pagamento" 
          element={
            <ProtectedRoute>
              <PagamentoPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;