var serverURL = "http://localhost:5000";
const orderRouteURL = serverURL + "/order";

function createOrder(order) {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        return fetch(orderRouteURL + '/create-order', requestOption('POST', order, userToken))
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

function getOrders() {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        console.log('get orders');
        return fetch(orderRouteURL + "/my-orders", requestOption('GET', undefined, userToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    console.log('my orders', res);
                    return res.orders;
                } else {
                    window.location.href === 'http://127.0.0.1:5500/Frontend/assets/user/view/login.html'
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

function cancelOrderAPI(order) {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        console.log(userToken);
        return fetch(orderRouteURL + "/cancel", requestOption('PUT', order, userToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                return res;
            })
            .catch(err => {
                console.log(err);
                return false;
            });
    } else {
        window.location.href === 'http://127.0.0.1:5500/Frontend/assets/admin/views/login.html'
            ? 1 : window.location.href = './login.html';
        return false
    }
}
