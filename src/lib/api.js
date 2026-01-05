const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Auth methods
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    this.setToken(data.token);
    return data;
  }

  async register(email, password, full_name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: { email, password, full_name },
    });
    this.setToken(data.token);
    return data;
  }

  // Candidates methods
  async getCandidates() {
    return this.request('/candidates');
  }

  async createCandidate(candidate) {
    return this.request('/candidates', {
      method: 'POST',
      body: candidate,
    });
  }

  async updateCandidate(id, updates) {
    return this.request(`/candidates/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteCandidate(id) {
    return this.request(`/candidates/${id}`, {
      method: 'DELETE',
    });
  }

  // Calls methods
  async makeCall(callData) {
    return this.request('/calls/make-call', {
      method: 'POST',
      body: callData,
    });
  }

  async getCalls() {
    return this.request('/calls');
  }

  async updateCall(id, updates) {
    return this.request(`/calls/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  // Settings methods
  async getPhoneNumbers() {
    return this.request('/settings/phone-numbers');
  }

  async addPhoneNumber(phoneData) {
    return this.request('/settings/phone-numbers', {
      method: 'POST',
      body: phoneData,
    });
  }

  async getCompanies() {
    return this.request('/settings/companies');
  }

  async addCompany(companyData) {
    return this.request('/settings/companies', {
      method: 'POST',
      body: companyData,
    });
  }
}

export const apiClient = new ApiClient();