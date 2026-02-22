/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../../api/user.api';
import { UserProfile } from '../../../types';

export const useUser = () => {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: userApi.getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: userApi.updateProfile,
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
