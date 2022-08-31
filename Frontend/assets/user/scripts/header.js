let user = {};
let cart = [];
let actionBar = document.querySelector(".actionbar");
let searchbox = document.querySelector(".searchbox");
let elNotification = actionBar.querySelector('#notification');
let elUser = actionBar.querySelector('#user');
let elLogin = actionBar.querySelector('#login');
let elMycart = actionBar.querySelector('#mycart');
let elLogout = actionBar.querySelector('#logout')

setHeaderEventListener();
setLoginStatus();
cartAmount();

function setLoginStatus() {

    if (localStorage.getItem("userToken")) {
        elLogin.style.display = 'none';
        elNotification.style.display = 'block';
        elUser.style.display = 'block';
        elMycart.style.display = 'block';

        user = JSON.parse(localStorage.getItem("user"));
        elUser.querySelector("img").src = user.avatar;
    } else {
        elLogin.style.display = 'block';
        elNotification.style.display = 'none';
        elUser.style.display = 'none';
        elMycart.style.display = 'none';
    }
}

function setHeaderEventListener() {
    setSearchEvent();
    setActionBarEvent();
}

function setSearchEvent() {
    let searchform = searchbox.querySelector("form");
    let searchBar = searchform.querySelector("input[id]");
    let searchResults = searchbox.querySelector("#search-results")
    searchBar.onkeyup = function (event) {
        if (searchBar.value) {
            getSearchProduct("#search-results", searchBar.value, renderSearchResults);
        } else {
            searchResults.innerHTML = "";
        }
    }
}

function setActionBarEvent() {
    elMycart.onclick = function (event) {
        window.location.href = "./my-cart.html";
    }
    elLogout.onclick = function (event) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("user")
        location.reload();
    }
}

async function cartAmount(callback) {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        cart = await getMyCart();
        let elCartAmount = elMycart.querySelector("span");
        if (cart.length > 0) {
            elCartAmount.style.display = "inline";
            elCartAmount.innerHTML = cart.length;
        } else {
            elCartAmount.style.display = "none";
        }
        if (typeof callback === 'function') {
            callback();
            delete callback;
        }
    }
}