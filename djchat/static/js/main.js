// TAILWIND_COMMAND = npx tailwindcss -i ./static/css/main.css -o ./static/css/main.min.css --watch

/**
 * Variables
 */

let chatName = "";
let chatSocket = null;
let chatWindowUrl = window.location.href;
let chatRoomUuid = Math.random().toString(36).slice(2, 12);

/**
 * Elements
 */

const chatElement = document.querySelector("#chat");
const chatIconElement = document.querySelector("#chat_icon");
const chatOpenElement = document.querySelector("#chat_open");
const chatWelcomeElement = document.querySelector("#chat_welcome");
const chatNameElement = document.querySelector("#chat_name");
const chatJoinElement = document.querySelector("#chat_join");
const chatRoomElement = document.querySelector("#chat_room");
const chatLogElement = document.querySelector("#chat_log");
const chatInputElement = document.querySelector("#chat_message_input");
const chatSubmitElement = document.querySelector("#chat_message_submit");

/**
 * Functions
 */

function scrollToBottom() {
    chatLogElement.scrollTop = chatLogElement.scrollHeight;
}

function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie != "") {
        let cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();

            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
        return cookieValue;
    }
}

async function joinChatRoom() {
    chatName = chatNameElement.value;

    const data = new FormData();
    data.append("name", chatName);
    data.append("url", chatWindowUrl);

    await fetch(`/api/create-room/${chatRoomUuid}`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: data,
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {
            console.log(data);
        });

    chatSocket = new WebSocket(
        `ws://${window.location.host}/ws/${chatRoomUuid}/`
    );

    chatSocket.onmessage = function (e) {
        console.log("OnMessage");
        onChatMessage(JSON.parse(e.data));
    };

    chatSocket.onopen = function (e) {
        scrollToBottom();
        console.log("OnOpen");
    };

    chatSocket.onclose = function (e) {
        console.log("OnClose");
    };
}

function sendMessage() {
    chatSocket.send(
        JSON.stringify({
            type: "message",
            message: chatInputElement.value,
            name: chatName,
        })
    );
    console.log(chatInputElement.value);
    chatInputElement.value = "";
}

function onChatMessage(data) {
    if (data.type == "chat_message") {
        if (data.agent) {
            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div>

                    <div>
                        <div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm">${data.message}</p>
                        </div>
                        
                        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                    </div>
                </div>
            `;
        } else {
            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end">
                    <div>
                        <div class="bg-blue-300 p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm">${data.message}</p>
                        </div>
                        
                        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                    </div>

                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div>
                </div>
            `;
        }
    } else if (data.type == "users_update") {
        chatLogElement.innerHTML += `<p class="mt-2">The admin/agent has joined the chat!</p>`;
    } else if (data.type == "writing_active" && data.agent) {
        let tmpInfo = document.querySelector(".tmp-info");
        if (tmpInfo) {
            tmpInfo.remove();
        }
        console.log("Writing active triggered element")
        chatLogElement.innerHTML += `
                 <div class="tmp-info flex w-full mt-2 space-x-3 max-w-md">
                         <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div>
                         <div>
                             <div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg">
                                 <p class="text-sm">The agent/admin is writing a message.}</p>
                             </div>
                             
                         </div>
                 </div>
                 `
    }

    scrollToBottom();
}

/**
 * Events Listener
 */

chatOpenElement.onclick = (e) => {
    e.preventDefault();

    chatIconElement.classList.add("hidden");
    chatWelcomeElement.classList.remove("hidden");
    return false;
};

chatJoinElement.onclick = (e) => {
    e.preventDefault();

    chatWelcomeElement.classList.add("hidden");
    chatRoomElement.classList.remove("hidden");
    joinChatRoom();
    return false;
};

chatSubmitElement.onclick = (e) => {
    e.preventDefault();

    sendMessage();
    return false;
};

chatInputElement.onkeyup = function (e) {
    if (e.keyCode == 13) {
        sendMessage();
    }
};


chatInputElement.onfocus = function (e) {
    chatSocket.send(JSON.stringify({
        'type': 'update',
        'message': 'writing_active',
        'name': chatName,
        'agent': '',
    }))
}