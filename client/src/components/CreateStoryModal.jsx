import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, DocumentTextIcon, SparklesIcon, CameraIcon } from '@heroicons/react/24/outline';

const CreateStoryModal = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const [storyType, setStoryType] = useState('text');
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStoryType('text');
      setText('');
      setImage(null);
      setImagePreview('');
      setTextColor('#000000');
      setBackgroundColor('#ffffff');
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

  const handleSave = () => {
    // Create story data in the format expected by the backend
    const storyData = {
      content: storyType === 'text' ? text : '',
      image: storyType === 'image' ? image : null,
      textColor: storyType === 'text' ? textColor : null,
      backgroundColor: storyType === 'text' ? backgroundColor : null
    };
    
    onSave(storyData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const colorOptions = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ];

  const bgColorOptions = [
    '#ffffff', '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1',
    '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Your Story</h2>
              <p className="text-sm text-gray-500">Share a moment with your friends</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Story type selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Story Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setStoryType('text')}
              disabled={isLoading}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                storyType === 'text' 
                  ? 'border-purple-500 bg-purple-50 text-purple-600 shadow-md' 
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <DocumentTextIcon className="h-8 w-8" />
              <span className="font-medium">Text Story</span>
            </button>
            <button
              onClick={() => setStoryType('image')}
              disabled={isLoading}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                storyType === 'image' 
                  ? 'border-purple-500 bg-purple-50 text-purple-600 shadow-md' 
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <CameraIcon className="h-8 w-8" />
              <span className="font-medium">Photo Story</span>
            </button>
          </div>
        </div>

        {/* Content input */}
        {storyType === 'text' ? (
          <div className="space-y-4">
            {/* Text input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Story Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind? Share your thoughts..."
                className="w-full p-4 border border-gray-300 rounded-xl resize-none h-32 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                maxLength={100}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">{text.length}/100 characters</span>
                <span className="text-xs text-gray-400">Stories last 24 hours</span>
              </div>
            </div>

            {/* Color customization */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Text Color</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setTextColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      textColor === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Background Color</label>
              <div className="flex gap-2 flex-wrap">
                {bgColorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      backgroundColor === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            {text && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preview</label>
                <div 
                  className="w-full h-32 rounded-xl flex items-center justify-center p-4 text-center"
                  style={{ 
                    backgroundColor: backgroundColor,
                    color: textColor
                  }}
                >
                  <span className="text-lg font-medium">{text}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={isLoading}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Click to upload an image</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>
            </div>
            
            {imagePreview && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preview</label>
                <div className="relative">
                  <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
                  <button 
                    onClick={() => { setImage(null); setImagePreview(''); }}
                    disabled={isLoading}
                    className="absolute top-3 right-3 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || (storyType === 'text' ? !text.trim() : !image)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Create Story
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryModal; 