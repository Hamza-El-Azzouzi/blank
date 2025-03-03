import { useEffect } from 'react';
import { GetCookie } from '@/lib/cookie';

let worker = null;

function initWorker() {
    if (worker) return;

    try {
        worker = new SharedWorker('/websocket-worker.js');
        worker.port.start();
        console.log('WebSocket worker initialized');
    } catch (error) {
        console.error('Failed to initialize WebSocket worker:', error);
        return null;
    }
}

export function useWebSocket(currentChatUserId = null, onNewMessage = null, showToast = null) {
    useEffect(() => {
        
        initWorker();

        worker.port.onmessage = (event) => {
            const data = event.data;
            
            if (data.type === 'message') {
                if (currentChatUserId && data.message.sender_id === currentChatUserId && onNewMessage) {
                    onNewMessage(data.message);
                } else if (showToast) {
                    showToast(data.label, 'message');
                }
            } else if (data.type === 'notification' && showToast) {
                showToast(data.label, 'notification');
            } else if (data.type === 'error' && showToast) {
                showToast(data.label, 'error');
            }
        };

    }, [currentChatUserId, onNewMessage, showToast]);

    const sendMessage = (receiverId, content, receiverType) => {
        if (!worker) return;

        worker.port.postMessage({
            type: 'message',
            message: {
                receiver_Id: receiverId,
                receiver_type: receiverType, // to_user or to_group
                content: content,
                session_id: GetCookie('sessionId')
            }
        });
    };

    return sendMessage
}