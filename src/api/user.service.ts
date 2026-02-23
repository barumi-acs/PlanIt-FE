/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseApiService, apiClients } from './base';
import { UserProfile, Friend, FriendRequest } from '../types';

// Mock 데이터 (개발용)
let mockUser: UserProfile = {
  id: '1',
  nickname: '',
  keywords: [],
  email: 'user@example.com'
};

let mockFriends: Friend[] = [
  { id: 'f1', nickname: '김철수', tasks: [] },
  { id: 'f2', nickname: '이영희', tasks: [] },
];

let mockRequests: FriendRequest[] = [
  { id: 'r1', nickname: '박지민' },
];

/**
 * User Service API
 * 사용자 프로필, 친구 관리 등을 담당
 */
class UserService extends BaseApiService {
  // Mock 모드 여부 (개발 환경에서는 true)
  private useMock = import.meta.env.DEV;

  constructor() {
    super(apiClients.user);
  }

  /**
   * 사용자 프로필 조회
   */
  async getProfile(): Promise<UserProfile> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockUser;
    }
    return this.get<UserProfile>('/api/v1/profile');
  }

  /**
   * 사용자 프로필 수정
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockUser = { ...mockUser, ...updates };
      return mockUser;
    }
    return this.patch<UserProfile>('/api/v1/profile', updates);
  }

  /**
   * 친구 목록 조회
   */
  async getFriends(): Promise<Friend[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockFriends;
    }
    return this.get<Friend[]>('/api/v1/friends');
  }

  /**
   * 친구 요청 목록 조회
   */
  async getFriendRequests(): Promise<FriendRequest[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockRequests;
    }
    return this.get<FriendRequest[]>('/api/v1/friends/requests');
  }

  /**
   * 친구 요청 수락
   */
  async acceptFriendRequest(requestId: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const req = mockRequests.find(r => r.id === requestId);
      if (req) {
        mockFriends.push({ id: req.id, nickname: req.nickname, tasks: [] });
        mockRequests = mockRequests.filter(r => r.id !== requestId);
      }
      return;
    }
    return this.post<void>(`/api/v1/friends/requests/${requestId}/accept`);
  }

  /**
   * 친구 삭제
   */
  async removeFriend(friendId: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockFriends = mockFriends.filter(f => f.id !== friendId);
      return;
    }
    return this.delete<void>(`/api/v1/friends/${friendId}`);
  }

  /**
   * 친구 요청 보내기
   */
  async sendFriendRequest(userId: string): Promise<FriendRequest> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newRequest: FriendRequest = {
        id: `r${Date.now()}`,
        nickname: `User ${userId}`,
      };
      mockRequests.push(newRequest);
      return newRequest;
    }
    return this.post<FriendRequest>('/api/v1/friends/requests', { userId });
  }

  /**
   * 친구 요청 거절
   */
  async rejectFriendRequest(requestId: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockRequests = mockRequests.filter(r => r.id !== requestId);
      return;
    }
    return this.delete<void>(`/api/v1/friends/requests/${requestId}`);
  }
}

export const userService = new UserService();

// 하위 호환성을 위한 별칭 export
export const userApi = {
  getProfile: () => userService.getProfile(),
  updateProfile: (updates: Partial<UserProfile>) => userService.updateProfile(updates),
};

export const friendsApi = {
  getFriends: () => userService.getFriends(),
  getRequests: () => userService.getFriendRequests(),
  acceptRequest: (id: string) => userService.acceptFriendRequest(id),
  removeFriend: (id: string) => userService.removeFriend(id),
};
