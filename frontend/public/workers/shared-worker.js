let wsReady = null
let ports = [] // Store (tabs)

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
    ports.push(port)

    if (!wsReady) {
        wsReady = initWebSocket()
    }

    const ws = await wsReady

    port.onmessage = (e) => ws.send(JSON.stringify(e.data))

    ws.onmessage = (e) => {
        ports.forEach(p => p.postMessage(e.data)) 
    }

    port.onclose = function () {
        // Remove closed port from the list
        ports = ports.filter(p => p !== port)
        
        if (ports.length === 0) {
            ws.close()
            wsReady = null
            console.log("WebSocket closed")
        }
    }
}