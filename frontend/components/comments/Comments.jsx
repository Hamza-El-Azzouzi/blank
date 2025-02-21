'use client'

import { useState, useEffect } from 'react'
import "./comments.css"
import { RiCloseLargeLine } from "react-icons/ri"
import * as cookies from '@/lib/cookie'
import Toast from '../toast/Toast'
import Loading from '../loading/Loading'
import { fetchBlob } from '@/lib/fetch_blob'
import { BiLoaderCircle } from 'react-icons/bi'

export default function Comments({ postID, onClose }) {
    const [comments, setComments] = useState([])
    const [user, setUser] = useState({})
    const [isChanged, setIsChanged] = useState(false)
    const [commentContent, setCommentContent] = useState("")
    const [page, setpage] = useState(0)
    const [noMore, setNoMore] = useState(false)
    const [cookieValue, setCookieValue] = useState(null)
    const [loading, setLoading] = useState(true)


    useEffect(function getSessionID() {
        setCookieValue(cookies.GetCookie("sessionId"))
    }, [cookieValue])

    useEffect(function checkInputChanging() {
        setIsChanged(commentContent !== "")
    }, [commentContent])

    useEffect(function fetchAuthenticatedUserInfo() {
        if (!cookieValue) return
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/authenticated-user`, {
            method: "GET",
            credentials: "include",
            headers: { 'Authorization': `Bearer ${cookieValue}` }
        })
            .then(res => res.json())
            .then(async (data) => {
                if (data.status && data.status != 200) {
                    throw new Error(data.message)
                }
                data.avatar = data.avatar
                    ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + data.avatar)
                    : '/default-avatar.jpg'
                setUser(data)
            })
            .catch(err => {
                console.error('Error fetching user info:', err)
            })
    }, [cookieValue])

    useEffect(function fetchComments() {
        if (!postID || !cookieValue || noMore) return
        handleFetchComments()
    }, [postID, page, cookieValue])

    useEffect(function listenOnScroll() {
        document.getElementById('comments')?.addEventListener("scroll", handleScroll)
        return () => document.getElementById('comments')?.removeEventListener("scroll", handleScroll)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isChanged || !cookieValue) return

        if (commentContent.length > 200) {
            // return <Toast message={"comment is too long"} type={'error'} />
            alert("comment is too long")
            return
        }

        const newComment = {
            user: user,
            content: commentContent,
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
                post_id: postID,
                content: commentContent
            })
        })
            .then(res => res.json())
            .then(async (data) => {
                if (data.status) {
                    if (data.status == 200) {
                        setComments(data => [newComment, ...data])
                        setCommentContent("")
                    } else {
                        throw new Error(data.message)
                    }
                }
            })
            .catch(err => {
                console.error('Error fetching commenting:', err)
            })
    }

    const handleFetchComments = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/comment/${postID}/${page}`, {
                credentials: "include",
                headers: { 'Authorization': `Bearer ${cookieValue}` }
            })
            let data = await res.json()

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
                        }
                    }
                }))

                setComments(prevComments => {
                    const exist = new Set(prevComments.map(c => c.comment_id));
                    const newComments = data.filter(c => !exist.has(c.comment_id));
                    return [...prevComments, ...newComments];
                });
            }
        } catch (err) {
            console.error('Error fetching comments:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleScroll = () => {
        const commentsContainer = document.getElementById('comments')
        if (!commentsContainer) return
        if (Math.ceil(commentsContainer.scrollTop + commentsContainer.clientHeight) + 1 >= commentsContainer.scrollHeight) {
            setpage(prevPage => prevPage + 1)
        }
    }

    return (
        <div className="dialog-overlay">
            <div className="dialog-content">
                <button onClick={onClose} className='comments-close'><RiCloseLargeLine /></button>
                <h2>Comments</h2>
                <div className="comments" id='comments'>
                    {!loading ? (
                        comments.length > 0 ?
                            comments.map((comment, idx) => (
                                <div key={idx} className="comment">
                                    <img src={comment.user.avatar} alt={`${comment.user.first_name}'s avatar`} className="comment-avatar" />
                                    <div className="comment-content">
                                        <div className="comment-author">{comment.user.first_name} {comment.user.last_name}</div>
                                        <p className="comment-text">{comment.content}</p>
                                        <span className="comment-time">{comment.formatted_date}</span>
                                    </div>
                                </div>
                            ))
                            : <p>no comments</p>
                    )
                        : <Loading />
                    }
                    {!noMore && !loading ? <span className='comments-loading-more'><BiLoaderCircle className='loader' /></span> : ""}
                </div>
                <form onSubmit={handleSubmit} className="comments-form" method='POST'>
                    <input max={200} value={commentContent} onChange={(e) => setCommentContent(e.target.value)} type="text" placeholder="Write a comment..." />
                    <button type="submit">Comment</button>
                </form>
            </div>
        </div>
    )
}
