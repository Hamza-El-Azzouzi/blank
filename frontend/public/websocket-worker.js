const tabs = [];
let ws = null;

self.onconnect = function (e) {
    const port = e.ports[0];
    tabs.push(port);

    if (!ws || ws.readyState !== WebSocket.CONNECTING && ws.readyState !== WebSocket.OPEN) {
        initWebSocket()

    }

    port.onmessage = function (event) {
        const data = event.data;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data.message))
        }
    };
};

function initWebSocket() {
    try {
        ws = new WebSocket(`ws://127.0.0.1:1414/ws`)

        ws.onopen = function () {
            console.log('WebSocket connected');
        };

        ws.onmessage = function (e) {
            try {
                const data = JSON.parse(e.data);
                broadcastToTabs(data);
            } catch (err) {
                console.error('Error parsing WebSocket message:', err);
            }
        };

        ws.onclose = function (e) {
            console.log('WebSocket connection closed:', e.code, e.reason);
            ws = null;
        };

        ws.onerror = function (error) {
            console.error('WebSocket error:', error);
        };

    } catch (error) {
        console.error('Error initializing WebSocket:', error);
    }
}

function broadcastToTabs(message) {
    const currentTabs = [...tabs];
    
    currentTabs.forEach(port => {
        try {
            port.postMessage(message);
        } catch (error) {
            console.error('Error sending message to tab:', error);
            const index = tabs.indexOf(port);
            if (index > -1) {
                tabs.splice(index, 1);
            }
        }
    });
}