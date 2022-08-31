const params = new URLSearchParams(window.location.search);
const product_id = params.get('id');
const review_id = params.get('review');
let product;
getProductDetail(product_id, setUp);

if (review_id) {
    setTimeout(scrollToReview, 1000);
}

function setUp(result) {
    product = result;
    renderContainer(".breadcrumb", product, renderBreadcrumb);
    renderContainer(".images-group", product.images, renderImageGroup);
    renderContainer("#product-info", product, renderProductInfo);
    if (product.reviews.length > 0) {
        renderContainer("#all-reviews", product.reviews, renderReviews);
    }
    let main_img = document.querySelector("#main-img");
    main_img.src = product.images[0].image_url;
    setInterval(() => {
        getProductDetail(product_id, rtUpdateProduct);
    }, 500);
}

function rtUpdateProduct(uptProduct) {
    console.log(uptProduct);
    if (!uptProduct) {
        location.reload();
    }
    if (JSON.stringify(uptProduct) !== JSON.stringify(product)) {
        let productInfoContainer = document.querySelector('#product-detail #product-info');
        let productName = productInfoContainer.querySelector('.product-name');
        let rating = productInfoContainer.querySelector('.rating')
        let price = productInfoContainer.querySelector('.price')
        let sizes = productInfoContainer.querySelector('#select-size')
        let description = productInfoContainer.querySelector('#description')

        console.log(productInfoContainer, productName, rating, price, description, sizes);

        productName.innerText = uptProduct.name;
        rating.innerHTML = renderRating(uptProduct.score);
        price.innerText = priceFormat(uptProduct.price) + 'VND';
        sizes.innerHTML = uptProduct.sizes.map((size) => {
            return `<option value="${size.size_name}">${size.size_name}</option>`
        }).join('')
        description.innerText = uptProduct.description;

        if (JSON.stringify(product.reviews) !== JSON.stringify(uptProduct.reviews)) {
            if (product.reviews.length > 0) {
                renderContainer("#all-reviews", uptProduct.reviews, renderReviews);
            }
        }
        if (JSON.stringify(product.images) !== JSON.stringify(uptProduct.images)) {
            renderContainer(".images-group", uptProduct.images, renderImageGroup);
        }
        renderContainer(".breadcrumb", uptProduct, renderBreadcrumb);
        product = uptProduct;
    }
}

function scrollToReview() {
    const elReview = document.querySelector('#user-' + review_id);
    console.log(elReview);
    elReview.scrollIntoView();
    elReview.style.background = '#e0f0ff';
    setTimeout(function () {
        elReview.style.background = 'unset';
    }, 1000)
}

function amountChangeAction(selInput, selFormMessage, selSelectSize) {
    let input = document.querySelector(selInput);
    let formMessage = input.parentElement.querySelector(selFormMessage);
    let selectedSize = document.querySelector(selSelectSize).value;
    let sizeStock = product.sizes.find((size) => {
        return size.size_name === selectedSize;
    }).stock;

    if (input.value > sizeStock) {
        input.parentElement.classList.add('invalid');
        formMessage.innerText = `*Chỉ còn lại ${sizeStock} size ${selectedSize}`;
        input.value = sizeStock;
    } else {
        input.parentElement.classList.remove('invalid');
        formMessage.innerText = ``;
    }
}

function imageSelectAction(link) {
    let small_imgs = document.querySelectorAll(".small-img");
    let main_img = document.querySelector("#main-img");
    Array.from(small_imgs).forEach((small_img) => {
        if (small_img.src === link) {
            console.log(small_img.src === link);
            small_img.style.border = "2px solid rgb(25, 1, 98)";
        } else {
            small_img.style.border = "none";
        }
    });
    main_img.src = link;
}

function updateReviewModalRender(comment, score, elReviewSelector) {
    let modalReview = document.querySelector('section#review-panel #review-modal');
    let productImg = modalReview.querySelector('.image');
    let productName = modalReview.querySelector('.name');
    let selectRatingBar = modalReview.querySelector(`.rate input[value="${score}"]`);
    let txtComment = modalReview.querySelector('#comment')
    let bttClose = modalReview.querySelector('#close-modal');

    modalReview.setAttribute('review_selector', elReviewSelector);
    selectRatingBar ? selectRatingBar.checked = true : 1;
    txtComment.value = comment;
    productImg.src = product.images[0].image_url;
    productName.innerText = product.name;
    modalReview.style.display = 'block';

    bttClose.onclick = function () {
        modalReview.style.display = 'none';
    }
}

async function updateReviewAction(data) {
    let modalReview = document.querySelector('section#review-panel #review-modal');
    data['product_id'] = product.product_id;

    const res = await updateReviewAPI(JSON.stringify(data));
    if (res.success) {
        notificationDialog('success', res.message);
        let selector = modalReview.getAttribute('review_selector');
        let elReview = document.querySelector(`li#${selector}`);
        let rating = elReview.querySelector('div.rating');
        let comment = elReview.querySelector('p.comment');

        rating.innerHTML = renderRating(data.rating);
        comment.innerText = data.comment;
    } else {
        dialog('failure', res.message);
    }
    modalReview.style.display = 'none';
}

async function deleteReviewAction(selector) {
    const option = await dialog('alert', 'Bạn có chắc muốn xóa đánh giá này không?');
    if (option) {
        data = {
            product_id: product.product_id
        }
        const res = await deleteReviewAPI(JSON.stringify(data));
        if (res.success) {
            notificationDialog('success', res.message);
            let elReview = document.querySelector(`li#${selector}`);
            elReview.remove();
        } else {
            dialog('failure', res.message);
        }
    }
}

async function addToCartAction(selAmount, selSelectSize) {
    let amount = document.querySelector(selAmount).value;
    let selectedSize = document.querySelector(selSelectSize).value;
    console.log(selectedSize);
    const cartItem = {
        cartItem: {
            product_id: product.product_id,
            size_name: selectedSize,
            amount: Number(amount)
        }
    }
    await addToCart(JSON.stringify(cartItem));
    cartAmount();
}

// Render html function
function renderBreadcrumb(any) {
    const breadcrumb =
        `<li class="breadcrumb-item"><a href="../view/home.html">Home</a></li>
        <li class="breadcrumb-item"><a href="../view/search-results.html?searchbar=${product.category}">${product.category}</a></li>
        <li class="breadcrumb-item"><a href="../view/search-results.html?searchbar=${product.brand}">${product.brand}</a></li>
        <li class="breadcrumb-item active" aria-current="page">${product.name}</li>`;
    return breadcrumb;
}

function renderImageGroup(images) {
    return images.map((image) => {
        return `<div onclick="imageSelectAction('${image.image_url}')">
            <img src="${image.image_url}" class="small-img" width="100%" alt="">
        </div>`
    }).join('');
}

function renderProductInfo(product) {
    return `<h3 class="product-name py-2">${product.name}</h3>
    <div class="rating">
        ${renderRating(product.score)}
    </div>
    <h2 class="price mt-3">${priceFormat(product.price)} VND</h2>
    <div style="display: flex;">
        <label for="select-size" style="font-size: larger;line-height: 67px;margin-right: 52px;">Size: </label>
        <select id="select-size" name="select-size" class="select-size my-3" onchange="amountChangeAction('#amount','.form-message','#select-size')">
        ${product.sizes.map((size) => {
        return `<option value="${size.size_name}">${size.size_name}</option>`
    }).join('')
        }
        </select>
    </div>
    <div class="form-group mb-3">
        <label for="amount" style="font-size: larger;margin-right: 8px;">Số lượng: </label>
        <input id="amount" name="amount" class="form-control" type="number" value="1" min="1" onchange="amountChangeAction('#amount','.form-message','#select-size')">
        <span class="form-message"></span>
    </div class="form-group">
    <button id="add-to-cart" onclick="addToCartAction('#amount','#select-size')">Thêm vào giỏ <i class="icon-shopping-cart"
            style="font-size: 20px;"></i></button>
    <hr class="my-4">
    <h4>Mô tả</h4>
    <span id="description">${product.description}</span>`;
}

function renderReviewTool(review) {
    if (JSON.parse(localStorage.getItem("user"))) {
        console.log(JSON.parse(localStorage.getItem("user")));
        return JSON.parse(localStorage.getItem("user")).user_id === review.user_id ?
            `<div class="review-action">
                <i class="update-review fa-solid fa-pencil" data-bs-toggle="tooltip" data-bs-placement="bottom"
                    title="Sửa đánh giá" onclick="updateReviewModalRender('${review.comment}','${review.score}','user-${review.user_id}')"></i>
                <i class="delete-review fa-solid fa-xmark" data-bs-toggle="tooltip" data-bs-placement="bottom"
                    title="Xóa đánh giá" onclick="deleteReviewAction('user-${review.user_id}')"></i>
            </div>`: ' '
    } else { return ' ' }
}
function renderReviews(reviews) {
    return reviews.map((review) => {
        return `<li id="user-${review.user_id}" class="review row">
        <div class="user col-lg-3 col-12">
            <img class="user-avatar" src="${review.avatar}" alt="" style="display: inline;">
            <h6 class="fullname" style="display: inline;">${review.name}</h6>
        </div>
        <div class="score-comment col-lg-9">
            <div class="rating">
                ${renderRating(review.score)}
            </div>
            <p class="comment py-3">
                ${review.comment}
            </p>
            <span class="reviewat">${dateFormat(review.ratingAt)}</span>
        </div>
        ${renderReviewTool(review)}
    </li>`;
    }).join('');
}