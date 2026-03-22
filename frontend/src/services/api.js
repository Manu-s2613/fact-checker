import axios from 'axios'
import { getToken } from '../utils/auth'

const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password })
  return response.data
}

export const logoutAPI = async () => {
  const response = await api.post('/auth/logout')
  return response.data
}

export const getPosts = async () => {
  const response = await api.get('/posts')
  return response.data
}

export const getPost = async (postId) => {
  const response = await api.get(`/posts/${postId}`)
  return response.data
}

export const createPost = async (caption, imageUrl = null) => {
  const response = await api.post('/posts', { caption, image_url: imageUrl })
  return response.data
}

export const createComment = async (postId, content) => {
  const response = await api.post(`/posts/${postId}/comments`, { content })
  return response.data
}

export const likePost = async (postId) => {
  const response = await api.post(`/posts/${postId}/like`)
  return response.data
}

export const verifyPost = async (postId, content) => {
  const response = await api.post('/verify-post', { post_id: postId, content })
  return response.data
}

export default api