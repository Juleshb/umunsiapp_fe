import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const StoryViewer = ({ story, currentSlideIndex = 0, onClose, onNext, onPrevious, hasNext, hasPrevious }) => {
  const [progress, setProgress] = useState(0);

  const slides = story.slides || [
    { type: 'image', content: story.user.avatar, duration: 5000 },
    { type: 'text', content: 'Hello from ' + story.user.name + '! 👋', duration: 3000 },
  ];

  useEffect(() => {
    setProgress(0);
  }, [currentSlideIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentSlideIndex < slides.length - 1) {
            onNext();
          } else if (hasNext) {
            onNext();
          } else {
            onClose();
          }
          return 0;
        }
        return prev + 1;
      });
    }, slides[currentSlideIndex]?.duration / 100 || 50);

    return () => clearInterval(timer);
  }, [currentSlideIndex, slides, hasNext, onNext, onClose]);

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      onNext();
    } else if (hasNext) {
      onNext();
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      onPrevious();
    } else if (hasPrevious) {
      onPrevious();
    }
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < width / 3) {
      handlePrevious();
    } else if (x > (width * 2) / 3) {
      handleNext();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={handleClick}>
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1">
        {slides.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-100 ${
                index === currentSlideIndex ? 'w-full' : index < currentSlideIndex ? 'w-full' : 'w-0'
              }`}
              style={{ width: index === currentSlideIndex ? `${progress}%` : undefined }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2 hover:bg-black hover:bg-opacity-30 rounded-full"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      {/* Navigation buttons */}
      <button 
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 p-2 hover:bg-black hover:bg-opacity-30 rounded-full"
        disabled={currentSlideIndex === 0 && !hasPrevious}
      >
        <ChevronLeftIcon className="h-8 w-8" />
      </button>

      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 p-2 hover:bg-black hover:bg-opacity-30 rounded-full"
      >
        <ChevronRightIcon className="h-8 w-8" />
      </button>

      {/* Story content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {slides[currentSlideIndex]?.type === 'image' ? (
          <img 
            src={slides[currentSlideIndex].content} 
            alt="story" 
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-white text-center p-8 max-w-md">
            <div className="text-3xl font-bold leading-relaxed">{slides[currentSlideIndex]?.content}</div>
          </div>
        )}
      </div>

      {/* User info */}
      <div className="absolute bottom-4 left-4 text-white">
        <div className="flex items-center gap-3">
          <img 
            src={story.user.avatar} 
            alt={story.user.name}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div>
            <span className="font-semibold text-lg">{story.user.name}</span>
            {slides.length > 1 && (
              <div className="text-sm text-gray-300">
                {currentSlideIndex + 1} of {slides.length}
              </div>
            )}
          </div>
          {story.isLive && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">LIVE</span>
          )}
        </div>
      </div>

      {/* Slide counter */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 text-white text-sm">
          {currentSlideIndex + 1} / {slides.length}
        </div>
      )}
    </div>
  );
};

export default StoryViewer; 