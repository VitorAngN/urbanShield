import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, LogOut, Navigation, MapPin, X, Camera, Send, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Coordenadas reais de pontos em Cornélio Procópio para simular localização GPS
const CP_LOCATIONS = [
  { lat: -23.1811, lng: -50.6467, label: 'Av. São Paulo (Centro)' },
  { lat: -23.1825, lng: -50.6452, label: 'R. Paraná x R. Mato Grosso' },
  { lat: -23.1798, lng: -50.6480, label: 'Praça Brasil' },
  { lat: -23.1840, lng: -50.6495, label: 'Av. Marechal Deodoro' },
  { lat: -23.1855, lng: -50.6433, label: 'R. XV de Fevereiro' },
];

async function saveReport(desc: string, type: string, anonymous: boolean) {
  const loc = CP_LOCATIONS[Math.floor(Math.random() * CP_LOCATIONS.length)];
  const jitter = () => (Math.random() - 0.5) * 0.002;
  const report = {
    title: type,
    desc,
    type: 'warning', // default warning for citizen reports
    time: new Date().toLocaleTimeString(),
    lat: loc.lat + jitter(),
    lng: loc.lng + jitter(),
    confidence: anonymous ? 65 : 85,
    source: 'App Cidadão',
    validatedBy: anonymous ? 'Anônimo' : 'Cidadão Verificado',
    id: Date.now()
  };
  
  try {
    await fetch('http://localhost:3001/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
  } catch (err) {
    console.error("Falha ao conectar com o banco de dados", err);
    // Fallback to localStorage just in case server is off
    const existing = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
    existing.push(report);
    localStorage.setItem('citizen_reports', JSON.stringify(existing));
  }
}

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const [isReporting, setIsReporting] = useState(false);
  const [reportType, setReportType] = useState('Atividade Suspeita');
  const [reportDesc, setReportDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [policeNotifs, setPoliceNotifs] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(console.error);

    // Poll for police notifications
    const loadNotifs = () => {
      const saved = localStorage.getItem('police_notifications');
      if (saved) setPoliceNotifs(JSON.parse(saved));
    };
    loadNotifs();
    const interval = setInterval(loadNotifs, 3000);
    window.addEventListener('storage', loadNotifs);
    return () => { clearInterval(interval); window.removeEventListener('storage', loadNotifs); };
  }, []);

  return (
    <div style={{ backgroundColor: '#05070a', minHeight: '100vh', color: '#fff', padding: '32px', fontFamily: 'Inter, sans-serif' }}>

      {/* Police Notification Toast */}
      {policeNotifs.length > 0 && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {policeNotifs.slice(0, 3).map((n, i) => (
            <motion.div key={n.id} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '14px 20px', maxWidth: 340, display: 'flex', gap: 12, alignItems: 'flex-start' }}
            >
              <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', marginTop: 5, flexShrink: 0, boxShadow: '0 0 8px #10b981' }} />
              <div>
                <p style={{ margin: 0, fontSize: 13, color: '#10b981', fontWeight: 700 }}>NOTIFICACAO POLICIAL</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#e2e8f0', lineHeight: 1.4 }}>{n.msg}</p>
                <p style={{ margin: '4px 0 0', fontSize: 10, color: '#64748b' }}>{n.ts}</p>
              </div>
              <button onClick={() => setPoliceNotifs(prev => prev.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }}>x</button>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', maxWidth: '1100px', margin: '0 auto 48px auto' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontFamily: 'Orbitron', fontSize: '20px' }}>
          <Navigation color="#3b82f6" size={24} />
          SEGURANÇA_CIDADÃ
        </h1>
        <button 
          onClick={() => navigate('/login')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', cursor: 'pointer' }}
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
        
        {/* Report Block */}
        <motion.div 
          whileHover={{ y: -5 }}
          style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '24px', padding: '40px', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.03 }}>
            <FilePlus size={200} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '16px' }}>
              <FilePlus color="#3b82f6" size={32} />
            </div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Nova Denúncia</h2>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
            Envie informações sobre crimes ou emergências. Suporte a envio anônimo e geolocalização automática.
          </p>
          <button 
            onClick={() => setIsReporting(true)}
            style={{ width: '100%', padding: '18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)' }}
          >
            <MapPin size={20} />
            REPORTAR AGORA
          </button>
        </motion.div>

        {/* Alerts Block (Dynamic from DB) */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '16px' }}>
              <BellRing color="#f59e0b" size={32} />
            </div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Alertas Locais</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {alerts.length > 0 ? (
              alerts.map(a => (
                <div key={a.id} style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '16px', borderLeft: '4px solid #f59e0b' }}>
                  <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '8px' }}>Risco: {a.zone} ({a.level})</strong>
                  <span style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>{a.message}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
                <strong style={{ color: '#10b981', display: 'block', marginBottom: '8px' }}>Zona Segura</strong>
                <span style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>Nenhuma atividade suspeita detectada recentemente na sua região.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Reporting Modal */}
      <AnimatePresence>
        {isReporting && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px' }}>Detalhes do Relato</h3>
                <button onClick={() => setIsReporting(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X /></button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de Ocorrência</label>
                <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}>
                  <option style={{ color: '#000' }}>Atividade Suspeita</option>
                  <option style={{ color: '#000' }}>Roubo/Furto</option>
                  <option style={{ color: '#000' }}>Vandalismo</option>
                  <option style={{ color: '#000' }}>Emergência Médica</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Descrição</label>
                <textarea 
                  rows={4}
                  value={reportDesc}
                  onChange={e => setReportDesc(e.target.value)}
                  placeholder="Descreva o que está acontecendo..."
                  style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <input
                  id="media-input"
                  type="file"
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  onChange={e => setMediaFile(e.target.files?.[0] || null)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label htmlFor="media-input"
                    style={{ padding: '14px', background: mediaFile ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)', border: `1px dashed ${mediaFile ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`, borderRadius: '12px', color: mediaFile ? '#3b82f6' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Camera size={18} />
                    {mediaFile ? mediaFile.name.slice(0, 14) + '...' : 'Foto / Video'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#10b981' }}>
                    <Navigation size={14} /> GPS: Cornelio Procopio
                  </div>
                </div>
              </div>

              {/* Toggle Anônimo */}
              <div 
                onClick={() => setIsAnonymous(!isAnonymous)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', marginBottom: '20px', background: isAnonymous ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isAnonymous ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer' }}
              >
                <div style={{ width: 18, height: 18, borderRadius: 4, background: isAnonymous ? '#10b981' : 'transparent', border: '2px solid #10b981', transition: 'all 0.2s' }} />
                <span style={{ fontSize: '13px', color: isAnonymous ? '#10b981' : '#94a3b8' }}>Enviar como Anônimo</span>
              </div>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                  <p style={{ fontWeight: 700, color: '#10b981' }}>Denúncia enviada ao CORE OPS!</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Aparecerá no mapa da polícia em segundos.</p>
                </div>
              ) : (
                <button 
                  onClick={async () => {
                    if (!reportDesc.trim()) return;
                    await saveReport(reportDesc, reportType, isAnonymous);
                    setSubmitted(true);
                    setTimeout(() => { setIsReporting(false); setSubmitted(false); setReportDesc(''); }, 2500);
                  }}
                  style={{ width: '100%', padding: '18px', background: reportDesc.trim() ? '#10b981' : '#334155', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: reportDesc.trim() ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', transition: 'all 0.2s' }}
                >
                  <Send size={18} /> ENVIAR DENÚNCIA
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
