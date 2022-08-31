
let tblCoupons = document.querySelector('#coupons-containers');
let coupons;
let rtPause = false;
setUp();

let rtCoupons = setInterval(async () => {
    if (!rtPause) {
        const uptCoupons = await getAllCouponsAPI();
        if (JSON.stringify(uptCoupons) !== JSON.stringify(coupons)) {
            console.log(uptCoupons, coupons);
            coupons = uptCoupons;
            renderTblCoupons();
        }
    }
}, 1000);

async function setUp() {
    coupons = await getAllCouponsAPI();
    renderTblCoupons();
}

function dateFormatInput(date = new Date()) {
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let month = date.getMonth() < 9 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);

    return `${date.getFullYear()}-${month}-${day}`;
}

function dateFormatCoupon(date = new Date()) {
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let month = date.getMonth() < 9 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);

    return `${date.getFullYear()}-${month}-${day}`;
}

// Action Event Funcs
async function updateCouponAction(data) {
    let modalUpdCoupon = document.querySelector('#update-coupon-modal');
    modalUpdCoupon.style.display = 'none';
    data.value = Number(data.value) / 100;
    rtPause = true;
    const response = await updateCouponAPI(JSON.stringify(data));
    if (response.success) {
        notificationDialog('success', response.message);
        rtPause = false;
    } else {
        notificationDialog('failure', response.message);
        rtPause = false;
    }
}

async function createCouponAction(data) {
    let modalUpdCoupon = document.querySelector('#update-coupon-modal');
    modalUpdCoupon.style.display = 'none';
    data.value = Number(data.value) / 100;
    rtPause = true;
    const response = await createCouponAPI(JSON.stringify(data));
    if (response.success) {
        notificationDialog('success', response.message);
        rtPause = false;
    } else {
        dialog('failure', response.message);
        rtPause = false;
    }
}

async function deleteCouponAction(discount_code) {

    const option = await dialog('alert', 'Bạn có chắc muốn xóa phiếu giảm giá ' + discount_code)
    if (option) {
        const data = { discount_code: discount_code }
        const response = await deleteCouponAPI(JSON.stringify(data));
        if (response.success) {
            notificationDialog('success', response.message);
            rtPause = false;
        } else {
            dialog('failure', response.message);
            rtPause = false;
        }
    }
}

function validTimeOrder(inputFrom, inputUntil) {
    const dateFrom = new Date(inputFrom.value);
    const dateUntil = new Date(inputUntil.value);
    console.log(dateFrom, dateUntil);
    if (dateFrom > dateUntil) {
        inputFrom.value = inputUntil.value;
        inputFrom.nextElementSibling.innerText = 'Ngày bắt đầu phải trước ngày kết thúc';
        inputFrom.parentElement.classList.add('invalid');
        inputUntil.nextElementSibling.innerText = 'Ngày bắt đầu phải trước ngày kết thúc';
        inputUntil.parentElement.classList.add('invalid');
    } else {
        inputFrom.nextElementSibling.innerText = '';
        inputFrom.parentElement.classList.remove('invalid');
        inputUntil.nextElementSibling.innerText = '';
        inputUntil.parentElement.classList.remove('invalid');
    }
}

// Render Funcs
function checkValid(from, isvalid) {
    const now = new Date()
    if (from > now) {
        return `<td class="isvalid" style="color: #0059c2"> Sắp tới </td>`
    } else if (isvalid) {
        return `<td class="isvalid" style="color: green"> Trong hiệu lực </td>`
    } else {
        return `<td class="isvalid" style="color: red"> Hết hạn </td>`
    }
}

function renderUpdateCouponModal(discount_code) {
    let modalUpdCoupon = document.querySelector('#update-coupon-modal');
    let bttClose = modalUpdCoupon.querySelector("#close-modal");
    let tittle = modalUpdCoupon.querySelector("#content-tittle");
    let bttGenerateDiscountCode = document.querySelector('#generate-code');
    let bttSubmit = modalUpdCoupon.querySelector("#send-update-coupon");

    bttGenerateDiscountCode.style.display = 'none';
    tittle.innerText = 'Sửa phiếu giảm giá ' + discount_code
    bttSubmit.innerText = 'Xác nhận sửa'
    let coupon = coupons.find(coupon => {
        return coupon.discount_code === discount_code;
    })
    console.log(coupon);
    let inputs = modalUpdCoupon.querySelectorAll("[name]")
    inputs.forEach(input => {
        switch (input.type) {
            case 'date':
                input.value = dateFormatInput(new Date(coupon[input.name]));
                break;
            default:
                input.value = coupon[input.name] < 1 ? coupon[input.name] * 100 : coupon[input.name];
                break;
        }
    });
    modalUpdCoupon.style.display = 'block';

    bttClose.onclick = function () {
        modalUpdCoupon.style.display = 'none';
    }
}

async function renderCreateCouponModal() {
    let modalUpdCoupon = document.querySelector('#update-coupon-modal');
    let bttClose = modalUpdCoupon.querySelector("#close-modal");
    let tittle = modalUpdCoupon.querySelector("#content-tittle");
    let inputDiscountCode = modalUpdCoupon.querySelector('input#discount_code');
    let bttGenerateDiscountCode = modalUpdCoupon.querySelector('#generate-code');
    let inputs = modalUpdCoupon.querySelectorAll("[name]")
    let bttSubmit = modalUpdCoupon.querySelector("#send-update-coupon");

    inputs.forEach(input => {
        input.value = '';
    });
    inputDiscountCode.value = await generateDiscountCodeAPI();
    bttGenerateDiscountCode.style.display = 'block';
    tittle.innerText = 'Tạo phiếu giảm giá '
    bttSubmit.innerText = 'Tạo phiếu'
    modalUpdCoupon.style.display = 'block';

    bttClose.onclick = function () {
        modalUpdCoupon.style.display = 'none';
    }

    bttGenerateDiscountCode.onclick = async function () {
        inputDiscountCode.value = await generateDiscountCodeAPI();
    }
}

function renderTblCoupons() {
    tblCoupons.innerHTML = `<tr id="span-th">
    <th></th>
    <th></th>
    <th></th>
    <th colspan="2" style="border-bottom: 1px solid #979797;">Thời gian hiệu lực</th>
    <th></th>
    <th></th>
    <th></th>
</tr>
<tr id="tblheader">
    <th>Mã Giảm Giá</th>
    <th>nội dung</th>
    <th>giá trị giảm</th>
    <th class="valid_time">Từ ngày</th>
    <th class="valid_time">Đến ngày</th>
    <th>Điều kiện kích hoạt</th>
    <th>Hiệu lực</th>
    <th>Chỉnh sửa</th>
</tr>`
    var couponsHTML = coupons.map(coupon => {
        return ` <tr coupon_id="${coupon.discount_code}">
    <td class="discount_code">${coupon.discount_code}</td>
    <td class="description">${coupon.description}</td>
    <td class="value">${coupon.value * 100}%</td>
    <td class="valid_from">${dateFormatCoupon(new Date(coupon.valid_from))}</td>
    <td class="valid_until">${dateFormatCoupon(new Date(coupon.valid_until))}</td>
    <td class="condition_by">${priceFormat(coupon.condition_by)} VND</td>
    ${checkValid(new Date(coupon.valid_from), Boolean(coupon.isvalid))}
    <td class="tool">
        <i class="update-coupon fa-solid fa-pencil" data-bs-toggle="tooltip" data-bs-placement="bottom"
            title="Sửa phiếu" onclick="renderUpdateCouponModal('${coupon.discount_code}')"></i>
        <i class="delete-coupon fa-solid fa-xmark" data-bs-toggle="tooltip" data-bs-placement="bottom"
            title="Xóa phiếu" onclick="deleteCouponAction('${coupon.discount_code}')"></i>
    </td>
</tr>`
    }).join('')
    tblCoupons.insertAdjacentHTML('beforeend', couponsHTML);
}