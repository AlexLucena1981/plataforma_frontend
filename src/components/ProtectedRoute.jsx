import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // This will run while the initial user check is happening
  if (user === undefined) {
    return <div>Carregando...</div>; 
  }

  if (!user) {
    // If there's no user, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If there is a user, show the requested page
  return children;
}