import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Activity, LogOut, Target, Shield } from 'lucide-react';
import './Dashboard.css';

const models = [
  { id: 'PRED-01', name: 'Módulo Preditivo', desc: 'Forecasting de ocorrências por zona e horário', status: 'online', accuracy: 91.2, load: 72 },
  { id: 'CLASS-02', name: 'Classificador NLP', desc: 'Classifica denúncias em texto livre automaticamente', status: 'online', accuracy: 97.8, load: 45 },
  { id: 'ANOM-03', name: 'Detector de Anomalias', desc: 'Análise em tempo real de padrões anômalos', status: 'online', accuracy: 88.5, load: 90 },
  { id: 'RISK-04', name: 'Motor de Risco', desc: 'Score de periculosidade por região e hora', status: 'training', accuracy: 84.1, load: 20 },
];

const threatZones = [
  { zone: 'Centro (Av. São Paulo)', score: 78, trend: 'up' },
  { zone: 'Praça Brasil', score: 42, trend: 'down' },
  { zone: 'R. XV de Fevereiro', score: 61, trend: 'up' },
  { zone: 'Zona Sul (Jd. Primavera)', score: 29, trend: 'down' },
];

const dispatchScenarios = [
  { 
    incident: 'Roubo em Andamento (R. Paraná)', 
    recommended: 'VTR-12', 
    eta: '1m 45s', 
    confidence: 94,
    alternatives: [
      { unit: 'VTR-45', eta: '3m 10s' },
      { unit: 'VTR-21', eta: '4m 50s' }
    ]
  },
  { 
    incident: 'Anomalia Acústica (Av. Minas Gerais)', 
    recommended: 'VTR-45', 
    eta: '2m 15s', 
    confidence: 88,
    alternatives: [
      { unit: 'VTR-12', eta: '3m 30s' }
    ]
  }
];

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ height: '100%', background: color, boxShadow: `0 0 8px ${color}88` }}
      />
    </div>
  );
}

export default function AIDashboard() {
  const navigate = useNavigate();
  const [pulse, setPulse] = useState(false);
  const [activeModel, setActiveModel] = useState(models[0]);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ai-dashboard">

      {/* Ambient Glow */}
      <div className="ai-glow-top" />
      <div className="ai-glow-bottom" />

      {/* Header */}
      <header className="ai-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <motion.div animate={{ rotate: pulse ? 10 : -10 }} transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}>
            <Brain color="#8b5cf6" size={32} />
          </motion.div>
          <div>
            <h1 className="ai-title">ENGINE COGNITIVO</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontFamily: 'Orbitron', letterSpacing: 2 }}>SISTEMA IA · CORNÉLIO PROCÓPIO PD</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="ai-status-chip">
            <motion.div animate={{ opacity: pulse ? 1 : 0.3 }} className="ai-dot" />
            4 Modelos Ativos
          </div>
          <button onClick={() => navigate('/login')} className="ai-logout-btn">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="ai-kpi-row">
        {[
          { icon: <Target size={22} color="#8b5cf6" />, label: 'Precisão Média', value: '91.8%', color: '#8b5cf6' },
          { icon: <Zap size={22} color="#3b82f6" />, label: 'Inferências / min', value: '1.204', color: '#3b82f6' },
          { icon: <Activity size={22} color="#10b981" />, label: 'Uptime do Motor', value: '99.4%', color: '#10b981' },
          { icon: <Shield size={22} color="#f59e0b" />, label: 'Alertas Gerados Hoje', value: '38', color: '#f59e0b' },
        ].map(k => (
          <div key={k.label} className="ai-kpi-card">
            <div className="ai-kpi-icon" style={{ background: `${k.color}22` }}>{k.icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{k.label}</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, fontFamily: 'Orbitron', color: k.color }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="ai-main-grid">

        {/* Left: Model Cards */}
        <div>
          <p className="ai-section-label">Modelos em Produção</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {models.map(m => (
              <motion.div
                key={m.id}
                whileHover={{ x: 4 }}
                onClick={() => setActiveModel(m)}
                className={`ai-model-card ${activeModel.id === m.id ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '14px' }}>{m.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{m.desc}</p>
                  </div>
                  <span className={`ai-badge ${m.status}`}>{m.status}</span>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', minWidth: 90 }}>Acc: {m.accuracy}%</span>
                  <ScoreBar value={m.accuracy} color="#8b5cf6" />
                </div>
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', minWidth: 90 }}>CPU Load: {m.load}%</span>
                  <ScoreBar value={m.load} color={m.load > 80 ? '#ef4444' : '#3b82f6'} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Center: Selected Model Detail */}
        <div>
          <p className="ai-section-label">Análise: {activeModel.name}</p>
          <AnimatePresence mode="wait">
            <motion.div key={activeModel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ai-detail-card">
              
              {/* Animated "neural" visualization */}
              <div className="ai-neural-viz">
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="ai-node"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
                <div className="ai-network-lines" />
              </div>

              <div style={{ marginTop: '24px' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6 }}>{activeModel.desc}</p>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Acurácia', val: `${activeModel.accuracy}%`, color: '#8b5cf6' },
                    { label: 'Status', val: activeModel.status === 'online' ? '● Produção' : '⟳ Retreinando', color: activeModel.status === 'online' ? '#10b981' : '#f59e0b' },
                    { label: 'Versão', val: 'v3.2.1', color: '#64748b' },
                    { label: 'Última atualização', val: 'Hoje, 15:00', color: '#64748b' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '13px' }}>
                      <span style={{ color: '#64748b' }}>{row.label}</span>
                      <span style={{ color: row.color, fontWeight: 600 }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Dispatch Optimizer + Threat Heatmap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <p className="ai-section-label">Otimização de Despacho (Live)</p>
            <div className="ai-detail-card" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
              {dispatchScenarios.map((sc, i) => (
                <div key={i} style={{ marginBottom: i === 0 ? '20px' : 0, paddingBottom: i === 0 ? '20px' : 0, borderBottom: i === 0 ? '1px dashed rgba(255,255,255,0.1)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{sc.incident}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '12px', marginBottom: '8px' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>IA RECOMENDA</p>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#10b981' }}>{sc.recommended}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>ETA OTIMIZADO</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>{sc.eta}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {sc.alternatives.map(alt => (
                      <div key={alt.unit} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{alt.unit}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#ef4444' }}>{alt.eta}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="ai-section-label">Previsão de Risco de Patrulha</p>
            <div className="ai-detail-card" style={{ padding: '20px' }}>
              {threatZones.map(z => (
                <div key={z.zone} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#e2e8f0' }}>{z.zone}</span>
                    <span style={{ color: z.score > 65 ? '#ef4444' : z.score > 40 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                      {z.trend === 'up' ? '▲' : '▼'} {z.score}
                    </span>
                  </div>
                  <ScoreBar value={z.score} color={z.score > 65 ? '#ef4444' : z.score > 40 ? '#f59e0b' : '#10b981'} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
