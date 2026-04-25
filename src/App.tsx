import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import CitizenDashboard from './pages/Citizen/Dashboard';
import PoliceDashboard from './pages/Police/Dashboard';
import MayorDashboard from './pages/Mayor/Dashboard';
import AIDashboard from './pages/AI/Dashboard';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Camada Cidadão */}
        <Route path="/citizen" element={<CitizenDashboard />} />
        
        {/* Camada Policiamento (Centro de Comando) */}
        <Route path="/police" element={<PoliceDashboard />} />

        {/* Camada Prefeito (Gestão Estratégica) */}
        <Route path="/mayor" element={<MayorDashboard />} />

        {/* Camada IA (Engine Cognitivo) */}
        <Route path="/ai" element={<AIDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
