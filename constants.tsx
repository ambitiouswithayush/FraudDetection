import {
  ShieldAlert,
  Activity,
  Search,
  BrainCircuit,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  History,
  Zap,
  BarChart3,
  Clock,
  AlertCircle
} from 'lucide-react';

export const ICONS = {
  Shield: <ShieldAlert className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Search: <Search className="w-4 h-4" />,
  Brain: <BrainCircuit className="w-5 h-5" />,
  Database: <Database className="w-5 h-5" />,
  Check: <CheckCircle className="w-4 h-4" />,
  Block: <XCircle className="w-4 h-4" />,
  Alert: <AlertTriangle className="w-5 h-5" />,
  Lock: <Lock className="w-4 h-4" />,
  History: <History className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  BarChart: <BarChart3 className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  AlertCircle: <AlertCircle className="w-5 h-5" />
};

export const INITIAL_KNOWLEDGE_BASE = [
  {
    id: "CASE_001",
    narrative: "Urgent transfer for medical supplies to overseas vendor",
    merchant: "Medi-Global",
    type: "APP Fraud (Authorized Push Payment)"
  },
  {
    id: "CASE_002",
    narrative: "Refund verification small deposit",
    merchant: "TechRefund Support",
    type: "Refund Scam"
  },
  {
    id: "CASE_003",
    narrative: "Payment for winning lottery tax clearance",
    merchant: "Lottery Commission",
    type: "Advance Fee Fraud"
  }
];