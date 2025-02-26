let wsReady = null

function initWebSocket() {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://127.0.0.1:1414/ws`)

        ws.onopen = function () {
            console.log("WebSocket connected")
            resolve(ws)
        }

        ws.onerror = function (error) {
            console.log("WebSocket error:", error)
            reject(error)
        }
    })
}

self.onconnect = function (event) {
    const port = event.ports[0]

    if (!wsReady) {
        wsReady = initWebSocket()
    }

    port.onmessage = async function (e) {
        try {
            const ws = await wsReady
            ws.send(JSON.stringify(e.data))
        } catch (error) {
            console.error("Failed to send message:", error)
        }
    }

    port.onerror = function (error) {
        console.log("Port error:", error)
    }

    port.onclose = async function () {
        try {
            const ws = await wsReady
            ws.close()
            console.log("Worker closed")
        } catch (error) {
            console.error("Error closing WebSocket:", error)
        }
    }
}