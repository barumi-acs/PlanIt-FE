/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API 응답 공통 타입 (백엔드 표준 응답 형식)
 * - 백엔드 ApiResponse 형식: { code, message, data, timestamp }
 * - 레거시 형식도 지원: { success, data, message }
 */
export interface ApiResponse<T = any> {
  code: string;       // e.g. "C2001"
  message: string;    // e.g. "성공"
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
      // 인증 토큰이 있다면 헤더에 추가
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // 개발 단계용 테스트 유저 ID 추가 (모든 서비스 공통)
      config.headers['X-User-Id'] = 'test-user';
      
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
      // 에러 처리 로직
      if (error.response?.status === 401) {
        // ✅ auth 경로는 401이어도 리다이렉트 제외 (login, signup, check-withdrawn 등)
        const isAuthPath = error.config?.url?.includes('/auth/');
        if (!isAuthPath) {
          localStorage.removeItem('accessToken');
          window.location.href = '/';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * 각 서비스별 Axios 인스턴스
 */
export const apiClients = {
  user: createApiClient(SERVICE_URLS.USER),
  schedule: createApiClient(SERVICE_URLS.SCHEDULE),
  intelligence: createApiClient(SERVICE_URLS.INTELLIGENCE),
  insight: createApiClient(SERVICE_URLS.INSIGHT),
} as const;

/**
 * 공통 API 호출 헬퍼 함수
 */
export class BaseApiService {
  constructor(protected client: AxiosInstance) { }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      
      // 백엔드 ApiResponse 표준에 따라 성공 코드 확인
      // C2001: 성공, 200/201: 일반 성공
      const code = response.data.code?.toString();
      const isSuccess = code === '200' || code === '201' || code === 'C2001';
      
      if (code && !isSuccess) {
        const error = new Error(response.data.message || 'API Error');
        (error as any).response = response;
        throw error;
      }
      
      return response.data.data;
    } catch (error) {
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
