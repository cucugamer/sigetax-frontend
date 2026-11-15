import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function RastreoPublico() {
  const { token } = useParams(); // Obtiene el token de la URL
  const [viaje, setViaje] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const consultarRastreo = async () => {
      try {
        // Petición pública (sin Token JWT)
        const response = await axios.get(`http://localhost:3000/api/v1/seguridad/rastreo/${token}`);
        setViaje(response.data.data);
      } catch (err) {
        setError('Enlace de rastreo inválido o expirado.');
      }
    };
    
    consultarRastreo();
    // Opcional: Actualizar cada 10 segundos para simular tiempo real
    const interval = setInterval(consultarRastreo, 10000);
    return () => clearInterval(interval);
  }, [token]);

  if (error) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</h2>;
  }

  if (!viaje) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando rastreo...</h2>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#28a745', color: 'white', padding: '15px', textAlign: 'center' }}>
        <h3>🚕 SIGETAX - Rastreo en Vivo</h3>
        <p>Estado del viaje: <strong>{viaje.estado_viaje.toUpperCase()}</strong></p>
      </div>

      <div style={{ height: '60vh', width: '100%' }}>
        <MapContainer center={[Number(viaje.origen_latitud), Number(viaje.origen_longitud)]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Marcador del Origen */}
          <Marker position={[Number(viaje.origen_latitud), Number(viaje.origen_longitud)]}>
            <Popup>Origen (Pasajero)</Popup>
          </Marker>

          {/* Marcador del Destino */}
          <Marker position={[Number(viaje.destino_latitud), Number(viaje.destino_longitud)]}>
            <Popup>Destino (Villa de Álvarez)</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', color: '#333' }}>
        <h4>Información del Conductor</h4>
        {viaje.nombre_taxista ? (
          <div>
            <p><strong>Nombre:</strong> {viaje.nombre_taxista}</p>
            <p><strong>Vehículo:</strong> {viaje.modelo_vehiculo} ({viaje.color})</p>
            <p><strong>Placa:</strong> {viaje.numero_placa}</p>
          </div>
        ) : (
          <p>Esperando asignación de conductor...</p>
        )}
        <p style={{ marginTop: '15px', fontWeight: 'bold' }}>Costo Estimado: ${viaje.monto_estimado}</p>
      </div>
    </div>
  );
}