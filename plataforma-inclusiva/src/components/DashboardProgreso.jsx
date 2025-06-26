// src/components/DashboardProgreso.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from 'recharts';

// Colores para los gráficos
const COLORS = ['#82ca9d', '#8884d8', '#ffc658', '#a28fd0'];

export default function DashboardProgreso() {
  const [stats, setStats] = useState({
    logins: 0,
    num_interactions: 0,
    num_content_requests: 0,
    nivelCognitivo: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [snapProfile, snapStats] = await Promise.all([
          getDoc(doc(db, 'usuarios', user.uid)),
          getDoc(doc(db, 'usuarios', user.uid, 'stats', 'current')),
        ]);
        const profile = snapProfile.exists() ? snapProfile.data() : {};
        const s = snapStats.exists() ? snapStats.data() : {};
        setStats({
          logins: s.logins || 0,
          num_interactions: profile.num_interactions || 0,
          num_content_requests: profile.num_content_requests || 0,
          nivelCognitivo:
            s.nivelDiscapacidadFinal ?? profile.nivelDiscapacidadFinal ?? 0,
        });
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  // Preparar datos KPI
  const data = [
    { name: 'Sesiones', value: stats.logins },
    { name: 'Interacciones', value: stats.num_interactions },
    { name: 'Solicitudes', value: stats.num_content_requests },
    { name: 'Cognitivo', value: stats.nivelCognitivo },
  ];

  // Datos para PieChart: solo valores > 0, ordenados descendente
  const pieData = data
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Título */}
      <h1 className="text-white text-4xl font-bold text-center mb-6">
        Dashboard de Progreso
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {data.map((d, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
          >
            <h2 className="text-lg font-medium mb-2">{d.name}</h2>
            <p className="text-2xl font-bold">{d.value}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BarChart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-center">Métricas</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d">
                <LabelList dataKey="value" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PieChart con leyenda y dinámico */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-center">Distribución</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ percent, name, value }) => `${name}: ${value}`}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
