/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFriends, useFriendRequests, useProcessFriendRequest, useDeleteFriend } from '../hooks/useFriends';
import { useSearchUsers } from '../hooks/useSearchUsers';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Users, UserPlus, UserMinus, Check, X, Search } from 'lucide-react';
import { Friend } from '../../../api/user.service';
import FriendTodoView from '../components/FriendTodoView';

export const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [reactionTaskId, setReactionTaskId] = useState<string | null>(null);

  const { data: friendsData, isLoading: friendsLoading, refetch: refetchFriends } = useFriends(currentPage, 20);
  const { data: requestsData, isLoading: requestsLoading, refetch: refetchRequests } = useFriendRequests(currentPage, 20);
  const processRequestMutation = useProcessFriendRequest();
  const deleteFriendMutation = useDeleteFriend();

  // 탭 전환 시 데이터 새로고침
  const handleTabChange = (tab: 'friends' | 'requests' | 'search') => {
    setActiveTab(tab);
    if (tab === 'friends') {
      refetchFriends();
    } else if (tab === 'requests') {
      refetchRequests();
    }
  };

  const {
    searchKeyword,
    setSearchKeyword,
    searchResults,
    isLoading: searchLoading,
    sendFriendRequest,
    isSending
  } = useSearchUsers();

  const handleAcceptRequest = (friendshipId: number) => {
    processRequestMutation.mutate({
      friendshipId,
      status: 'ACCEPTED',
    });
  };

  const handleRejectRequest = (friendshipId: number) => {
    processRequestMutation.mutate({
      friendshipId,
      status: 'REJECTED',
    });
  };

  const handleDeleteFriend = (friendshipId: number) => {
    if (confirm('정말 친구를 삭제하시겠습니까?')) {
      deleteFriendMutation.mutate(friendshipId);
    }
  };

  const handleSendFriendRequest = async (targetUserId: string, nickname: string) => {
    try {
      await sendFriendRequest(targetUserId);
      alert(`${nickname}님에게 친구 요청을 보냈습니다.`);
    } catch (error) {
      console.error('친구 요청 실패:', error);
      alert('친구 요청에 실패했습니다.');
    }
  };

  // 친구 선택 (FriendTodoView에서 자체적으로 tasks 로드)
  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
  };

  if (friendsLoading || requestsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 친구 프로필 모달 */}
        {selectedFriend && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-6">
                <FriendTodoView
                  friend={{
                    id: selectedFriend.userId,
                    nickname: selectedFriend.nickname,
                    tasks: [],
                  }}
                  onBack={() => {
                    setSelectedFriend(null);
                    setReactionTaskId(null);
                  }}
                  reactionTaskId={reactionTaskId}
                  setReactionTaskId={setReactionTaskId}
                />
              </div>
            </div>
          </div>
        )}

        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8" />
            친구 관리
          </h1>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => handleTabChange('friends')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'friends'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                친구 목록 ({friendsData?.totalElements || 0})
              </button>
              <button
                onClick={() => handleTabChange('requests')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'requests'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                받은 요청 ({requestsData?.totalElements || 0})
              </button>
              <button
                onClick={() => handleTabChange('search')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'search'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                친구 찾기
              </button>
            </nav>
          </div>

          {/* 친구 목록 */}
          {activeTab === 'friends' && (
            <div className="divide-y divide-gray-200">
              {friendsData?.content.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  아직 친구가 없습니다.
                </div>
              ) : (
                friendsData?.content.map((friend) => (
                  <div
                    key={friend.friendshipId}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                      onClick={() => handleSelectFriend(friend)}
                    >
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{friend.nickname}</p>
                        <p className="text-sm text-gray-500">{friend.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFriend(friend.friendshipId);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="친구 삭제"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 받은 친구 요청 */}
          {activeTab === 'requests' && (
            <div className="divide-y divide-gray-200">
              {requestsData?.content.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  받은 친구 요청이 없습니다.
                </div>
              ) : (
                requestsData?.content.map((request) => (
                  <div
                    key={request.friendshipId}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{request.nickname}</p>
                        <p className="text-sm text-gray-500">{request.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.friendshipId)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                        title="수락"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.friendshipId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="거절"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 친구 검색 */}
          {activeTab === 'search' && (
            <div>
              {/* 검색 입력 */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="닉네임으로 검색 (최소 2자)"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 검색 결과 */}
              <div className="divide-y divide-gray-200">
                {searchKeyword.length < 2 ? (
                  <div className="p-8 text-center text-gray-500">
                    닉네임을 2자 이상 입력해주세요.
                  </div>
                ) : searchLoading ? (
                  <div className="p-8 flex justify-center">
                    <LoadingSpinner />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={user.userId}
                      className="p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.nickname}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendFriendRequest(user.userId, user.nickname)}
                        disabled={isSending}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="text-sm font-medium">친구 요청</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {((activeTab === 'friends' && friendsData && friendsData.totalPages > 1) ||
          (activeTab === 'requests' && requestsData && requestsData.totalPages > 1)) && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                이전
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {currentPage + 1} /{' '}
                {activeTab === 'friends' ? friendsData?.totalPages : requestsData?.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={
                  currentPage >=
                  ((activeTab === 'friends' ? friendsData?.totalPages : requestsData?.totalPages) || 1) - 1
                }
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
      </div>
    </div>
  );
};
