import TagInput from './TagInput';
import { addTagsToArticle, uploadArticleImages } from '../services/articleService';
import { useState, useEffect } from 'react';

const EditArticleModal = ({ article, onClose }) => {
  const [tags, setTags] = useState(article.tags ? article.tags.map(t => t.tag.name) : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(article.coverImage || null);
  const [gallery, setGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

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
      await updateArticle(article.id, formData);
      if (tags.length > 0) {
        await addTagsToArticle(article.id, tags);
      }
      if (gallery.length > 0) {
        await uploadArticleImages(article.id, gallery);
      }
      onClose(true); // Pass true to indicate success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update article.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTitle(article.title || '');
      setImage(null);
      setImagePreview(article.image || null);
      setCoverImage(null);
      setCoverPreview(article.coverImage || null);
      setGallery([]);
      setGalleryPreviews([]);
      setTags(article.tags ? article.tags.map(t => t.tag.name) : []);
      setError(null);
      setLoading(false);
      editor && editor.commands.setContent(article.content || '');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen, article, editor]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setCoverImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(article.coverImage || null);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGallery(files);
    setGalleryPreviews(files.map(file => URL.createObjectURL(file)));
  };

  return (
    <div>
      {/* ... existing code ... */}
      <div>
        <label className="block font-medium mb-1">Tags</label>
        <TagInput value={tags} onChange={setTags} />
      </div>
      <div>
        <label className="block font-medium mb-1">Cover Image (optional)</label>
        <input type="file" accept="image/*" className="w-full" onChange={handleCoverChange} />
        {coverPreview && <img src={coverPreview} alt="Cover Preview" className="mt-2 rounded max-h-40" />}
      </div>
      <div>
        <label className="block font-medium mb-1">Gallery Images (optional, multiple)</label>
        <input type="file" accept="image/*" className="w-full" multiple onChange={handleGalleryChange} />
        {galleryPreviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {galleryPreviews.map((src, i) => (
              <img key={i} src={src} alt={`Gallery ${i + 1}`} className="rounded max-h-24" />
            ))}
          </div>
        )}
        {/* Show existing gallery images */}
        {article.images && article.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {article.images.map(img => (
              <img key={img.id} src={img.url} alt="Gallery" className="rounded max-h-24" />
            ))}
          </div>
        )}
      </div>
      {/* ... existing code ... */}
    </div>
  );
};

export default EditArticleModal; 