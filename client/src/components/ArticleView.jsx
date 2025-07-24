import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticleById, deleteArticle, likeArticle, unlikeArticle, getArticleLikes, deleteArticleImage, getArticleComments, shareArticle } from '../services/articleService';
import { useAuth } from '../contexts/AuthContext';
import EditArticleModal from './EditArticleModal';
import ArticleComments from './ArticleComments';
import { TagIcon, HeartIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from './RightSidebar';
import socketService from '../services/socketService';

// Use the backend API URL as the base for images
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

// Helper to resolve any image URL (main, cover, gallery)
const getImageUrl = (img, type = 'articles') => {
  if (!img) return '';
  let url = typeof img === 'string' ? img : img.url;
  if (!url) return '';

  // If already a full URL, return as is
  if (url.startsWith('http')) return url;

  // Gallery images: always ensure /gallery/ subdir
  if (type === 'gallery' || /^gallery-\d+-\d+\.(jpeg|jpg|png|webp|gif)$/i.test(url)) {
    url = url.replace(/^gallery\//, ''); // Remove any leading gallery/
    return `${BASE_URL}/uploads/articles/gallery/${url}`;
  }

  // Main article image
  if (type === 'articles' || /^article-\d+-\d+\.(jpeg|jpg|png|webp|gif)$/i.test(url)) {
    url = url.replace(/^articles\//, '');
    return `${BASE_URL}/uploads/articles/${url}`;
  }

  // Cover image
  if (type === 'covers' || /^coverImage-\d+-\d+\.(jpeg|jpg|png|webp|gif)$/i.test(url)) {
    url = url.replace(/^covers\//, '');
    return `${BASE_URL}/uploads/covers/${url}`;
  }

  // Fallback
  return `${BASE_URL}/uploads/${url}`;
};

const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || 'Unknown User';
};

const getUserAvatar = (user) => {
  if (!user) {
    return 'https://ui-avatars.com/api/?name=Unknown&background=random';
  }
  if (user.avatar) {
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    // Always use /uploads/avatars/ and never /api/
    let avatarPath = user.avatar.replace(/^avatars\//, '');
    return `http://localhost:5002/uploads/avatars/${avatarPath}`;
  }
  return `https://ui-avatars.com/api/?name=${getUserDisplayName(user)}&background=random`;
};

const ArticleView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef();
  const navigate = useNavigate();
  const [likes, setLikes] = useState({ count: 0, users: [] });
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareCount, setShareCount] = useState(article?.shareCount || 0);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await getArticleById(id);
        setArticle(data);
        // Fetch initial comments
        const initialComments = await getArticleComments(id);
        setComments(initialComments);
        // Fetch likes and set liked state
        const likeData = await getArticleLikes(id);
        setLikes(likeData);
        if (user) {
          setLiked(likeData.users.some(u => u.id === user.id));
        } else {
          setLiked(false);
        }
      } catch (err) {
        setError('Failed to load article.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id, user]);

  useEffect(() => {
    if (!article) return;
    // Real-time like updates
    const handleLikeUpdate = (data) => {
      if (data.articleId === article.id) {
        setLikes((prev) => ({ ...prev, count: data.likeCount }));
        setArticle((prev) => prev ? { ...prev, likeCount: data.likeCount } : prev);
      }
    };
    socketService.on('article-like-updated', handleLikeUpdate);

    // Real-time comment updates
    const handleCommentUpdate = (data) => {
      if (data.articleId === article.id) {
        console.log('ArticleView received article-comment-updated', data);
        setArticle((prev) => prev ? { ...prev, commentCount: data.commentCount } : prev);
        setComments(data.comments);
      }
    };
    socketService.on('article-comment-updated', handleCommentUpdate);

    return () => {
      socketService.off('article-like-updated', handleLikeUpdate);
      socketService.off('article-comment-updated', handleCommentUpdate);
    };
  }, [article]);

  const handleLike = async () => {
    if (!user) return;
    try {
    if (liked) {
      await unlikeArticle(article.id);
    } else {
      await likeArticle(article.id);
    }
      // After like/unlike, fetch likes again to update state
      const likeData = await getArticleLikes(article.id);
      setLikes(likeData);
      setLiked(likeData.users.some(u => u.id === user.id));
    } catch (err) {
      // Optionally show error
    }
  };

  const handleShare = async () => {
    try {
      const res = await shareArticle(article.id);
      setShareUrl(res.shareUrl);
      setShareCount(res.shareCount);
      setShareModalOpen(true);
    } catch (err) {
      // Optionally show error
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!article) return <div>Article not found.</div>;

  const isAuthor = user && user.id === article.authorId && user.plan === 'PREMIUM';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-16">
        {/* Fixed Left Sidebar */}
        <div className="hidden lg:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <Sidebar />
        </div>
        {/* Main Content with proper spacing */}
        <main className="flex-1 lg:ml-64 lg:mr-80 px-4 py-8 pb-20 lg:pb-8">
          <div className="max-w-2xl mx-auto">
            {/* Article Card */}
            <div className="bg-white rounded-xl shadow-sm border mb-8 overflow-hidden">
              {/* Author Row */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <img src={getUserAvatar(article.author)} alt={getUserDisplayName(article.author)} className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover" />
                  <div>
                    <div className="font-semibold text-gray-800 text-base">{getUserDisplayName(article.author)}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Content */}
              <div className="px-4 pb-3">
                {article.title && (
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{article.title}</h2>
                )}
                <div ref={contentRef} className="text-gray-800 leading-relaxed text-base mb-4" dangerouslySetInnerHTML={{ __html: article.content }} />
                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {article.tags.map(t => (
                      <span key={t.tag.name} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium border border-gray-200">
                        <TagIcon className="w-3 h-3" />
                        {t.tag.name}
                      </span>
                    ))}
                  </div>
                )}
                {/* Images/Media */}
                {(article.image || article.coverImage || (article.gallery && article.gallery.length > 0)) && (
                  <div className="mt-3 flex flex-col gap-2">
                    {article.image && (
                      <img src={getImageUrl(article.image, 'articles')} alt="Main" className="rounded-xl object-cover max-h-80 w-full" />
                    )}
                    {article.coverImage && (
                      <img src={getImageUrl(article.coverImage, 'covers')} alt="Cover" className="rounded-xl object-cover max-h-80 w-full" />
                    )}
                    {article.gallery && article.gallery.length > 0 && (
                      <div className="flex gap-2 w-full overflow-x-auto scrollbar-hide">
                        {article.gallery.map((img, idx) => (
                          <div key={idx} className="relative group min-w-[120px]">
                            <img src={getImageUrl(img, 'gallery')} alt={`Gallery ${idx + 1}`} className="rounded-xl object-cover w-32 h-32" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Stats Row */}
              <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                <span>{article.likeCount || 0} likes</span>
                <span>{article.commentCount || 0} comments</span>
              </div>
              {/* Action Bar */}
              <div className="flex items-center gap-8 px-4 py-2 border-t border-b">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 p-2 rounded-full transition text-2xl ${liked ? 'text-red-500 hover:bg-red-50' : 'text-gray-500 hover:bg-gray-100'}`}
                  disabled={!user}
                >
                  <HeartIcon className="h-7 w-7" />
                </button>
                <button
                  onClick={() => document.getElementById(`comments-${article.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition text-2xl"
                >
                  <ChatBubbleLeftRightIcon className="h-7 w-7" />
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition text-2xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h9m0 0l-3.75-3.75M16.5 12l-3.75 3.75" />
                  </svg>
                  <span className="text-base">{shareCount}</span>
                </button>
              </div>
            </div>
            {/* Article Comments */}
            <div id={`comments-${article.id}`} className="mt-8">
              <ArticleComments articleId={article.id} />
            </div>
          </div>
        </main>
        {/* Fixed Right Sidebar */}
        <div className="hidden lg:block w-80 fixed right-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <RightSidebar />
        </div>
      </div>
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2">Share this article</h2>
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full border rounded px-3 py-2 mb-3 text-center text-gray-700"
              onFocus={e => e.target.select()}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
              onClick={() => { navigator.clipboard.writeText(shareUrl); }}
            >
              Copy Link
            </button>
            <button
              className="text-gray-500 hover:underline"
              onClick={() => setShareModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleView; 