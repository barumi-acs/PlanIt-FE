/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Friend, FriendRequest } from '../types';

let mockFriends: Friend[] = [
  { id: 'f1', nickname: '김철수', tasks: [] },
  { id: 'f2', nickname: '이영희', tasks: [] },
];

let mockRequests: FriendRequest[] = [
  { id: 'r1', nickname: '박지민' },
];

export const friendsApi = {
  getFriends: async (): Promise<Friend[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockFriends;
  },

  getRequests: async (): Promise<FriendRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRequests;
  },

  acceptRequest: async (id: string): Promise<void> => {
    const req = mockRequests.find(r => r.id === id);
    if (req) {
      mockFriends.push({ id: req.id, nickname: req.nickname, tasks: [] });
      mockRequests = mockRequests.filter(r => r.id !== id);
    }
  },

  removeFriend: async (id: string): Promise<void> => {
    mockFriends = mockFriends.filter(f => f.id !== id);
  }
};
