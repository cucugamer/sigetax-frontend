import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [correo, setCorreo] = useState('juan@test.com');
  const [password, setPassword] = useState('Password123');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://sigetax-backend.onrender.com/api/v1/auth/login', {
        correo_electronico: correo,
        password: password
      });
      
      const usuarioLogueado = response.data.data.usuario;
      const tokenRecibido = response.data.data.token;

      localStorage.setItem('token', tokenRecibido);
      localStorage.setItem('usuario', JSON.stringify(usuarioLogueado));
      
      setMensaje(`¡Bienvenido ${usuarioLogueado.nombre_completo}!`);
      
      // 👇 AQUÍ ESTÁ EL BLOQUE QUE PREGUNTASTE 👇
      setTimeout(() => {
        if (usuarioLogueado.rol === 'taxista') {
          navigate('/taxista');
        } else if (usuarioLogueado.rol === 'administrador') {
          navigate('/admin'); 
        } else {
          navigate('/dashboard');
        }
      }, 1000);

    } catch (error) {
      setMensaje(error.response?.data?.error?.mensaje || 'Error al conectar');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>🚕 SIGETAX</h1>
      <h3>Iniciar Sesión</h3>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="Correo" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Entrar</button>
      </form>

      {mensaje && <p style={{ marginTop: '20px', fontWeight: 'bold', color: 'green' }}>{mensaje}</p>}
    </div>
  );
}