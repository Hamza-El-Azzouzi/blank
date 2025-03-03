import { useEffect, useRef } from 'react';
import { GetCookie } from '@/lib/cookie';

let worker = null;
const handlers = new Map();
let nextHandlerId = 0;

function initWorker() {
    if (worker) return;

    try {
        worker = new SharedWorker('/websocket-worker.js');
        worker.port.start();
        console.log('WebSocket worker initialized');

        worker.port.onmessage = (event) => {
            const data = event.data;

            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (err) {
                    console.error('Error in WebSocket message handler:', err);
                }
            });
        };

    } catch (error) {
        console.error('Failed to initialize WebSocket worker:', error);
        return null;
    }
}

export function useWebSocket(currentChatUserId = null, onNewMessage = null, showToast = null) {
    const handlerIdRef = useRef(null);

    useEffect(() => {
        initWorker();

        const handleMessage = (data) => {
            if (data.type === 'message') {
                if (currentChatUserId && data.message.sender_id === currentChatUserId && onNewMessage) {
                    onNewMessage(data.message);
                }
                else if (showToast) {
                    showToast(data.label, 'message');
                }
                else if (onNewMessage) onNewMessage()
            }
            else if (showToast) {
                showToast(data.label, data.type);
            }
        };

        const handlerId = nextHandlerId++;
        handlerIdRef.current = handlerId;
        handlers.set(handlerId, handleMessage);

        return () => {
            if (handlerIdRef.current !== null) {
                handlers.delete(handlerIdRef.current);
            }
        };

    }, [currentChatUserId, onNewMessage, showToast]);

    const sendMessage = (receiverId, content, receiverType) => {
        if (!worker) return;

        worker.port.postMessage({
            type: 'message',
            message: {
                receiver_id: receiverId,
                receiver_type: receiverType, // to_user or to_group
                content: content,
                session_id: GetCookie('sessionId')
            }
        });
    };

    return sendMessage
}