/**
 * API Client — Plataforma Ares
 *
 * Cliente HTTP con interceptor de JWT automático.
 * Detecta respuestas 403 (suscripción vencida) y redirige
 * a la pantalla de renovación.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('ares_token');
  }

  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, skipAuth = false } = options;

    const token = this.getToken();

    const isFormData = body instanceof FormData;
    const finalHeaders: Record<string, string> = {
      ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };
    if (!isFormData && !finalHeaders['Content-Type']) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers: finalHeaders,
      ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Manejar 403 — suscripción vencida o suspendida
    if (response.status === 403) {
      const data = await response.json();
      if (data.reason === 'expired' || data.reason === 'suspended') {
        if (typeof window !== 'undefined') {
          // Guardar la razón para mostrarla en la pantalla de renovación
          localStorage.setItem('ares_block_reason', JSON.stringify(data));
          window.location.href = '/renovar';
        }
      }
      throw new ApiError(data.error || data.message, 403, data);
    }

    // Manejar 401 — Token missing o inválido
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ares_token');
        localStorage.removeItem('ares_vendor');
        window.location.href = '/'; // Redirect to login
      }
      throw new ApiError('Token de autenticación requerido', 401);
    }

    if (!response.ok) {
      console.error(`API Error [${response.status}] at ${API_BASE}${endpoint}`);
      const data = await response.json().catch(() => ({ error: 'Error de red' }));
      throw new ApiError(data.error || 'Error desconocido', response.status, data);
    }

    return response.json();
  }

  // Shortcuts
  get<T = any>(endpoint: string, skipAuth = false) {
    return this.request<T>(endpoint, { skipAuth });
  }

  post<T = any>(endpoint: string, body?: any, skipAuth = false) {
    return this.request<T>(endpoint, { method: 'POST', body, skipAuth });
  }

  put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  patch<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();
export default api;
