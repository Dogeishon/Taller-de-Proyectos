import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Registro from './components/registro.jsx';


function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta por defecto = login */}
        <Route path="/" element={<Login />} />

        {/* Ruta para registro */}
        <Route path="/registro" element={<Registro />} />

        {/* Aquí puedes agregar más rutas luego */}
        {/* <Route path="/estilo" element={<EstiloAprendizaje />} /> */}
        {/* <Route path="/chatbot" element={<Chatbot />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
