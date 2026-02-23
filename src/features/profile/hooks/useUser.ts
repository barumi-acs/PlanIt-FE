/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../../api/user.service';
import { UserProfile } from '../../../types';

export const useUser = () => {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<UserProfile>) => userService.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  return {
    profile,
    updateProfile: updateProfileMutation.mutate,
    isInitialized: !!profile?.nickname,
  };
};
