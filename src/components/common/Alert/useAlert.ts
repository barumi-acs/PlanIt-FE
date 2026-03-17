/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useContext } from 'react';
import { AlertContext } from './AlertProvider';

/**
 * Alert 표시를 위한 Custom Hook
 * 
 * @example
 * ```tsx
 * const { success, error, warning, info } = useAlert();
 * 
 * // 성공 메시지
 * success('저장되었습니다!');
 * 
 * // 에러 메시지
 * error('저장에 실패했습니다.');
 * 
 * // 경고 메시지
 * warning('카테고리를 3개 이상 선택해주세요.');
 * 
 * // 정보 메시지
 * info('처리 중입니다...');
 * ```
 */
export const useAlert = () => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }

  return context;
};
