import { BigNumber, ethers } from "../scripts/lib/ethers-5.1.esm.min.js"
import { abi, contractAddress } from "./lib/constants.js";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const KavanoOrder = new ethers.Contract(contractAddress, abi, signer);
const divPayMethodContainer = document.querySelector('.payment-method')
const order = JSON.parse(localStorage.getItem('order'));
let previewTotal = 0, discount = 0, calTotal = 0;

order.orderitems.forEach(item => {
    previewTotal += (item.price * item.amount)
});

discount = order.discount ? previewTotal * order.discount.value : 0;
calTotal = previewTotal - discount;
console.log(order);

constructor()
function constructor() {
    if (order) {
        renderContainer('#cart-all-items', order, renderOrder);
    }
    const bttConfirmOrder = document.querySelector('button[id="go-order"]');
    bttConfirmOrder.onclick = () => {
        bttConfirmOrder.setAttribute('disabled', '');
        bttConfirmOrder.style.backgroundColor = 'Grey';

        let i = 30;
        let paymentTimeInterval = setInterval(() => {
            bttConfirmOrder.innerHTML = `Hãy thanh toán trong 00:${i}`
            i--;
        }, 1000)
        setTimeout(() => {
            clearInterval(paymentTimeInterval);
            bttConfirmOrder.innerHTML = `Hết thời gian thanh toán`
        }, 29900)
        createOrderEvent();
    }

    let inputPayMethods = divPayMethodContainer.querySelectorAll('input');
    let ethPayContainer = document.querySelector('.eth-pay-container');
    let ethPay = ethPayContainer.querySelector('#eth-pay');
    inputPayMethods.forEach(input => {
        input.onchange = async () => {
            const selectedPayMethod = divPayMethodContainer.querySelector('input[name="method"]:checked').value;
            switch (Number(selectedPayMethod)) {
                case 0:
                    ethPayContainer.style.display = 'none'
                    break;
                case 1:
                    const TotalEth = await KavanoOrder.USDtoWEI(ethers.utils.parseEther((calTotal / 24000).toString()));
                    console.log(ethers.utils.formatEther(TotalEth));
                    ethPay.innerHTML = `≈ ${ethers.utils.formatEther(TotalEth)} <i class="fa-brands fa-ethereum" ></i>`
                    ethPayContainer.style.display = 'flex'
                    break;
                default:
                    break;
            }
        }
    })
}

function createOrderEvent() {
    const inputPayMethod = document.querySelector('input[name="method"]:checked')
    if (Number(inputPayMethod.value) === 1) {
        orderByEth();
    } else if (Number(inputPayMethod.value) === 0) {
        orderByCash();
    }
}

async function orderByCash() {
    const option = await dialog('alert', 'Xác nhận đặt hàng?')
    if (option) {
        loadingDialog();
        const response = await createOrder(JSON.stringify(order));
        if (response.success) {
            document.querySelector("section#main").innerHTML = `
        <div class="order-success">
            <h5 class="p-4">Đặt hàng thành công mã đơn hàng: ${order.order_id}</h5>
            <img style="width: 12%;" src="../img/modal/success.png" class="mt-4" alt="">
            <span style="font-size: 24px; font-style: italic;">Cảm ơn bạn đã mua hàng tại Kavano!</span>
            <a id="my-order" href="./my-orders.html" class="mt-4">Xem đơn hàng của bạn</a>
        </div>`
            let sectionDialog = document.querySelector("section[id='dialog']");
            sectionDialog.innerHTML = '';
        } else {
            //abc
            dialog('failure', 'Không thể đặt hàng vì số lượng tồn sản phẩm không đủ');
        }
    }
}

async function orderByEth() {
    const rs = await connectWallet();
    if (rs) {
        order['payment_method'] = 'CRYPTO';
        const response = await createOrder(JSON.stringify(order), 'CRYPTO');
        if (response.success) {
            fund(response.order_id, response.totalEth);
        } else {
            //abc
            dialog('failure', 'Không thể đặt hàng vì số lượng tồn sản phẩm không đủ');
        }
    }
}

async function fund(order_id, ethAmount) {
    if (typeof window.ethereum !== "undefined") {
        order['order_id'] = order_id;
        order['status'] = 'Pending';
        try {
            const transactionResponse = await KavanoOrder.fund(order_id, { value: ethAmount })
            await transactionlistener(transactionResponse, provider);
        } catch (error) {
            dialog('failure', 'Người dùng hủy giao dịch');
        }
    }
}

function transactionlistener(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return provider.once(transactionResponse.hash, (receipt) => {
        // const rs = await updateOrder(JSON.stringify(order));
        document.querySelector("section#main").innerHTML = `
            <div class="order-success">
                <h5 class="p-4">Đặt hàng thành công mã đơn hàng: ${order.order_id}</h5>
                <img style="width: 12%;" src="../img/modal/success.png" class="mt-4" alt="">
                <span style="font-size: 24px; font-style: italic;">Cảm ơn bạn đã mua hàng tại Kavano!</span>
                <a id="my-order" href="./my-orders.html" class="mt-4">Xem đơn hàng của bạn</a>
            </div>`
        let sectionDialog = document.querySelector("section[id='dialog']");
        sectionDialog.innerHTML = '';
        localStorage.removeItem('order');
    })
}

function renderOrder(order) {
    document.querySelector('#address').innerHTML = order.address;
    document.querySelector('#discount-code').innerHTML = order.discount ? order.discount.discount_code : "Không có";
    document.querySelector('#preview-total').innerHTML = priceFormat(previewTotal) + ' VND';
    document.querySelector('#discount').innerHTML = `-${priceFormat(discount)} VND`;
    document.querySelector('#cal-total').innerHTML = priceFormat(calTotal) + ' VND';

    return order.orderitems.map((item) => {
        return `<div id="${item.product_id}" class="cart-item row">
            <div class="item-propety col-6">
                <img class="image" src="${item.image_url}" alt="">
                <div class="product-name px-4" style="align-self: center; width: 100%;">
                    <a href="./product-detail.html?id=${item.product_id}">
                        ${item.name}
                    </a>
                </div>
                <div class="size" style="align-self: center; font-weight: 500;">${item.size_name}</div>
            </div>
            <span id="price" class="item-propety col-2">${priceFormat(item.price)} VND</span>
            <span id="amount" class="item-propety col-2">x${item.amount}</span>
            <span class="item-total item-propety col-2">${priceFormat(item.amount * item.price)} VND</span>
        </div>`
    }).join('');
}

var serverURL = "http://localhost:5000";
const orderRouteURL = serverURL + "/order";
function createOrder(order, payment_method = 'CASH') {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        if (payment_method === 'CRYPTO')
            return fetch(orderRouteURL + '/create-crypto-order', requestOption('POST', order, userToken))
                .then(res => {
                    return res.json();
                })
                .then(res => {
                    console.log(res);
                    return res;
                })
                .catch(err => {
                    console.log(err);
                })
        else return fetch(orderRouteURL + '/create-order', requestOption('POST', order, userToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                console.log(res);
                return res;
            })
            .catch(err => {
                console.log(err);
            })
    } else {
        window.location.href = "./login.html";
    }
}