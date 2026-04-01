const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export type ApiErrorCode = 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500;

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  status: number;
}

type QueryParams = Record<string, string | number | boolean | undefined | null>;

class APIClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private buildUrl(endpoint: string, query?: QueryParams): string {
    const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${API_BASE_URL}${normalized}`);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async safeParseJson(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  private toApiError(status: number, body: unknown): ApiError {
    const fallback = `Request failed with status ${status}`;

    if (typeof body === 'object' && body !== null) {
      const record = body as Record<string, unknown>;
      const message =
        (typeof record.message === 'string' && record.message) ||
        (typeof record.error === 'string' && record.error) ||
        fallback;

      return {
        code: status as ApiErrorCode,
        message,
        details: record.error && typeof record.error !== 'string' ? record.error : undefined,
      };
    }

    return {
      code: status as ApiErrorCode,
      message: fallback,
    };
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options?: {
      body?: unknown;
      query?: QueryParams;
      headers?: HeadersInit;
    }
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.query);

    const headers = new Headers(options?.headers);

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const isFormData = options?.body instanceof FormData;
    if (!isFormData) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body:
          options?.body === undefined
            ? undefined
            : isFormData
              ? (options.body as FormData)
              : JSON.stringify(options.body),
      });

      const parsed = await this.safeParseJson(response);

      if (!response.ok) {
        return {
          success: false,
          error: this.toApiError(response.status, parsed),
          status: response.status,
        };
      }

      return {
        success: true,
        data: parsed as T,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Network error',
        },
        status: 500,
      };
    }
  }

  get<T>(endpoint: string, query?: QueryParams, headers?: HeadersInit) {
    return this.request<T>('GET', endpoint, { query, headers });
  }

  post<T>(endpoint: string, body?: unknown, query?: QueryParams, headers?: HeadersInit) {
    return this.request<T>('POST', endpoint, { body, query, headers });
  }

  put<T>(endpoint: string, body?: unknown, query?: QueryParams, headers?: HeadersInit) {
    return this.request<T>('PUT', endpoint, { body, query, headers });
  }

  patch<T>(endpoint: string, body?: unknown, query?: QueryParams, headers?: HeadersInit) {
    return this.request<T>('PATCH', endpoint, { body, query, headers });
  }

  delete<T>(endpoint: string, query?: QueryParams, headers?: HeadersInit) {
    return this.request<T>('DELETE', endpoint, { query, headers });
  }
}

export const apiClient = new APIClient();

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; name: string; email: string }>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post<{ data: { name: string; email: string } }>('/auth/register', {
      name,
      email,
      password,
    }),

  me: () => apiClient.get<{ user: { id: string; name: string; email: string; role: 'CLIENT' | 'DEV'; createdAt: string } }>('/auth/me'),
};

export const jobsAPI = {
  list: (query?: QueryParams) => apiClient.get<{ items: any[]; pagination: any }>('/jobs/listJobs', query),

  getById: (jobId: string) => apiClient.get<any>(`/jobs/${jobId}`),

  create: (payload: {
    title: string;
    description: string;
    budgetMin: number;
    budgetMax: number;
    skillsRequired: string[];
    deadline: string;
  }) => apiClient.post<{ job: any }>('/jobs/createJob', payload),

  apply: (jobId: string, payload: { coverLetter: string; bidAmount: number }) =>
    apiClient.post<{ proposal: any }>(`/jobs/proposal/${jobId}`, payload),

  getJobProposals: (jobId: string) => apiClient.get<{ proposals: any[] }>(`/jobs/proposal/${jobId}`),

  close: (jobId: string) => apiClient.patch<{ updtJob: any }>(`/jobs/${jobId}/close`),
};

export const proposalsAPI = {
  getMine: (query?: QueryParams) => apiClient.get<{ items: any[]; pagination: any }>('/proposals/me', query),

  updateStatus: (proposalId: string, status: 'ACCEPTED' | 'REJECTED') =>
    apiClient.patch<{ updtProposal: any }>(`/proposals/${proposalId}/status`, { status }),

  withdraw: (proposalId: string) => apiClient.patch<{ updtProposal: any }>(`/proposals/${proposalId}/withdraw`),
};

export const contractsAPI = {
  getMine: (query?: QueryParams) => apiClient.get<{ items: any[]; pagination: any }>('/contracts/me', query),

  getById: (contractId: string) => apiClient.get<{ safeContract: any }>(`/contracts/${contractId}`),

  createFromProposal: (proposalId: string) =>
    apiClient.post<{ contract: any }>(`/contracts/from-proposal/${proposalId}`),

  submitDelivery: (contractId: string, payload: { deliveryNote: string; deliveryUrl?: string }) =>
    apiClient.post<any>(`/contracts/${contractId}/deliveries`, payload),

  reviewDelivery: (contractId: string, payload: { action: 'ACCEPT' | 'DISPUTE'; reason?: string }) =>
    apiClient.post<any>(`/contracts/${contractId}/reviews`, payload),
};

export const notificationsAPI = {
  getMine: (query?: QueryParams) => apiClient.get<{ items: any[]; pagination: any }>('/notifications/me', query),

  markAsRead: (notificationId: string) => apiClient.patch<any>(`/notifications/${notificationId}/read`),
};

export const reviewsAPI = {
  getMine: (query?: QueryParams) => apiClient.get<{ items: any[]; pagination?: any }>('/reviews/me', query),

  getDevReviews: (devId: string, query?: QueryParams) =>
    apiClient.get<{ items: any[]; pagination: any; summary: { totalReviews: number; avgRating: number } }>(
      `/reviews/dev/${devId}`,
      query,
    ),

  getByContract: (contractId: string) => apiClient.get<{ review: any | null }>(`/reviews/contract/${contractId}`),

  createForContract: (contractId: string, payload: { rating: number; comment?: string }) =>
    apiClient.post<any>(`/reviews/contracts/${contractId}`, payload),
};

export const paymentsAPI = {
  createForContract: (contractId: string) => apiClient.post<{ payment: any }>(`/payments/contract/${contractId}`),

  release: (paymentId: string) => apiClient.patch<{ updtPayment: any }>(`/payments/${paymentId}/release`),

  checkout: (paymentId: string) => apiClient.post<{ sessionId: string; checkoutUrl: string }>(`/payments/${paymentId}/checkout`),

  logs: (paymentId: string, query?: QueryParams) => apiClient.get<{ items: any[]; totalItems: number; totalPages: number }>(`/payments/${paymentId}/logs`, query),
};
