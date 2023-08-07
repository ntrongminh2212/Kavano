var serverURL = "http://localhost:5000";
const usersRouteURL = serverURL + "/users";

function login(data) {
    fetch(usersRouteURL + "/admin/login", requestOption('POST', data))
        .then(res => {
            return res.json();
        })
        .then(res => {
            if (res.success) {
                localStorage.setItem("adminToken", res.userToken);
                localStorage.setItem("admin", JSON.stringify(res.user));
                window.location.href = "./orders_manage.html";
            } else {
                handleError("password", res.message);
            }
        })
}

function adminVerify() {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        return fetch(usersRouteURL + "/admin/", requestOption('POST', undefined, adminToken))
            .then(res => {
                console.log(res);
                if (res.status === 200) {
                    return true;
                } else {
                    window.location.href === 'http://127.0.0.1:5500/Frontend/assets/admin/views/login.html'
                        ? 1 : window.location.href = './login.html';
                    return false
                }
            })
            .catch(err => {
                console.log(err);
                window.location.href === 'http://127.0.0.1:5500/Frontend/assets/admin/views/login.html'
                    ? 1 : window.location.href = './login.html';
                return false;
            });
    }
}

function updateUserInfoAPI(data) {
    const userToken = localStorage.getItem("adminToken");
    if (userToken) {
        return fetch(usersRouteURL + "/update-info", requestOption('PUT', data, userToken))
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

function changeAvatarAPI(data) {
    const userToken = localStorage.getItem("adminToken");
    if (userToken) {
        return fetch(usersRouteURL + "/change-avatar", requestOption('PUT', data, userToken))
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

function changePasswordAPI(data) {
    const userToken = localStorage.getItem("adminToken");
    if (userToken) {
        return fetch(usersRouteURL + "/change-password", requestOption('PUT', data, userToken))
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

