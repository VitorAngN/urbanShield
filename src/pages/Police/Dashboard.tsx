import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, LogOut, Car, X, ShieldAlert, Activity } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, CircleF, PolylineF } from '@react-google-maps/api';
import './Dashboard.css';

const center = { lat: -23.1833, lng: -50.6500 }; // Cornélio Procópio, PR

const mockIncidents = [
  { 
    id: 1, 
    type: 'critical', 
    title: 'Roubo em Progresso', 
    desc: 'Assalto à mão armada em estabelecimento comercial. Unidades em deslocamento.', 
    time: '2m atrás', 
    lat: -23.1850, 
    lng: -50.6480, 
    confidence: 98,
    source: 'WhatsApp API',
    validatedBy: 'Vigilante Noturno (P-102)'
  },
  { 
    id: 2, 
    type: 'warning', 
    title: 'Anomalia Detectada', 
    desc: 'Movimentação suspeita em área restrita detectada por análise preditiva.', 
    time: '15m atrás', 
    lat: -23.1900, 
    lng: -50.6550, 
    confidence: 72,
    source: 'IA Engine',
    validatedBy: 'Pendente'
  },
  { 
    id: 3, 
    type: 'info', 
    title: 'Ação Preventiva Sugerida', 
    desc: 'Padrão histórico indica alta probabilidade de furtos nesta região.', 
    time: '30m atrás', 
    lat: -23.1780, 
    lng: -50.6420, 
    confidence: 89,
    source: 'Predictive Mod',
    validatedBy: 'Sistema'
  },
  { 
    id: 4, 
    type: 'warning', 
    title: 'Detecção de Sensor Acústico', 
    desc: 'Ruído compatível com disparo de arma de fogo detectado por sensor IoT.', 
    time: '1m atrás', 
    lat: -23.1810, 
    lng: -50.6510, 
    confidence: 94,
    source: 'IoT Sensor Mesh',
    validatedBy: 'Pendente'
  },
  { 
    id: 5, 
    type: 'critical', 
    title: 'Alarme Bancário Ativo', 
    desc: 'Alarme silencioso disparado em agência central.', 
    time: 'Justo agora', 
    lat: -23.1835, 
    lng: -50.6475, 
    confidence: 100,
    source: 'Sistema Bancário',
    validatedBy: 'CORE'
  },
];

const riskZones = [
  { center: { lat: -23.1850, lng: -50.6480 }, radius: 400, color: '#ef4444' },
  { center: { lat: -23.1900, lng: -50.6550 }, radius: 600, color: '#f59e0b' },
];

// Coordenadas reais das viaturas
const mockUnits = [
  { id: 'VTR-45', status: 'Em patrulha', region: 'Rua Anchieta', lat: -23.183614, lng: -50.643443, precision: 98 },
  { id: 'VTR-12', status: 'Em ocorrência', region: 'Avenida Alberto Carazzai', lat: -23.185405, lng: -50.648955, precision: 92 },
  { id: 'VTR-21', status: 'Em patrulha', region: 'Rua Piauí', lat: -23.186471, lng: -50.652194, precision: 95 },
  { id: 'VTR-09', status: 'Disponível', region: 'Avenida XV de Novembro', lat: -23.1810, lng: -50.6510, precision: 100 },
];

// Rotas de patrulha reais seguindo as ruas (via OSRM)
const patrolRoutes = [
  {
    id: 'VTR-45',
    color: '#3b82f6',
    path: [
      { lat: -23.179857, lng: -50.648514 },
      { lat: -23.179776, lng: -50.647539 },
      { lat: -23.179987, lng: -50.646596 },
      { lat: -23.181563, lng: -50.647044 },
      { lat: -23.181950, lng: -50.645380 },
      { lat: -23.183099, lng: -50.644927 },
      { lat: -23.183614, lng: -50.643443 }
    ]
  },
  {
    id: 'VTR-12',
    color: '#f59e0b',
    path: [
      { lat: -23.182484, lng: -50.644981 },
      { lat: -23.183748, lng: -50.644839 },
      { lat: -23.184991, lng: -50.644702 },
      { lat: -23.185052, lng: -50.645295 },
      { lat: -23.185190, lng: -50.646720 },
      { lat: -23.185364, lng: -50.648517 },
      { lat: -23.185405, lng: -50.648955 }
    ]
  },
  {
    id: 'VTR-21',
    color: '#10b981',
    path: [
      { lat: -23.184006, lng: -50.649572 },
      { lat: -23.185450, lng: -50.649439 },
      { lat: -23.185582, lng: -50.650882 },
      { lat: -23.185701, lng: -50.652276 },
      { lat: -23.186471, lng: -50.652194 }
    ]
  },
];

export default function PoliceDashboard() {
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeTab, setActiveTab] = useState<'incidents' | 'units' | 'partners'>('incidents');
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  const [citizenReports, setCitizenReports] = useState<any[]>([]);
  const [dbIncidents, setDbIncidents] = useState<any[]>([]);
  const [dbPartners, setDbPartners] = useState<any[]>([]);
  // AI Routing state
  const [routePath, setRoutePath] = useState<{lat:number,lng:number}[]>([]);
  const [dispatchedUnit, setDispatchedUnit] = useState<any>(null);
  const [routeEta, setRouteEta] = useState<string | null>(null);
  const [routeDist, setRouteDist] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [altRoutes, setAltRoutes] = useState<any[]>([]);
  // Animation state
  const [unitPosition, setUnitPosition] = useState<{lat:number,lng:number} | null>(null);
  const [animStep, setAnimStep] = useState(0);
  const [dispatchHistory, setDispatchHistory] = useState<any[]>([]);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lê dados do Banco de Dados real (json-server) e mescla com localStorage fallback
  useEffect(() => {
    const loadData = async () => {
      try {
        const [incRes, partRes] = await Promise.all([
          fetch('http://localhost:3001/incidents'),
          fetch('http://localhost:3001/partners')
        ]);
        const incidents = await incRes.json();
        const partners = await partRes.json();
        setDbIncidents(incidents);
        setDbPartners(partners);
      } catch (err) {
        console.warn("DB offline, usando fallback local", err);
      }
      
      const saved = localStorage.getItem('citizen_reports');
      if (saved) {
        setCitizenReports(JSON.parse(saved));
      }
    };
    loadData();
    const interval = setInterval(loadData, 3000); // Polling 3s
    
    window.addEventListener('storage', loadData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const onMapLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  const focusOnCoord = (lat: number, lng: number) => {
    if (map) { map.panTo({ lat, lng }); map.setZoom(17); }
  };

  // Haversine distance in km
  const calcDistance = (a: {lat:number,lng:number}, b: {lat:number,lng:number}) => {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const s = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
  };

  // AI DISPATCH: find nearest unit, call OSRM (free, no API key needed), draw route
  const dispatchAI = async (incident: any) => {
    if (!incident) return;
    setIsCalculating(true);
    setRoutePath([]);
    setAltRoutes([]);

    // Find nearest unit (Haversine)
    const nearest = mockUnits
      .map(u => ({ ...u, dist: calcDistance({lat: u.lat, lng: u.lng}, {lat: incident.lat, lng: incident.lng}) }))
      .sort((a, b) => a.dist - b.dist)[0];

    setDispatchedUnit(nearest);
    setSelectedUnit(nearest.id);

    try {
      // OSRM public routing API — free, no key, uses OpenStreetMap data
      const url = `https://router.project-osrm.org/route/v1/driving/${nearest.lng},${nearest.lat};${incident.lng},${incident.lat}?geometries=geojson&overview=full&alternatives=true`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        // Primary route
        const primary = data.routes[0];
        const coords = primary.geometry.coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng }));
        setRoutePath(coords);

        const mins = Math.ceil(primary.duration / 60);
        const km = (primary.distance / 1000).toFixed(1);
        setRouteEta(`${mins} min`);
        setRouteDist(`${km} km`);

        // Alternatives
        setAltRoutes(data.routes.slice(1).map((r: any, i: number) => ({
          label: `Alternativa ${i + 1}`,
          eta: `${Math.ceil(r.duration / 60)} min`,
          dist: `${(r.distance / 1000).toFixed(1)} km`,
        })));

        // Fit map bounds to route
        if (map && coords.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          coords.forEach((c: {lat:number,lng:number}) => bounds.extend(c));
          map.fitBounds(bounds, 80);
        }

        // Start animation
        startAnimation(coords, nearest, incident, mins);
      }
    } catch (err) {
      console.error('OSRM routing error:', err);
      // Fallback: straight line
      setRoutePath([
        { lat: nearest.lat, lng: nearest.lng },
        { lat: incident.lat, lng: incident.lng }
      ]);
      setRouteEta('~3 min');
      setRouteDist('~1.2 km');
    } finally {
      setIsCalculating(false);
    }
  };

  // Start animating unit along the route (1 step every 400ms)
  const startAnimation = (coords: {lat:number,lng:number}[], _unit: any, _incident: any, etaMin: number) => {
    if (animRef.current) clearInterval(animRef.current);
    let step = 0;
    setAnimStep(0);
    setUnitPosition(coords[0]);
    animRef.current = setInterval(() => {
      step++;
      if (step >= coords.length) {
        clearInterval(animRef.current!);
        setUnitPosition(coords[coords.length - 1]);
        return;
      }
      setAnimStep(step);
      setUnitPosition(coords[step]);
    }, Math.max(200, (etaMin * 60 * 1000) / coords.length)); // spread steps across ETA duration
  };

  // Confirm arrival: save to history DB, clear route
  const confirmArrival = async () => {
    if (!dispatchedUnit || !selectedIncident) return;
    const record = {
      unitId: dispatchedUnit.id,
      incident: selectedIncident.title || selectedIncident.desc,
      eta: routeEta,
      dist: routeDist,
      arrivedAt: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    };
    // Save to JSON-Server
    try {
      await fetch('http://localhost:3001/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (_) { /* offline */ }
    setDispatchHistory(prev => [record, ...prev]);
    // Notify citizen via localStorage
    const notif = { id: Date.now(), msg: `Viatura ${dispatchedUnit.id} chegou ao local. Ocorrência em atendimento.`, ts: new Date().toLocaleTimeString() };
    const prev = JSON.parse(localStorage.getItem('police_notifications') || '[]');
    localStorage.setItem('police_notifications', JSON.stringify([notif, ...prev]));
    // Clear dispatch
    if (animRef.current) clearInterval(animRef.current);
    setRoutePath([]);
    setDispatchedUnit(null);
    setUnitPosition(null);
    setRouteEta(null);
    setRouteDist(null);
    setSelectedIncident(null);
  };

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_MAPS_KEY || '',
    libraries: ['geometry'],
  });

  return (
    <div className="police-dashboard">
      {/* 3D Map Component */}
      <div className="map-background">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={16}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: true,
              styles: [
                { elementType: "geometry", stylers: [{ color: "#0b0f19" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f19" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#3b82f6" }] },
                { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
                { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1d4ed8" }, { opacity: 0.2 }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
                { featureType: "poi", stylers: [{ visibility: "off" }] }
              ]
            }}
          >
            {riskZones.map((zone, i) => (
              <CircleF 
                key={i} 
                center={zone.center} 
                radius={zone.radius} 
                options={{ 
                  fillColor: zone.color, 
                  fillOpacity: 0.05, // Muito mais sutil
                  strokeColor: zone.color, 
                  strokeOpacity: 0.2,
                  strokeWeight: 1 
                }} 
              />
            ))}

            {mockIncidents.map(inc => (
              <MarkerF
                key={inc.id}
                position={{ lat: inc.lat, lng: inc.lng }}
                onClick={() => {
                  setSelectedIncident(inc);
                  focusOnCoord(inc.lat, inc.lng);
                }}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                  fillColor: inc.type === 'critical' ? '#ef4444' : '#f59e0b',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                  scale: 12
                }}
              />
            ))}

            {mockUnits.map(unit => (
              <MarkerF
                key={unit.id}
                position={{ lat: unit.lat, lng: unit.lng }}
                onClick={() => {
                  setSelectedUnit(unit.id);
                  focusOnCoord(unit.lat, unit.lng);
                }}
                icon={{
                  // Custom shield-arrow SVG — reliable across all zoom levels
                  path: 'M 0,-1 L 0.6,0.6 L 0,0.2 L -0.6,0.6 Z',
                  fillColor: selectedUnit === unit.id ? '#10b981' : '#3b82f6',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 0.5,
                  scale: 18,
                  rotation: 0,
                  anchor: new window.google.maps.Point(0, 0),
                }}
                label={{
                  text: unit.id,
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '700',
                  className: 'map-marker-label'
                }}
              />
            ))}

            {/* Rotas de Patrulha — só aparece quando uma unidade está selecionada */}
            {selectedUnit && patrolRoutes
              .filter(route => route.id === selectedUnit)
              .map(route => (
              <PolylineF
                key={route.id}
                path={route.path}
                options={{
                  strokeColor: route.color,
                  strokeOpacity: 0.9,
                  strokeWeight: 5,
                  icons: [{
                    icon: {
                      path: window.google?.maps?.SymbolPath?.FORWARD_OPEN_ARROW || 0,
                      scale: 3,
                      strokeColor: route.color
                    },
                    offset: '80%'
                  }]
                }}
              />
            ))}

            {/* Markers do DB (Parceiros) */}
            {dbPartners.map(partner => (
              <MarkerF
                key={partner.id}
                position={{ lat: partner.lat, lng: partner.lng }}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                  fillColor: '#8b5cf6',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                  scale: 8
                }}
                label={{
                  text: '📹',
                  fontSize: '12px',
                  className: 'map-marker-label'
                }}
                onClick={() => alert(`Parceiro Validador: ${partner.name}\nStatus: ${partner.status}`)}
              />
            ))}

            {/* Markers de Denúncias Cidadãs (fonte: DB + localStorage) */}
            {[...dbIncidents, ...citizenReports].map((report, i) => (
              <MarkerF
                key={`cr-${i}`}
                position={{ lat: report.lat, lng: report.lng }}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                  fillColor: '#10b981',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                  scale: 10
                }}
                onClick={() => setSelectedIncident({
                  id: 99 + i,
                  type: 'warning',
                  title: `Denúncia Cidadã #${String(i + 1).padStart(3, '0')}`,
                  desc: report.desc || 'Ocorrência reportada anonimamente pelo aplicativo cidadão.',
                  time: report.time || 'Agora',
                  lat: report.lat,
                  lng: report.lng,
                  confidence: 75,
                  source: 'App Cidadão',
                  validatedBy: report.anonymous ? 'Anônimo' : 'Cidadão Verificado'
                })}
              />
            ))}

            {/* AI Route via OSRM */}
            {routePath.length > 1 && (
              <PolylineF
                path={routePath}
                options={{
                  strokeColor: '#10b981',
                  strokeWeight: 6,
                  strokeOpacity: 0.95,
                  icons: [{
                    icon: { path: window.google?.maps?.SymbolPath?.FORWARD_CLOSED_ARROW || 0, scale: 4 },
                    offset: '50%',
                    repeat: '120px'
                  }]
                }}
              />
            )}

            {/* Animated dispatch unit marker */}
            {unitPosition && (
              <MarkerF
                position={unitPosition}
                zIndex={1000}
                icon={{
                  path: 'M 0,-1 L 0.6,0.6 L 0,0.2 L -0.6,0.6 Z',
                  fillColor: '#10b981',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 0.5,
                  scale: 22,
                  rotation: 0,
                  anchor: new window.google.maps.Point(0, 0),
                }}
                label={{ text: dispatchedUnit?.id || '', color: '#fff', fontSize: '9px', fontWeight: '800' }}
              />
            )}

            {selectedIncident && (
              <InfoWindowF 
                position={{ lat: selectedIncident.lat, lng: selectedIncident.lng }}
                onCloseClick={() => { setSelectedIncident(null); setRoutePath([]); setDispatchedUnit(null); }}
              >
                <div className="map-hud-popup">
                  <h3 style={{ color: selectedIncident.type === 'critical' ? '#ef4444' : '#f59e0b', margin: '0 0 8px 0' }}>{selectedIncident.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 12px 0' }}>{selectedIncident.desc}</p>
                  <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>Confiança:</span>
                    <span style={{ fontWeight: 700 }}>{selectedIncident.confidence}%</span>
                  </div>
                  <button className="hud-btn" onClick={() => dispatchAI(selectedIncident)}>⚡ DESPACHO IA</button>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity className="animate-spin" size={48} color="#3b82f6" />
          </div>
        )}
      </div>

      {/* Cleaner Top Bar */}
      <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 100 }}>
        <div className="pill" style={{ background: 'rgba(13, 17, 23, 0.9)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <div className="dot" />
          <span style={{ fontFamily: 'Orbitron', fontSize: '10px' }}>HQ LIVE: {systemTime}</span>
        </div>
        <div className="pill" style={{ background: 'rgba(13, 17, 23, 0.9)' }}>
          <Activity size={12} color="#3b82f6" />
          <span style={{ fontSize: '10px' }}>IA ENGINE: NOMINAL</span>
        </div>
      </div>

      <div className="icon-btn-container">
        <button className="tech-btn"><Bell size={20} /></button>
        <button className="tech-btn"><Settings size={20} /></button>
        <button className="tech-btn" onClick={() => navigate('/login')}><LogOut size={20} /></button>
      </div>

      {/* Left Sidebar: Command Center */}
      <motion.div 
        initial={{ x: -400 }} 
        animate={{ x: 0 }} 
        className="floating-panel left-sidebar"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <ShieldAlert color="#3b82f6" size={24} />
          <h1 className="brand-title" style={{ fontSize: '16px' }}>COMMAND_CORE</h1>
        </div>

        {/* Tab System */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
          {(['incidents', 'units', 'partners'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                background: activeTab === tab ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: activeTab === tab ? '#fff' : '#64748b',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'incidents' ? 'Eventos' : tab === 'units' ? 'Frotas' : 'Rede'}
            </button>
          ))}
        </div>

        <div className="scroll-area">
          <AnimatePresence mode="wait">
            {activeTab === 'incidents' && (
              <motion.div key="incidents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {[...dbIncidents, ...mockIncidents, ...citizenReports].map((inc, i) => (
                  <div key={inc.id || `inc-${i}`} className={`incident-card ${selectedIncident?.id === inc.id ? 'active' : ''}`} onClick={() => setSelectedIncident(inc)} style={{ padding: '16px' }}>
                    <div className="card-header">
                      <span className={`priority-tag ${inc.type}`}>{inc.type}</span>
                      <span className="card-meta">{inc.time}</span>
                    </div>
                    <h3 className="card-title" style={{ fontSize: '13px' }}>{inc.title || inc.desc}</h3>
                    <div className="card-meta">
                      <span>{inc.source}</span>
                      <span style={{ color: '#10b981' }}>{inc.confidence}%</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'units' && (
              <motion.div key="units" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {mockUnits.map(unit => (
                  <div 
                    key={unit.id} 
                    className={`incident-card ${selectedUnit === unit.id ? 'active' : ''}`}
                    style={{ padding: '14px', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedUnit(unit.id);
                      focusOnCoord(unit.lat, unit.lng);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Car size={16} color="#3b82f6" />
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{unit.id}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: '#10b981', display: 'block' }}>{unit.status}</span>
                        <span style={{ fontSize: '9px', color: '#3b82f6', fontWeight: 700 }}>PRECISÃO: {unit.precision}%</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{unit.region}</div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'partners' && (
              <motion.div key="partners" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', marginBottom: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Rede de Vigilância Ativa</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, margin: '4px 0' }}>{dbPartners.length} Agentes On-line (DB)</p>
                </div>
                {dbPartners.length > 0 ? dbPartners.map(partner => (
                  <div key={partner.id} className="incident-card" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>{partner.name}</p>
                      <span style={{ fontSize: '10px', color: '#10b981', padding: '2px 6px', background: 'rgba(16,185,129,0.1)', borderRadius: '4px' }}>{partner.status}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>ID: {partner.id} | Tipo: {partner.type}</p>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <div style={{ marginBottom: '12px' }}>📡</div>
                    Nenhum parceiro validado na rede ativa no momento.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Sidebar: Incident Intelligence */}
      <AnimatePresence>
        {selectedIncident && (
          <motion.div 
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="floating-panel right-sidebar"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>INTELIGÊNCIA</h2>
              <button className="tech-btn" style={{ width: 32, height: 32 }} onClick={() => { setSelectedIncident(null); setRoutePath([]); setDispatchedUnit(null); setRouteEta(null); setRouteDist(null); }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }} className="scroll-area">
              <div style={{ marginBottom: '24px' }}>
                <span className="section-label">Inteligência Preditiva</span>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Activity size={16} color="#3b82f6" />
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>RISCO DE ESCALADA: ALTO</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Padrão detectado: Similar a ocorrência #882 em 2023. Sugerido cerco em raio de 2km.</p>
                </div>
              </div>

              {selectedIncident.source === 'WhatsApp API' && (
                <div style={{ marginBottom: '24px' }}>
                  <span className="section-label">Evidência WhatsApp</span>
                  <div style={{ background: '#075e54', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ background: '#dcf8c6', color: '#000', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '8px', maxWidth: '80%' }}>
                      "Acabei de ver dois homens armados entrando na loja de conveniência!"
                    </div>
                    <div style={{ background: '#fff', color: '#000', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', alignSelf: 'flex-end', marginLeft: '20%', maxWidth: '80%' }}>
                      "Entendido. Unidade VTR-45 a caminho. Mantenha-se seguro."
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <span className="section-label">Validação em Campo</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                  <ShieldAlert size={20} color="#10b981" />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>{selectedIncident.validatedBy}</p>
                    <span style={{ fontSize: '11px', color: '#10b981' }}>Confirmação Visual via Parceiro</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="section-label">Protocolo de Resposta</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="hud-btn" style={{ background: '#ef4444', margin: 0 }}>DESPACHO PRIORITÁRIO</button>
                  <button className="hud-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', margin: 0 }}>NOTIFICAR UNIDADES ÁREA</button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
              {isCalculating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.3)' }}>
                  <Activity size={16} color="#3b82f6" className="animate-spin" />
                  <span style={{ fontSize: '12px', color: '#3b82f6' }}>IA calculando rota ótima...</span>
                </div>
              )}
              {dispatchedUnit && routeEta && !isCalculating && (
                <>
                  <span className="section-label">Despacho IA Ativado</span>
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Car size={16} color="#10b981" />
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#10b981' }}>{dispatchedUnit.id}</span>
                      </div>
                      <span style={{ fontSize: '10px', background: '#10b981', color: '#000', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>ÓTIMO</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>ETA</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>{routeEta}</p>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>Distância</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>{routeDist}</p>
                      </div>
                    </div>
                  </div>
                  {altRoutes.length > 0 && (
                    <>
                      <span className="section-label">Rotas Alternativas</span>
                      {altRoutes.map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '6px', fontSize: '12px' }}>
                          <span style={{ color: '#94a3b8' }}>{r.label}</span>
                          <span style={{ color: '#f59e0b' }}>{r.eta} · {r.dist}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {/* Progress bar */}
                  {routePath.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                        <span>Progresso</span>
                        <span>{Math.round((animStep / Math.max(routePath.length - 1, 1)) * 100)}%</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#10b981', borderRadius: 4, transition: 'width 0.3s', width: `${Math.round((animStep / Math.max(routePath.length - 1, 1)) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                  <button
                    className="hud-btn"
                    style={{ background: '#10b981', margin: '0 0 8px 0', width: '100%', fontWeight: 800 }}
                    onClick={confirmArrival}
                  >✅ CONFIRMAR CHEGADA</button>
                  <button className="hud-btn" style={{ background: '#ef4444', margin: '0', width: '100%' }}
                    onClick={() => { if (animRef.current) clearInterval(animRef.current); setRoutePath([]); setDispatchedUnit(null); setUnitPosition(null); setRouteEta(null); setRouteDist(null); }}
                  >CANCELAR DESPACHO</button>
                </>
              )}
              <button className="hud-btn" style={{ width: '100%', margin: 0 }}
                onClick={() => dispatchAI(selectedIncident)}
              >⚡ ACIONAR DESPACHO IA</button>

              {dispatchHistory.length > 0 && (
                <>
                  <span className="section-label" style={{ marginTop: '16px', display: 'block' }}>Histórico de Despachos</span>
                  {dispatchHistory.slice(0, 3).map((d, i) => (
                    <div key={i} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '6px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>{d.unitId}</span>
                        <span style={{ color: '#64748b' }}>{d.arrivedAt}</span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.incident}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Live Intelligence Ticker */}
      <div style={{ position: 'absolute', bottom: '24px', left: '428px', right: '408px', height: '40px', background: 'rgba(13, 17, 23, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 30, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap', animation: 'ticker 30s linear infinite', color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>
          <span style={{ color: '#ef4444' }}>[CRITICAL]</span> VTR-45 em deslocamento para Setor 04 • 
          <span style={{ color: '#3b82f6' }}>[INFO]</span> Nova denúncia via WhatsApp recebida (ID #928) • 
          <span style={{ color: '#10b981' }}>[UPDATE]</span> Câmera 09 (Praça Central) operando via IA • 
          <span style={{ color: '#f59e0b' }}>[WARNING]</span> Aumento de fluxo detectado na Av. Paraná • 
          <span style={{ color: '#ef4444' }}>[CRITICAL]</span> Disparo de alarme detectado em Agência Bancária #02
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
