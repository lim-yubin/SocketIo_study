import express from "express"
import SocketIO from "socket.io"
import http from "http"

const app = express()

app.set("view engine", "pug")
app.set("views", __dirname + "/public/views")
app.use("/public", express.static(__dirname + "/public"))
app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/"))

const handelListen = () => console.log(`Listening on http://localhost:3000`)


const httpServer = http.createServer(app)
const wsServer = SocketIO(httpServer)


wsServer.on("connection", (socket) => {
    socket.onAny((event) => {
        // console.log(`Socket event: ${event}`)
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName)
        done()
        socket.to(roomName).emit("welcome")
    })
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye"))
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", msg)
        done()

    })




})




// const wss = new WebSocket.Server({ server })


// function onSocketClose() {
//     console.log("Disconnected from Server")
// }

// const sockets = []

// wss.on("connection", (socket) => {
//     sockets.push(socket)
//     socket["nickname"] = "Anon"
//     socket.on("close", onSocketClose)
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg)
//         switch (message.type) {
//             case "new_message": sockets.forEach(aSocket => aSocket.send(`${socket.nickname} : ${message.payload}`))
//             case "nickname":
//                 socket['nickname'] = message.payload
//                 console.log(socket)
//         }
//     })
//     console.log("Connected to Browser!!")
// })






httpServer.listen(3000, handelListen)