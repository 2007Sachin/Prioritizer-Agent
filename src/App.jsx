import { useState, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  LayoutGrid,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { supabase } from './supabaseClient';
import './App.css';

// Status configuration
const STATUS_CONFIG = {
  New: { label: 'New 📥', order: 0 },
  Planned: { label: 'Planned 🗓️', order: 1 },
  'In Progress': { label: 'In Progress 🚀', order: 2 },
};

const STATUS_FLOW = ['New', 'Planned', 'In Progress'];

// Custom Tooltip for ScatterChart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl shadow-xl backdrop-blur-md">
        <p className="font-semibold text-white mb-2">{data.feature_name}</p>
        <div className="space-y-1 text-sm text-slate-300">
          <p><span className="text-violet-400">RICE Score:</span> {data.final_rice_score}</p>
          <p><span className="text-amber-400">Effort:</span> {data.effort_score}</p>
          <p><span className="text-cyan-400">Category:</span> {data.category}</p>
        </div>
      </div>
    );
  }
  return null;
};

// RICE Badge Component
const RiceBadge = ({ score }) => {
  let colorClass = 'bg-red-500/20 text-red-400 border-red-500/30';
  if (score >= 400) colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  else if (score >= 200) colorClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
      RICE: {score}
    </span>
  );
};

// Feature Card Component
const FeatureCard = ({ feature, onMoveLeft, onMoveRight, canMoveLeft, canMoveRight, isUpdating }) => {
  return (
    <div className="group relative bg-slate-900/50 border border-slate-700/50 hover:border-violet-500/30 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/5">
      <div className="flex justify-between items-start gap-3 mb-3">
        <h4 className="text-lg font-semibold text-white group-hover:text-violet-200 transition-colors">
          {feature.feature_name}
        </h4>
        <RiceBadge score={feature.final_rice_score} />
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs">
        <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700/50">
          {feature.category}
        </span>
        <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700/50">
          Effort: {feature.effort_score}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          onClick={() => onMoveLeft(feature)}
          disabled={!canMoveLeft || isUpdating}
          className={`p-2 rounded-lg transition-colors ${!canMoveLeft
              ? 'text-slate-700 cursor-not-allowed'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          title="Move Left"
        >
          <ArrowLeft size={16} />
        </button>

        {isUpdating && <Loader2 className="animate-spin text-violet-500" size={16} />}

        <button
          onClick={() => onMoveRight(feature)}
          disabled={!canMoveRight || isUpdating}
          className={`p-2 rounded-lg transition-colors ${!canMoveRight
              ? 'text-slate-700 cursor-not-allowed'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          title="Move Right"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Kanban Column Component
const KanbanColumn = ({ title, features, status, onMoveFeature, updatingIds }) => {
  const statusIndex = STATUS_FLOW.indexOf(status);
  const canMoveLeft = statusIndex > 0;
  const canMoveRight = statusIndex < STATUS_FLOW.length - 1;

  const handleMoveLeft = (feature) => {
    const newStatus = STATUS_FLOW[statusIndex - 1];
    onMoveFeature(feature.id, newStatus);
  };

  const handleMoveRight = (feature) => {
    const newStatus = STATUS_FLOW[statusIndex + 1];
    onMoveFeature(feature.id, newStatus);
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4 min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-slate-200 font-semibold flex items-center gap-2">
          {title}
        </h3>
        <span className="bg-slate-700/50 text-slate-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {features.length}
        </span>
      </div>

      <div className="space-y-4 flex-1">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            isUpdating={updatingIds.includes(feature.id)}
          />
        ))}
        {features.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center">
            <p className="text-slate-600 text-sm">No features</p>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingIds, setUpdatingIds] = useState([]);

  // Fetch features from Supabase
  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_requests')
        .select('*')
        .order('final_rice_score', { ascending: false });

      if (error) throw error;
      setFeatures(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  // Move feature to a new status
  const handleMoveFeature = async (featureId, newStatus) => {
    setUpdatingIds((prev) => [...prev, featureId]);

    try {
      const { error } = await supabase
        .from('feature_requests')
        .update({ status: newStatus })
        .eq('id', featureId);

      if (error) throw error;

      // Update local state immediately
      setFeatures((prev) =>
        prev.map((f) => (f.id === featureId ? { ...f, status: newStatus } : f))
      );
    } catch (err) {
      console.error('Error updating feature:', err);
      setError(`Failed to update feature: ${err.message}`);
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== featureId));
    }
  };

  // Group features by status
  const getFeaturesByStatus = (status) => {
    const filtered = features.filter((f) => f.status === status);
    // Sort "New" column by RICE score descending
    if (status === 'New') {
      return filtered.sort((a, b) => b.final_rice_score - a.final_rice_score);
    }
    return filtered;
  };

  // Prepare data for scatter chart
  const scatterData = features.map((f) => ({
    ...f,
    x: f.effort_score,
    y: f.final_rice_score,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin text-violet-500" size={40} />
        <p className="font-medium">Loading RICE Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md w-full text-center">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-500/80 text-sm mb-4">{error}</p>
          <button
            onClick={fetchFeatures}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Sparkles className="text-violet-400" size={24} />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                RICE Roadmap Dashboard
              </h1>
            </div>
            <p className="text-slate-500 ml-14">Prioritize features with data-driven insights</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Sync Active
          </div>
        </header>

        {/* Section 1: Strategy Matrix */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="text-amber-500" size={24} />
              <h2 className="text-xl font-semibold text-white">Strategy Matrix</h2>
            </div>
            <span className="px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-medium rounded-full border border-violet-500/20">
              Top-left = Quick Wins (High Score, Low Effort)
            </span>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 pointer-events-none" />

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="x"
                    name="Effort"
                    type="number"
                    domain={[0, 'dataMax + 1']}
                    stroke="#475569"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={{ stroke: '#475569' }}
                    label={{
                      value: 'Effort Score (Lower is Better)',
                      position: 'bottom',
                      fill: '#64748b',
                      fontSize: 12,
                      offset: 0,
                    }}
                  />
                  <YAxis
                    dataKey="y"
                    name="RICE Score"
                    type="number"
                    domain={[0, 'dataMax + 50']}
                    stroke="#475569"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={{ stroke: '#475569' }}
                    label={{
                      value: 'RICE Score (Higher is Better)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#64748b',
                      fontSize: 12,
                    }}
                  />
                  <ZAxis range={[100, 400]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />
                  <Scatter
                    data={scatterData}
                    fill="#8b5cf6"
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Section 2: Kanban Board */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <LayoutGrid className="text-cyan-500" size={24} />
            <h2 className="text-xl font-semibold text-white">Feature Board</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATUS_FLOW.map((status) => (
              <KanbanColumn
                key={status}
                title={STATUS_CONFIG[status].label}
                status={status}
                features={getFeaturesByStatus(status)}
                onMoveFeature={handleMoveFeature}
                updatingIds={updatingIds}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
