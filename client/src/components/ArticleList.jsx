import React, { useEffect, useState } from 'react';
import { getAllArticles, getArticlesByTag } from '../services/articleService';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Tag, Calendar, User, Eye, BookOpen } from 'lucide-react';
import socketService from '../services/socketService';

const ArticleList = ({ tag, onTagClick }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = async () => {
    try {
      let data;
      if (tag) {
        data = await getArticlesByTag(tag);
      } else {
        data = await getAllArticles();
      }
      setArticles(data);
    } catch (err) {
      setError('Failed to load articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [tag]);

  useEffect(() => {
    // Listen for real-time like/comment updates
    const handleUpdate = () => {
      fetchArticles();
    };
    socketService.on('article-like-updated', handleUpdate);
    socketService.on('article-comment-updated', handleUpdate);
    return () => {
      socketService.off('article-like-updated', handleUpdate);
      socketService.off('article-comment-updated', handleUpdate);
    };
  }, [tag]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-6">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-8">
          <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No articles yet</h3>
          <p className="text-gray-400">Be the first to share an article with the community!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map(article => (
        <Link
          to={`/articles/${article.id}`}
          key={article.id}
          className="block bg-gray-700/50 rounded-xl border border-gray-600 hover:border-gray-500 hover:bg-gray-700 transition-all duration-200 overflow-hidden group"
        >
          <div className="flex flex-col md:flex-row">
            {/* Article Image */}
            {article.image && (
              <div className="md:w-1/3">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}
            
            {/* Article Content */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <div className="flex items-center space-x-2 text-gray-400 text-sm ml-4">
                  <Eye className="h-4 w-4" />
                  <span>{article.viewCount || 0}</span>
                </div>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map(t => (
                    <button
                      key={t.tag.name}
                      onClick={e => { e.preventDefault(); onTagClick && onTagClick(t.tag.name); }}
                      className="flex items-center gap-1 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-600/30 transition-colors border border-blue-600/30"
                    >
                      <Tag className="w-3 h-3" />
                      {t.tag.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Article Meta */}
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{article.author?.username || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Article Preview */}
              <div className="text-gray-300 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: article.content }} />

              {/* Engagement Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{article.likeCount || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{article.commentCount || 0}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {article.readTime ? `${article.readTime} min read` : 'Quick read'}
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ArticleList; 