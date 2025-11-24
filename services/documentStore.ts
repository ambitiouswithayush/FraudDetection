import {
  DocumentStore,
  AMLPolicy,
  SanctionEntity,
  MerchantRisk,
  CustomerPolicy,
  AuditLog
} from '../types';

/**
 * Document Store Service
 * Centralized repository for compliance policies, sanction lists, merchant ratings,
 * customer policies, and audit logs.
 */

// ============= AML POLICIES =============
const amlPolicies: AMLPolicy[] = [
  {
    id: 'AML_POL_001',
    name: 'Enhanced Due Diligence (EDD) Policy',
    jurisdiction: 'US',
    version: '2.1',
    effective_date: '2024-01-01',
    rules: [
      {
        rule_id: 'EDD_001',
        description: 'Transactions exceeding $10,000 require enhanced verification',
        threshold: 10000,
        action: 'REQUIRE_APPROVAL',
      },
      {
        rule_id: 'EDD_002',
        description: 'PEP (Politically Exposed Person) detected - flag and review',
        action: 'FLAG',
      },
      {
        rule_id: 'EDD_003',
        description: 'High-risk jurisdiction detected - require additional documentation',
        action: 'REQUIRE_APPROVAL',
      },
    ],
    created_by: 'compliance-admin',
    last_updated: '2024-11-15',
  },
  {
    id: 'AML_POL_002',
    name: 'Transaction Velocity Policy',
    jurisdiction: 'US',
    version: '1.5',
    effective_date: '2024-02-01',
    rules: [
      {
        rule_id: 'TV_001',
        description: 'More than 5 transactions in 1 hour',
        threshold: 5,
        action: 'FLAG',
      },
      {
        rule_id: 'TV_002',
        description: 'Daily transaction total exceeds $50,000',
        threshold: 50000,
        action: 'REQUIRE_APPROVAL',
      },
      {
        rule_id: 'TV_003',
        description: 'Unusual geographic pattern detected (multiple countries in 24h)',
        action: 'FLAG',
      },
    ],
    created_by: 'compliance-admin',
    last_updated: '2024-11-10',
  },
  {
    id: 'AML_POL_003',
    name: 'Merchant Category Risk Policy',
    jurisdiction: 'US',
    version: '1.0',
    effective_date: '2024-03-01',
    rules: [
      {
        rule_id: 'MCR_001',
        description: 'High-risk merchant categories require approval for transactions >$5,000',
        threshold: 5000,
        action: 'REQUIRE_APPROVAL',
      },
      {
        rule_id: 'MCR_002',
        description: 'Adult services, gambling, and cryptocurrency merchants flagged',
        action: 'FLAG',
      },
    ],
    created_by: 'compliance-admin',
    last_updated: '2024-11-12',
  },
];

// ============= SANCTION LISTS (OFAC-style) =============
const sanctionLists: SanctionEntity[] = [
  {
    entity_id: 'SANC_001',
    name: 'Crimson Trading LLC',
    type: 'ORGANIZATION',
    country: 'IRAN',
    reason: 'OFAC SDN - State Sponsor of Terrorism',
    action: 'BLOCK_ALL',
  },
  {
    entity_id: 'SANC_002',
    name: 'Viktor Petrov',
    type: 'INDIVIDUAL',
    country: 'RUSSIA',
    reason: 'Oligarch - Economic Sanctions',
    action: 'BLOCK_ALL',
  },
  {
    entity_id: 'SANC_003',
    name: 'North Korean Trade Finance Bank',
    type: 'BANK',
    country: 'NORTH_KOREA',
    reason: 'OFAC SDN - Illicit Financial Activities',
    action: 'BLOCK_ALL',
  },
  {
    entity_id: 'SANC_004',
    name: 'Hezbollah Financial Network',
    type: 'ORGANIZATION',
    country: 'LEBANON',
    reason: 'UN Terrorist Organization',
    action: 'BLOCK_ALL',
  },
  {
    entity_id: 'SANC_005',
    name: 'Ahmed Hassan Al-Mansouri',
    type: 'INDIVIDUAL',
    country: 'YEMEN',
    reason: 'Sanctions Evader - Under Investigation',
    action: 'REVIEW',
  },
];

// ============= MERCHANT RISK RATINGS =============
const merchantRatings: MerchantRisk[] = [
  {
    id: 'MERCH_001',
    merchant_name: 'QuickMart Retail',
    merchant_type: 'E-Commerce',
    risk_tier: 'LOW',
    risk_score: 1.2,
    fraud_rate: 0.02,
    chargeback_rate: 0.001,
    compliance_issues: [],
    action_on_transaction: 'AUTO_APPROVE',
    created_date: '2023-06-01',
    updated_date: '2024-11-20',
  },
  {
    id: 'MERCH_002',
    merchant_name: 'CryptoExchange Pro',
    merchant_type: 'Cryptocurrency',
    risk_tier: 'HIGH',
    risk_score: 7.8,
    fraud_rate: 0.15,
    chargeback_rate: 0.08,
    compliance_issues: [
      {
        issue: 'KYC compliance gaps',
        severity: 'HIGH',
        date_reported: '2024-10-15',
      },
      {
        issue: 'Suspected money laundering activity',
        severity: 'HIGH',
        date_reported: '2024-11-05',
      },
    ],
    action_on_transaction: 'FLAG',
    created_date: '2023-09-01',
    updated_date: '2024-11-18',
  },
  {
    id: 'MERCH_003',
    merchant_name: 'Adult Entertainment Inc',
    merchant_type: 'Adult Services',
    risk_tier: 'HIGH',
    risk_score: 6.5,
    fraud_rate: 0.12,
    chargeback_rate: 0.10,
    compliance_issues: [
      {
        issue: 'High chargeback rate',
        severity: 'HIGH',
        date_reported: '2024-11-01',
      },
    ],
    action_on_transaction: 'REQUIRE_VERIFICATION',
    created_date: '2023-08-15',
    updated_date: '2024-11-19',
  },
  {
    id: 'MERCH_004',
    merchant_name: 'Global Tech Solutions',
    merchant_type: 'B2B Services',
    risk_tier: 'LOW',
    risk_score: 2.1,
    fraud_rate: 0.03,
    chargeback_rate: 0.002,
    compliance_issues: [],
    action_on_transaction: 'AUTO_APPROVE',
    created_date: '2023-07-20',
    updated_date: '2024-11-17',
  },
  {
    id: 'MERCH_005',
    merchant_name: 'Suspicious Wire Transfer Co',
    merchant_type: 'Money Transfer',
    risk_tier: 'HIGH',
    risk_score: 8.2,
    fraud_rate: 0.22,
    chargeback_rate: 0.15,
    compliance_issues: [
      {
        issue: 'Operating without proper licensing',
        severity: 'HIGH',
        date_reported: '2024-08-20',
      },
      {
        issue: 'Multiple sanctions violations detected',
        severity: 'CRITICAL',
        date_reported: '2024-11-10',
      },
    ],
    action_on_transaction: 'BLOCK',
    created_date: '2023-05-01',
    updated_date: '2024-11-14',
  },
];

// ============= CUSTOMER POLICIES =============
const customerPolicies: CustomerPolicy[] = [
  {
    id: 'CUST_POL_001',
    user_id: 'USER_VIP_001',
    daily_limit: 100000,
    monthly_limit: 1000000,
    requires_approval_above: 50000,
    allowed_countries: ['US', 'UK', 'CA', 'AU', 'SG'],
    blocked_countries: ['KP', 'IR', 'SY'],
    max_transactions_per_day: 100,
    risk_tier: 'LOW',
    compliance_status: 'VERIFIED_KYC',
  },
  {
    id: 'CUST_POL_002',
    user_id: 'USER_STANDARD_001',
    daily_limit: 10000,
    monthly_limit: 50000,
    requires_approval_above: 5000,
    allowed_countries: ['US', 'CA', 'UK'],
    blocked_countries: ['KP', 'IR', 'SY', 'CU'],
    max_transactions_per_day: 20,
    risk_tier: 'MEDIUM',
    compliance_status: 'VERIFIED_KYC',
  },
  {
    id: 'CUST_POL_003',
    user_id: 'USER_NEW_001',
    daily_limit: 2000,
    monthly_limit: 10000,
    requires_approval_above: 1000,
    allowed_countries: ['US'],
    blocked_countries: ['KP', 'IR', 'SY', 'CU', 'VE'],
    max_transactions_per_day: 5,
    risk_tier: 'HIGH',
    compliance_status: 'PENDING_KYC',
  },
  {
    id: 'CUST_POL_004',
    user_id: 'USER_SUSPENDED_001',
    daily_limit: 0,
    monthly_limit: 0,
    requires_approval_above: 0,
    allowed_countries: [],
    blocked_countries: ['*'],
    max_transactions_per_day: 0,
    risk_tier: 'HIGH',
    compliance_status: 'FAILED_KYC',
  },
];

// ============= AUDIT LOGS =============
const auditLogs: AuditLog[] = [
  {
    id: 'AUDIT_001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    event_type: 'POLICY_CHANGE',
    changed_by: 'compliance-admin',
    details: {
      policy_id: 'AML_POL_002',
      change: 'Updated transaction velocity threshold from 6 to 5 transactions/hour',
      reason: 'Increased fraud detection sensitivity',
    },
    approval_status: 'APPROVED',
  },
  {
    id: 'AUDIT_002',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    event_type: 'TRANSACTION_BLOCKED',
    changed_by: 'system',
    details: {
      transaction_id: 'TXN_12345',
      merchant_id: 'MERCH_005',
      reason: 'Merchant on sanction list - Suspicious Wire Transfer Co',
      amount: 25000,
    },
    approval_status: 'APPROVED',
  },
  {
    id: 'AUDIT_003',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    event_type: 'TRANSACTION_APPROVED',
    changed_by: 'analyst-user-1',
    details: {
      transaction_id: 'TXN_67890',
      merchant_id: 'MERCH_001',
      reason: 'Manual override - verified legitimate customer',
      amount: 8500,
    },
    approval_status: 'APPROVED',
  },
];

/**
 * Initialize and return the complete Document Store
 */
export function getDocumentStore(): DocumentStore {
  return {
    policies: amlPolicies,
    sanction_lists: sanctionLists,
    merchant_ratings: merchantRatings,
    customer_policies: customerPolicies,
    audit_logs: auditLogs,
  };
}

/**
 * Get AML policy by ID
 */
export function getAMLPolicy(policyId: string): AMLPolicy | undefined {
  return amlPolicies.find(p => p.id === policyId);
}

/**
 * Check if entity is sanctioned
 */
export function checkSanctionStatus(entityName: string): SanctionEntity | undefined {
  return sanctionLists.find(s =>
    s.name.toLowerCase().includes(entityName.toLowerCase()) ||
    entityName.toLowerCase().includes(s.name.toLowerCase())
  );
}

/**
 * Get merchant risk rating
 */
export function getMerchantRisk(merchantName: string): MerchantRisk | undefined {
  return merchantRatings.find(m =>
    m.merchant_name.toLowerCase() === merchantName.toLowerCase()
  );
}

/**
 * Get customer policy
 */
export function getCustomerPolicy(userId: string): CustomerPolicy | undefined {
  return customerPolicies.find(p => p.user_id === userId);
}

/**
 * Check if transaction exceeds customer policy limits
 */
export function checkPolicyCompliance(
  userId: string,
  amount: number,
  country: string
): { compliant: boolean; violations: string[] } {
  const policy = getCustomerPolicy(userId);
  if (!policy) {
    return { compliant: false, violations: ['Customer policy not found'] };
  }

  const violations: string[] = [];

  // Check daily limit
  if (amount > policy.daily_limit) {
    violations.push(`Exceeds daily limit of $${policy.daily_limit}`);
  }

  // Check country restrictions
  if (policy.blocked_countries.includes(country)) {
    violations.push(`Transaction to blocked country: ${country}`);
  }

  if (policy.allowed_countries.length > 0 && !policy.allowed_countries.includes(country)) {
    violations.push(`Country ${country} not in allowed list`);
  }

  // Check KYC status
  if (policy.compliance_status === 'FAILED_KYC') {
    violations.push('Customer failed KYC verification');
  }

  return {
    compliant: violations.length === 0,
    violations,
  };
}

/**
 * Log audit event
 */
export function logAuditEvent(
  eventType: 'POLICY_CHANGE' | 'TRANSACTION_BLOCKED' | 'TRANSACTION_APPROVED',
  changedBy: string,
  details: Record<string, any>,
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED' = 'PENDING'
): AuditLog {
  const log: AuditLog = {
    id: `AUDIT_${Date.now()}`,
    timestamp: new Date().toISOString(),
    event_type: eventType,
    changed_by: changedBy,
    details,
    approval_status: approvalStatus,
  };

  auditLogs.push(log);
  return log;
}

/**
 * Get recent audit logs
 */
export function getAuditLogs(limit: number = 10): AuditLog[] {
  return [...auditLogs].reverse().slice(0, limit);
}
