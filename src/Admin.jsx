import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export default function Admin() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token = localStorage.getItem('token');
  
  const [alertas, setAlertas] = useState([]);
  const [taxistas, setTaxistas] = useState([]);

  useEffect(() => {
    if (!usuario || usuario.rol !== 'administrador') {
      alert('Acceso denegado. Solo administradores.');
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [resAlertas, resTaxistas] = await Promise.all([
          axios.get('https://sigetax-backend.onrender.com/api/v1/admin/alertas', { headers }),
          axios.get('https://sigetax-backend.onrender.com/api/v1/admin/taxistas', { headers })
        ]);
        setAlertas(resAlertas.data.data);
        setTaxistas(resTaxistas.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [usuario, token, navigate]);

  const cerrarSesion = () => { localStorage.clear(); navigate('/'); };

  if (!usuario || usuario.rol !== 'administrador') return null;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h2>👑 Panel de Administración SIGETAX</h2>
        <button onClick={cerrarSesion} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>Salir</button>
      </div>

      {/* SECCIÓN DE ALERTAS */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#dc3545' }}>🚨 Alertas de Pánico Recientes</h3>
        {alertas.length === 0 ? <p>No hay alertas registradas.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8d7da', textAlign: 'left' }}>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>ID</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Pasajero</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Ubicación</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Fecha</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map(a => (
                <tr key={a.id_alerta}>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>{a.id_alerta}</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>{a.pasajero}</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>{a.latitud_evento}, {a.longitud_evento}</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>{new Date(a.fecha_hora_alerta).toLocaleString()}</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', color: a.estatus === 'activa' ? 'red' : 'green' }}>{a.estatus.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SECCIÓN DE TAXISTAS */}
      <div style={{ marginTop: '40px', marginBottom: '50px' }}>
        <h3 style={{ color: '#007BFF' }}>🚕 Flotilla de Taxistas</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#cce5ff', textAlign: 'left' }}>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>Concesión</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>Nombre</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>Placa</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>Vehículo</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>Estatus</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>Calificación</th>
            </tr>
          </thead>
          <tbody>
            {taxistas.map(t => (
              <tr key={t.id_taxista}>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{t.numero_concesion}</td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{t.nombre_completo}</td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{t.numero_placa}</td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{t.modelo_vehiculo}</td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{t.estatus_disponibilidad}</td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>⭐ {t.calificacion_promedio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}