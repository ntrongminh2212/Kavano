const params = new URLSearchParams(window.location.search);
const product_id = params.get('id');
let product = {};
let sizes;
let lstImages = [];
var tblSizeStock = document.querySelector('#sizes-stock');
let imagesGroup = document.querySelector(".images-group");
let mainImg = document.querySelector("#main-img");
let initialState = document.querySelector('#product-detail').innerHTML;
document.querySelector("#product-detail .tittle").innerHTML = 'Chi tiết sản phẩm id ' + product_id
let sizeType;
setUp()
let rtUpdate = setInterval(() => {
    setUp()
}, 500);

async function setUp() {
    uptProduct = await getProductDetail(product_id);
    if (!uptProduct) {
        notificationDialog('failure', 'Sản phẩm không tồn tại hoặc đã bị xóa');
        document.querySelector('#product-detail').innerHTML = initialState;
        return
    }
    if (JSON.stringify(uptProduct) !== JSON.stringify(product)) {
        product = uptProduct;
        sizes = await getSizes();
        sizeType = sizes.find(size => {
            if (size.size_name === product.sizes[0].size_name) {
                return size.type
            }
        })
        renderTableSizeStock(sizeType.type);
        renderCategorySelectBox('#category', sizeType.type);
        renderBrandSelectBox('#brand-select');
        renderContainer(".images-group", product.images, renderImageGroup);
        fillProductData();
        mainImg.src = product.images[0].image_url
        lstImages = product.images.map(image => { return image.image_url });
    }
}

function findSizeInProduct(size_name) {
    return product.sizes.find(size => {
        return size.size_name === size_name
    })
}

// Action event funcs
function previewFile(inputSelectImg) {
    let lstSelectImages = inputSelectImg.files;
    if (lstSelectImages.length > 0) {
        if (lstImages.length + lstSelectImages.length < 6) {
            Array.from(lstSelectImages).forEach(image => {
                var fileReader = new FileReader();

                fileReader.addEventListener('load', () => {
                    if (!lstImages.includes(fileReader.result)) {
                        addProductImageAction(fileReader.result);
                    } else {
                        alert('Ảnh trùng lặp')
                    }
                })
                fileReader.readAsDataURL(image);
            })
        } else {
            alert(`Chỉ được nhập nhiều nhất ${5} ảnh cho một sản phẩm`);
        }
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

async function addStockAction(inputSize) {
    const sizeOldStock = findSizeInProduct(inputSize.id);
    if (Number(inputSize.value) > 0) {
        const data = {
            size_name: inputSize.id,
            product_id: product.product_id,
            update_stock: Number(inputSize.value)
        }

        const rs = await importStockAPI(JSON.stringify(data));
        if (rs.success) {
            notificationDialog("success", "Nhập hàng thành công");
            if (sizeOldStock) {
                sizeOldStock.stock = Number(rs.update_stock);
            } else {
                product.sizes.push({
                    size_name: data.size_name,
                    stock: Number(rs.update_stock)
                })
            }
        } else {
            notificationDialog("failure", "Có lỗi khi nhập hàng");
        }
        renderTableSizeStock(sizeType.type);
    }
}

async function updateProductAction(data) {

    console.log(data);
    data['product_id'] = product.product_id;
    const rs = await updateProductAPI(JSON.stringify(data));
    if (rs.success) {
        notificationDialog("success", rs.message);
    } else {
        notificationDialog("failure", rs.message);
        var inputProductName = Array.from(inputs).find(input => {
            return input.name === 'name'
        })
        inputProductName.value = product.name;
    }

}

async function deleteProductAction() {
    const option = await dialog('alert', 'Bạn có chắc chắn muốn xóa sản phẩm id ' + product.product_id);
    if (option) {
        const response = await deleteProductAPI(JSON.stringify(product));
        if (response.success) {
            dialog('success', response.message);
        } else {
            dialog('failure', response.message);
        }
    }
}

async function addProductImageAction(base64Img) {
    loadingDialog();
    const data = {
        product_id: product.product_id,
        base64img: base64Img
    }
    const res = await addProductImageAPI(JSON.stringify(data));
    if (res.success) {
        notificationDialog("success", res.message);
        mainImg.src = res.image_url;
        product.images.push({ image_url: res.image_url });
        lstImages.push(res.image_url);
        renderAddImage(res.image_url);
    } else {
        notificationDialog("failure", res.message);
    }
}

async function removeSelectedImageAction() {
    if (product.images.length > 1) {
        const rs = await dialog('alert', 'Bạn thực sự muốn xóa ảnh này?');
        if (rs) {
            const data = { image_url: mainImg.src }
            loadingDialog();
            const res = await deleteProductImageAPI(JSON.stringify(data));
            if (res.success) {
                notificationDialog("success", res.message);
                removeSelectedImage();
            } else {
                notificationDialog("failure", res.message);
            }
        }
    } else {
        await dialog('failure', 'Sản phẩm chỉ còn 1 ảnh duy nhất, không thể xóa')
    }
}


function removeSelectedImage() {
    if (mainImg.src) {
        const index = lstImages.indexOf(mainImg.src);
        const deleteImg = product.images.find(img => {
            return img.image_url === mainImg.src;
        })
        const deleteImgIndex = product.images.indexOf(deleteImg);
        lstImages.splice(index, 1);
        product.images.splice(deleteImgIndex, 1);
        imagesGroup.querySelector(`img[src="${mainImg.src}"]`).remove();
        mainImg.src = lstImages[lstImages.length - 1];
    }
}

// Render funcs
function renderTableSizeStock(sizetype) {
    tblSizeStock.innerHTML =
        `<tr>
        <th>Mã size</th>
        <th>Số lượng tồn</th>
        <th>Nhập thêm</th>
    </tr>`

    const sizeFilter = sizes.filter(size => {
        return size.type === sizetype;
    })

    tblSizeStock.insertAdjacentHTML('beforeend',
        sizeFilter.map(size => {
            return `<tr>
        <td><label class="form-label" for="${size.size_name}">${size.size_name}</label></td>
        <td style="font-weight: 600; width: 150px">${findSizeInProduct(size.size_name) ? findSizeInProduct(size.size_name).stock : 0}</td>
        <td>
            <input autocomplete="off" id="${size.size_name}" type="number" placeholder="Số lượng" step="1"
                min="0" value="0">
            <a class="addStock" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Nhập kho"
                 onclick="addStockAction(this.previousElementSibling)"><i
                    class="fa-solid fa-plus"></i></a>
        </td>
    </tr>`
        }).join(''))

    turnOnToolTip();
}

async function renderCategorySelectBox(selector, size_type) {
    var selectBox = document.querySelector(selector);
    var categories = await getAllCategories();

    categories.forEach(category => {
        if (category.size_type === size_type) {
            var option = document.createElement('option');
            option.value = category.category_id;
            option.innerText = category.name;
            selectBox.appendChild(option);
        }
        if (category.name === product.category) {
            console.log("balala");
            selectBox.value = category.category_id;
        }
    });
}

async function renderBrandSelectBox(selector) {
    var selectBox = document.querySelector(selector);
    var brands = await getAllBrands();

    brands.forEach(brand => {
        var option = document.createElement('option');
        option.value = brand.brand_id;
        option.innerText = brand.name;
        selectBox.appendChild(option);
    });
}

function renderImageGroup(images) {
    return images.map((image) => {
        return `<div onclick="imageSelectAction('${image.image_url}')">
            <img src="${image.image_url}" class="small-img" width="100%" alt="">
        </div>`
    }).join('');
}

function renderAddImage(link) {
    imagesGroup.insertAdjacentHTML('beforeend', `<div onclick="imageSelectAction('${link}')">
    <img src="${link}" class="small-img" width="100%" alt="">
</div>`);
}


function fillProductData() {
    console.log(product);
    let inputs = document.querySelectorAll('#product-info [name]');

    Array.from(inputs).forEach(input => {
        switch (input.type) {
            case 'radio':
                input.value == product[input.name] ? input.checked = true : 0;
                break;
            default:
                input.value = product[input.name];
                break;
        }
    })
}