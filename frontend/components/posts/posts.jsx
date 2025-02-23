import { useRef, useCallback } from 'react';
import Post from './post';

const Posts = ({ posts, loading, endReached, onLoadMore, target }) => {
  const observer = useRef();
  const lastPostElementRef = useCallback(node => {
    if (loading || endReached) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        onLoadMore && onLoadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, endReached, onLoadMore]);

  return (
    <div className="posts-list">
      {posts.map((post, index) => {
        if (posts.length === index + 1) {
          return (
            <div ref={lastPostElementRef} key={post.post_id}>
              <Post post={post} target={target} />
            </div>
          );
        }
        return <Post key={post.post_id} post={post} target={target}/>;
      })}
      {loading && <div className="loading-spinner"></div>}
      {endReached && posts.length > 0 && <div className="end-message">No more posts to load</div>}
    </div>
  );
};

export default Posts;
