import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Taxista() {
  const [mensaje, setMensaje] = useState('');
  const [viajeAceptado, setViajeAceptado] = useState(false);
  const [viaje, setViaje] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  // Estados para la telemetría
  const [gpsEnviando, setGpsEnviando] = useState(false);
  const [gpsMensaje, setGpsMensaje] = useState('');

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!usuario || usuario.rol !== 'taxista') {
      navigate('/');
      return;
    }

    const buscarViaje = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/viajes/pendiente', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setViaje(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };
    buscarViaje();
  }, [usuario, token, navigate]);

  const handleAceptarViaje = async () => {
    if (!viaje) return;
    try {
      await axios.put(`http://localhost:3000/api/v1/viajes/${viaje.id_viaje}/aceptar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('¡Viaje aceptado! Dirígete al origen.');
      setViajeAceptado(true);
    } catch (error) {
      setMensaje(error.response?.data?.error?.mensaje || 'Error al aceptar el viaje');
    }
  };

  // 👇 NUEVA FUNCIÓN: Simular el envío de GPS
  const handleEnviarUbicacion = async () => {
    setGpsEnviando(true);
    setGpsMensaje('');
    try {
      // Simulamos coordenadas ligeramente distintas para simular movimiento
      const latSimulada = 19.2433 + (Math.random() * 0.005);
      const lngSimulada = -103.7250 + (Math.random() * 0.005);

      await axios.post('http://localhost:3000/api/v1/telemetria/ubicacion', {
        lat: latSimulada,
        lng: lngSimulada
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setGpsMensaje(`📍 Ubicación enviada: ${latSimulada.toFixed(4)}, ${lngSimulada.toFixed(4)}`);
    } catch (error) {
      setGpsMensaje('Error al enviar ubicación');
    } finally {
      setGpsEnviando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  if (cargando) return <h3 style={{ textAlign: 'center', marginTop: '50px' }}>Buscando viajes...</h3>;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🚕 Panel del Taxista</h2>
        <button onClick={cerrarSesion} style={{ padding: '5px 10px', cursor: 'pointer' }}>Salir</button>
      </div>
      
      <p><strong>Bienvenido, {usuario?.nombre_completo}</strong></p>
      
      {!viaje ? (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', textAlign: 'center', backgroundColor: '#f9f9f9', color: '#333' }}>
          <h3>No hay viajes pendientes</h3>
          <p>Espera a que un pasajero solicite uno.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', marginTop: '20px', backgroundColor: '#f9f9f9', color: '#333' }}>
          <h3>Nuevo viaje disponible (ID: {viaje.id_viaje})</h3>
          <p><strong>Tarifa estimada:</strong> ${viaje.monto_estimado}</p>
          
          <button 
            onClick={handleAceptarViaje} 
            disabled={viajeAceptado}
            style={{ padding: '10px 20px', backgroundColor: viajeAceptado ? 'gray' : 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', marginTop: '10px' }}
          >
            {viajeAceptado ? 'Viaje Aceptado' : 'Aceptar Viaje'}
          </button>

          {/* 👇 NUEVA SECCIÓN: Telemetría GPS (Solo aparece si aceptó el viaje) */}
          {viajeAceptado && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ccc' }}>
              <h4>📡 Simulador de Telemetría</h4>
              <p style={{ fontSize: '14px' }}>Envía tu posición GPS al servidor para que el pasajero pueda rastrearte.</p>
              <button 
                onClick={handleEnviarUbicacion} 
                disabled={gpsEnviando}
                style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}
              >
                {gpsEnviando ? 'Enviando señal...' : '📍 Enviar Ubicación GPS'}
              </button>
              {gpsMensaje && <p style={{ fontSize: '12px', color: 'green', marginTop: '10px', fontWeight: 'bold' }}>{gpsMensaje}</p>}
            </div>
          )}
        </div>
      )}

      {mensaje && <p style={{ marginTop: '20px', fontWeight: 'bold', color: mensaje.includes('aceptado') ? 'blue' : 'red', textAlign: 'center' }}>{mensaje}</p>}
    </div>
  );
}