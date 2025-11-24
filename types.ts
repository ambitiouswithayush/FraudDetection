export type RiskLevel = 'LOW' | 'MEDIUM' | 'CRITICAL';

export interface FraudCase {
  id: string;
  narrative: string;
  merchant: string;
  type: string;
  vectorId?: string; // Simulated vector ID
}

export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  merchant: string;
  merchantId: string;
  narrative: string;
  location: string;
  ip: string;
  
  // Calculated Fast Features
  zScore: number;
  velocityScore: number;
  
  // RAG/Signature Features
  signatureMatchScore: number;
  matchedCaseId?: string;
  
  riskLevel: RiskLevel;
  status: 'PENDING' | 'ANALYZING' | 'BLOCKED' | 'ALLOWED' | 'FLAGGED';
}

export interface AnalysisResult {
  isLikelyFraud: boolean;
  confidence: number;
  reasoning: string;
  recommendedAction: 'BLOCK' | 'ALLOW' | 'HOLD';
  keyRiskFactors: string[];
}

export interface UserProfile {
  history: number[]; // Last N amounts
  mean: number;
  stdDev: number;
}

// ============= DOCUMENT STORE TYPES =============

export interface AMLPolicy {
  id: string;
  name: string;
  jurisdiction: string;
  version: string;
  effective_date: string;
  rules: {
    rule_id: string;
    description: string;
    threshold?: number;
    action: 'BLOCK' | 'REQUIRE_APPROVAL' | 'FLAG';
  }[];
  created_by: string;
  last_updated: string;
}

export interface SanctionEntity {
  entity_id: string;
  name: string;
  type: 'ORGANIZATION' | 'INDIVIDUAL' | 'BANK';
  country: string;
  reason: string;
  action: 'BLOCK_ALL' | 'FLAG' | 'REVIEW';
}

export interface MerchantRisk {
  id: string;
  merchant_name: string;
  merchant_type: string;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_score: number; // 0-10
  fraud_rate: number; // percentage
  chargeback_rate: number;
  compliance_issues: {
    issue: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    date_reported: string;
  }[];
  action_on_transaction: 'AUTO_APPROVE' | 'REQUIRE_VERIFICATION' | 'FLAG' | 'BLOCK';
  created_date: string;
  updated_date: string;
}

export interface CustomerPolicy {
  id: string;
  user_id: string;
  daily_limit: number;
  monthly_limit: number;
  requires_approval_above: number;
  allowed_countries: string[];
  blocked_countries: string[];
  max_transactions_per_day: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH';
  compliance_status: 'VERIFIED_KYC' | 'PENDING_KYC' | 'FAILED_KYC';
}

export interface DocumentStore {
  policies: AMLPolicy[];
  sanction_lists: SanctionEntity[];
  merchant_ratings: MerchantRisk[];
  customer_policies: CustomerPolicy[];
  audit_logs: AuditLog[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event_type: 'POLICY_CHANGE' | 'TRANSACTION_BLOCKED' | 'TRANSACTION_APPROVED';
  changed_by: string;
  details: Record<string, any>;
  approval_status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

// ============= DASHBOARD TYPES =============

export interface DashboardMetrics {
  transactions_today: number;
  fraud_detected: number;
  detection_rate: number; // percentage
  legitimate_approved: number;
  pending_review: number;

  avg_response_time_ms: number;
  max_response_time_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  throughput_txn_per_sec: number;

  model_accuracy: number;
  model_precision: number;
  model_recall: number;
  false_positive_rate: number;
  false_negative_rate: number;

  active_alerts: Alert[];
  system_health: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface Alert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  timestamp: string;
  related_transaction_id?: string;
}