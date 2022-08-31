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

function getAllCategories() {
    return fetch(serverURL + "/category/all", requestOption('GET'))
        .then(res => {
            return res.json();
        })
        .then(res => {
            if (res.success) {
                return res.categories;
            }
        })
        .catch(err => {
            console.log(err);
        })
}

function getAllBrands() {
    return fetch(serverURL + "/brand/all", requestOption('GET'))
        .then(res => {
            return res.json();
        })
        .then(res => {
            if (res.success) {
                return res.brands;
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

function getAllProduct(slSearchResults, renderCallBack) {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
        fetch(productRouteURL + `/all-products`, requestOption('GET', undefined, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                console.log(res);
                if (res.success) {
                    renderContainer(slSearchResults, res.products, renderCallBack);
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

function getSizes() {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
        return fetch(productRouteURL + `/sizes`, requestOption('GET', undefined, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                console.log(res);
                if (res.success) {
                    return res.sizes;
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

function getProductDetail(productId) {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
        return fetch(productRouteURL + `/admin/${productId}`, requestOption('GET', undefined, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    return res.product;
                }
            })
            .catch(err => {
                console.log(err);
            })
    } else {
        window.location.href === 'http://127.0.0.1:5500/Frontend/assets/admin/views/login.html'
            ? 1 : window.location.href = './login.html';
        return false
    }
}

function createNewProductAPI(newProduct) {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
        fetch(productRouteURL + `/create`, requestOption('POST', newProduct, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    notificationDialog("success", "Tạo thành công sản phẩm mới");
                    window.location.href = `./product-detail.html?id=${res.product_id}`;
                    return res;
                } else {
                    alert(res.message);
                    return false
                }
            })
            .catch(err => {
                alert('Tạo sản phẩm thất bại');
                return false;
            });
    } else {
        window.location.href === 'http://127.0.0.1:5500/Frontend/assets/admin/views/login.html'
            ? 1 : window.location.href = './login.html';
        return false
    }
}

function importStockAPI(product_detail) {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
        return fetch(productRouteURL + `/admin/import-stock`, requestOption('PUT', product_detail, adminToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    return res;
                } else {
                    alert(res.message);
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

function updateProductAPI(product) {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
        return fetch(productRouteURL + `/admin/update-product`, requestOption('PUT', product, adminToken))
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

function deleteProductAPI(product) {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
        return fetch(productRouteURL + `/admin/update-product`, requestOption('DELETE', product, adminToken))
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

function addProductImageAPI(product_img) {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
        return fetch(productRouteURL + `/admin/add-product-img`, requestOption('POST', product_img, adminToken))
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

function deleteProductImageAPI(image_url) {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
        return fetch(productRouteURL + `/admin/delete-product-img`, requestOption('DELETE', image_url, adminToken))
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