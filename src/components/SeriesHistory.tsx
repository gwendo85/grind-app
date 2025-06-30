"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
// @ts-ignore
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

interface SeriesLog {
  id: string;
  workout_id: string;
  exercise_name: string;
  set_number: number;
  timestamp: string;
  success: boolean;
}

function toCSV(rows: SeriesLog[]) {
  const header = 'Exercice,Série,Date,Succès\n';
  const body = rows.map(s => `${s.exercise_name},${s.set_number},${new Date(s.timestamp).toLocaleString('fr-FR')},${s.success ? '✅' : '❌'}`).join('\n');
  return header + body;
}

export default function SeriesHistory() {
  const [series, setSeries] = useState<SeriesLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseFilter, setExerciseFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    setLoading(true);
    setError(null);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("Utilisateur non connecté");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("workout_sets")
      .select("id, workout_id, exercise_name, set_number, timestamp, success")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false })
      .limit(100);
    if (error) setError(error.message);
    setSeries(data || []);
    setLoading(false);
  };

  // Filtres dynamiques
  const uniqueExercises = Array.from(new Set(series.map(s => s.exercise_name)));
  const filteredSeries = series.filter(s =>
    (!exerciseFilter || s.exercise_name === exerciseFilter) &&
    (!dateFilter || s.timestamp.startsWith(dateFilter))
  );

  // Export CSV
  const handleExportCSV = () => {
    const csv = toCSV(filteredSeries);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'series_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats avancées
  const total = filteredSeries.length;
  const successCount = filteredSeries.filter(s => s.success).length;
  const failCount = filteredSeries.filter(s => !s.success).length;
  const successRate = total ? Math.round((successCount / total) * 100) : 0;
  const bestRest = (() => {
    let min = Infinity;
    for (let i = 1; i < filteredSeries.length; i++) {
      if (filteredSeries[i].exercise_name === filteredSeries[i - 1].exercise_name) {
        const t1 = new Date(filteredSeries[i - 1].timestamp).getTime();
        const t2 = new Date(filteredSeries[i].timestamp).getTime();
        const diff = (t2 - t1) / 1000;
        if (diff > 0 && diff < min) min = diff;
      }
    }
    return min === Infinity ? null : min;
  })();
  const seriesByExercise = uniqueExercises.map(ex =>
    filteredSeries.filter(s => s.exercise_name === ex).length
  );

  // Graphique séries par exercice
  const chartData = {
    labels: uniqueExercises,
    datasets: [
      {
        label: 'Séries réalisées',
        data: seriesByExercise,
        backgroundColor: 'rgba(59,130,246,0.7)'
      }
    ]
  };

  if (loading) return <div className="text-gray-500">Chargement de l'historique...</div>;
  if (error) return <div className="text-red-600">Erreur : {error}</div>;
  if (series.length === 0) return <div className="text-gray-500">Aucune série enregistrée.</div>;

  return (
    <div className="bg-white/80 rounded-lg shadow p-4 mt-6">
      <h3 className="text-lg font-bold mb-3">📝 Historique des séries</h3>
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Filtrer par exercice</label>
          <select value={exerciseFilter} onChange={e => setExerciseFilter(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Tous</option>
            {uniqueExercises.map(ex => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Filtrer par date</label>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <button onClick={handleExportCSV} className="btn btn-outline ml-auto">⬇️ Export CSV</button>
      </div>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="bg-blue-50 rounded p-2 text-blue-800 text-xs font-semibold">Taux de réussite : {successRate}%</div>
        <div className="bg-green-50 rounded p-2 text-green-800 text-xs font-semibold">Séries réussies : {successCount}</div>
        <div className="bg-red-50 rounded p-2 text-red-700 text-xs font-semibold">Séries ratées : {failCount}</div>
        <div className="bg-yellow-50 rounded p-2 text-yellow-700 text-xs font-semibold">Meilleur temps entre séries : {bestRest ? `${Math.round(bestRest)}s` : 'N/A'}</div>
      </div>
      <div className="mb-6">
        <Bar data={chartData} options={{ plugins: { legend: { display: false } } }} height={120} />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-700 border-b">
            <th className="py-1 text-left">Exercice</th>
            <th className="py-1">Série</th>
            <th className="py-1">Date</th>
            <th className="py-1">Succès</th>
          </tr>
        </thead>
        <tbody>
          {filteredSeries.map((s) => (
            <tr key={s.id} className="border-b last:border-0">
              <td className="py-1 font-medium">{s.exercise_name}</td>
              <td className="py-1 text-center">{s.set_number}</td>
              <td className="py-1 text-center">{new Date(s.timestamp).toLocaleString('fr-FR')}</td>
              <td className="py-1 text-center">{s.success ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 