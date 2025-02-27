'use client'

import { useState, useEffect } from 'react'
import "./comments.css"
import { RiCloseLargeLine } from "react-icons/ri"
import * as cookies from '@/lib/cookie'
import Toast from '../toast/Toast'
import { FiImage } from 'react-icons/fi';
import Loading from '../loading/Loading'
import { fetchBlob } from '@/lib/fetch_blob'
import { BiLoaderCircle } from 'react-icons/bi'
import Comment from './Comment'

export default function Comments({ postID, setCommentsCount, onClose, target }) {
    const [comments, setComments] = useState([])
    const [user, setUser] = useState({})
    const [toasts, setToasts] = useState([]);
    const [isChanged, setIsChanged] = useState(false)
    const [commentContent, setCommentContent] = useState("")
    const [page, setpage] = useState(0)
    const [noMore, setNoMore] = useState(false)
    const [cookieValue, setCookieValue] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [image, setImage] = useState(null);
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const removeImage = () => {
        setImage(null);
    };
    useEffect(function getSessionID() {
        setCookieValue(cookies.GetCookie("sessionId"))
    }, [cookieValue])

    useEffect(function checkInputChanging() {
        setIsChanged(commentContent !== "" || image !== null)
    }, [commentContent,image])

    useEffect(function fetchAuthenticatedUserInfo() {
        if (!cookieValue) return
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/authenticated-user`, {
            method: "GET",
            credentials: "include",
            headers: { 'Authorization': `Bearer ${cookieValue}` }
        })
            .then(res => res.json())
            .then(async (data) => {
                data = data.data
                if (data.status && data.status != 200) {
                    throw new Error(data.message)
                }
                data.avatar = data.avatar
                    ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + data.avatar)
                    : '/default-avatar.jpg'
                setUser(data)
            })
            .catch(err => {
                showToast('error', 'Error fetching user info: ' + err);
            })
    }, [cookieValue])

    useEffect(function fetchComments() {
        if (!postID || !cookieValue || noMore) return
        if (page > 0) setLoadingMore(true)
        handleFetchComments()
    }, [postID, page, cookieValue])

    useEffect(function listenOnScroll() {
        document.getElementById('comments')?.addEventListener("scroll", handleScroll)
        return () => document.getElementById('comments')?.removeEventListener("scroll", handleScroll)
    }, [])

    const handleChange = async (e) => {
        if (commentContent.length >= 200 && e.nativeEvent.inputType !== "deleteContentBackward") return
        setCommentContent(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isChanged || !cookieValue) return

        if (commentContent.length > 200) {
            showToast('warning', 'Comment size should be less than 200 characters');
            return
        }
        const newComment = {
            user: user,
            content: commentContent,
            image:image,
            formatted_date: new Date().toLocaleString()
        }

        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/comment/create`, {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
            body: JSON.stringify({
                commentable_id: postID,
                content: commentContent,
                target: target,
                image
            })
        })
            .then(res => res.json())
            .then(async (data) => {
                if (data.status) {
                    if (data.status == 200) {
                        newComment.comment_id = data.data;
                        setComments(data => [newComment, ...data])
                        setCommentContent("")
                        setCommentsCount(comments.length + 1)
                        setImage(null);
                    } else {
                        throw new Error(data.message)
                    }
                }
            })
            .catch(err => {
                showToast('error', 'Error saving the comment: ' + err);
            })
    }

    const handleFetchComments = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/comment/${postID}/${page}/${target}`, {
                credentials: "include",
                headers: { 'Authorization': `Bearer ${cookieValue}` }
            })
            let data = await res.json()
            data = data.data

            if (Array.isArray(data) && data.length > 0) {
                if (data.length < 20) {
                    setNoMore(true)
                }
                data = await Promise.all(data.map(async (comment) => {

                    return {
                        ...comment,
                        user: {
                            ...comment.user,
                            avatar: comment.user.avatar
                                ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + comment.user.avatar)
                                : '/default-avatar.jpg'
                        },
                        image: comment.image
                            ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + comment.image)
                            : ''
                    }
                }))

                setComments(prevComments => {
                    const exist = new Set(prevComments.map(c => c.comment_id));
                    const newComments = data.filter(c => !exist.has(c.comment_id));
                    return [...prevComments, ...newComments];
                });
            }
        } catch (err) {
            showToast('error', err);
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const showToast = (type, message) => {
        const newToast = { id: Date.now(), type, message };
        setToasts((prevToasts) => [...prevToasts, newToast]);
    }

    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }

    const handleScroll = () => {
        const commentsContainer = document.getElementById('comments')
        if (!commentsContainer) return
        if (Math.ceil(commentsContainer.scrollTop + commentsContainer.clientHeight) + 1 >= commentsContainer.scrollHeight) {
            setpage(prevPage => prevPage + 1)
        }
    }

    return (
        <div className="comments-dialog-overlay">
            <div className="comments-dialog-content">
                <button onClick={onClose} className='comments-close'><RiCloseLargeLine /></button>
                <h2>Comments</h2>
                <div className="comments" id='comments'>
                    {!loading ? (
                        comments.length > 0 ?
                            comments.map((comment) => (
                                <Comment
                                    key={comment.comment_id}
                                    comment={comment}
                                    cookieValue={cookieValue}
                                    target={target}
                                />
                            ))
                            : <span className='no-comments'>No comments to display!</span>
                    )
                        : <Loading />
                    }
                    {!noMore && !loading && loadingMore ?
                        <span className='comments-loading-more'><BiLoaderCircle className='loader' /></span>
                        : ""
                    }
                </div>
                {image && (
                    <div className="image-preview-wrapper">
                        <img src={image} alt="Preview" className="preview-image" />
                        <button type="button" onClick={removeImage} className="remove-image" aria-label="Remove image">
                            ×
                        </button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="comments-form" method='POST'>

                    <input max={200} value={commentContent} onChange={handleChange} type="text" placeholder="Write a comment..." />
                    <label className="upload-image-label">
                        <FiImage className="action-icon" />
                        <input type="file" accept="image/*"
                            onChange={handleImageChange} className="hidden-input" />
                    </label>
                    <button type="submit">Comment</button>
                </form>
            </div>

            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    )
}
