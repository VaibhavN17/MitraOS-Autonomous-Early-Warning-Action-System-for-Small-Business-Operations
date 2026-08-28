import {
  MorningBriefData,
  IssueItem,
  UnderlyingDataResponse,
  MetricsSummary,
  ChatMessage,
  AuditLogItem,
  ProductItem,
  OrderItem,
  CustomerItem
} from '../types';

const API_BASE = '/api/v1';

export const api = {
  // Morning brief
  async getMorningBrief(): Promise<MorningBriefData> {
    const res = await fetch(`${API_BASE}/morning-brief`);
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
  async sendChatMessage(message: string): Promise<{ id: string; reply: string; structured_plan?: any; created_at: string }> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error('Failed to communicate with conversational agent');
    return res.json();
  },

  // Metrics
  async getMetrics(timeRange: string = '7d'): Promise<MetricsSummary> {
    const res = await fetch(`${API_BASE}/metrics?time_range=${timeRange}`);
    if (!res.ok) throw new Error('Failed to fetch metrics summary');
    return res.json();
  },

  // Live Simulator (Judge Demo Engine)
  async injectLiveAnomaly(anomalyType: string): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/inject-anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anomaly_type: anomalyType })
    });
    if (!res.ok) throw new Error('Failed to inject anomaly');
    return res.json();
  },

  async resetDatabase(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo dataset');
    return res.json();
  },

  async runPipeline(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/run-pipeline`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger pipeline pass');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(limit: number = 50, actor?: string): Promise<AuditLogItem[]> {
    const url = actor ? `${API_BASE}/audit?limit=${limit}&actor=${actor}` : `${API_BASE}/audit?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Business Data
  async getProducts(): Promise<ProductItem[]> {
    const res = await fetch(`${API_BASE}/data/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getRecentOrders(): Promise<OrderItem[]> {
    const res = await fetch(`${API_BASE}/data/orders`);
    if (!res.ok) throw new Error('Failed to fetch recent orders');
    return res.json();
  },

  async getCustomers(): Promise<CustomerItem[]> {
    const res = await fetch(`${API_BASE}/data/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  }
};
