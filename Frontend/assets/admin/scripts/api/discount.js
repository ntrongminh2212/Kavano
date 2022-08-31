var serverURL = "http://localhost:5000";
const discountRouteURL = serverURL + "/discount";

function getAllCouponsAPI() {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        return fetch(discountRouteURL + "/admin", requestOption('GET', undefined, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    return res.coupons;
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

function generateDiscountCodeAPI() {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        return fetch(discountRouteURL + "/getid", requestOption('GET', undefined, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    console.log(res);
                    return res.discount_code;
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

function updateCouponAPI(coupon) {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        return fetch(discountRouteURL + "/admin", requestOption('PUT', coupon, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                console.log(res);
                return res;
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

function deleteCouponAPI(coupon) {
    console.log(coupon);
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        return fetch(discountRouteURL + "/admin", requestOption('DELETE', coupon, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                console.log(res);
                return res;
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


function createCouponAPI(coupon) {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        return fetch(discountRouteURL + "/admin", requestOption('POST', coupon, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                console.log(res);
                return res;
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