import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticleById, deleteArticle, likeArticle, unlikeArticle, getArticleLikes, deleteArticleImage } from '../services/articleService';
import { useAuth } from '../contexts/AuthContext';
import EditArticleModal from './EditArticleModal';
import ArticleComments from './ArticleComments';
import { TagIcon, HeartIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from './RightSidebar';

const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';

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
    if (user.avatar.startsWith('uploads/')) {
      return `${BASE_URL}/${user.avatar}`;
    }
    if (user.avatar.startsWith('avatars/')) {
      return `${BASE_URL}/uploads/${user.avatar}`;
    }
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  }
  return `https://ui-avatars.com/api/?name=${getUserDisplayName(user)}&background=random`;
};

const getImageUrl = (img) => {
  if (!img) return '';
  if (img.url) {
    let url = img.url;
    if (/^gallery-\d+-\d+\.(jpeg|jpg|png|webp|gif)$/i.test(url) && !url.includes('gallery/')) {
      url = `gallery/${url}`;
    }
    if (url.startsWith('http')) return url;
    if (url.startsWith('uploads/')) return `${BASE_URL}/${url}`;
    if (url.startsWith('articles/')) return `${BASE_URL}/uploads/${url}`;
    if (url.startsWith('gallery/')) return `${BASE_URL}/uploads/articles/gallery/${url}`;
    return `${BASE_URL}/uploads/articles/${url}`;
  }
  if (typeof img === 'string') {
    let url = img;
    if (/^gallery-\d+-\d+\.(jpeg|jpg|png|webp|gif)$/i.test(url) && !url.includes('gallery/')) {
      url = `gallery/${url}`;
    }
    if (url.startsWith('http')) return url;
    if (url.startsWith('uploads/')) return `${BASE_URL}/${url}`;
    if (url.startsWith('articles/')) return `${BASE_URL}/uploads/${url}`;
    if (url.startsWith('gallery/')) return `${BASE_URL}/uploads/articles/gallery/${url}`;
    return `${BASE_URL}/uploads/articles/${url}`;
  }
  return '';
};

const ArticleView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef();
  const navigate = useNavigate();
  const [likes, setLikes] = useState({ count: 0, users: [] });
  const [liked, setLiked] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await getArticleById(id);
        setArticle(data);
      } catch (err) {
        setError('Failed to load article.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id, editOpen]);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!article) return;
      const data = await getArticleLikes(article.id);
      setLikes(data);
      setLiked(user && data.users.some(u => u.id === user.id));
    };
    fetchLikes();
  }, [article, user]);

  // Reading progress bar logic
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = contentRef.current.scrollHeight - windowHeight;
      const scrolled = window.scrollY - contentRef.current.offsetTop;
      let percent = 0;
      if (totalHeight > 0) {
        percent = Math.min(100, Math.max(0, (scrolled / totalHeight) * 100));
      }
      setProgress(percent);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  const handleDelete = async () => {
    try {
      await deleteArticle(id);
      navigate('/articles');
    } catch (err) {
      setError('Failed to delete article.');
    }
  };

  const handleLike = async () => {
    if (!user) return;
    if (liked) {
      await unlikeArticle(article.id);
    } else {
      await likeArticle(article.id);
    }
    const data = await getArticleLikes(article.id);
    setLikes(data);
    setLiked(!liked);
  };

  const handleDeleteImage = async (imageId) => {
    await deleteArticleImage(imageId);
    // Refetch article after deletion
    const data = await getArticleById(article.id);
    setArticle(data);
  };

  const handleTagClick = (tag) => {
    // Implement tag filter navigation or callback here
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
                      <button
                        key={t.tag.name}
                        onClick={() => handleTagClick(t.tag.name)}
                        className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-100 transition border border-gray-200"
                      >
                        <TagIcon className="w-3 h-3" />
                        {t.tag.name}
                      </button>
                    ))}
                  </div>
                )}
                {/* Images/Media */}
                {(article.coverImage || (article.gallery && article.gallery.length > 0)) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {article.coverImage && (
                      <img src={getImageUrl(article.coverImage)} alt="Cover" className="rounded-xl object-cover max-h-80 w-full" />
                    )}
                    {article.gallery && article.gallery.length > 0 && (
                      <div className="flex gap-2 w-full overflow-x-auto scrollbar-hide">
                        {article.gallery.map((url, idx) => (
                          <div key={idx} className="relative group min-w-[120px]">
                            <img src={getImageUrl(url)} alt="Gallery" className="rounded-xl object-cover w-32 h-32" />
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
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 p-2 rounded-lg transition ${liked ? 'text-red-500 hover:bg-red-50' : 'text-gray-500 hover:bg-gray-100'}`}
                  disabled={!user}
                >
                  <HeartIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Like</span>
                </button>
                <button
                  onClick={() => document.getElementById(`comments-${article.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Comment</span>
                </button>
                <button className="flex items-center gap-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                  <span className="text-sm font-medium">Share</span>
                </button>
                <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
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
    </div>
  );
};

export default ArticleView; 