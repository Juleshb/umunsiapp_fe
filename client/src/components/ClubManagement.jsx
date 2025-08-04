import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Clock, Check, X, Trash2, Crown, Shield } from 'lucide-react';
import clubService from '../services/clubService';
import { useAuth } from '../contexts/AuthContext';

const ClubManagement = ({ club, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const userMembership = club.members?.find(m => m.userId === user?.id);
  const isOwner = userMembership?.role === 'owner' || club.userRole === 'owner';
  const isAdmin = userMembership?.role === 'admin' || club.userRole === 'admin' || isOwner;
  const canManage = isOwner || isAdmin;

  useEffect(() => {
    if (activeTab === 'members') {
      loadMembers();
    } else if (activeTab === 'requests' && canManage) {
      loadJoinRequests();
    }
  }, [activeTab, currentPage]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await clubService.getClubMembers(club.id, currentPage);
      setMembers(response.data.members);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJoinRequests = async () => {
    try {
      setLoading(true);
      const response = await clubService.getClubJoinRequests(club.id, currentPage);
      setJoinRequests(response.data.joinRequests);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error loading join requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (requestId, action) => {
    try {
      await clubService.handleJoinRequest(club.id, requestId, action);
      // Reload both members and requests
      loadMembers();
      loadJoinRequests();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error handling join request:', error);
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await clubService.removeMember(club.id, memberId);
      loadMembers();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (role) {
      case 'owner':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'admin':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!canManage) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Club Members</h3>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading members...</div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.firstName}&background=random`}
                    alt={member.user.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{member.user.firstName} {member.user.lastName}</p>
                    <p className="text-sm text-gray-500">@{member.user.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getRoleIcon(member.role)}
                  <span className={getRoleBadge(member.role)}>
                    {member.role}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="inline h-4 w-4 mr-2" />
            Members ({members.length})
          </button>
          {canManage && (
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="inline h-4 w-4 mr-2" />
              Join Requests ({joinRequests.length})
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Club Members</h3>
              <button
                onClick={() => setActiveTab('add-member')}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">Loading members...</div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.firstName}&background=random`}
                        alt={member.user.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{member.user.firstName} {member.user.lastName}</p>
                        <p className="text-sm text-gray-500">@{member.user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(member.role)}
                        <span className={getRoleBadge(member.role)}>
                          {member.role}
                        </span>
                      </div>
                      {canManage && member.role !== 'owner' && member.userId !== user?.id && (
                        <button
                          onClick={() => removeMember(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Pending Join Requests</h3>
            
            {loading ? (
              <div className="text-center py-8">Loading requests...</div>
            ) : joinRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending join requests
              </div>
            ) : (
              <div className="space-y-3">
                {joinRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={request.user.avatar || `https://ui-avatars.com/api/?name=${request.user.firstName}&background=random`}
                        alt={request.user.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{request.user.firstName} {request.user.lastName}</p>
                        <p className="text-sm text-gray-500">@{request.user.username}</p>
                        {request.message && (
                          <p className="text-sm text-gray-600 mt-1">"{request.message}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleJoinRequest(request.id, 'approve')}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleJoinRequest(request.id, 'reject')}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-member' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Add Member</h3>
            <p className="text-gray-600 mb-4">
              This feature will be implemented to allow searching and adding users directly to the club.
            </p>
            <button
              onClick={() => setActiveTab('members')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Members
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManagement; 