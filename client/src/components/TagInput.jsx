import React, { useEffect, useState } from 'react';
import { getAllTags } from '../services/articleService';

const TagInput = ({ value, onChange }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allTags, setAllTags] = useState([]);

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
    }
  };

  const handleRemove = (tag) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
            {tag}
            <button type="button" onClick={() => handleRemove(tag)} className="text-blue-500 hover:text-blue-700">&times;</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="w-full border rounded px-3 py-2"
        placeholder="Add tag..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && input.trim()) {
            handleAdd(input.trim());
            e.preventDefault();
          }
        }}
      />
      {suggestions.length > 0 && (
        <div className="bg-white border rounded shadow mt-1 absolute z-10 w-full max-h-40 overflow-y-auto">
          {suggestions.map(tag => (
            <div
              key={tag.id}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
              onClick={() => handleAdd(tag.name)}
            >
              {tag.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput; 