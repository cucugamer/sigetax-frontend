import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token = localStorage.getItem('token');
  
  const [viaje, setViaje] = useState(null);
  const [estadoViaje, setEstadoViaje] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [alertaEnviada, setAlertaEnviada] = useState(false);
  const [taxisCercanos, setTaxisCercanos] = useState([]);

  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [calificado, setCalificado] = useState(false);

  useEffect(() => {
    if (!usuario || usuario.rol !== 'pasajero') {
      navigate('/');
      return;
    }

    const buscarTaxis = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/v1/taxistas/cercanos?lat=19.2433&lng=-103.7250&radio=5', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTaxisCercanos(res.data.data);
      } catch (error) { console.error(error); }
    };
    buscarTaxis();
  }, [usuario, navigate, token]);

  useEffect(() => {
    let interval;
    if (viaje && !calificado) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:3000/api/v1/viajes/${viaje.id_viaje}/estado`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.data) {
            setEstadoViaje(res.data.data);
          }
        } catch (error) { console.error(error); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [viaje, calificado, token]);

  const handleSolicitarViaje = async () => {
    setCargando(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/viajes/solicitar', {
        origen: { lat: 19.2433, lng: -103.7250 },
        destino: { lat: 19.2644, lng: -103.7372 }
      }, { headers: { Authorization: `Bearer ${token}` } });
      setViaje(response.data.data);
    } catch (error) {
      alert(error.response?.data?.error?.mensaje || 'Error al pedir viaje');
    } finally { setCargando(false); }
  };

  const handlePanico = async () => {
    if (!viaje) return;
    try {
      await axios.post('http://localhost:3000/api/v1/seguridad/panico', {
        id_viaje: viaje.id_viaje, lat: 19.2433, lng: -103.7250
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAlertaEnviada(true);
      alert('🚨 ¡ALERTA DE PÁNICO ENVIADA! 🚨');
    } catch (error) { alert('Error al enviar la alerta.'); }
  };

  const handleCalificar = async () => {
    if (estrellas === 0) return alert('Por favor, selecciona una calificación.');
    try {
      await axios.post('http://localhost:3000/api/v1/evaluaciones', {
        id_viaje: viaje.id_viaje,
        calificacion: estrellas,
        comentario: comentario
      }, { headers: { Authorization: `Bearer ${token}` } });
      setCalificado(true);
      alert('¡Gracias por tu evaluación!');
    } catch (error) {
      alert(error.response?.data?.error?.mensaje || 'Error al calificar');
    }
  };

  const cerrarSesion = () => { localStorage.clear(); navigate('/'); };

  if (!usuario || usuario.rol !== 'pasajero') return null;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#007BFF', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between' }}>
        <h3>🚕 SIGETAX - {usuario?.nombre_completo}</h3>
        <button onClick={cerrarSesion} style={{ padding: '5px 10px', cursor: 'pointer' }}>Salir</button>
      </div>

      <div style={{ height: '50vh', width: '100%' }}>
        <MapContainer center={[19.2433, -103.7250]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[19.2433, -103.7250]}><Popup>Tú</Popup></Marker>
          {taxisCercanos.map((taxi) => (
            <Marker key={taxi.id_taxista} position={[Number(taxi.latitud), Number(taxi.longitud)]}>
              <Popup>🚕 {taxi.nombre_completo} - {taxi.numero_placa}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{ padding: '20px', textAlign: 'center' }}>
        
        {/* 1. ESTADO INICIAL: No hay viaje */}
        {!viaje && (
          <button onClick={handleSolicitarViaje} disabled={cargando}
            style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%', maxWidth: '300px' }}>
            {cargando ? 'Procesando...' : 'Pedir Taxi a Villa de Álvarez'}
          </button>
        )}

        {/* 2. ESTADO INTERMEDIO: Viaje solicitado, esperando taxista */}
        {viaje && (!estadoViaje || estadoViaje.estado_viaje === 'solicitado') && (
          <div style={{ border: '2px solid #ffc107', padding: '20px', borderRadius: '10px', maxWidth: '400px', margin: '0 auto', backgroundColor: '#fff9e6', color: '#333' }}>
            <h3 style={{ color: '#d39e00', marginTop: 0 }}>⏳ Buscando conductor...</h3>
            <p>Tu solicitud ha sido enviada. Esperando a que un taxista la acepte.</p>
            <div className="spinner" style={{ fontSize: '24px' }}>🔄</div>
          </div>
        )}

        {/* 3. ESTADO ACEPTADO: Ficha Digital y Calificación */}
        {estadoViaje && estadoViaje.estado_viaje === 'aceptado' && !calificado && (
          <div style={{ border: '2px solid #28a745', padding: '15px', borderRadius: '10px', maxWidth: '400px', margin: '0 auto', backgroundColor: '#f8fff9', color: '#333' }}>
            <h3 style={{ color: '#28a745', marginTop: 0 }}>🚕 Tu conductor va en camino</h3>
            <p><strong>Conductor:</strong> {estadoViaje.nombre_taxista}</p>
            <p><strong>Placa:</strong> {estadoViaje.numero_placa}</p>
            <p><strong>Vehículo:</strong> {estadoViaje.modelo_vehiculo} ({estadoViaje.color})</p>
            <p><strong>Calificación:</strong> ⭐ {estadoViaje.calificacion_promedio} / 5.00</p>
            
            <hr style={{ margin: '15px 0' }} />
            <h4>Simular fin del viaje y calificar:</h4>
            <div style={{ fontSize: '24px', cursor: 'pointer', margin: '10px 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} onClick={() => setEstrellas(star)}>
                  {star <= estrellas ? '⭐' : '☆'}
                </span>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="Añadir un comentario (opcional)" 
              value={comentario} onChange={(e) => setComentario(e.target.value)}
              style={{ padding: '8px', width: '90%', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            />
            <button onClick={handleCalificar} style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>
              Enviar Calificación
            </button>
          </div>
        )}

        {/* 4. ESTADO FINAL: Calificado */}
        {calificado && (
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', maxWidth: '400px', margin: '0 auto', backgroundColor: '#e9ecef', color: '#333' }}>
            <h3>¡Viaje Finalizado! 🏁</h3>
            <p>Gracias por usar SIGETAX. Tu calificación de {estrellas} estrellas ha sido registrada.</p>
          </div>
        )}

        {/* 5. BOTÓN DE PÁNICO (Solo si el viaje está aceptado) */}
        {estadoViaje && estadoViaje.estado_viaje === 'aceptado' && !calificado && (
          <div style={{ marginTop: '20px' }}>
            <button onClick={handlePanico} disabled={alertaEnviada}
              style={{ padding: '15px', fontSize: '18px', fontWeight: 'bold', backgroundColor: alertaEnviada ? '#555' : '#dc3545', color: 'white', border: 'none', borderRadius: '50px', cursor: alertaEnviada ? 'not-allowed' : 'pointer', width: '100%', maxWidth: '300px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
              {alertaEnviada ? '🚨 ALERTA ENVIADA' : '🚨 BOTÓN DE PÁNICO'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}