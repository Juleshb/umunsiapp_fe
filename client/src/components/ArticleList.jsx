import React, { useEffect, useState } from 'react';
import { getAllArticles, getArticlesByTag } from '../services/articleService';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, HeartIcon, TagIcon } from '@heroicons/react/24/outline';
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

  if (loading) return <div>Loading articles...</div>;
  if (error) return <div>{error}</div>;
  if (!articles.length) return <div>No articles yet.</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {articles.map(article => (
        <Link
          to={`/articles/${article.id}`}
          key={article.id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col hover:ring-2 hover:ring-blue-200"
        >
          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4 flex-1 flex flex-col">
            <h2 className="text-xl font-bold mb-1 line-clamp-2">{article.title}</h2>
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {article.tags.map(t => (
                  <button
                    key={t.tag.name}
                    onClick={e => { e.preventDefault(); onTagClick && onTagClick(t.tag.name); }}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition border border-blue-200"
                  >
                    <TagIcon className="w-3 h-3" />
                    {t.tag.name}
                  </button>
                ))}
              </div>
            )}
            <div className="text-sm text-gray-500 mb-2">
              By {article.author?.username || 'Unknown'} on {new Date(article.createdAt).toLocaleDateString()}
            </div>
            <div className="text-gray-700 mb-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: article.content }} />
            {/* Like and comment counts */}
            <div className="flex items-center gap-4 mt-auto pt-2">
              <div className="flex items-center gap-1 text-gray-500">
                <HeartIcon className="w-5 h-5" />
                <span>{article.likeCount || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>{article.commentCount || 0}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ArticleList; 