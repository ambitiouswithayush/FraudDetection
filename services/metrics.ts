import { Transaction, DashboardMetrics, Alert } from '../types';

/**
 * Metrics Calculation Service
 * Computes real-time fraud detection metrics and system health indicators
 */

export interface MetricsSnapshot {
  timestamp: number;
  responseTime: number;
  isFraud: boolean;
}

/**
 * Calculate dashboard metrics from transaction history and performance data
 */
export function calculateMetrics(
  transactions: Transaction[],
  metricsHistory: MetricsSnapshot[] = [],
  alerts: Alert[] = []
): DashboardMetrics {
  const fraudCases = transactions.filter(t => t.riskLevel === 'CRITICAL' || t.status === 'BLOCKED');
  const approvedCases = transactions.filter(t => t.status === 'ALLOWED');
  const pendingCases = transactions.filter(t => t.status === 'PENDING' || t.status === 'ANALYZING');

  const detectionRate = transactions.length > 0 ? fraudCases.length / transactions.length : 0;

  // Calculate performance metrics from history
  const responseTimes = metricsHistory.map(m => m.responseTime);
  const avgResponseTime =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

  const maxResponseTime =
    responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

  const p95Latency = calculatePercentile(responseTimes, 0.95);
  const p99Latency = calculatePercentile(responseTimes, 0.99);

  // Calculate throughput (transactions per second)
  const throughput = calculateThroughput(metricsHistory);

  // Calculate model performance metrics
  const fraudDetected = fraudCases.length;
  const truePositives = fraudCases.filter(t => t.status === 'BLOCKED').length;
  const falsePositives = fraudCases.filter(t => t.status === 'ALLOWED').length;
  const falseNegatives = approvedCases.filter(t => t.riskLevel === 'CRITICAL').length;
  const trueNegatives = approvedCases.filter(t => t.riskLevel === 'LOW').length;

  const precision =
    truePositives + falsePositives > 0
      ? truePositives / (truePositives + falsePositives)
      : 0;

  const recall =
    truePositives + falseNegatives > 0
      ? truePositives / (truePositives + falseNegatives)
      : 0;

  const accuracy =
    transactions.length > 0
      ? (truePositives + trueNegatives) / transactions.length
      : 0;

  const falsePositiveRate =
    falsePositives + trueNegatives > 0
      ? falsePositives / (falsePositives + trueNegatives)
      : 0;

  const falseNegativeRate =
    falseNegatives + truePositives > 0
      ? falseNegatives / (falseNegatives + truePositives)
      : 0;

  // Determine system health
  const systemHealth = determineSystemHealth(
    detectionRate,
    falsePositiveRate,
    avgResponseTime,
    alerts
  );

  return {
    transactions_today: transactions.length,
    fraud_detected: fraudDetected,
    detection_rate: detectionRate,
    legitimate_approved: approvedCases.length,
    pending_review: pendingCases.length,

    avg_response_time_ms: avgResponseTime,
    max_response_time_ms: maxResponseTime,
    p95_latency_ms: p95Latency,
    p99_latency_ms: p99Latency,
    throughput_txn_per_sec: throughput,

    model_accuracy: Math.max(0, Math.min(1, accuracy)),
    model_precision: Math.max(0, Math.min(1, precision)),
    model_recall: Math.max(0, Math.min(1, recall)),
    false_positive_rate: Math.max(0, Math.min(1, falsePositiveRate)),
    false_negative_rate: Math.max(0, Math.min(1, falseNegativeRate)),

    active_alerts: alerts,
    system_health: systemHealth,
  };
}

/**
 * Calculate percentile from sorted array
 */
function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * percentile) - 1;
  return Math.round(sorted[Math.max(0, index)]);
}

/**
 * Calculate throughput (transactions per second)
 */
function calculateThroughput(metricsHistory: MetricsSnapshot[]): number {
  if (metricsHistory.length < 2) return 0;

  const sorted = [...metricsHistory].sort((a, b) => a.timestamp - b.timestamp);
  const timespanSeconds = (sorted[sorted.length - 1].timestamp - sorted[0].timestamp) / 1000;

  if (timespanSeconds === 0) return 0;
  return Number((metricsHistory.length / timespanSeconds).toFixed(2));
}

/**
 * Determine overall system health status
 */
function determineSystemHealth(
  detectionRate: number,
  falsePositiveRate: number,
  avgResponseTime: number,
  alerts: Alert[]
): 'NORMAL' | 'WARNING' | 'CRITICAL' {
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;

  // Critical conditions
  if (
    criticalAlerts > 5 ||
    falsePositiveRate > 0.3 ||
    avgResponseTime > 5000 ||
    detectionRate > 0.5
  ) {
    return 'CRITICAL';
  }

  // Warning conditions
  if (
    alerts.length > 10 ||
    falsePositiveRate > 0.15 ||
    avgResponseTime > 2000 ||
    detectionRate > 0.3
  ) {
    return 'WARNING';
  }

  return 'NORMAL';
}

/**
 * Generate realistic alerts based on metrics
 */
export function generateAlerts(
  transactions: Transaction[],
  metrics: Partial<DashboardMetrics> = {}
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  // High fraud detection rate alert
  const detectionRate = metrics.detection_rate || 0;
  if (detectionRate > 0.1) {
    alerts.push({
      id: `ALERT_HIGH_FRAUD_${Date.now()}`,
      severity: detectionRate > 0.2 ? 'CRITICAL' : 'WARNING',
      title: 'Elevated Fraud Detection Rate',
      description: `${(detectionRate * 100).toFixed(1)}% of transactions flagged as suspicious in the last hour`,
      timestamp: now.toISOString(),
    });
  }

  // High false positive rate alert
  const falsePositiveRate = metrics.false_positive_rate || 0;
  if (falsePositiveRate > 0.2) {
    alerts.push({
      id: `ALERT_FALSE_POS_${Date.now()}`,
      severity: 'WARNING',
      title: 'High False Positive Rate',
      description: `Model incorrectly flagging ${(falsePositiveRate * 100).toFixed(1)}% of legitimate transactions`,
      timestamp: new Date(now.getTime() - 300000).toISOString(),
    });
  }

  // Performance degradation alert
  const avgResponseTime = metrics.avg_response_time_ms || 0;
  if (avgResponseTime > 3000) {
    alerts.push({
      id: `ALERT_PERFORMANCE_${Date.now()}`,
      severity: avgResponseTime > 5000 ? 'CRITICAL' : 'WARNING',
      title: 'System Performance Degradation',
      description: `Average response time is ${avgResponseTime}ms. Consider scaling infrastructure.`,
      timestamp: new Date(now.getTime() - 600000).toISOString(),
    });
  }

  // Recent high-value fraud alert
  const highValueFraud = transactions.find(
    t => t.riskLevel === 'CRITICAL' && t.amount > 10000
  );
  if (highValueFraud) {
    alerts.push({
      id: `ALERT_HIGH_VALUE_${Date.now()}`,
      severity: 'CRITICAL',
      title: 'High-Value Fraud Detected',
      description: `Critical risk transaction of $${highValueFraud.amount} detected at ${highValueFraud.merchant}`,
      timestamp: now.toISOString(),
      related_transaction_id: highValueFraud.id,
    });
  }

  // Merchant risk alert
  const highRiskMerchant = transactions.find(
    t =>
      t.merchant.toLowerCase().includes('crypto') ||
      t.merchant.toLowerCase().includes('wire') ||
      t.merchant.toLowerCase().includes('transfer')
  );
  if (highRiskMerchant) {
    alerts.push({
      id: `ALERT_MERCHANT_RISK_${Date.now()}`,
      severity: 'WARNING',
      title: 'High-Risk Merchant Activity',
      description: `Transaction with high-risk merchant category detected: ${highRiskMerchant.merchant}`,
      timestamp: new Date(now.getTime() - 1200000).toISOString(),
      related_transaction_id: highRiskMerchant.id,
    });
  }

  // Velocity alert
  const recentTransactions = transactions.slice(0, 10);
  if (recentTransactions.length >= 5) {
    alerts.push({
      id: `ALERT_VELOCITY_${Date.now()}`,
      severity: 'WARNING',
      title: 'Abnormal Transaction Velocity',
      description: `${recentTransactions.length} transactions in the last few minutes. Possible account compromise.`,
      timestamp: new Date(now.getTime() - 180000).toISOString(),
    });
  }

  // Sort by severity and timestamp
  return alerts.sort((a, b) => {
    const severityOrder: Record<string, number> = {
      CRITICAL: 0,
      WARNING: 1,
      INFO: 2,
    };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

/**
 * Add metrics snapshot to history (for tracking performance over time)
 */
export function recordMetricsSnapshot(
  history: MetricsSnapshot[],
  responseTime: number,
  isFraud: boolean,
  maxHistorySize: number = 1000
): MetricsSnapshot[] {
  const snapshot: MetricsSnapshot = {
    timestamp: Date.now(),
    responseTime,
    isFraud,
  };

  const updated = [...history, snapshot];

  // Keep only recent history
  if (updated.length > maxHistorySize) {
    return updated.slice(-maxHistorySize);
  }

  return updated;
}

/**
 * Calculate hourly fraud trend
 */
export function calculateHourlyTrend(
  transactions: Transaction[]
): Array<{ hour: number; fraudCount: number; totalCount: number }> {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const trends = hours.map((hour) => ({
    hour,
    fraudCount: 0,
    totalCount: 0,
  }));

  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp);
    const hour = date.getHours();
    trends[hour].totalCount++;

    if (tx.riskLevel === 'CRITICAL' || tx.status === 'BLOCKED') {
      trends[hour].fraudCount++;
    }
  });

  return trends;
}
