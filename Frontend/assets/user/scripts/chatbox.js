import {
    firebaseDb,
    firebaseDbRef,
    firebaseSet,
    onValue
} from '../scripts/firebase.js'
var serverURL = "http://localhost:5000";
const orderRouteURL = serverURL + "/order";

let deliverOrders;
let deliverOrdersFb = [];
let orderChatHistory = {};
let orderChats = [];
var elChatBox = document.querySelector('#chatbox');
var elClose = document.querySelector('#close-chatbox');
var elChatBoxColapse = document.querySelector('#chatbox-colapse');
let headerChat = document.querySelector('#chatbox main header');
let selectedChatKey = '';

onValue(firebaseDbRef(firebaseDb, `orders`), async (snapshot) => {
    if (snapshot.exists()) {
        let orders = snapshot.val();
        if (orders) {
            const user_id = JSON.parse(localStorage.getItem("user")).user_id;
            // console.log(user_id);
            let updDeliOrdersFb = Object.keys(orders).filter(order_id => {
                return (orders[order_id].user_id == user_id)
                    && (orders[order_id].status == 'Deliver')
            })

            if (JSON.stringify(deliverOrdersFb) !== JSON.stringify(updDeliOrdersFb)) {
                deliverOrders = (await getOrders()).filter((order) => {
                    return order.status === 'Deliver'
                })

                let notListenChatKeys = updDeliOrdersFb.filter((order_id) => {
                    return !deliverOrdersFb.includes(order_id)
                })
                orderChats = orderChats.filter((orderChat) => {
                    return updDeliOrdersFb.includes(orderChat.order_id)
                })

                handleListenTochats(notListenChatKeys);
                deliverOrdersFb = updDeliOrdersFb;
            }
        } else {
            console.log('Không có đơn hàng');
        }
    }
})

handleChatBoxEvent()

function getOrders() {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        // console.log('get orders');
        return fetch(orderRouteURL + "/my-orders", requestOption('GET', undefined, userToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    // console.log('my orders', res);
                    return res.orders;
                } else {
                    window.location.href === 'Frontend/assets/user/view/login.html'
                        ? 1 : window.location.href = './login.html';
                    return false
                }
            })
            .catch(err => {
                window.location.href === 'http://127.0.0.1:5500/Frontend/assets/user/view/login.html'
                    ? 1 : window.location.href = './login.html';
                return false;
            });
    } else {
        window.location.href === 'http://127.0.0.1:5500/Frontend/assets/user/view/login.html'
            ? 1 : window.location.href = './login.html';
        return false
    }
}

function handleListenTochats(notListenChatKeys) {
    let notListenChatOrders = deliverOrders.filter((order) => {
        return notListenChatKeys.includes(order.order_id)
    })
    console.log(notListenChatOrders);
    notListenChatOrders.forEach((order) => {
        onValue(firebaseDbRef(firebaseDb, `messenger/${order.order_id}/`), (snapshot) => {
            if (snapshot.exists()) {
                let lstTimeStamp = snapshot.val();
                orderChatHistory[order.order_id] = lstTimeStamp;
                if (lstTimeStamp) {
                    let lastTimeStamp = Math.max(...Object.keys(lstTimeStamp));
                    updOrderChats({
                        order_id: order.order_id,
                        avatar: order.shipper_avatar,
                        name: order.shipper_name,
                        lastMessage: lstTimeStamp[lastTimeStamp].message,
                        lastTimeStamp: lastTimeStamp,
                        lastTimeSend: calcLastTimeMessage(lastTimeStamp),
                        unreadMessageNums: 0
                    });
                } else {
                    updOrderChats({
                        order_id: order.order_id,
                        avatar: order.shipper_avatar,
                        name: order.shipper_name,
                        lastMessage: 'Hiện chưa có tin nhắn nào',
                        lastTimeStamp: null,
                        lastTimeSend: '',
                        unreadMessageNums: 0
                    })
                }
                if (headerChat.getAttribute('order_id') === order.order_id) {
                    renderChat(order.order_id);
                }
            } else {
                console.log('Chua co don hang nao van chuyen');
            }
        })
    })
}

function handleChatBoxEvent() {
    elChatBoxColapse.onclick = () => {
        elChatBox.style.display = 'block';
        elChatBoxColapse.style.display = 'none';
    }
    elClose.onclick = () => {
        elChatBox.style.display = 'none';
        elChatBoxColapse.style.display = 'block';
    }
}


function calcLastTimeMessage(lastTimeStamp) {
    if (lastTimeStamp) {
        let remainTime = new Date().getTime() - lastTimeStamp;

        let second = 1000;
        let minute = 60 * 1000;
        let hour = 60 * minute;
        let day = 24 * hour;

        if ((remainTime / second) < 60) return "Vừa xong"
        else if ((remainTime / minute) < 60) return `${Math.floor(remainTime / minute)} phút`
        else if ((remainTime / hour) < 24) return `${Math.floor(remainTime / hour)} tiếng`
        else if ((remainTime / day) < 30) return `${Math.floor(remainTime / day)} ngày`
    } else return ''
}

function timeSendFormat(timeSend) {
    if (timeSend) {
        let remainTime = new Date().getTime() - timeSend;
        let date = new Date()

        let second = 1000;
        let minute = 60 * 1000;
        let hour = minute * 60
        let day = 24 * hour;
        let yesterday = new Date().getTime() - new Date().getTime() % day;

        let hourStr = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        let minutesStr = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        let noonStr = hour < 12 ? 'AM' : 'PM'
        let timeFormatStr = `${hourStr}:${minutesStr} ${noonStr}`;

        if ((remainTime / second) < 60) return "Vừa xong"
        else if ((remainTime / minute) < 60) return `${Math.floor(remainTime / minute)} phút`
        else if (timeSend > yesterday) {
            return timeFormatStr;
        } else if ((yesterday / timeSend) < 30) return `${Math.floor(yesterday / timeSend)} ngày`
    } else return ''
}

const updOrderChats = (updOrderChat) => {
    // if (!onScreen) return;

    let index = orderChats.findIndex(orderChat => {
        return orderChat.order_id === updOrderChat.order_id
    })
    // console.log(index, updOrderChat.order_id, orderChats);
    if (index >= 0) {
        orderChats[index] = updOrderChat;
    } else {
        orderChats.push(updOrderChat);
    }
    console.log('updOrderChats', orderChats);
    renderListShippers();
}

function renderListShippers() {
    let ulShippers = document.querySelector('#chatbox #list-shippers')
    ulShippers.innerHTML = orderChats.map((order) => {
        return `
    <li>
        <div class="order-id">
            <i class="fa-solid fa-receipt" style="margin-right:4px;"></i>
            <h3>${order.order_id}</h3>
        </div>
        <div>
            <img src="${order.avatar}" alt="">
            <div>
                <h2>${order.name}</h2>
                <div class="d-flex flex-row">
                    <span class="col-8">${order.lastMessage}</span>
                    <span class="col-4">${order.lastTimeSend}</span>
                </div>
            </div>
        </div>
    </li>`
    }).join('')
    let lstLi = ulShippers.querySelectorAll('li');

    lstLi.forEach((li) => {
        let order_id = li.querySelector(".order-id h3").innerHTML;
        li.addEventListener('click', () => { renderChat(order_id) })
    })
}

function renderChat(order_id) {
    let ulMessage = document.querySelector('#chat');

    headerChat.setAttribute('order_id', order_id);

    let order = deliverOrders.find((order) => { return order.order_id === order_id })
    headerChat.innerHTML =
        ` <img src="${order.shipper_avatar}" alt="">
      <div class="col-10">
        <h2 id="shipperr-name">${order.shipper_name}</h2>
      </div>
      `

    let chatMessages = orderChatHistory[order_id];
    ulMessage.innerHTML = Object.keys(chatMessages).map((timeStamp) => {
        return ` 
        <li class="${chatMessages[timeStamp].isSender ? 'you' : 'me'}">
            ${chatMessages[timeStamp].isSender ? '' : `<span class="timesend" style="display: none;">${timeSendFormat(timeStamp)}</span>`}
            <div class="message">
                 ${chatMessages[timeStamp].message}
            </div>
            ${chatMessages[timeStamp].isSender ? `<span class="timesend" style="display: none;">${timeSendFormat(timeStamp)}</span>` : ''}
        </li>`
    }).join('')
    let lstLi = ulMessage.querySelectorAll('li');
    lstLi.forEach((li) => {
        let spanTimeSend = li.querySelector(".timesend");
        li.addEventListener('mouseover', () => { spanTimeSend.style.display = 'inline' })
        li.addEventListener('mouseleave', () => { spanTimeSend.style.display = 'none' })
    })
    ulMessage.scrollTop = ulMessage.offsetHeight;
    addSendMessageEvent(order_id);
}


function addSendMessageEvent(order_id) {
    let bttSend = elChatBox.querySelector('#send-msg');
    let input = elChatBox.querySelector('#typed-text');

    bttSend.onclick = () => {
        let typedText = input.value;
        if (typedText.trim().length == 0) {
            return;
        }
        let newMessage = {
            isSender: false,
            message: typedText
        }
        console.log();
        firebaseSet(firebaseDbRef(
            firebaseDb,
            `messenger/${order_id}/${new Date().getTime()}`),
            newMessage)
        input.value = '';
    }
}