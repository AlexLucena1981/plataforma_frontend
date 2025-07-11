// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api'; // Certifique-se que o arquivo api.js existe em 'src/services/'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/user/status/')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          setUser(null);
        });
    }
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/token/', { username, password });
    localStorage.setItem('accessToken', response.data.access);
    const userResponse = await api.get('/user/status/');
    setUser(userResponse.data);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};