const params = new URLSearchParams(window.location.search);
const searchStr = params.get('searchbar');
let page = 0;
let productsPerPage = 15;
let products = [];
let filterProducts = [];
let bttLoadMore = document.querySelector("#loadmore");

if (searchStr) {
    getSearchProduct("#product-container", searchStr, setUp);
} else {
    getAllProduct("#product-container", setUp);
}

function setUp(results) {
    products = results;
    console.log(products);
    filterProducts = results;
    if (products.length > 0) {
        document.querySelector("#searchstr").innerHTML = searchStr;
    }
    renderFilterOption("#filter");
    return renderPaginateProducts(products);
}

function renderPaginateProducts() {
    const startIndex = page * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    page++;
    const productsRender = filterProducts.slice(startIndex, endIndex);
    if (filterProducts.length <= endIndex) {
        bttLoadMore.style.visibility = 'hidden';
    } else {
        bttLoadMore.style.visibility = 'visible';
    }
    return renderProduct(productsRender);
}

function loadMore(selector) {
    const moreProducts = renderPaginateProducts();
    let productContainer = document.querySelector(selector);
    productContainer.innerHTML += moreProducts;
}

function renderFilterOption(selector) {
    let sectionFilter = document.querySelector(selector);
    let ulCategories = sectionFilter.querySelector("#list-categories");
    let ulBrands = sectionFilter.querySelector("#list-brands");
    let ulSexs = sectionFilter.querySelector("#list-sex");
    let ulStockStatus = sectionFilter.querySelector("#list-stock");

    let Categories = [];
    let Brands = [];
    products.forEach((product, index) => {
        if (!Categories.includes(product.category)) {
            Categories.push(product.category);
        }
        if (!Brands.includes(product.brand)) {
            Brands.push(product.brand);
        }
    })

    ulCategories.innerHTML = Categories.map((category) =>
        `<li>
            <input type="checkbox" name="${category}" id="${category}" value="${category}">
            <label for="${category}">${category}</label>
        </li>`
    ).join('');

    ulBrands.innerHTML = Brands.map((brand) =>
        `<li>
            <input type="checkbox" name="${brand}" id="${brand}" value="${brand}">
            <label for="${brand}">${brand}</label>
        </li>`
    ).join('');
    setFilterEvent(ulCategories, ulBrands, ulSexs, ulStockStatus);
}

function setFilterEvent(ulCategories, ulBrands, ulSexs, ulStockStatus) {
    ulCategories.querySelectorAll("input").forEach((inputCategory) => {
        inputCategory.onchange = function (event) {
            filterAction(ulCategories, ulBrands, ulSexs, ulStockStatus);
        }
    });

    ulBrands.querySelectorAll("input").forEach((inputBrands) => {
        inputBrands.onchange = function (event) {
            filterAction(ulCategories, ulBrands, ulSexs, ulStockStatus);
        }
    });

    ulSexs.querySelectorAll("input").forEach((inputSex) => {
        inputSex.onchange = function (event) {
            filterAction(ulCategories, ulBrands, ulSexs, ulStockStatus);
        }
    })

    ulStockStatus.querySelectorAll("input").forEach((inputStock) => {
        inputStock.onchange = function (event) {
            filterAction(ulCategories, ulBrands, ulSexs, ulStockStatus);
        }
    })
}

function filterAction(ulCategories, ulBrands, ulSexs, ulStockStatus) {
    page = 0;
    var categoriesCheck = Array.from(ulCategories.querySelectorAll("input:checked"))
        .map((input) => { return input.value; });
    var brandsCheck = Array.from(ulBrands.querySelectorAll("input:checked"))
        .map((input) => { return input.value; });
    var sexCheck = ulSexs.querySelector("input:checked").value;
    var StockStatusCheck = ulStockStatus.querySelector("input:checked").value;

    filterProducts = products.filter((product, index) => {
        return (sexCheck == -1 ? 1 : product.sex == sexCheck)
            && (categoriesCheck.length === 0 ? 1 : categoriesCheck.includes(product.category))
            && (brandsCheck.length === 0 ? 1 : brandsCheck.includes(product.brand))
            && (StockStatusCheck == -1 ? 1 : isStockStatus(product.sizes, StockStatusCheck));
    })
    renderContainer("#product-container", filterProducts, renderPaginateProducts);
}

function isStockStatus(listSizes, inputVal) {
    switch (Number(inputVal)) {
        case 0:
            return listSizes.find((size) => {
                return Number(size.stock) === 0;
            })
            break;
        case 1:
            return listSizes.every((size) => {
                return Number(size.stock) === 0;
            })
            break;
        default:
            break;
    }
}

function sortByName(a, b) {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    return nameA.localeCompare(nameB);
}

function sortByPrice(a, b) {
    return a.price - b.price;
}

function sortProducts(selector) {
    page = 0;
    let selectSort = document.querySelector(selector);
    switch (selectSort.value) {
        case 'nameAsc':
            filterProducts.sort((a, b) => sortByName(a, b));
            break;
        case 'nameDesc':
            filterProducts.sort((a, b) => sortByName(b, a));
            break;
        case 'priceAsc':
            filterProducts.sort((a, b) => sortByPrice(a, b));
            break;
        case 'priceDesc':
            filterProducts.sort((a, b) => sortByPrice(b, a));
            break;
        default:
            break;
    }
    renderContainer("#product-container", filterProducts, renderPaginateProducts);
}