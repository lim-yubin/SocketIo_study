const socket = io();


const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")
const room = document.getElementById('room')
const li = document.createElement("li")

room.hidden = true
let roomName = ''

function addMessage(message) {
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message
    ul.appendChild(li)
}


function showRoom(newCount) {
    welcome.hidden = true
    room.hidden = false
    const h3 = room.querySelector('h3')
    h3.innerText = `Room:${roomName} (${newCount})`
    // console.log(roomName)
    const form = room.querySelector("form")
    form.addEventListener("submit", handleMessageSubmit)
}


function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector('input')
    const value = input.value
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`)
    })
    input.value = ""
}



function handleRoomSubmit(event) {
    event.preventDefault();
    const room = form.querySelector("#roomname")
    const nick = form.querySelector('#nickname')
    socket.emit("enter_room",
        room.value,
        nick.value,
        showRoom
    )
    roomName = room.value
    room.value = ""
}

form.addEventListener("submit", handleRoomSubmit)

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector('h3')
    h3.innerText = `Room:${roomName} (${newCount})`

    addMessage(`${user}: joined!`)
})

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector('h3')
    h3.innerText = `Room:${roomName} (${newCount})`
    addMessage(`${left}: left`)
})

socket.on("new_message", addMessage)
socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul")
    roomList.innerHTML = ''
    if (rooms.length === 0) {

        return
    }

    rooms.forEach((room) => {
        const li = document.createElement('li')
        li.innerText = room;
        roomList.append(li)
    })
})