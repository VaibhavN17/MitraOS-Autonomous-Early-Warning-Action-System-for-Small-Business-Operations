import {
  MerchantInfo,
  MorningBriefData,
  IssueItem,
  UnderlyingDataResponse,
  MetricsSummary,
  ChatMessage,
  AuditLogItem,
  ProductItem,
  OrderItem,
  CustomerItem,
  AuthResponse,
  UserProfile,
  CreateMerchantPayload
} from '../types';

const API_BASE = '/api/v1';

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Authentication failed');
    }
    return res.json();
  },

  async register(payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    business_name?: string;
    category?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getCurrentUser(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  // Multi-business merchants
  async getMerchants(): Promise<MerchantInfo[]> {
    const res = await fetch(`${API_BASE}/data/merchants`);
    if (!res.ok) throw new Error('Failed to fetch business directory');
    return res.json();
  },

  async createMerchant(payload: CreateMerchantPayload): Promise<MerchantInfo> {
    const res = await fetch(`${API_BASE}/data/merchants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create new business');
    return res.json();
  },

  // Morning brief
  async getMorningBrief(merchantId?: string): Promise<MorningBriefData> {
    const url = merchantId ? `${API_BASE}/morning-brief?merchant_id=${merchantId}` : `${API_BASE}/morning-brief`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch morning brief');
    return res.json();
  },

  // Issue details & charts
  async getIssueDetail(issueId: string): Promise<IssueItem> {
    const res = await fetch(`${API_BASE}/issues/${issueId}`);
    if (!res.ok) throw new Error('Failed to fetch issue details');
    return res.json();
  },

  async getUnderlyingData(issueId: string): Promise<UnderlyingDataResponse> {
    const res = await fetch(`${API_BASE}/issues/${issueId}/underlying-data`);
    if (!res.ok) throw new Error('Failed to fetch underlying data');
    return res.json();
  },

  // Actions
  async approveAction(actionId: string, customParameters?: Record<string, any>): Promise<any> {
    const res = await fetch(`${API_BASE}/actions/${actionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_parameters: customParameters })
    });
    if (!res.ok) throw new Error('Failed to approve action');
    return res.json();
  },

  async rejectAction(actionId: string, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/actions/${actionId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to reject action');
    return res.json();
  },

  async updateActionParameters(actionId: string, parameters: Record<string, any>): Promise<any> {
    const res = await fetch(`${API_BASE}/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parameters })
    });
    if (!res.ok) throw new Error('Failed to update action parameters');
    return res.json();
  },

  // Chat
  async sendChatMessage(message: string, merchantId?: string): Promise<{ id: string; reply: string; structured_plan?: any; created_at: string }> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, merchant_id: merchantId })
    });
    if (!res.ok) throw new Error('Failed to communicate with conversational agent');
    return res.json();
  },

  // Metrics
  async getMetrics(timeRange: string = '7d', merchantId?: string): Promise<MetricsSummary> {
    const url = merchantId 
      ? `${API_BASE}/metrics?time_range=${timeRange}&merchant_id=${merchantId}` 
      : `${API_BASE}/metrics?time_range=${timeRange}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch metrics summary');
    return res.json();
  },

  // Live Simulator (Judge Demo Engine)
  async injectLiveAnomaly(anomalyType: string, merchantId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/inject-anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anomaly_type: anomalyType, merchant_id: merchantId })
    });
    if (!res.ok) throw new Error('Failed to inject anomaly');
    return res.json();
  },

  async resetDatabase(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo dataset');
    return res.json();
  },

  async runPipeline(merchantId?: string): Promise<any> {
    const url = merchantId ? `${API_BASE}/simulator/run-pipeline?merchant_id=${merchantId}` : `${API_BASE}/simulator/run-pipeline`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger pipeline pass');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(limit: number = 50, actor?: string, merchantId?: string): Promise<AuditLogItem[]> {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    if (actor) params.set('actor', actor);
    if (merchantId) params.set('merchant_id', merchantId);

    const res = await fetch(`${API_BASE}/audit?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Business Data
  async getProducts(merchantId?: string): Promise<ProductItem[]> {
    const url = merchantId ? `${API_BASE}/data/products?merchant_id=${merchantId}` : `${API_BASE}/data/products`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getRecentOrders(limit: number = 25, merchantId?: string): Promise<OrderItem[]> {
    const url = merchantId 
      ? `${API_BASE}/data/orders?limit=${limit}&merchant_id=${merchantId}` 
      : `${API_BASE}/data/orders?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch recent orders');
    return res.json();
  },

  async getCustomers(limit: number = 50, merchantId?: string): Promise<CustomerItem[]> {
    const url = merchantId 
      ? `${API_BASE}/data/customers?limit=${limit}&merchant_id=${merchantId}` 
      : `${API_BASE}/data/customers?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  }
};
