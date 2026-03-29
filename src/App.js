import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import Quadras from './pages/Quadras';
import Usuarios from './pages/Usuarios';
import Bloqueios from './pages/Bloqueios';

function RotaProtegida({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return <div>Carregando...</div>;
  if (!usuario) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          } />
          <Route path="/reservas" element={
            <RotaProtegida>
              <Reservas />
            </RotaProtegida>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/quadras" element={
            <RotaProtegida>
              <Quadras />
            </RotaProtegida>
          } />
          <Route path="/usuarios" element={
            <RotaProtegida>
              <Usuarios />
            </RotaProtegida>
          } />
          <Route path="/bloqueios" element={
            <RotaProtegida>
              <Bloqueios />
            </RotaProtegida>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;