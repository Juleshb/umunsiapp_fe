import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, UserPlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import userService from '../services/userService';
import friendService from '../services/friendService';

const FindFriends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Load friend requests on component mount
  useEffect(() => {
    loadFriendRequests();
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Find Friends</h1>
        <p className="text-gray-600">Search for people and connect with them</p>
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username, first name, or last name..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Search Results */}
        {searching && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Searching...</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Search Results</h3>
            {searchResults.map((user) => {
              const requestStatus = getRequestStatus(user.id);
              
              return (
                <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <img
                      src={user.avatar || 'https://via.placeholder.com/40'}
                      alt={user.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-gray-500 text-sm">@{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {requestStatus === 'pending' ? (
                      <button
                        onClick={() => cancelFriendRequest(pendingRequests.find(req => req.receiver.id === user.id)?.id)}
                        className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel Request
                      </button>
                    ) : requestStatus === 'received' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => acceptFriendRequest(friendRequests.find(req => req.sender.id === user.id)?.id)}
                          className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectFriendRequest(friendRequests.find(req => req.sender.id === user.id)?.id)}
                          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => sendFriendRequest(user.id)}
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <UserPlusIcon className="h-4 w-4" />
                        <span>Add Friend</span>
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
            <p className="text-gray-500">No users found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Friend Requests Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Friend Requests</h3>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        ) : friendRequests.length > 0 ? (
          <div className="space-y-4">
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-4">
                  <img
                    src={request.sender.avatar || 'https://via.placeholder.com/40'}
                    alt={request.sender.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {request.sender.firstName} {request.sender.lastName}
                    </h4>
                    <p className="text-gray-500 text-sm">@{request.sender.username}</p>
                    <p className="text-gray-400 text-xs">Wants to be your friend</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => acceptFriendRequest(request.id)}
                    className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request.id)}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending friend requests</p>
          </div>
        )}
      </div>

      {/* Sent Requests Section */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sent Requests</h3>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-4">
                  <img
                    src={request.receiver.avatar || 'https://via.placeholder.com/40'}
                    alt={request.receiver.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {request.receiver.firstName} {request.receiver.lastName}
                    </h4>
                    <p className="text-gray-500 text-sm">@{request.receiver.username}</p>
                    <p className="text-gray-400 text-xs">Request sent</p>
                  </div>
                </div>
                
                <button
                  onClick={() => cancelFriendRequest(request.id)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindFriends; 