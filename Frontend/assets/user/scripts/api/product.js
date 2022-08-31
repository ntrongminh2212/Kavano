var serverURL = "http://localhost:5000";
const productRouteURL = serverURL + "/product";

function getFeature(slProductContainer) {
    fetch(productRouteURL + "/feature", requestOption('GET'))
        .then(res => {
            return res.json();
        })
        .then(res => {
            if (res.success) {
                renderContainer(slProductContainer, res.products, renderProduct);
            }
        })
        .catch(err => {
            console.log(err);
        })
}

function getAllCategories(slCateContainer) {
    fetch(serverURL + "/category/all", requestOption('GET'))
        .then(res => {
            return res.json();
        })
        .then(res => {
            if (res.success) {
                renderContainer(slCateContainer, res.categories, renderHomeCategories);
            }
        })
        .catch(err => {
            console.log(err);
        })
}

function getSearchProduct(slSearchResults, searchStr, renderCallBack) {
    fetch(productRouteURL + `/filter/${searchStr}`, requestOption('GET'))
        .then(res => {
            return res.json();
        })
        .then(res => {
            if (res.success) {
                renderContainer(slSearchResults, res.products, renderCallBack);
            }
        })
        .catch(err => {
            console.log(err);
        })
}

function getProductDetail(productId, renderCallBack) {
    fetch(productRouteURL + `/${productId}`, requestOption('GET'))
        .then(res => {
            return res.json();
        })
        .then(res => {
            console.log(res);
            if (res.success) {
                if (typeof renderCallBack === 'function') {
                    renderCallBack(res.product);
                }
            } else {
                renderCallBack(undefined)
            }
        })
        .catch(err => {
            console.log(err);
        })
}

function addReviewAPI(data) {
    console.log(data);
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        return fetch(productRouteURL + '/review', requestOption('POST', data, userToken))
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

function updateReviewAPI(data) {
    console.log(data);
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        return fetch(productRouteURL + '/review', requestOption('PUT', data, userToken))
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

function deleteReviewAPI(data) {
    console.log(data);
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        return fetch(productRouteURL + '/review', requestOption('DELETE', data, userToken))
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
