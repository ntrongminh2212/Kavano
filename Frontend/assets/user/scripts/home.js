function ScrollCate(selector, direct) {
    var section = document.querySelector(selector);
    section.scrollBy({
        left: 600 * direct,
        behavior: 'smooth'
    });
}

function setUpHomePage(slProductContainer, slCateContainer) {
    getFeature(slProductContainer);
    getAllCategories(slCateContainer);
}