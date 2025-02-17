// app/(main)/page.js
import CreatePost from '@/components/posts/createPost';
import Post from '@/components/posts/post';

const mockPosts = [
  {
      "id": "2",
      "content": "My first post!",
      "created_at": "2025-02-17T11:18:40Z",
      "timestamp": "02/17/2025, 11:18 AM",
      "likes": 0,
      "comments": 0,
      "privacy": "public",
      "user": {
          "name": "Hamza Maach",
          "avatar": "/default-avatar.jpg"
      }
  },
  {
      "id": "1",
      "content": "Hello World!",
      "created_at": "2025-02-17T11:18:40Z",
      "timestamp": "02/17/2025, 11:18 AM",
      "likes": 0,
      "comments": 0,
      "privacy": "public",
      "user": {
          "name": "Hamza Maach",
          "avatar": "/default-avatar.jpg"
      }
  }
]

export default function Home() {
  return (
    <div className="home-page">
      <CreatePost />
      {mockPosts.map(post => (<Post key={post.id} post={post} />))}
    </div>
  );
}