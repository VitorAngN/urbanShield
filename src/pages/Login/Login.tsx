import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'citizen' | 'police' | 'mayor' | 'ai'>('citizen');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/${role}`);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">
            <span className="logo-squares"></span>
          </div>
          <h1>Public Security Platform</h1>
        </div>

        <p className="login-subtitle">Acesse sua conta para continuar</p>

        <div className="account-type-toggle">
          <button 
            type="button" 
            className={`toggle-btn ${role === 'citizen' ? 'active' : ''}`}
            onClick={() => setRole('citizen')}
          >
            Cidadão
          </button>
          <button 
            type="button" 
            className={`toggle-btn ${role === 'police' ? 'active' : ''}`}
            onClick={() => setRole('police')}
          >
            Polícia
          </button>
          <button 
            type="button" 
            className={`toggle-btn ${role === 'mayor' ? 'active' : ''}`}
            onClick={() => setRole('mayor')}
          >
            Prefeito
          </button>
          <button 
            type="button" 
            className={`toggle-btn ${role === 'ai' ? 'active' : ''}`}
            onClick={() => setRole('ai')}
          >
            Sist. IA
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" placeholder="seu@email.com" required />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input type="password" id="senha" placeholder="••••••••" required />
          </div>

          <button type="submit" className="login-submit-btn">Entrar como {
            role === 'citizen' ? 'Cidadão' : role === 'police' ? 'Polícia' : role === 'mayor' ? 'Prefeito' : 'Engenheiro de IA'
          }</button>
        </form>
      </div>
    </div>
  );
}
