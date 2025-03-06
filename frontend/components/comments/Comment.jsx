'use client'

import { formatNumber } from '@/lib/formatting'
import { useState } from 'react'
import Link from 'next/link';
import { FiHeart } from 'react-icons/fi'

export default function Comment({ comment, cookieValue, target }) {
    const [likes, setLikes] = useState(comment?.like_count || 0)
    const [isLiked, setIsLiked] = useState(comment.has_liked || false)

    const handleLike = async () => {
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/comment/${comment.comment_id}/like/${target}`, {
            method: "POST",
            credentials: "include",
            headers: {
                'Authorization': `Bearer ${cookieValue}`
            }
        })
            .then(res => res.json())
            .then(async (data) => {
                if (data.status) {
                    if (data.status == 200) {
                        setIsLiked(!isLiked)
                        setLikes(prev => isLiked ? prev - 1 : prev + 1)
                    } else {
                        throw new Error(data.message)
                    }
                }
            })
            .catch(err => {
                console.error('Error error likng comment:', err)
            })
    }

    return (
        <div className="comment">
            <div className='comment-side'>
                <Link
                    key={comment.user.user_id}
                    href={`/profile/${comment.user.user_id}`}
                >
                    <img
                        src={comment.user.avatar}
                        alt={`${comment.user.first_name}'s avatar`}
                        className="comment-avatar"
                    />
                </Link>
                <div className="comment-reaction">
                    <button className={`comment-reaction-button ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                        <FiHeart className={`comment-reaction-icon ${isLiked ? 'liked' : ''}`} />
                    </button>
                    <span className='comments-like-count'>{formatNumber(likes)}</span>
                </div>
            </div>
            <div className="comment-content">
                <Link
                    key={comment.user.user_id}
                    href={`/profile/${comment.user.user_id}`}
                >
                    <div className="comment-author">{comment.user.first_name} {comment.user.last_name}</div>
                </Link>
                <p className="comment-text">{comment.content}</p>
                <span className="comment-time">{comment.formatted_date}</span>
                {comment.image && (
                    <div className="comment-image-container">
                        <img
                            src={comment.image}
                            alt="Comment attachment"
                            className="comment-image"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}