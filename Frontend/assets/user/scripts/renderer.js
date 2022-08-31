function renderRating(score) {
    let ratingHTML = '';
    let shine = '';
    for (let i = 0; i < 10; i++) {
        if (i < score * 2) shine = 'style="color: gold"';
        else shine = '';

        if (i % 2 == 0) {
            ratingHTML += `<i class="icon-star-half" ${shine}></i>`;
        } else {
            ratingHTML += `<i class="icon-star" ${shine}></i>`;
        }
    }
    return ratingHTML;
}

function renderProduct(products) {
    console.log(products);
    return products.map((product) =>
        `<div id=${product.product_id} class="product p-2">
            <a href="./product-detail.html?id=${product.product_id}">
                <img class="image" src="${product.image_url}" alt="" srcset="">
                <div class="rating mt-2">
                    ${renderRating(product.score)}
                </div>
                <h6 class="product-name mx-2 my-1">${product.name}</h6>
                <h5 class="price mx-2 mb-1">${priceFormat(product.price)} VND</h5>
            </a>
        </div>`).join('');
}

function renderHomeCategories(categories) {
    return categories.map((category) =>
        `<a class="category" href="#" id="${category.category_id}">
            <img src="${category.image_url}" alt="" srcset="">
            <h5 class="cate-name mt-1">${category.name}</h5>
        </a>
        <a class="category" href="#" id="${category.category_id}">
            <img src="${category.image_url}" alt="" srcset="">
            <h5 class="cate-name mt-1">${category.name}</h5>
        </a>`
    ).join('');
}

function renderSearchResults(products) {
    var htmlList = ' ';
    for (let i = 0; i < 5; i++) {
        if (products[i]) {
            htmlList +=
                `<a id="${products[i].product_id}" href="./product-detail.html?id=${products[i].product_id}">
                <img src="${products[i].image_url}" alt="" srcset="">
                <h6 class="product-name">${products[i].name}</h6>
                <h6 class="price">${priceFormat(products[i].price)} VND</h6>
            </a>
            `
        }
    }
    return htmlList;
}