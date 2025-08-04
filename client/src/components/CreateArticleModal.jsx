import React, { useState, useEffect, useRef } from 'react';
import { createArticle, addTagsToArticle, uploadArticleImages } from '../services/articleService';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TagInput from './TagInput';
import { Sparkles, X, Image, FileText, Upload, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CreateArticleModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const fileInputRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isCoverDragging, setIsCoverDragging] = useState(false);
  const [isGalleryDragging, setIsGalleryDragging] = useState(false);
  const coverInputRef = useRef();
  const galleryInputRef = useRef();
  const { user } = useAuth();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: false }),
      TextStyle,
      Color,
    ],
    content: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setImage(null);
      setImagePreview(null);
      setCoverImage(null);
      setCoverPreview(null);
      setGallery([]);
      setGalleryPreviews([]);
      setTags([]);
      setError(null);
      setLoading(false);
      editor && editor.commands.setContent('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen, editor]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setCoverImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGallery(files);
    setGalleryPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverDrop = (e) => {
    e.preventDefault();
    setIsCoverDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryDrop = (e) => {
    e.preventDefault();
    setIsGalleryDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setGallery(files);
    setGalleryPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !editor.getHTML().trim()) {
      setError('Title and content are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const articleData = {
        title: title.trim(),
        content: editor.getHTML(),
        tags: tags
      };

      const article = await createArticle(articleData);

      // Upload images if provided
      if (image || coverImage || gallery.length > 0) {
        const formData = new FormData();
        if (image) formData.append('image', image);
        if (coverImage) formData.append('coverImage', coverImage);
        gallery.forEach(file => formData.append('gallery', file));

        await uploadArticleImages(article.id, formData);
      }

      onClose(true);
    } catch (err) {
      setError(err.message || 'Failed to create article.');
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || 'Unknown User';
  };

  // Get user avatar
  const getUserAvatar = (user) => {
    if (!user) {
      return 'https://ui-avatars.com/api/?name=Unknown&background=random';
    }
    if (user.avatar) {
      return user.avatar;
    }
    return `https://ui-avatars.com/api/?name=${getUserDisplayName(user)}&background=random`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl relative animate-fade-in flex flex-col max-h-[90vh] border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-6 pt-6 pb-2 sticky top-0 bg-gray-900 z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <img
              src={getUserAvatar(user)}
              alt={getUserDisplayName(user)}
              className="w-10 h-10 rounded-full object-cover border border-gray-600"
            />
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
                Create Article
              </h2>
              <p className="text-sm text-gray-400">Share your in-depth stories, guides, and insights.</p>
            </div>
          </div>
          <button 
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-4 space-y-5" encType="multipart/form-data">
          <div>
            <label className="block font-semibold mb-2 text-white">Title</label>
            <input 
              type="text" 
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block font-semibold mb-2 text-white flex items-center gap-2">
              <Image className="h-5 w-5 text-blue-400" />
              Image (optional)
            </label>
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${
                isDragging 
                  ? 'border-blue-500 bg-blue-600/10' 
                  : 'border-gray-600 bg-gray-800 hover:border-blue-400 hover:bg-gray-700'
              }`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleImageDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') fileInputRef.current && fileInputRef.current.click(); }}
              style={{ minHeight: '120px' }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="rounded-xl max-h-40 mx-auto" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-blue-400 mb-2" />
                  <span className="text-gray-400 text-sm">Drag & drop or click to upload</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                ref={fileInputRef}
                tabIndex={-1}
              />
            </div>
          </div>
          
          <div>
            <label className="block font-semibold mb-2 text-white">Cover Image (optional)</label>
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${
                isCoverDragging 
                  ? 'border-purple-500 bg-purple-600/10' 
                  : 'border-gray-600 bg-gray-800 hover:border-purple-400 hover:bg-gray-700'
              }`}
              onDragOver={e => { e.preventDefault(); setIsCoverDragging(true); }}
              onDragLeave={e => { e.preventDefault(); setIsCoverDragging(false); }}
              onDrop={handleCoverDrop}
              onClick={() => coverInputRef.current && coverInputRef.current.click()}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') coverInputRef.current && coverInputRef.current.click(); }}
              style={{ minHeight: '120px' }}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover Preview" className="rounded-xl max-h-40 mx-auto" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-purple-400 mb-2" />
                  <span className="text-gray-400 text-sm">Drag & drop or click to upload cover</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
                ref={coverInputRef}
                tabIndex={-1}
              />
            </div>
          </div>
          
          <div>
            <label className="block font-semibold mb-2 text-white">Gallery Images (optional, multiple)</label>
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${
                isGalleryDragging 
                  ? 'border-pink-500 bg-pink-600/10' 
                  : 'border-gray-600 bg-gray-800 hover:border-pink-400 hover:bg-gray-700'
              }`}
              onDragOver={e => { e.preventDefault(); setIsGalleryDragging(true); }}
              onDragLeave={e => { e.preventDefault(); setIsGalleryDragging(false); }}
              onDrop={handleGalleryDrop}
              onClick={() => galleryInputRef.current && galleryInputRef.current.click()}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') galleryInputRef.current && galleryInputRef.current.click(); }}
              style={{ minHeight: '120px' }}
            >
              {galleryPreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 w-full">
                  {galleryPreviews.map((src, i) => (
                    <img key={i} src={src} alt={`Gallery ${i + 1}`} className="rounded-xl max-h-24 w-full object-cover" />
                  ))}
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-pink-400 mb-2" />
                  <span className="text-gray-400 text-sm">Drag & drop or click to upload gallery images</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                multiple
                onChange={handleGalleryChange}
                ref={galleryInputRef}
                tabIndex={-1}
              />
            </div>
          </div>
          
          <div>
            <label className="block font-semibold mb-2 text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Content
            </label>
            <div className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-800 min-h-[220px] max-h-[400px] overflow-y-auto">
              <EditorContent editor={editor} className="prose prose-invert max-w-none" />
            </div>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
              <button 
                type="button" 
                onClick={() => editor.chain().focus().toggleBold().run()} 
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  editor.isActive('bold') 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                Bold
              </button>
              <button 
                type="button" 
                onClick={() => editor.chain().focus().toggleUnderline().run()} 
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  editor.isActive('underline') 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                Underline
              </button>
              <button 
                type="button" 
                onClick={() => editor.chain().focus().toggleItalic().run()} 
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  editor.isActive('italic') 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                Italic
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const url = prompt('Enter URL');
                  if (url) editor.chain().focus().setLink({ href: url }).run();
                }} 
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  editor.isActive('link') 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                Link
              </button>
              <button 
                type="button" 
                onClick={() => editor.chain().focus().unsetLink().run()}
                className="px-3 py-1 rounded text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
              >
                Unlink
              </button>
              <input 
                type="color" 
                onChange={e => editor.chain().focus().setColor(e.target.value).run()} 
                title="Text color" 
                className="w-8 h-8 p-0 border-0 rounded cursor-pointer" 
              />
              <select 
                onChange={e => editor.chain().focus().setFontSize(e.target.value).run()} 
                defaultValue="16px" 
                className="border border-gray-600 rounded px-2 py-1 bg-gray-700 text-white text-sm"
              >
                <option value="12px">12</option>
                <option value="14px">14</option>
                <option value="16px">16</option>
                <option value="18px">18</option>
                <option value="24px">24</option>
                <option value="32px">32</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block font-semibold mb-2 text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Tags
            </label>
            <TagInput value={tags} onChange={setTags} />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm font-semibold text-center p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Action Button always visible at bottom */}
          <div className="sticky bottom-0 left-0 right-0 bg-gray-900 pt-2 pb-2 z-10 -mx-6 px-6 rounded-b-2xl border-t border-gray-700">
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg" 
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticleModal; 