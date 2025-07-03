import React, { useState, useEffect, useRef } from 'react';
import { createArticle, addTagsToArticle, uploadArticleImages } from '../services/articleService';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TagInput from './TagInput';
import { SparklesIcon, XMarkIcon, PhotoIcon, DocumentTextIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
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
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', editor.getHTML());
      if (image) formData.append('article', image);
      if (coverImage) formData.append('coverImage', coverImage);
      const article = await createArticle(formData);
      if (tags.length > 0) {
        await addTagsToArticle(article.id, tags);
      }
      if (gallery.length > 0) {
        await uploadArticleImages(article.id, gallery);
      }
      onClose(true); // Pass true to indicate success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create article.');
    } finally {
      setLoading(false);
    }
  };

  // Get user display name
  const getUserDisplayName = (user) => {
    if (!user) return 'Unknown User';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-6 pt-6 pb-2 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <img
              src={getUserAvatar(user)}
              alt={getUserDisplayName(user)}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Article</h2>
              <p className="text-sm text-gray-500">Share your in-depth stories, guides, and insights.</p>
            </div>
          </div>
          <button 
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-4 space-y-5" encType="multipart/form-data">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Title</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700 flex items-center gap-2"><PhotoIcon className="h-5 w-5 text-blue-400" />Image (optional)</label>
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}`}
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
                  <ArrowUpTrayIcon className="h-8 w-8 text-blue-400 mb-2" />
                  <span className="text-gray-500 text-sm">Drag & drop or click to upload</span>
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
            <label className="block font-semibold mb-1 text-gray-700">Cover Image (optional)</label>
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${isCoverDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'}`}
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
                  <ArrowUpTrayIcon className="h-8 w-8 text-purple-400 mb-2" />
                  <span className="text-gray-500 text-sm">Drag & drop or click to upload cover</span>
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
            <label className="block font-semibold mb-1 text-gray-700">Gallery Images (optional, multiple)</label>
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${isGalleryDragging ? 'border-pink-500 bg-pink-50' : 'border-gray-300 bg-gray-50 hover:border-pink-400 hover:bg-pink-50'}`}
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
                  <ArrowUpTrayIcon className="h-8 w-8 text-pink-400 mb-2" />
                  <span className="text-gray-500 text-sm">Drag & drop or click to upload gallery images</span>
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
            <label className="block font-semibold mb-1 text-gray-700">Content</label>
            <div className="border border-gray-300 rounded-lg px-2 py-1 bg-gray-50 min-h-[220px] max-h-[400px] overflow-y-auto">
              <EditorContent editor={editor} />
            </div>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mt-2">
              <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'font-bold text-blue-600' : ''}>Bold</button>
              <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'underline text-blue-600' : ''}>Underline</button>
              <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'italic text-blue-600' : ''}>Italic</button>
              <button type="button" onClick={() => {
                const url = prompt('Enter URL');
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }} className={editor.isActive('link') ? 'text-blue-600 underline' : ''}>Link</button>
              <button type="button" onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</button>
              <input type="color" onChange={e => editor.chain().focus().setColor(e.target.value).run()} title="Text color" className="w-6 h-6 p-0 border-0" />
              <select onChange={e => editor.chain().focus().setFontSize(e.target.value).run()} defaultValue="16px" className="border rounded px-1">
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
            <label className="block font-semibold mb-1 text-gray-700">Tags</label>
            <TagInput value={tags} onChange={setTags} />
          </div>
          {error && <div className="text-red-500 text-sm font-semibold text-center">{error}</div>}
          {/* Action Button always visible at bottom */}
          <div className="sticky bottom-0 left-0 right-0 bg-white pt-2 pb-2 z-10 -mx-6 px-6 rounded-b-2xl">
            <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 font-semibold text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? 'Posting...' : 'Post Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticleModal; 