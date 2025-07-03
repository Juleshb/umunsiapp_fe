import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, FaceSmileIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import postService from '../services/postService';
import toast from 'react-hot-toast';

const CreatePostModal = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [location, setLocation] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);

  const emojis = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '💯', '✨', '🚀', '💪'];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setImage(null);
      setImagePreview('');
      setLocation('');
      setShowEmoji(false);
      setLoading(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const postData = {
        content: content.trim(),
        location: location.trim() || undefined,
        image: image || undefined,
      };

      const response = await postService.createPost(postData);
      
      if (response.success) {
        toast.success('Post created successfully!');
        onSave(response.data);
        onClose();
      } else {
        toast.error(response.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Create post error:', error);
      toast.error(error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const addEmoji = (emoji) => {
    setContent(prev => prev + emoji);
    setShowEmoji(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Create Post</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {/* User info */}
          <div className="flex items-center gap-3 mb-4">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.firstName} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div>
              <div className="font-semibold">{user?.firstName} {user?.lastName}</div>
              <div className="text-sm text-gray-500">Public</div>
            </div>
          </div>

          {/* Content input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border-0 resize-none text-lg focus:outline-none"
            rows={4}
            disabled={loading}
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mb-4">
              <img src={imagePreview} alt="preview" className="w-full max-h-96 object-cover rounded-lg" />
              <button 
                onClick={() => { setImage(null); setImagePreview(''); }}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-colors"
                disabled={loading}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Location input */}
          <div className="mb-4">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between p-3 border-t">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <PhotoIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              
              <div className="relative">
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={loading}
                >
                  <FaceSmileIcon className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-gray-700">Emoji</span>
                </button>
                {showEmoji && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg p-2 shadow-lg z-10">
                    <div className="grid grid-cols-5 gap-1">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => addEmoji(emoji)}
                          className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!content.trim() || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal; 