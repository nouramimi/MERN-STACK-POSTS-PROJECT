import React, { useState, useEffect } from 'react';

// Composant pour un bouton de réaction avec emoji
const ReactionButton = ({ count, emoji, name, onReactionClick, isActive }) => (
  <button
    onClick={onReactionClick}
    className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors
      ${isActive 
        ? 'bg-blue-100 text-blue-600' 
        : 'hover:bg-gray-100 text-gray-600'}`}
  >
    <span className="text-xl">{emoji}</span>
    <span className="text-sm">{count}</span>
  </button>
);

const PostManagement = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [userReactions, setUserReactions] = useState({});

  // Map des réactions avec leurs émojis
  const reactionEmojis = {
    thumbsUp: '👍',
    heart: '❤️',
    rocket: '🚀',
    coffee: '☕',
    wow: '⭐'
  };

  useEffect(() => {
    fetchUsers();
    fetchPosts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData.data);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/posts');
      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    const reactionKey = `${postId}-${reactionType}`;
    const hasReacted = userReactions[reactionKey];
    
    if (hasReacted) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v1/posts/${postId}/reactions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reaction: reactionType })
      });

      if (response.ok) {
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              reactions: {
                ...post.reactions,
                [reactionType]: post.reactions[reactionType] + 1
              }
            };
          }
          return post;
        }));

        setUserReactions(prev => ({
          ...prev,
          [reactionKey]: true
        }));
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const onSavePostClicked = async () => {
    if (title && content && userId) {
      setStatus('loading');
      try {
        const response = await fetch('http://localhost:5000/api/v1/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            content,
            author: userId
          })
        });

        if (response.ok) {
          setStatus('succeeded');
          setTitle('');
          setContent('');
          setUserId('');
          fetchPosts();
        } else {
          throw new Error('Failed to save post');
        }
      } catch (err) {
        setStatus('failed');
        setError('Failed to save post');
        console.error('Error saving post:', err);
      }
    }
  };

  const canSave = Boolean(title) && Boolean(content) && Boolean(userId) && status !== 'loading';

  const usersOptions = users.map(user => (
    <option key={user._id} value={user._id}>
      {user.name}
    </option>
  ));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl p-4 mx-auto">
      <section className="p-8 mb-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-4xl font-semibold text-[#F16E00] mb-6">Add a New Post</h2>
        {error && (
          <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        <form className="space-y-4">
          <div>
            <label htmlFor="postTitle" className="block mb-1 font-medium text-gray-700 text-md">
              Post Title:
            </label>
            <input
              type="text"
              id="postTitle"
              name="postTitle"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F16E00] focus:border-transparent"
              placeholder="Enter your post title"
            />
          </div>

          <div>
            <label htmlFor="postAuthor" className="block mb-1 font-medium text-gray-700 text-md">
              Author:
            </label>
            <select
              id="postAuthor"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F16E00] focus:border-transparent"
            >
              <option value="">Select an author</option>
              {usersOptions}
            </select>
          </div>

          <div>
            <label htmlFor="postContent" className="block mb-1 font-medium text-gray-700 text-md">
              Content:
            </label>
            <textarea
              id="postContent"
              name="postContent"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F16E00] focus:border-transparent"
              rows="5"
              placeholder="Write your content here..."
            />
          </div>

          <button
            type="button"
            onClick={onSavePostClicked}
            disabled={!canSave}
            className={`w-full py-2 px-4 text-white font-medium rounded-md ${
              !canSave
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#ff7900] hover:bg-[#F16E00] focus:ring-2 focus:ring-[#ff7900]'
            }`}
          >
            {status === 'loading' ? 'Saving...' : 'Save Post'}
          </button>
        </form>
      </section>

      <section className="p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-[#F16E00] mb-6">Posts</h2>
        <div className="space-y-6">
          {posts.map(post => (
            <article key={post._id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.content}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>By: {post.author?.name || 'Unknown author'}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex space-x-2">
                {Object.entries(post.reactions).map(([reactionType, count]) => (
                  <ReactionButton
                    key={reactionType}
                    count={count}
                    emoji={reactionEmojis[reactionType]}
                    name={reactionType}
                    onReactionClick={() => handleReaction(post._id, reactionType)}
                    isActive={userReactions[`${post._id}-${reactionType}`]}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PostManagement;