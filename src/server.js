import express from "express"
import { Server } from "socket.io"
import http from "http"
import { instrument } from "@socket.io/admin-ui"

const app = express()

app.set("view engine", "pug")
app.set("views", __dirname + "/public/views")
app.use("/public", express.static(__dirname + "/public"))
app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/"))

const handelListen = () => console.log(`Listening on http://localhost:3000`)


const httpServer = http.createServer(app)
const wsServer = new Server(httpServer, {
    cors: {
        origin: ['https://admin.socket.io'],
        credentials: true,
    }
})

instrument(wsServer, {
    auth: false
})

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

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}


wsServer.on("connection", (socket) => {

    wsServer.sockets.emit("room_change", publicRooms())
    /* 사용자가 처음 프론트를 볼 때 열려있는 방을 확인할 수 있게하기위함 */


    socket["nickname"] = 'Anon'
    /* 닉네임을 입력하지 않았을때 기본적으로 입력되는 닉네임=> 
    초기화면에서 닉네임 미설정시 채팅방 입장불가하게끔 설정하였기에 필요없음  */

    socket.onAny((event) => {
        console.log(wsServer.sockets.adapter)
    })
    /*  */

    socket.on("enter_room", (roomName, nickName, done) => {
        socket["nickname"] = nickName
        socket.join(roomName)
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName))
        wsServer.sockets.emit("room_change", publicRooms())
        const newCount = countRoom(roomName)
        done(newCount)
        /* roomName의 방으로 join 하게함. 
           입장한 방에(roomName) "welcome 문구" 작성하게함.
           서버전체에 방이 새로 개설되었는지 여부를 공지함.
           프론트엔드에서 넘겨주는 done 함수를 시행함(실행자체는 프론트에서 실행됨.)
        */
    })
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms())
    })
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1))

    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}:${msg}`)
        done()

    })


})




httpServer.listen(3000, handelListen)