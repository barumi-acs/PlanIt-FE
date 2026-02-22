/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../types';

let mockUser: UserProfile = {
  id: '1',
  nickname: '',
  keywords: [],
  email: 'user@example.com'
};

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUser;
  },

  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    mockUser = { ...mockUser, ...updates };
    return mockUser;
  }
};
