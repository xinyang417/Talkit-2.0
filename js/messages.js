"use strict";

let socket = io.connect('/');
let data = JSON.parse(sessionStorage.getItem("user"));
var room;
socket.emit('loggedin', data)

function openChatWindow(room) {
    if (!document.getElementById(room)) {
        document.getElementById("chat-box").innerHTML = `<div class="chat-window" id="${room}"></div>`;
        document.getElementById("send").setAttribute("onclick", `sendMessage('${room}')`);
    }
}
function createRoom(id, name) {
    let loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    room = Date.now() + Math.random();
    room = room.toString().replace(".", "_");
    document.getElementById("friend-dName").getElementsByTagName("b")[0].innerHTML = name;
    socket.emit('create', {room: room, userId: loggedInUser.ID, withUserId: id, hostName: data.displayName});
    openChatWindow(room);
}

function sendMyMessage(chatWindowId, fromUser, message) {
    let loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    let meClass = loggedInUser.ID == fromUser.ID ? 'me' : '';
    let html;
    console.log(fromUser);
    if (data.ID == fromUser.ID) {
        console.log("my chat");
        html =`<div class="myBubble ${meClass}">
                    <div class="myMsg">
                        <p class="myText">${message}</p>
                        <img class="myPic" src="/img/${fromUser.profilePic}" />
                    </div>
                </div>`;
    } else {
        html = `<div class="userBubble ${meClass}">
                    <div class="userMsg">
                        <p class="userText">${message}</p>
                        <img class="userPic" src="/img/${fromUser.profilePic}" />
                    </div>
                </div>`;
    }
    
    document.getElementById(`${chatWindowId}`).insertAdjacentHTML("beforeend", html); 
}

function sendMessage(room) {
    let message = document.getElementById("msg").value;
    document.getElementById("msg").value = "";
    console.log(room);
    console.log(message);
    console.log(data);
    socket.emit('message', {room: room, message:message, from: data});
    sendMyMessage(room, data, message);
}

socket.on('updateUserList', (userList) => {
    let loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    document.getElementById("inbox-component").innerHTML = `<ul></ul>`;
    let i = 0;
    userList.forEach(item => {
        if (loggedInUser.ID != item.ID){
            document.getElementById('inbox-component').getElementsByTagName("ul")[i].innerHTML = `<li data-id ="${item.ID}" onclick = "createRoom('${item.ID}', '${item.displayName}')">${item.displayName}</li>`;
            i++;
        }
    });
});

socket.on('invite', function(data) {
    console.log("invite");
    document.getElementById("friend-dName").getElementsByTagName("b")[0].innerHTML = `${data.room.hostName}`;
    socket.emit("joinRoom",data)
});

socket.on('message', function(msg) {
    console.log(msg);
    if(!document.getElementById(`${msg.room}`)) {
        console.log("openchatwindow");
        openChatWindow(msg.room);
    }
    
    sendMyMessage(msg.room, msg.from, msg.message)
});