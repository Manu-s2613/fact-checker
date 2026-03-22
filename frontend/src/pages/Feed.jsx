import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import PostCard from '../components/PostCard'
import CreatePostModal from '../components/CreatePostModal'
import VerifyResultModal from '../components/VerifyResultModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { getPosts } from '../services/api'
import { Plus } from 'lucide-react'

function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [verifyResult, setVerifyResult] = useState(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)

  useEffect(() => { loadPosts() }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await getPosts()
      setPosts(data)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts])
    setShowCreatePost(false)
  }

  const handleVerifyResult = (result) => {
    setVerifyResult(result)
    setShowVerifyModal(true)
  }

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)))
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'transparent' }}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onVerifyResult={handleVerifyResult}
                onPostUpdate={handlePostUpdate}
              />
            ))}
            {posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No posts yet</p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Create your first post
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-full shadow-2xl hover:from-purple-700 hover:to-purple-800 transform hover:scale-110 transition-all duration-200 z-40"
        aria-label="Create post"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}
      {showVerifyModal && verifyResult && (
        <VerifyResultModal
          result={verifyResult}
          onClose={() => setShowVerifyModal(false)}
        />
      )}
    </div>
  )
}

export default Feed