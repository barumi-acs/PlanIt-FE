/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API 응답 공통 타입 (백엔드 표준 응답 형식)
 * - 백엔드 ApiResponse 형식: { code, message, data, timestamp }
 */
export interface ApiResponse<T = any> {
  code: string | number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * 레거시 API 응답 타입 (하위 호환성)
 */
export interface LegacyApiResponse<T = any> {
  success: boolean;
  data: T;
  timestamp: string;
}

/**
 * API 에러 응답 타입
 */
export interface ApiError {
  code: string;
  message: string;
}

/**
 * 서비스별 Base URL 설정
 */
export const SERVICE_URLS = {
  USER: import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081',
  SCHEDULE: import.meta.env.VITE_SCHEDULE_SERVICE_URL || 'http://localhost:8082',
  INTELLIGENCE: import.meta.env.VITE_INTELLIGENCE_SERVICE_URL || 'http://localhost:8083',
  INSIGHT: import.meta.env.VITE_INSIGHT_SERVICE_URL || 'http://localhost:8084',
} as const;

/**
 * 공통 Axios 인스턴스 생성 함수
 */
export const createApiClient = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor
  instance.interceptors.request.use(
    (config) => {
      // 1. JWT 토큰 주입
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // 2. 실제 유저 ID 주입 (X-User-Id 헤더)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.userId) {
            config.headers['X-User-Id'] = user.userId;
          }
        } catch (e) {
          console.error('[BaseApiService] Failed to parse user from localStorage', e);
        }
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        const isAuthPath = error.config?.url?.includes('/auth/');
        if (!isAuthPath) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userId');
          window.location.href = '/';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClients = {
  user: createApiClient(SERVICE_URLS.USER),
  schedule: createApiClient(SERVICE_URLS.SCHEDULE),
  intelligence: createApiClient(SERVICE_URLS.INTELLIGENCE),
  insight: createApiClient(SERVICE_URLS.INSIGHT),
} as const;

export class BaseApiService {
  constructor(protected client: AxiosInstance) { }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      
      const rawCode = response.data.code?.toString();
      
      // 🎯 물리적 핵심: 백엔드 커스텀 코드(C2001 등) 및 표준 코드(200, 201) 모두 성공으로 인정
      const isSuccess = 
        (rawCode && (rawCode.startsWith('2') || rawCode.startsWith('C2'))) || 
        (!rawCode && response.status >= 200 && response.status < 300);

      if (isSuccess) {
        return response.data.data;
      }
      
      const error = new Error(response.data.message || `API Error (${rawCode})`);
      (error as any).response = response;
      throw error;
      
    } catch (error) {
      if ((error as any).response) throw error;
      console.error(`[BaseApiService] POST ${url} 실패:`, error);
      throw error;
    }
  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  protected async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }
}
