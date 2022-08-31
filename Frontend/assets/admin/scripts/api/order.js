var serverURL = "http://localhost:5000";
const orderRouteURL = serverURL + "/order";

function getOrders() {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        return fetch(orderRouteURL + "/my-orders", requestOption('GET', undefined, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    return res.orders;
                } else {
                    window.location.href === 'http://127.0.0.1:5500/Frontend/assets/admin/views/login.html'
                        ? 1 : window.location.href = './login.html';
                    return false
                }
            })
            .catch(err => {
                window.location.href === 'http://127.0.0.1:5500/Frontend/assets/admin/views/login.html'
                    ? 1 : window.location.href = './login.html';
                return false;
            });
    } else {
        window.location.href === 'http://127.0.0.1:5500/Frontend/assets/admin/views/login.html'
            ? 1 : window.location.href = './login.html';
        return false
    }
}


function updateOrderStatus(order) {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        return fetch(orderRouteURL + "/update-status", requestOption('PUT', order, adminToken))
            .then(res => {
                console.log('update order response', res);
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

function cancelOrderAPI(order) {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        return fetch(orderRouteURL + "/cancel", requestOption('PUT', order, adminToken))
            .then(res => {
                console.log('cancel response', res);
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

function getStatisticDataAPI(dayfrom, dayto, by = 'day') {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        return fetch(orderRouteURL + `/admin/statistic?dayfrom=${dayfrom} 00:00:00&dayto=${dayto}&by=${by}`, requestOption('GET', undefined, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    return res;
                } else {
                    console.log(res.message);
                    return false
                }
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