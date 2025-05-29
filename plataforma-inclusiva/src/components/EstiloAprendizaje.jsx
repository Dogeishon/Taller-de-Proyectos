import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const preguntas = [
  {
    texto: '¿Cómo prefieres aprender algo nuevo?',
    opciones: [
      { texto: 'Viendo imágenes o diagramas', tipo: 'visual' },
      { texto: 'Escuchando explicaciones', tipo: 'auditivo' },
      { texto: 'Haciendo algo con tus manos', tipo: 'kinestesico' }
    ]
  },
  {
    texto: 'Cuando estudias, ¿qué método usas más?',
    opciones: [
      { texto: 'Haces mapas o esquemas', tipo: 'visual' },
      { texto: 'Grabas y escuchas audio', tipo: 'auditivo' },
      { texto: 'Practicas con ejercicios o experimentos', tipo: 'kinestesico' }
    ]
  },
  {
    texto: '¿Qué haces cuando alguien te da direcciones?',
    opciones: [
      { texto: 'Dibujas un mapa mentalmente', tipo: 'visual' },
      { texto: 'Repites las instrucciones en voz alta', tipo: 'auditivo' },
      { texto: 'Te guías por puntos de referencia', tipo: 'kinestesico' }
    ]
  }
];

function EstiloAprendizaje() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const navigate = useNavigate();

  const manejarRespuesta = (tipo) => {
    setRespuestas([...respuestas, tipo]);

    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      finalizarTest([...respuestas, tipo]);
    }
  };

  const finalizarTest = async (respuestasFinales) => {
    const conteo = {
      visual: 0,
      auditivo: 0,
      kinestesico: 0
    };

    respuestasFinales.forEach((tipo) => {
      conteo[tipo]++;
    });

    const estiloFinal = Object.keys(conteo).reduce((a, b) =>
      conteo[a] > conteo[b] ? a : b
    );

    try {
      const usuario = auth.currentUser;
      const userRef = doc(db, 'usuarios', usuario.uid);
      await updateDoc(userRef, {
        estiloAprendizaje: estiloFinal,
        estiloTestCompletado: true
      });

      navigate('/chatbot'); // Redirige al chatbot (ajústalo si usas otra ruta)
    } catch (error) {
      console.error('Error al guardar estilo de aprendizaje:', error);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
      <h2>Test de Estilo de Aprendizaje</h2>
      <p>{preguntas[preguntaActual].texto}</p>
      <div>
        {preguntas[preguntaActual].opciones.map((opcion, index) => (
          <button
            key={index}
            onClick={() => manejarRespuesta(opcion.tipo)}
            style={{ display: 'block', margin: '1rem 0', width: '100%' }}
          >
            {opcion.texto}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EstiloAprendizaje;
