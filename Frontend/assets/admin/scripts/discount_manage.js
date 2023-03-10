
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

    const option = await dialog('alert', 'B???n c?? ch???c mu???n x??a phi???u gi???m gi?? ' + discount_code)
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
        inputFrom.nextElementSibling.innerText = 'Ng??y b???t ?????u ph???i tr?????c ng??y k???t th??c';
        inputFrom.parentElement.classList.add('invalid');
        inputUntil.nextElementSibling.innerText = 'Ng??y b???t ?????u ph???i tr?????c ng??y k???t th??c';
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
        return `<td class="isvalid" style="color: #0059c2"> S???p t???i </td>`
    } else if (isvalid) {
        return `<td class="isvalid" style="color: green"> Trong hi???u l???c </td>`
    } else {
        return `<td class="isvalid" style="color: red"> H???t h???n </td>`
    }
}

function renderUpdateCouponModal(discount_code) {
    let modalUpdCoupon = document.querySelector('#update-coupon-modal');
    let bttClose = modalUpdCoupon.querySelector("#close-modal");
    let tittle = modalUpdCoupon.querySelector("#content-tittle");
    let bttGenerateDiscountCode = document.querySelector('#generate-code');
    let bttSubmit = modalUpdCoupon.querySelector("#send-update-coupon");

    bttGenerateDiscountCode.style.display = 'none';
    tittle.innerText = 'S???a phi???u gi???m gi?? ' + discount_code
    bttSubmit.innerText = 'X??c nh???n s???a'
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
    tittle.innerText = 'T???o phi???u gi???m gi?? '
    bttSubmit.innerText = 'T???o phi???u'
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
    <th colspan="2" style="border-bottom: 1px solid #979797;">Th???i gian hi???u l???c</th>
    <th></th>
    <th></th>
    <th></th>
</tr>
<tr id="tblheader">
    <th>M?? Gi???m Gi??</th>
    <th>n???i dung</th>
    <th>gi?? tr??? gi???m</th>
    <th class="valid_time">T??? ng??y</th>
    <th class="valid_time">?????n ng??y</th>
    <th>??i???u ki???n k??ch ho???t</th>
    <th>Hi???u l???c</th>
    <th>Ch???nh s???a</th>
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
            title="S???a phi???u" onclick="renderUpdateCouponModal('${coupon.discount_code}')"></i>
        <i class="delete-coupon fa-solid fa-xmark" data-bs-toggle="tooltip" data-bs-placement="bottom"
            title="X??a phi???u" onclick="deleteCouponAction('${coupon.discount_code}')"></i>
    </td>
</tr>`
    }).join('')
    tblCoupons.insertAdjacentHTML('beforeend', couponsHTML);
}