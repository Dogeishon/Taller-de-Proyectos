import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [nivelDiscapacidad, setNivelDiscapacidad] = useState(1);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, correo, password);
      const user = userCredential.user;

      // 2. Guardar datos adicionales en Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        nombre,
        correo,
        nivelDiscapacidad,
        fechaRegistro: new Date()
      });

      setMensaje('✅ Usuario registrado correctamente');
      navigate('/'); // Redirigir al login
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al registrar usuario');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '1rem' }}>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleRegistro}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        /><br /><br />
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <label>Nivel de discapacidad:</label><br />
        <select
          value={nivelDiscapacidad}
          onChange={(e) => setNivelDiscapacidad(Number(e.target.value))}
          style={{ width: '100%' }}
        >
          <option value={1}>Leve</option>
          <option value={2}>Moderada</option>
          <option value={3}>Severa</option>
        </select><br /><br />
        <button type="submit" style={{ width: '100%' }}>
          Registrarse
        </button>
      </form>
      {mensaje && <p style={{ marginTop: '1rem' }}>{mensaje}</p>}
      <p>¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link></p>
    </div>
  );
}

export default Registro;
