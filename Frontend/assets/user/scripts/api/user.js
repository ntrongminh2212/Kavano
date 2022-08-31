var serverURL = "http://localhost:5000";
const usersRouteURL = serverURL + "/users";

function registry(data) {
    fetch(usersRouteURL + "/registry", requestOption('POST', data))
        .then(res => {
            return res.json();
        })
        .then(res => {
            console.log(res.error);
            if (res.success) {
                alert('Đăng ký thành công');
                window.location.href = './login.html';
            } else {
                handleError(res.dupCol, res.message);
            }
        })
        .catch(err => {
            console.log(err);
        })
}

function login(data) {
    fetch(usersRouteURL + "/login", requestOption('POST', data))
        .then(res => {
            return res.json();
        })
        .then(res => {
            if (res.success) {
                localStorage.setItem("userToken", res.userToken);
                localStorage.setItem("user", JSON.stringify(res.user));
                if (document.referrer) {
                    history.back(-1);
                } else {
                    window.location.href = "./home.html";
                }
            } else {
                handleError("password", res.message);
            }
        })
}

function getUserAdressAPI() {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        return fetch(usersRouteURL + "/address", requestOption('GET', undefined, userToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    return res.addresses;
                }
            })
    } else {
        window.location.href === 'http://127.0.0.1:5500/Frontend/assets/user/view/login.html'
            ? 1 : window.location.href = './login.html';
        return false
    }
}

function addUserAdressAPI(data) {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        return fetch(usersRouteURL + "/address", requestOption('POST', data, userToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                return res;
            })
    } else {
        window.location.href === 'http://127.0.0.1:5500/Frontend/assets/user/view/login.html'
            ? 1 : window.location.href = './login.html';
        return false
    }
}

function deleteUserAdressAPI(data) {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        return fetch(usersRouteURL + "/address", requestOption('DELETE', data, userToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                return res;
            })
    } else {
        window.location.href === 'http://127.0.0.1:5500/Frontend/assets/user/view/login.html'
            ? 1 : window.location.href = './login.html';
        return false
    }
}
