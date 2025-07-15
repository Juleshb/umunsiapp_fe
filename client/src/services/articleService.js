import axios from 'axios';

const API_URL = import.meta.env.VITE_ARTICLES_API_URL || 'http://localhost:5002/api/articles';

export const getAllArticles = async () => {
  const res = await axios.get(API_URL, { withCredentials: true });
  return res.data;
};

export const getArticleById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, { withCredentials: true });
  return res.data;
};

export const createArticle = async (data) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(API_URL, data, {
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return res.data;
};

export const updateArticle = async (id, data) => {
  // data should be FormData
  const res = await axios.put(`${API_URL}/${id}`, data, {
    withCredentials: true,
    headers: { 'Accept': 'application/json' },
  });
  return res.data;
};

export const deleteArticle = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
  return res.data;
};

export const getArticleComments = async (articleId) => {
  const res = await axios.get(`${API_URL}/${articleId}/comments`, { withCredentials: true });
  return res.data;
};

export const addArticleComment = async (articleId, data) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_URL}/${articleId}/comments`, data, {
    withCredentials: true,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return res.data;
};

export const updateArticleComment = async (commentId, data) => {
  const token = localStorage.getItem('token');
  const res = await axios.put(`${API_URL}/comments/${commentId}`, data, {
    withCredentials: true,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return res.data;
};

export const deleteArticleComment = async (commentId) => {
  const token = localStorage.getItem('token');
  const res = await axios.delete(`${API_URL}/comments/${commentId}`, {
    withCredentials: true,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return res.data;
};

export const likeArticle = async (articleId) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_URL}/${articleId}/like`, {}, {
    withCredentials: true,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return res.data;
};

export const unlikeArticle = async (articleId) => {
  const token = localStorage.getItem('token');
  const res = await axios.delete(`${API_URL}/${articleId}/like`, {
    withCredentials: true,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return res.data;
};

export const getArticleLikes = async (articleId) => {
  const res = await axios.get(`${API_URL}/${articleId}/likes`, { withCredentials: true });
  return res.data;
};

export const getAllTags = async () => {
  const res = await axios.get(`${API_URL}/tags`, { withCredentials: true });
  return res.data;
};

export const addTagsToArticle = async (articleId, tags) => {
  const res = await axios.post(`${API_URL}/${articleId}/tags`, { tags }, { withCredentials: true });
  return res.data;
};

export const getArticlesByTag = async (tag) => {
  const res = await axios.get(`${API_URL}?tag=${encodeURIComponent(tag)}`, { withCredentials: true });
  return res.data;
};

export const uploadArticleImages = async (articleId, files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('gallery', file));
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_URL}/${articleId}/images`, formData, {
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return res.data;
};

export const deleteArticleImage = async (imageId) => {
  const res = await axios.delete(`${API_URL}/images/${imageId}`, { withCredentials: true });
  return res.data;
};

export const shareArticle = async (articleId) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_URL}/${articleId}/share`, {}, {
    withCredentials: true,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  return res.data;
}; 