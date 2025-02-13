// app/(main)/page.js
import CreatePost from '@/components/posts/createPost';
import Post from '@/components/posts/post';

const mockPosts = [
  {
    id: 1,
    author: "John Doe",
    avatar: "/api/placeholder/40/40",
    content: "Just finished implementing a new feature! 🚀 Working on this social network project has been challenging but rewarding. Looking forward to adding more functionality!",
    time: "5 minutes ago",
    likes: 12,
    comments: 3,
    shares: 2
  },
  {
    id: 2,
    author: "Jane Smith",
    avatar: "/api/placeholder/40/40",
    content: "Here's a longer post to test our layout. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    time: "15 minutes ago",
    likes: 8,
    comments: 5,
    shares: 1
  }
];

export default function Home() {
  return (
    <div className="home-page">
      <CreatePost />
      {mockPosts.map(post => (<Post key={post.id} post={post} />))}
    </div>
  );
}