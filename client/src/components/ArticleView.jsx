import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticleById, deleteArticle, likeArticle, unlikeArticle, getArticleLikes, deleteArticleImage, getArticleComments, shareArticle } from '../services/articleService';
import { useAuth } from '../contexts/AuthContext';
import EditArticleModal from './EditArticleModal';
import ArticleComments from './ArticleComments';
import { Tag, Heart, MessageCircle, Share2, Calendar, User, Eye, BookOpen } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from './RightSidebar';
import socketService from '../services/socketService';

// Use the backend API URL as the base for images
const BASE_URL = import.meta.env.VITE_API_URL || 'https://umuhuza.store';

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
    return `https://umuhuza.store/uploads/avatars/${avatarPath}`;
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
    // Listen for real-time like updates
    const handleLikeUpdate = (data) => {
      if (data.articleId === id) {
        setLikes(prev => ({
          count: data.likeCount,
          users: data.users || prev.users
        }));
        if (user) {
          setLiked(data.users.some(u => u.id === user.id));
        }
      }
    };

    // Listen for real-time comment updates
    const handleCommentUpdate = (data) => {
      if (data.articleId === id) {
        setComments(prev => {
          const existingIndex = prev.findIndex(c => c.id === data.comment.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = data.comment;
            return updated;
          } else {
            return [data.comment, ...prev];
          }
        });
      }
    };

    socketService.on('article-like-updated', handleLikeUpdate);
    socketService.on('article-comment-updated', handleCommentUpdate);

    return () => {
      socketService.off('article-like-updated', handleLikeUpdate);
      socketService.off('article-comment-updated', handleCommentUpdate);
    };
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return;

    try {
      if (liked) {
        await unlikeArticle(id);
        setLikes(prev => ({
          count: prev.count - 1,
          users: prev.users.filter(u => u.id !== user.id)
        }));
        setLiked(false);
      } else {
        await likeArticle(id);
        setLikes(prev => ({
          count: prev.count + 1,
          users: [...prev.users, user]
        }));
        setLiked(true);
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-6">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-8">
            <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Article not found</h3>
            <p className="text-gray-400">The article you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = user && user.id === article.authorId && user.plan === 'PREMIUM';

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="flex pt-16">
        {/* Fixed Left Sidebar */}
        <div className="hidden lg:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <Sidebar />
        </div>
        
        {/* Main Content with proper spacing */}
        <main className="flex-1 lg:ml-64 lg:mr-80 px-4 py-8 pb-20 lg:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Article Card */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8 overflow-hidden">
              {/* Author Row */}
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={getUserAvatar(article.author)} 
                    alt={getUserDisplayName(article.author)} 
                    className="w-12 h-12 rounded-full border-2 border-gray-600 object-cover" 
                  />
                  <div>
                    <div className="font-semibold text-white text-lg">{getUserDisplayName(article.author)}</div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{article.viewCount || 0} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-6 pb-6">
                {article.title && (
                  <h1 className="text-2xl font-bold text-white mb-4">{article.title}</h1>
                )}
                
                <div 
                  ref={contentRef} 
                  className="text-gray-300 leading-relaxed text-base mb-6 prose prose-invert max-w-none" 
                  dangerouslySetInnerHTML={{ __html: article.content }} 
                />
                
                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map(t => (
                      <span 
                        key={t.tag.name} 
                        className="flex items-center gap-1 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-medium border border-blue-600/30"
                      >
                        <Tag className="w-3 h-3" />
                        {t.tag.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Images/Media */}
                {(article.image || article.coverImage || (article.gallery && article.gallery.length > 0)) && (
                  <div className="mt-6 flex flex-col gap-4">
                    {article.image && (
                      <img 
                        src={getImageUrl(article.image, 'articles')} 
                        alt="Main" 
                        className="rounded-xl object-cover max-h-96 w-full" 
                      />
                    )}
                    {article.coverImage && (
                      <img 
                        src={getImageUrl(article.coverImage, 'covers')} 
                        alt="Cover" 
                        className="rounded-xl object-cover max-h-96 w-full" 
                      />
                    )}
                    {article.gallery && article.gallery.length > 0 && (
                      <div className="flex gap-3 w-full overflow-x-auto scrollbar-hide">
                        {article.gallery.map((img, idx) => (
                          <div key={idx} className="relative group min-w-[150px]">
                            <img 
                              src={getImageUrl(img, 'gallery')} 
                              alt={`Gallery ${idx + 1}`} 
                              className="rounded-xl object-cover w-36 h-36 group-hover:scale-105 transition-transform duration-200" 
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Stats Row */}
              <div className="px-6 py-3 border-t border-gray-700 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{article.likeCount || 0} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{article.commentCount || 0} comments</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  <span>{shareCount} shares</span>
                </div>
              </div>
              
              {/* Action Bar */}
              <div className="flex items-center gap-8 px-6 py-3 border-t border-gray-700">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    liked 
                      ? 'text-red-400 hover:bg-red-600/10' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  disabled={!user}
                >
                  <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">Like</span>
                </button>
                
                <button
                  onClick={() => document.getElementById(`comments-${article.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span className="text-sm font-medium">Comment</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="h-6 w-6" />
                  <span className="text-sm font-medium">Share</span>
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
      
      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-lg p-6 max-w-sm w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4 text-white">Share this article</h2>
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full border border-gray-600 rounded-lg px-3 py-2 mb-4 text-center text-gray-300 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onFocus={e => e.target.select()}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-3 transition-colors w-full"
              onClick={() => { navigator.clipboard.writeText(shareUrl); }}
            >
              Copy Link
            </button>
            <button
              className="text-gray-400 hover:text-white transition-colors"
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