let coupons = [];
let inUseCoupon;
let previewTotal = 0;
let discount = 0;
let mycart = [];
let myaddresses = [];
let total = 0;
let pauseRt = false;

let rtMyaddesses = setInterval(async () => {
    if (!pauseRt) {
        let uptMyaddesses = await getUserAdressAPI();
        if (JSON.stringify(uptMyaddesses) !== JSON.stringify(myaddresses)) {
            myaddresses = uptMyaddesses;
            renderAddressItem();
        }
    }
}, 1500);
let rtMyCart = setInterval(async () => {
    if (!pauseRt) {
        let uptMycart = await getMyCart();
        if (JSON.stringify(uptMycart) !== JSON.stringify(mycart)) {
            console.log('up to date');
            mycart = uptMycart;
            setUp();
        }
    }
}, 1000);
let rtCoupons = setInterval(async () => {
    if (!pauseRt) {
        let uptCoupons = await getCoupons();
        if (JSON.stringify(uptCoupons) !== JSON.stringify(coupons)) {
            coupons = uptCoupons;
            renderContainer('.coupons-list', coupons, renderCouponsResult);
        }
    }
}, 1500);

async function setUp() {
    if (mycart.length > 0) {
        let pmMycart = new Promise((resolve, reject) => {
            resolve(renderContainer('#cart-all-items', mycart, renderMyCart));
        })

        pmMycart.then((val) => {
            setAmountBoxAction();
            setInterval(calcTotal, 0);
            inputAddressOnValueChange();
        })
    } else {
        document.querySelector("#cart-all-items").innerHTML = `<div class="empty-cart">
        Giỏ hàng trống
    </div>`
    }
    myaddresses = await getUserAdressAPI();
    if (myaddresses.length > 0) {
        fillShippingAddress(myaddresses[myaddresses.length - 1]);
        renderAddressItem();
    }
}

async function deleteCartItem(elCartItem) {
    let body, rs;
    var cartItem;
    if (elCartItem.id === 'delete-all') {
        body = JSON.stringify({ cartItems: mycart });
        rs = await dialog('alert', 'Toàn bộ giỏ hàng sẽ bị xóa hết?');
    } else {
        let itemSize = elCartItem.querySelector("div.size").innerText;
        cartItem = mycart.find(element => {
            return (element.product_id == elCartItem.id && element.size_name == itemSize);
        });
        body = JSON.stringify({ cartItems: [cartItem] });
        rs = await dialog('alert', 'Bạn có thực sự muốn xóa sản phẩm này khỏi giỏ hàng?');
    }
    if (rs) {
        pauseRt = true;
        const response = await deleteCartItemsAPI(body);
        if (response.success) {
            let elCartAmount = elMycart.querySelector(".actionbar #mycart span");
            console.log(elCartAmount);
            if (mycart.length > 0) {
                elCartAmount.style.display = "inline";
                elCartAmount.innerHTML = mycart.length - 1;
            } else {
                elCartAmount.style.display = "none";
            }
            pauseRt = false;
            if (cartItem) {
                mycart.splice(mycart.indexOf(cartItem), 1);
                elCartItem.remove();
            }
            notificationDialog('success', response.message);
        }
    }
}

function calcTotal() {
    let cartContainer = document.querySelector("#cart-all-items");
    let cartitems = cartContainer.querySelectorAll('div.cart-item input.select:checked');
    let spanMessage = document.querySelector('span#invalid-code')

    previewTotal = 0;
    Array.from(cartitems).forEach(item => {
        let product_id = item.parentElement.parentElement.id;
        let itemSize = item.parentElement.parentElement.querySelector("div.size").innerText;
        var cartItem = mycart.find(element => {
            return (element.product_id == product_id && element.size_name == itemSize);
        });
        previewTotal = previewTotal + (cartItem.price * cartItem.amount);
    });

    if (inUseCoupon) {
        if (previewTotal >= inUseCoupon.condition_by) {
            discount = previewTotal * inUseCoupon.value
            spanMessage.parentElement.classList.remove('invalid');
            spanMessage.parentElement.classList.add('valid');
            spanMessage.innerHTML = `Đã áp dụng mã giảm giá`;
        } else {
            discount = 0;
            spanMessage.parentElement.classList.add('invalid');
            spanMessage.parentElement.classList.remove('valid');
            spanMessage.innerHTML = `*Chưa đủ điều kiện >= ${priceFormat(inUseCoupon.condition_by)} VND`;
        }
    } else {
        discount = 0;
        spanMessage.parentElement.classList.remove('invalid');
        spanMessage.parentElement.classList.remove('valid');
        spanMessage.innerHTML = '';
    }
    total = previewTotal - discount;
    document.querySelector('span#discount').innerHTML = `-${priceFormat(discount)} VND`;
    document.querySelector('#preview-total').innerHTML = `${priceFormat(previewTotal)} VND`;
    document.querySelector('#cal-total').innerHTML = `${priceFormat(total)} VND`;
}

function selectAllCart(input) {
    let cartContainer = document.querySelector("#cart-all-items");
    let cartitems = cartContainer.querySelectorAll('div.cart-item input.select');

    Array.from(cartitems).forEach(item => {
        item.checked = input.checked;
    })
}

function fillShippingAddress(selectAddress) {
    var addressForm = document.querySelector('div#shipping');
    var inputs = addressForm.querySelectorAll('input[name]');
    Array.from(inputs).forEach(input => {
        input.value = selectAddress[input.name];
    })
}

// Set event funcs
async function couponsLoadAction() {
    renderContainer('.coupons-list', coupons, renderCouponsResult);
}

function filterCoupons(inputStr) {
    const filterCoupons = coupons.filter((coupon) => {
        return coupon.discount_code.includes(inputStr.toUpperCase());
    })
    renderContainer('.coupons-list', filterCoupons, renderCouponsResult);
}

function setCoupon(couponCode) {
    document.querySelector('input#coupon-code').value = couponCode;
    document.querySelector('input#coupon-code').dispatchEvent(new Event('change'));
}

function applyDiscount(couponCode) {
    inUseCoupon = coupons.find((coupon) => {
        return coupon.discount_code === couponCode.toUpperCase();
    });
}

function inputAddressOnValueChange() {
    let shippingContainer = document.querySelector('#shipping');
    let inputAddresses = shippingContainer.querySelectorAll('input');
    Array.from(inputAddresses).forEach(input => {
        input.focusout = function (evt) {
            setTimeout(() => {
                if (input.value) {
                    input.parentElement.classList.remove('invalid');
                }
            }, 170);
        }
    })
}

function setAmountBoxAction() {
    let cartContainer = document.querySelector("#cart-all-items");
    let cartitems = cartContainer.querySelectorAll('div.cart-item');

    Array.from(cartitems).forEach(item => {
        let bttIncrease = item.querySelector("span.increase");
        let bttDecrease = item.querySelector("span.decrease");
        let inputAmount = item.querySelector("input.amount");
        let formMessage = item.querySelector("span.form-message");
        let itemTotal = item.querySelector("span.item-total");
        let itemSize = item.querySelector("div.size").innerText;

        bttIncrease.onclick = function (evt) {
            inputAmount.value++;
            inputAmount.dispatchEvent(new Event('change'));
        }

        bttDecrease.onclick = function (evt) {
            inputAmount.value--;
            inputAmount.dispatchEvent(new Event('change'));
        }

        inputAmount.onchange = async function (evt) {
            var amount = Number(inputAmount.value);
            var cartItem = mycart.find(element => {
                return (element.product_id == item.id && element.size_name == itemSize);
            });

            if (amount === 0) {
                deleteCartItem(item);
                inputAmount.value = 1;
            }
            else if (amount > cartItem.stock) {
                inputAmount.parentElement.parentElement.classList.add('invalid');
                Number(cartItem.stock) === 0 ?
                    (formMessage.innerText = `*Đã hết size ${cartItem.size_name}`) :
                    (formMessage.innerText = `*Chỉ còn lại ${cartItem.stock} size ${cartItem.size_name}`);
            } else {
                inputAmount.parentElement.parentElement.classList.remove('invalid');
                formMessage.innerText = ``;
            }
            itemTotal.innerText = `${priceFormat(cartItem.price * inputAmount.value)} VND`;
            cartItem.amount = Number(inputAmount.value);
            pauseRt = true;
            const response = await updateCartItem(JSON.stringify({ cartItem }));
            if (response === 202) {
                pauseRt = false;
            } else {
                console.log(response);
            }
        }
    });
}

function selectAddressAction(elAddress) {
    var properties = elAddress.querySelectorAll('span[class]');
    var selectAddress = myaddresses.find(address => {
        return Array.from(properties).every(property => {
            return property.innerHTML === address[property.className];
        })
    })
    fillShippingAddress(selectAddress);
    let modalAddress = document.querySelector('#addresses-modal');
    modalAddress.style.display = 'none';
}

async function deleteAddressAction(elAddress) {
    const option = await dialog('alert', 'Bạn có chắc muốn xóa địa chỉ này không');
    if (option) {
        var properties = elAddress.querySelectorAll('span[class]');
        var selectAddress = myaddresses.find(address => {
            return Array.from(properties).every(property => {
                return property.innerHTML === address[property.className];
            })
        })
        const response = await deleteUserAdressAPI(JSON.stringify(selectAddress));
        console.log(response);
        if (response.success) {
            notificationDialog('success', response.message)
        }
    }
}

function outStockNotification(productStocks) {
    let cartContainer = document.querySelector("#cart-all-items");
    let cartitems = cartContainer.querySelectorAll('div.cart-item');

    Array.from(cartitems).forEach(item => {
        let inputAmount = item.querySelector("input.amount");

        mycart.forEach(cartItem => {
            const productStock = productStocks.find(productStock => {
                return (productStock.product_id == cartItem.product_id) && (productStock.size_name == cartItem.size_name);
            })
            if (productStock) {
                cartItem.stock = Number(productStock.stock);
                inputAmount.dispatchEvent(new Event('change'));
            }
        });
    })
}

async function createOrderEvent() {

    let cartContainer = document.querySelector("#cart-all-items");
    let shippingContainer = document.querySelector('#shipping');

    let elCartItems = cartContainer.querySelectorAll('div.cart-item input.select:checked');
    let inputAddresses = shippingContainer.querySelectorAll('input');
    let isFullfill = true;
    let alertMess = [' ', ' '];

    let address = '';
    let orderItems = Array.from(elCartItems).map(item => {
        let product_id = item.parentElement.parentElement.id;
        let itemSize = item.parentElement.parentElement.querySelector("div.size").innerText;
        var item = mycart.find(element => {
            return (element.product_id == product_id && element.size_name == itemSize);
        });
        return item;
    });

    // Select item?
    if (orderItems.length === 0) {
        isFullfill = false;
        alertMess[0] = 'Bạn chưa chọn sản phẩm nào trong giỏ hàng \n';
    }
    // Shipping address full fill?
    var inUseAddress = {};
    Array.from(inputAddresses).reverse().forEach(input => {
        if (!input.value) {
            input.parentElement.classList.add('invalid');
            isFullfill = false;
            alertMess[1] = 'Bạn chưa điền đầy đủ địa chỉ giao hàng';
        } else {
            inUseAddress[input.name] = input.value.trim();
            address ? (address += ', ' + input.value) : (address += input.value);
        }
    })
    // Data->JSON
    try {
        applyDiscount(inUseCoupon.discount_code)
    } catch (error) {

    }
    if (isFullfill) {
        const order = {
            address: address,
            discount: inUseCoupon,
            orderitems: orderItems
        }
        await checkNewAddress(inUseAddress);
        const option = await dialog('alert', 'Xác nhận đặt hàng?')
        if (option) {
            loadingDialog();
            const response = await createOrder(JSON.stringify(order));
            if (response.success) {
                document.querySelector("section#main").innerHTML = `
            <div class="order-success">
                <h5 class="p-4">Đặt hàng thành công mã đơn hàng: ${response.order_id}</h5>
                <img style="width: 12%;" src="../img/modal/success.png" class="mt-4" alt="">
                <span style="font-size: 24px; font-style: italic;">Cảm ơn bạn đã mua hàng tại Kavano!</span>
                <a id="my-order" href="./my-orders.html" class="mt-4">Xem đơn hàng của bạn</a>
            </div>`
                let sectionDialog = document.querySelector("section[id='dialog']");
                sectionDialog.innerHTML = '';
            } else {
                //abc
                dialog('failure', 'Không thể đặt hàng vì số lượng tồn sản phẩm không đủ');
                outStockNotification(response.productStocks);
            }
        }
    } else {
        rs = await dialog('failure', alertMess[0] + alertMess[1]);
    }
}

function checkNewAddress(inUseAddress) {
    return new Promise(async (resolve, reject) => {
        const isExist = myaddresses.some(address => {
            return inUseAddress.province === address.province
                && inUseAddress.district === address.district
                && inUseAddress.ward === address.ward
                && inUseAddress.address === address.address
        })

        if (!isExist) {
            const option = await dialog('alert', 'Ghi nhận địa chỉ mới, bạn có muốn thêm vào sổ địa chỉ không? ')
            if (option) {
                const response = await addUserAdressAPI(JSON.stringify(inUseAddress));
                if (response.success) {
                    notificationDialog('success', response.message);
                    resolve(true);
                } else {
                    resolve(false)
                }
            } else {
                resolve(false)
            }
        } else {
            resolve(false)
        }
    })
}

// Rendering funcs
function renderAddressModal() {
    let modalAddress = document.querySelector('#addresses-modal');
    let bttCloseModal = modalAddress.querySelector('#close-addresses-modal');
    modalAddress.style.display = 'block';
    bttCloseModal.onclick = function () {
        modalAddress.style.display = 'none';
    }
}

function renderCouponsResult(coupons) {
    return coupons.map((coupon) => {
        return `<div id="${coupon.discount_code}" class="coupon" onclick="setCoupon('${coupon.discount_code}')">
            <span class="code">${coupon.discount_code}</span>
            <p class="description">${coupon.description}</p>
            <span class="value">-${coupon.value * 100}%</span>
        </div>`
    }).join('');
}

function renderMyCart() {
    return mycart.map((item) => {
        return `<div id="${item.product_id}" class="cart-item row my-2">
        <label class="select-item item-propety col">
            <input class="select" type="checkbox" value="${item.product_id}">
            <span class="checkmark"></span>
        </label>
        <div class="item-propety col-5">
            <img class="image" src="${item.image_url}" alt="">
            <div class="product-name px-4" style="align-self: center; width: 100%;">
                <a href="./product-detail.html?id=${item.product_id}">
                    ${item.name}
                </a>
            </div>
            <div class="size" style="align-self: center; font-weight: 500;">${item.size_name}</div>
        </div>
        <span id="price" class="item-propety col-2">${priceFormat(item.price)} VND</span>
        <div id="amount" class="item-propety col-2">
            <div class="form-group">
                <div class="amount-box">
                    <span class="decrease">
                        <i class="icon-minus"></i>
                    </span>
                    <input type="tel" class="amount" value="${item.amount}" min="0">
                    <span class="increase">
                        <i class="icon-plus"></i>
                    </span>
                </div>
                <span class="form-message"></span>
            </div class="form-group">
        </div>
        <span class="item-total item-propety col-2">${priceFormat(item.amount * item.price)} VND</span>
        <div class="item-propety delete-item col">
            <i data-toggle="tooltip" data-placement="bottom" class="icon-trash"
                title="Xóa khỏi giỏ hàng" onclick="deleteCartItem(this.parentNode.parentNode)"></i>
        </div>
    </div>`
    }).join('');
}

function renderAddressItem() {
    var addressesContainer = document.querySelector('#addresses-container');
    addressesContainer.innerHTML = myaddresses.map(address => {
        return `<div class="address-item">
        <div class="address-data" onclick="selectAddressAction(this)">
            <span class="address">${address.address}</span>,
            <span class="ward">${address.ward}</span>,
            <span class="district">${address.district}</span>,
            <span class="province">${address.province}</span>
        </div>
        <i data-toggle="tooltip" data-placement="bottom" class="delete-address icon-trash" title=""
            data-original-title="Xóa địa chỉ"
            onclick="deleteAddressAction(this.previousElementSibling)"></i>
    </div>`
    }).join('');
}