export interface MerchantInfo {
  id: string;
  name: string;
}

export interface RootCauseStep {
  step: number;
  title: string;
  detail: string;
}

export interface ActionItem {
  id: string;
  action_type: string;
  requires_approval: boolean;
  parameters: Record<string, any>;
  status: 'proposed' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  result?: Record<string, any>;
}

export interface IssueItem {
  id: string;
  signal_id?: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
  estimated_impact_paise: number;
  status: string;
  created_at: string;
  root_cause_chain: RootCauseStep[];
  action?: ActionItem;
}

export interface MorningBriefData {
  date: string;
  merchant: MerchantInfo;
  yesterday_summary: {
    revenue_paise: number;
    orders_count: number;
    avg_order_value_paise: number;
  };
  risk_counts: {
    high: number;
    medium: number;
    low: number;
    total_active: number;
  };
  active_issues: IssueItem[];
  handled_today: IssueItem[];
}

export interface UnderlyingDataResponse {
  type: string;
  title: string;
  hourly_data?: Array<{
    hour: string;
    success: number;
    failed: number;
    failure_rate_pct: number;
  }>;
  methods_breakdown?: Array<{
    method: string;
    total: number;
    failed: number;
    failure_rate_pct: number;
  }>;
  projection?: Array<{
    day: string;
    stock: number;
    safety_threshold: number;
  }>;
  sku?: string;
  daily_burn_rate?: number;
  days_until_stockout?: number;
  customers?: Array<{
    name: string;
    ltv_paise: number;
    days_inactive: number;
    phone: string;
  }>;
  total_at_risk_paise?: number;
  root_error?: string;
}

export interface MetricsSummary {
  time_range: string;
  summary: {
    revenue_at_risk_paise: number;
    revenue_recovered_paise: number;
    recovery_rate_pct: number;
    detection_accuracy_pct: number;
    false_alert_rate_pct: number;
    total_issues_flagged: number;
    actions_executed_count: number;
    actions_pending_count: number;
    actions_auto_count: number;
  };
  ground_truth_benchmark: Array<{
    id: string;
    anomaly_type: string;
    description: string;
    expected_severity: string;
    is_detected: boolean;
  }>;
  timeline: Array<{
    day: string;
    at_risk_paise: number;
    recovered_paise: number;
    accuracy_pct: number;
  }>;
}

export interface ActionPlanCard {
  action_id: string;
  action_type: string;
  title: string;
  summary: string;
  metrics: Record<string, any>;
  requires_approval: boolean;
  estimated_impact_paise: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  structured_plan?: ActionPlanCard;
  timestamp: string;
}

export interface AuditLogItem {
  id: string;
  entity_type: string;
  entity_id: string;
  event: string;
  actor: string;
  payload: Record<string, any>;
  created_at: string;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  supplier_lead_time_days: number;
  unit_cost_paise: number;
  unit_price_paise: number;
  category: string;
}

export interface OrderItem {
  id: string;
  customer_name: string;
  product_name: string;
  amount_paise: number;
  quantity: number;
  status: string;
  payment_method: string;
  created_at: string;
}

export interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_lifetime_value_paise: number;
  last_purchase_at: string | null;
}
