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

self.onconnect = async function (event) {
    const port = event.ports[0]

    if (!wsReady) {
        wsReady = initWebSocket()
    }

    const ws = await wsReady

    port.onmessage = (e) => ws.send(JSON.stringify(e.data))
    port.onerror = (error) => console.log("Port error:", error)
    
    ws.onmessage = (e) => port.postMessage(JSON.parse(e.data))


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