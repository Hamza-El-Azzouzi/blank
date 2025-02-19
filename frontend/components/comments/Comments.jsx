'use client';

import { useState, useEffect } from 'react';
import Toast from '../toast/Toast';

export default function Comments({ PostID, onClose }) {
    const [isChanged, setIsChanged] = useState(false);
    const [commentContent, setCommentContent] = useState("");

    useEffect(() => {
        setIsChanged(commentContent !== "")
    }, [commentContent]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isChanged) return;

        if (commentContent.length > 200) {
            return <Toast message={"comment is too long"} type={'error'} />;
            // alert(data.message);
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}/api/comment/create`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookieValue}`
                },
                body: JSON.stringify({
                    post_id: PostID,
                    content: commentContent,
                }),
            });

            const data = await response.json();
            if (data.message === 'success') {
                onClose();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error updating user info:', error);
        }
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog-content">
                <h1>Comments of {PostID}</h1>
            </div>
        </div>
    );
}
