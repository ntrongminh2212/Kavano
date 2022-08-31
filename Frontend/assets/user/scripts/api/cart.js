var serverURL = "http://localhost:5000";
const cartRouteURL = serverURL + "/cart";
const discountRouteURL = serverURL + "/discount";

function addToCart(cartItem) {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        return fetch(cartRouteURL, requestOption('POST', cartItem, userToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                alert(res.message);
            })
            .catch(err => {
                console.log(err);
            })

    } else {
        window.location.href = "./login.html";
    }
}

function deleteCartItemsAPI(cartItem) {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        return fetch(cartRouteURL, requestOption('DELETE', cartItem, userToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                return res;
            })
            .catch(err => {
                console.log(err);
            })

    } else {
        window.location.href = "./login.html";
    }
}

function updateCartItem(cartItem) {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        return fetch(cartRouteURL, requestOption('PUT', cartItem, userToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                return res.success;
            })
            .catch(err => {
                console.log(err);
            })

    } else {
        window.location.href = "./login.html";
    }
}

async function getCoupons() {
    return fetch(discountRouteURL, requestOption('GET'))
        .then(res => {
            return res.json();
        })
        .then(res => {
            return res.coupons;
        })
        .catch(err => {
            console.log(err);
        })
}