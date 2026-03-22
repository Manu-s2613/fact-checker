import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, ShieldCheck, Send, MoreHorizontal, Loader2 } from 'lucide-react'
import CommentSection from './CommentSection'
import { verifyPost, likePost, createComment } from '../services/api'
import { getUser } from '../utils/auth'
import { useTheme } from '../utils/theme.jsx'

function PostCard({ post, onVerifyResult, onPostUpdate }) {
  const currentUser = getUser()
  const [showComments, setShowComments] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [localLikes, setLocalLikes] = useState(post.likes)
  const [localComments, setLocalComments] = useState(post.comments || [])
  const [commentText, setCommentText] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  const { darkMode } = useTheme()

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const seconds = Math.floor((new Date() - date) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const result = await verifyPost(post.id, post.caption)
      onVerifyResult(result)
    } catch (error) {
      console.error('Verification error:', error)
      alert('Failed to verify post. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleLike = async () => {
    const newLiked = !liked
    setLiked(newLiked)
    setLocalLikes(newLiked ? localLikes + 1 : localLikes - 1)
    try {
      await likePost(post.id)
    } catch {
      setLiked(!newLiked)
      setLocalLikes(newLiked ? localLikes - 1 : localLikes + 1)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || addingComment) return
    setAddingComment(true)
    try {
      const newComment = await createComment(post.id, commentText)
      const updated = [...localComments, newComment]
      setLocalComments(updated)
      setCommentText('')
      if (onPostUpdate) onPostUpdate({ ...post, comments_count: post.comments_count + 1, comments: updated })
    } catch {
      alert('Failed to add comment.')
    } finally {
      setAddingComment(false)
    }
  }

  return (
    <div className="rounded-2xl..." style={{ backgroundColor: darkMode ? '#111111' : 'white' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img src={post.avatar_url} alt={post.username} className="w-10 h-10 rounded-full ring-2 ring-purple-100" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{post.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(post.created_at)}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Image */}
      {post.image_url && (
        <img src={post.image_url} alt="Post" className="w-full object-cover max-h-96"
          onError={(e) => { e.target.style.display = 'none' }} />
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button onClick={handleLike} className={`transition-colors ${liked ? 'text-red-500' : 'text-gray-700 dark:text-gray-300 hover:text-red-500'}`}>
              <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button onClick={() => setShowComments(!showComments)} className="text-gray-700 dark:text-gray-300 hover:text-purple-600 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="text-gray-700 dark:text-gray-300 hover:text-purple-600 transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handleVerify} disabled={verifying}
              className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {verifying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm font-medium">Verifying...</span></>
              ) : (
                <><ShieldCheck className="w-4 h-4" /><span className="text-sm font-medium">Verify</span></>
              )}
            </button>
            <button onClick={() => setSaved(!saved)} className={`transition-colors ${saved ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'}`}>
              <Bookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <p className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
          {localLikes.toLocaleString()} {localLikes === 1 ? 'like' : 'likes'}
        </p>

        <div className="mb-2">
          <p className="text-gray-900 dark:text-gray-100">
            <span className="font-semibold mr-2">{post.username}</span>{post.caption}
          </p>
        </div>

        {localComments.length > 0 && !showComments && (
          <button onClick={() => setShowComments(true)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 mb-2">
            View all {localComments.length} comments
          </button>
        )}

        {showComments && <CommentSection comments={localComments} />}

        <form onSubmit={handleAddComment} className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <img
            src={currentUser?.avatar_url || "https://ui-avatars.com/api/?name=User&background=9333ea&color=fff"}
            alt="Your avatar" className="w-8 h-8 rounded-full"
          />
          <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
            disabled={addingComment}
          />
          <button type="submit" disabled={!commentText.trim() || addingComment}
            className="p-2 text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {addingComment ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PostCard