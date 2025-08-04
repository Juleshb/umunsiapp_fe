import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, Users, UserCheck, Clock, AlertCircle, Sparkles, UserX } from 'lucide-react';
import userService from '../services/userService';
import friendService from '../services/friendService';

const FindFriends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('suggested'); // 'suggested', 'search', 'requests', 'sent'

  // Load friend requests and suggested friends on component mount
  useEffect(() => {
    loadFriendRequests();
    loadSuggestedFriends();
  }, []);

  const loadFriendRequests = async () => {
    try {
      setLoading(true);
      const [receivedRes, sentRes] = await Promise.all([
        friendService.getFriendRequests('received'),
        friendService.getFriendRequests('sent')
      ]);
      
      setFriendRequests(receivedRes.data || []);
      setPendingRequests(sentRes.data || []);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestedFriends = async () => {
    try {
      setLoadingSuggestions(true);
      const response = await userService.getSuggestedFriends();
      setSuggestedFriends(response.data?.suggestions || []);
    } catch (error) {
      console.error('Error loading suggested friends:', error);
      // Fallback: show some mock suggestions if API fails
      setSuggestedFriends([
        {
          id: 'suggested-1',
          firstName: 'Alex',
          lastName: 'Johnson',
          username: 'alexj',
          avatar: null,
          mutualFriends: 3,
          isSuggested: true
        },
        {
          id: 'suggested-2',
          firstName: 'Sarah',
          lastName: 'Williams',
          username: 'sarahw',
          avatar: null,
          mutualFriends: 5,
          isSuggested: true
        },
        {
          id: 'suggested-3',
          firstName: 'Michael',
          lastName: 'Brown',
          username: 'mikeb',
          avatar: null,
          mutualFriends: 2,
          isSuggested: true
        }
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await userService.searchUsers(query);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => searchUsers(query), 300);
  };

  let searchTimeout;

  const sendFriendRequest = async (userId) => {
    try {
      await friendService.sendFriendRequest(userId);
      
      // Update search results to show pending status
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, requestStatus: 'pending' }
            : user
        )
      );

      // Update suggested friends to show pending status
      setSuggestedFriends(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, requestStatus: 'pending' }
            : user
        )
      );
      
      // Reload friend requests
      loadFriendRequests();
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      loadFriendRequests();
      // Reload suggested friends to remove the newly accepted friend
      loadSuggestedFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      loadFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const cancelFriendRequest = async (requestId) => {
    try {
      await friendService.cancelFriendRequest(requestId);
      loadFriendRequests();
    } catch (error) {
      console.error('Error canceling friend request:', error);
    }
  };

  const getRequestStatus = (userId) => {
    // Check if user has a pending request from us
    const pendingRequest = pendingRequests.find(req => req.receiver.id === userId);
    if (pendingRequest) return 'pending';
    
    // Check if we have a pending request from them
    const receivedRequest = friendRequests.find(req => req.sender.id === userId);
    if (receivedRequest) return 'received';
    
    return null;
  };

  const getUserAvatar = (user) => {
    if (!user) return 'https://ui-avatars.com/api/?name=Unknown&background=random';
    if (user.avatar) {
      if (user.avatar.startsWith('http')) return user.avatar;
      return `http://localhost:5002/uploads/avatars/${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${user.firstName || user.username || 'Unknown'}&background=random`;
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('suggested')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'suggested'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Suggested ({suggestedFriends.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Search className="h-4 w-4 mr-2" />
            Find People
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Requests ({friendRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Clock className="h-4 w-4 mr-2" />
            Sent ({pendingRequests.length})
          </button>
        </div>
      </div>

      {/* Suggested Friends Tab */}
      {activeTab === 'suggested' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
              Suggested Friends ({suggestedFriends.length})
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              People you might know based on your connections and interests
            </p>
            
            {loadingSuggestions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Finding suggestions...</p>
              </div>
            ) : suggestedFriends.length > 0 ? (
              <div className="space-y-3">
                {suggestedFriends.map((user) => {
                  const requestStatus = getRequestStatus(user.id);
                  
                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                      <div className="flex items-center space-x-4">
                        <img
                          src={getUserAvatar(user)}
                          alt={user.firstName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                        />
                        <div>
                          <h4 className="font-semibold text-white">
                            {user.firstName} {user.lastName}
                          </h4>
                          <p className="text-gray-400 text-sm">@{user.username}</p>
                          {user.mutualFriends && (
                            <p className="text-gray-500 text-xs">
                              {user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {requestStatus === 'pending' ? (
                          <button
                            onClick={() => cancelFriendRequest(pendingRequests.find(req => req.receiver.id === user.id)?.id)}
                            className="px-4 py-2 text-sm text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors flex items-center"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        ) : requestStatus === 'received' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => acceptFriendRequest(friendRequests.find(req => req.sender.id === user.id)?.id)}
                              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </button>
                            <button
                              onClick={() => rejectFriendRequest(friendRequests.find(req => req.sender.id === user.id)?.id)}
                              className="px-4 py-2 text-sm text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors flex items-center"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => sendFriendRequest(user.id)}
                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserX className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No suggestions available</p>
                <p className="text-gray-500 text-sm mt-1">Try searching for people instead</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Section */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username, first name, or last name..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              />
            </div>

            {/* Search Results */}
            {searching && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Searching...</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-400" />
                  Search Results ({searchResults.length})
                </h3>
                {searchResults.map((user) => {
                  const requestStatus = getRequestStatus(user.id);
                  
                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                      <div className="flex items-center space-x-4">
                        <img
                          src={getUserAvatar(user)}
                          alt={user.firstName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                        />
                        <div>
                          <h4 className="font-semibold text-white">
                            {user.firstName} {user.lastName}
                          </h4>
                          <p className="text-gray-400 text-sm">@{user.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {requestStatus === 'pending' ? (
                          <button
                            onClick={() => cancelFriendRequest(pendingRequests.find(req => req.receiver.id === user.id)?.id)}
                            className="px-4 py-2 text-sm text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors flex items-center"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        ) : requestStatus === 'received' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => acceptFriendRequest(friendRequests.find(req => req.sender.id === user.id)?.id)}
                              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </button>
                            <button
                              onClick={() => rejectFriendRequest(friendRequests.find(req => req.sender.id === user.id)?.id)}
                              className="px-4 py-2 text-sm text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors flex items-center"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => sendFriendRequest(user.id)}
                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No users found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friend Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-green-400" />
              Friend Requests ({friendRequests.length})
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading...</p>
              </div>
            ) : friendRequests.length > 0 ? (
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-4">
                      <img
                        src={getUserAvatar(request.sender)}
                        alt={request.sender.firstName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                      />
                      <div>
                        <h4 className="font-semibold text-white">
                          {request.sender.firstName} {request.sender.lastName}
                        </h4>
                        <p className="text-gray-400 text-sm">@{request.sender.username}</p>
                        <p className="text-gray-500 text-xs">Wants to be your friend</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => acceptFriendRequest(request.id)}
                        className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(request.id)}
                        className="px-4 py-2 text-sm text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No pending friend requests</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sent Requests Tab */}
      {activeTab === 'sent' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-400" />
              Sent Requests ({pendingRequests.length})
            </h3>
            
            {pendingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-4">
                      <img
                        src={getUserAvatar(request.receiver)}
                        alt={request.receiver.firstName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                      />
                      <div>
                        <h4 className="font-semibold text-white">
                          {request.receiver.firstName} {request.receiver.lastName}
                        </h4>
                        <p className="text-gray-400 text-sm">@{request.receiver.username}</p>
                        <p className="text-gray-500 text-xs">Request sent</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => cancelFriendRequest(request.id)}
                      className="px-4 py-2 text-sm text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel Request
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No sent requests</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindFriends; 