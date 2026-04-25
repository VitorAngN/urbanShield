import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { ShieldAlert, Activity, Users } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

const center = {
  lat: -23.55052,
  lng: -46.633309
};

export default function ManagerDashboard() {
  const navigate = useNavigate();
  
  // Note: Para uso real, a chave da API deve vir de uma variável de ambiente (ex: import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_API_KEY_HERE" // Substitua pela chave real
  });

  return (
    <div className="page-container" style={{ maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Centro de Comando (Gestão)</h1>
        <button 
          onClick={() => navigate('/login')}
          style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
        >
          Sair
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ShieldAlert color="#ef4444" size={32} />
          <div>
            <h3 style={{ margin: 0, color: '#aaa' }}>Ocorrências (24h)</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>142</p>
          </div>
        </div>
        
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Users color="#10b981" size={32} />
          <div>
            <h3 style={{ margin: 0, color: '#aaa' }}>Parceiros Ativos</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>38</p>
          </div>
        </div>

        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Activity color="#0d6efd" size={32} />
          <div>
            <h3 style={{ margin: 0, color: '#aaa' }}>Score Médio Confiança</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>87%</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div className="card" style={{ flex: 2 }}>
          <h2>Mapa de Risco em Tempo Real</h2>
          <p style={{ color: '#aaa', marginBottom: '16px' }}>Visão geral de calor e incidentes na região.</p>
          
          <div style={{ background: '#333', borderRadius: '8px', overflow: 'hidden' }}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                options={{
                  styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                  ]
                }}
              >
                {/* Aqui entrarão os markers e heatmaps no futuro */}
              </GoogleMap>
            ) : (
              <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Carregando Google Maps...
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h2>Policiamento Preditivo</h2>
          <p style={{ color: '#aaa', marginBottom: '16px' }}>Sugestões baseadas em IA</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
              <strong style={{ color: '#fca5a5' }}>Alta Probabilidade de Furto</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Deslocar viatura para Av. Paulista nas próximas 2h.</p>
            </div>
            <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px' }}>
              <strong style={{ color: '#fcd34d' }}>Aglomeração Anômala</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Monitoramento via parceiro ativado no Parque Ibirapuera.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
