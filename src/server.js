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

function publicRooms() {
    const sids = wsServer.sockets.adapter.sids
    const rooms = wsServer.sockets.adapter.rooms

    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key)
        }
    })
    return publicRooms
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = 'Anon'
    socket.onAny((event) => {
        console.log(wsServer.sockets.adapter)
    })
    socket.on("enter_room", (roomName, nickName, done) => {
        socket["nickname"] = nickName
        socket.join(roomName)
        socket.to(roomName).emit("welcome", socket.nickname)

        done()

    })
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname))
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}:${msg}`)
        done()

    })


})




httpServer.listen(3000, handelListen)