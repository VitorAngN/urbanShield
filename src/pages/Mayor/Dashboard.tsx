import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Shield, Users, Activity, LogOut, FileBarChart } from 'lucide-react';
import './Dashboard.css';

const monthlyData = [
  { name: 'Jan', crimes: 400, preditivo: 240 },
  { name: 'Fev', crimes: 300, preditivo: 139 },
  { name: 'Mar', crimes: 200, preditivo: 980 },
  { name: 'Abr', crimes: 278, preditivo: 390 },
  { name: 'Mai', crimes: 189, preditivo: 480 },
  { name: 'Jun', crimes: 239, preditivo: 380 },
  { name: 'Jul', crimes: 349, preditivo: 430 },
];

const pieData = [
  { name: 'Furtos', value: 400 },
  { name: 'Vandalismo', value: 300 },
  { name: 'Acidentes', value: 300 },
  { name: 'Outros', value: 200 },
];

const violentCrimesData = [
  { name: 'Homicídios', value: 12, color: '#ef4444' },
  { name: 'Tentativas', value: 24, color: '#f59e0b' },
  { name: 'Latrocínios', value: 5, color: '#3b82f6' },
];

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

export default function MayorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="mayor-dashboard">
      <div className="mayor-header">
        <h1 className="mayor-title">
          <FileBarChart color="#3b82f6" size={32} />
          Painel Estratégico Executivo
        </h1>
        <button 
          onClick={() => navigate('/login')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
            <Shield color="#3b82f6" size={28} />
          </div>
          <div className="kpi-info">
            <h3>Índice de Criminalidade</h3>
            <p className="kpi-value">12.4%</p>
            <span className="kpi-trend negative"><TrendingDown size={14}/> -2.1% este mês</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
            <Activity color="#10b981" size={28} />
          </div>
          <div className="kpi-info">
            <h3>Economia (Policiamento Preditivo)</h3>
            <p className="kpi-value">R$ 1.2M</p>
            <span className="kpi-trend positive"><TrendingUp size={14}/> +15% em eficiência</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
            <Users color="#f59e0b" size={28} />
          </div>
          <div className="kpi-info">
            <h3>Engajamento Cidadão</h3>
            <p className="kpi-value">8,432</p>
            <span className="kpi-trend positive"><TrendingUp size={14}/> +420 novos usuários</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
            <Activity color="#ef4444" size={28} />
          </div>
          <div className="kpi-info">
            <h3>Crimes Fatais (Homicídios)</h3>
            <p className="kpi-value" style={{ color: '#ef4444' }}>12</p>
            <span className="kpi-trend negative"><TrendingDown size={14}/> -15% vs ano anterior</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
            <Activity color="#8b5cf6" size={28} />
          </div>
          <div className="kpi-info">
            <h3>Sentimento Público</h3>
            <p className="kpi-value">Positivo (78%)</p>
            <span className="kpi-trend positive"><TrendingUp size={14}/> +5% vs mês anterior</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Gráfico Principal */}
        <div className="chart-card">
          <h2 className="chart-title">Evolução de Ocorrências vs Prevenção IA</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCrimes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="crimes" stroke="#ef4444" fillOpacity={1} fill="url(#colorCrimes)" name="Ocorrências" />
                <Area type="monotone" dataKey="preditivo" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPred)" name="Ações Preventivas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Pizza */}
        <div className="chart-card">
          <h2 className="chart-title">Alocação de Verba de Segurança</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {pieData.map((entry, idx) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS[idx] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="chart-card">
          <h2 className="chart-title">Detalhamento de Crimes Violentos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            {violentCrimesData.map(item => (
              <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 700 }}>{item.value}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(item.value / 40) * 100}%`, height: '100%', background: item.color, boxShadow: `0 0 10px ${item.color}44` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Histórico de Coleta de Dados (Denúncias)</h2>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="crimes" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} name="WhatsApp" />
                <Line type="monotone" dataKey="preditivo" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} name="App Web" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
