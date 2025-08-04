import React, { useEffect, useState } from 'react';
import { getAllTags } from '../services/articleService';
import { X, Tag } from 'lucide-react';

const TagInput = ({ value, onChange }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await getAllTags();
      setAllTags(tags);
    };
    fetchTags();
  }, []);

  useEffect(() => {
    setSuggestions(
      allTags.filter(tag =>
        tag.name.toLowerCase().includes(input.toLowerCase()) &&
        !value.includes(tag.name)
      )
    );
  }, [input, allTags, value]);

  const handleAdd = (tag) => {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  const handleRemove = (tag) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="relative">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map(tag => (
          <span 
            key={tag} 
            className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg flex items-center gap-2 border border-blue-600/30"
          >
            <Tag className="h-3 w-3" />
            {tag}
            <button 
              type="button" 
              onClick={() => handleRemove(tag)} 
              className="text-blue-400 hover:text-red-400 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add tag..."
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' && input.trim()) {
              handleAdd(input.trim());
              e.preventDefault();
            }
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg mt-1 z-20 max-h-40 overflow-y-auto">
            {suggestions.map(tag => (
              <div
                key={tag.id}
                className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                onClick={() => handleAdd(tag.name)}
              >
                <Tag className="h-3 w-3 text-blue-400" />
                {tag.name}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default TagInput; 