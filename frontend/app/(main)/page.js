// app/(main)/page.js
import CreatePost from '@/components/posts/createPost';
import Post from '@/components/posts/post';

const mockPosts = [
  {
    id: 1,
    author: "Emma Watson",
    avatar: "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg",
    content: "Just finished reading an amazing book! 📚 Sometimes the perfect weekend is just you, a good book, and a cup of coffee. What are you all reading these days?",
    image: "https://plus.unsplash.com/premium_photo-1661877737564-3dfd7282efcb?q=80&w=2100&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    time: "2 hours ago",
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false
  },
  {
    id: 2,
    author: "James Smith",
    avatar: "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg",
    content: "Working on the new project! 🚀 Making great progress with the team. Here's a sneak peek of what we're building.",
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    time: "5 hours ago",
    likes: 45,
    comments: 12,
    shares: 5,
    isLiked: true
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