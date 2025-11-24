import React from 'react';
import { DashboardMetrics, Alert } from '../types';
import { ICONS } from '../constants';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Props {
  metrics: DashboardMetrics;
}

const Dashboard: React.FC<Props> = ({ metrics }) => {
  // Chart data for transaction trends
  const trendData = [
    { time: '00:00', transactions: 45, fraud: 2 },
    { time: '04:00', transactions: 38, fraud: 1 },
    { time: '08:00', transactions: 62, fraud: 4 },
    { time: '12:00', transactions: 91, fraud: 6 },
    { time: '16:00', transactions: 78, fraud: 5 },
    { time: '20:00', transactions: 105, fraud: 8 },
    { time: '23:59', transactions: 68, fraud: 3 },
  ];

  // Model performance data
  const performanceData = [
    { name: 'Precision', value: (metrics.model_precision * 100).toFixed(1) },
    { name: 'Recall', value: (metrics.model_recall * 100).toFixed(1) },
    { name: 'Accuracy', value: (metrics.model_accuracy * 100).toFixed(1) },
  ];

  // Alert distribution
  const alertCounts = metrics.active_alerts.reduce(
    (acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const alertDistribution = [
    { name: 'INFO', value: alertCounts['INFO'] || 0, color: '#06b6d4' },
    { name: 'WARNING', value: alertCounts['WARNING'] || 0, color: '#f59e0b' },
    { name: 'CRITICAL', value: alertCounts['CRITICAL'] || 0, color: '#ef4444' },
  ];

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'NORMAL':
        return 'text-green-400';
      case 'WARNING':
        return 'text-yellow-400';
      case 'CRITICAL':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getHealthBgColor = (health: string) => {
    switch (health) {
      case 'NORMAL':
        return 'bg-green-500/10 border-green-500/50';
      case 'WARNING':
        return 'bg-yellow-500/10 border-yellow-500/50';
      case 'CRITICAL':
        return 'bg-red-500/10 border-red-500/50';
      default:
        return 'bg-slate-500/10 border-slate-500/50';
    }
  };

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Real-Time Risk Dashboard</h1>
        <p className="text-slate-400">System-wide fraud detection metrics and alerts</p>
      </div>

      {/* System Health Status */}
      <div className={`mb-6 p-6 rounded-xl border ${getHealthBgColor(metrics.system_health)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${getHealthColor(metrics.system_health)}`}>
              {ICONS.Shield}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">System Health</h2>
              <p className="text-sm text-slate-400">All systems operational</p>
            </div>
          </div>
          <span className={`text-2xl font-bold ${getHealthColor(metrics.system_health)}`}>
            {metrics.system_health}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Transactions Today */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Transactions Today</span>
            <span className="p-2 bg-blue-500/20 rounded text-blue-400">{ICONS.Activity}</span>
          </div>
          <div className="text-3xl font-bold text-white">{metrics.transactions_today}</div>
          <p className="text-xs text-slate-500 mt-2">Total processed</p>
        </div>

        {/* Fraud Detected */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Fraud Detected</span>
            <span className="p-2 bg-red-500/20 rounded text-red-400">{ICONS.AlertTriangle}</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{metrics.fraud_detected}</div>
          <p className="text-xs text-slate-500 mt-2">
            {(metrics.detection_rate * 100).toFixed(2)}% detection rate
          </p>
        </div>

        {/* Legitimate Approved */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Approved</span>
            <span className="p-2 bg-green-500/20 rounded text-green-400">{ICONS.Check}</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{metrics.legitimate_approved}</div>
          <p className="text-xs text-slate-500 mt-2">Legitimate transactions</p>
        </div>

        {/* Pending Review */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Pending Review</span>
            <span className="p-2 bg-yellow-500/20 rounded text-yellow-400">{ICONS.Clock}</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">{metrics.pending_review}</div>
          <p className="text-xs text-slate-500 mt-2">Awaiting analyst decision</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Transaction Trend Chart */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Transaction Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="transactions"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Total Transactions"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="fraud"
                stroke="#ef4444"
                strokeWidth={2}
                name="Fraud Cases"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Model Performance */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Model Performance</h3>
          <div className="space-y-4">
            {performanceData.map((metric) => (
              <div key={metric.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">{metric.name}</span>
                  <span className="text-sm font-bold text-white">{metric.value}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Error Rates */}
          <div className="mt-6 p-3 bg-slate-800/50 rounded-lg">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Error Rates</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">False Positives:</span>
                <span className="text-red-400 font-bold ml-1">
                  {(metrics.false_positive_rate * 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-slate-500">False Negatives:</span>
                <span className="text-red-400 font-bold ml-1">
                  {(metrics.false_negative_rate * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Latency Metrics */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <h4 className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-semibold">
            Avg Response Time
          </h4>
          <div className="text-2xl font-bold text-white mb-1">{metrics.avg_response_time_ms}ms</div>
          <p className="text-xs text-slate-500">
            Max: {metrics.max_response_time_ms}ms
          </p>
        </div>

        {/* P95 Latency */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <h4 className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-semibold">
            P95 Latency
          </h4>
          <div className="text-2xl font-bold text-white mb-1">{metrics.p95_latency_ms}ms</div>
          <p className="text-xs text-slate-500">
            P99: {metrics.p99_latency_ms}ms
          </p>
        </div>

        {/* Throughput */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <h4 className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-semibold">
            Throughput
          </h4>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics.throughput_txn_per_sec.toFixed(1)}
          </div>
          <p className="text-xs text-slate-500">transactions/second</p>
        </div>

        {/* Overall Accuracy */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <h4 className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-semibold">
            Model Accuracy
          </h4>
          <div className="text-2xl font-bold text-white mb-1">
            {(metrics.model_accuracy * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500">Overall accuracy</p>
        </div>
      </div>

      {/* Active Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Distribution */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Alert Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={alertDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {alertDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts */}
        <div className="lg:col-span-2 p-4 bg-slate-900 rounded-xl border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Alerts</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {metrics.active_alerts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No active alerts</p>
            ) : (
              metrics.active_alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-500/10 border-red-500/50'
                      : alert.severity === 'WARNING'
                        ? 'bg-yellow-500/10 border-yellow-500/50'
                        : 'bg-slate-800/50 border-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-red-500'
                              : alert.severity === 'WARNING'
                                ? 'bg-yellow-500'
                                : 'bg-cyan-500'
                          }`}
                        ></span>
                        <span className="font-semibold text-sm text-white">
                          {alert.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                      {alert.related_transaction_id && (
                        <p className="text-xs text-slate-500 mt-1">
                          TXN: {alert.related_transaction_id}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 ml-2 whitespace-nowrap">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
