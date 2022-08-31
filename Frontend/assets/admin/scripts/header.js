let user = {};
let actionBar = document.querySelector(".actionbar");
let searchbox = document.querySelector(".searchbox");
let elNotification = actionBar.querySelector('#notification');
let elUser = actionBar.querySelector('#user');
let elLogin = actionBar.querySelector('#login');
setHeaderEventListener();
setLoginStatus();

function setLoginStatus() {

    if (adminVerify()) {
        elLogin.style.display = 'none';
        elNotification.style.display = 'block';
        elUser.style.display = 'block';

        user = JSON.parse(localStorage.getItem("admin"));
        elUser.querySelector("img").src = user.avatar;
    } else {
        elLogin.style.display = 'block';
        elNotification.style.display = 'none';
        elUser.style.display = 'none';
    }
}

function setHeaderEventListener() {
    setSearchEvent();
    setActionBarEvent();
}

function setSearchEvent() {
    try {
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
    } catch (error) {

    }
}

function setActionBarEvent() {

}