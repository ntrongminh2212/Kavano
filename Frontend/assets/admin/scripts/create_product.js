let sizes = [];
let lstImages = [];
var categories = [];
let imagesGroup = document.querySelector(".images-group");
let mainImg = document.querySelector("#main-img");
setUp();

async function setUp() {
    sizes = await getSizes();
    categories = await getAllCategories();
    console.log(categories);
    renderCategorySelectBox('#category');
    renderTableSizeStock(categories[0].category_id);
    renderBrandSelectBox('#brand-select');
}

function previewFile(inputSelectImg) {
    let lstSelectImages = inputSelectImg.files;
    if (lstSelectImages.length > 0) {
        if (lstImages.length + lstSelectImages.length < 6) {
            Array.from(lstSelectImages).forEach(image => {
                var fileReader = new FileReader();

                fileReader.addEventListener('load', () => {
                    if (!lstImages.includes(fileReader.result)) {
                        renderImageGroup(fileReader.result);
                        lstImages.push(fileReader.result);
                        mainImg.src = fileReader.result;
                    } else {
                        alert('Ảnh trùng lặp')
                    }
                })
                fileReader.readAsDataURL(image);
            })
        } else {
            alert('Chỉ được nhập nhiều nhất 5 ảnh cho một sản phẩm');
        }
    }
}

function imageSelectAction(imgElement) {
    mainImg.src = imgElement.src;
    let small_imgs = document.querySelectorAll(".small-img");
    Array.from(small_imgs).forEach((small_img) => {
        if (small_img === imgElement) {
            small_img.style.border = "2px solid rgb(25, 1, 98)";
        } else {
            small_img.style.border = "none";
        }
    });
}

function removeSelectedImage() {
    if (mainImg.src) {
        const index = lstImages.indexOf(mainImg.src);
        lstImages.splice(index, 1);
        imagesGroup.querySelector(`img[src="${mainImg.src}"]`).remove();
        mainImg.src = lstImages[lstImages.length - 1];
    }
}

function createNewProduct(data) {
    console.log(data);
    var inputSizes = document.querySelectorAll('#sizes-stock input');
    if (lstImages.length > 0) {
        var sizes = Array.from(inputSizes).map(inputsize => {
            return {
                size_name: inputsize.name,
                stock: Number(inputsize.value)
            }
        })
        var newProduct = {
            name: data.name,
            brand: data.brand,
            category: data.category,
            description: data.description,
            images: lstImages,
            price: Number(data.price),
            sex: data.sex,
            sizes: sizes
        }
        console.log(newProduct);
        loadingDialog();
        createNewProductAPI(JSON.stringify(newProduct));
    } else {
        alert('Sản phẩm phải có ảnh minh họa, hãy chọn ảnh!')
    }
}

function renderImageGroup(base64Image) {
    imagesGroup.insertAdjacentHTML('beforeend', `<div>
    <img src="${base64Image}" class="small-img" width="100%" alt="" onclick="imageSelectAction(this)">
</div>`);
}

function renderTableSizeStock(category_id) {
    var sizetype = categories.find(category => {
        return category.category_id === Number(category_id);
    }).size_type;

    var tblSizeStock = document.querySelector('#sizes-stock');
    tblSizeStock.innerHTML =
        `<tr>
        <th>Mã size</th>
        <th>Số lượng</th>
    </tr>`

    const sizeFilter = sizes.filter(size => {
        return size.type === sizetype;
    })

    tblSizeStock.insertAdjacentHTML('beforeend',
        sizeFilter.map(size => {
            return `<tr>
        <td><label class="form-label" for="${size.size_name}">${size.size_name}</label></td>
        <td>
            <input autocomplete="off" id="${size.size_name}" name="${size.size_name}" type="number" placeholder="Số lượng" step="1"
                min="0" value="0">
        </td>
    </tr>`
        }).join(''))
}

async function renderCategorySelectBox(selector) {
    var selectBox = document.querySelector(selector);

    console.log(categories);
    categories.forEach(category => {
        var option = document.createElement('option');
        option.value = category.category_id;
        option.innerText = category.name;
        selectBox.appendChild(option);
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