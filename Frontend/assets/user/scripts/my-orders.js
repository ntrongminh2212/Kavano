let orders = [];
let pauseRt = false;

let rtOrders = setInterval(async () => {
  if (!pauseRt) {
    pauseRt = true;
    const uptOrders = await getOrders();
    if (JSON.stringify(uptOrders) !== JSON.stringify(orders)) {
      console.log('up to date');
      orders = uptOrders;
      setUp();
    }
    pauseRt = false;
  }
}, 1000);

function setUp() {
  renderContainer('.tab-content #placed', filterOrderByStatus('Placed', orders), renderOrder)
  renderContainer('.tab-content #confirm', filterOrderByStatus('Confirm', orders), renderOrder)
  renderContainer('.tab-content #assign', filterOrderByStatus('Assign', orders), renderOrder)
  renderContainer('.tab-content #deliver', filterOrderByStatus('Deliver', orders), renderOrder)
  renderContainer('.tab-content #complete', filterOrderByStatus('Complete', orders), renderOrder)
  renderContainer('.tab-content #cancel', filterOrderByStatus('Cancel', orders), renderOrder)
}

function filterOrderByStatus(_status, _orders) {
  return _orders.filter(order => {
    return order.status === _status;
  });
}

//Event funcs
// async function updateStatusAction(elOrder) {
//   const _order_id = elOrder.getAttribute('order-id');
//   var clickOrder = orders.find(order => {
//     return order.order_id === _order_id;
//   })

//   const rs = await updateOrderStatus(JSON.stringify(clickOrder));
//   if (rs.success) {
//     await dialog('success', 'Rất mong bạn tiếp tục ủng hộ Kavano!');
//     if (clickOrder.status === 'Deliver') {
//       clickOrder.status = 'Complete';
//       clickOrder.complete_time = String(new Date());
//       elOrder.remove();
//       document.querySelector('.tab-content #complete').insertAdjacentHTML('beforeend', renderOrder([clickOrder]));
//collapseExpanseOrder([document.querySelector(`.tab-content #complete div[order-id="${_order_id}"] .order-id`)]);
//     }
//   } else {
//     notificationDialog('failure', res.message);
//     setTimeout(function () { location.reload() }, 3000);
//   }
// }

function filterOrders(searchStr) {
  var filterOrders = orders.filter(order => {
    let searchobject = order.order_id + order.name + order.order_detail.map((item) => {
      return String(item.name + item.size_name)
    }).join('') + order.phone + order.address + order.email;

    console.log(searchobject);
    return searchobject.toUpperCase().includes(searchStr.toUpperCase());
  })
  new Promise((resolve, reject) => {
    resolve([renderContainer('.tab-content #placed', filterOrderByStatus('Placed', filterOrders), renderOrder),
    renderContainer('.tab-content #confirm', filterOrderByStatus('Confirm', filterOrders), renderOrder),
    renderContainer('.tab-content #confirm', filterOrderByStatus('Assign', filterOrders), renderOrder),
    renderContainer('.tab-content #deliver', filterOrderByStatus('Deliver', filterOrders), renderOrder),
    renderContainer('.tab-content #complete', filterOrderByStatus('Complete', filterOrders), renderOrder),
    renderContainer('.tab-content #cancel', filterOrderByStatus('Cancel', filterOrders), renderOrder)]);
  }).then((value) => {
    // collapseExpanseOrder(document.getElementsByClassName("order-id"));
  })
}

async function cancelOrderAction(elOrder) {
  const option = await dialog('alert', 'Bạn có thật sự muốn hủy đơn hàng này không?');
  if (option) {
    const _order_id = elOrder.getAttribute('order-id');
    var clickOrder = orders.find(order => {
      return order.order_id === _order_id;
    })

    const data = { order_id: _order_id }
    pauseRt = true;
    const res = await cancelOrderAPI(JSON.stringify(data));
    if (res.success) {
      notificationDialog('success', `Đã hủy đơn hàng ${_order_id}`)
      clickOrder.status = 'Cancel';
      elOrder.remove();
      document.querySelector('.tab-content #cancel').insertAdjacentHTML('afterbegin', renderOrder([clickOrder]));
      pauseRt = false;
    } else {
      notificationDialog('failure', res.message)
      setTimeout(function () { location.reload() }, 3000);
    }
  }
}

function collapseExpanseOrder(colls) {
  var i;
  for (i = 0; i < colls.length; i++) {
    colls[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var content = this.parentElement.parentElement.querySelector('.order-detail');
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  }
}

function renderReviewModal(product_id, image_url, name) {
  let modalReview = document.querySelector('section#review-panel #review-modal');
  let productImg = modalReview.querySelector('.image');
  let productName = modalReview.querySelector('.name');
  let bttClose = modalReview.querySelector('#close-modal');

  productImg.src = image_url;
  productName.innerText = name;
  modalReview.setAttribute('product_id', product_id);
  modalReview.style.display = 'block';

  bttClose.onclick = function () {
    modalReview.style.display = 'none';
  }
}

async function addReviewAction(data) {
  let modalReview = document.querySelector('section#review-panel #review-modal');
  let product_id = modalReview.getAttribute('product_id');
  data['product_id'] = product_id;

  pauseRt = true;
  const res = await addReviewAPI(JSON.stringify(data));
  if (res.success) {
    notificationDialog('success', res.message);
    pauseRt = false;
  } else {
    dialog('failure', res.message);
    pauseRt = false;
  }
  modalReview.style.display = 'none';
}


// Render funcs
function renderDateStatus(order) {
  let template;
  // if (order.status === 'Complete') {
  //   console.log(order.status);
  // }
  switch (order.status) {
    case 'Placed':
      template = `<span class="title">Đặt ngày:</span>
                        <span class="propety"> ${dateFormat(order.place_time)}</span>`;
      break;
    case 'Confirm':
      template = `<span class="title">Xác nhận ngày:</span>
            <span class="propety"> ${dateFormat(order.confirm_time)}</span>`;
      break;
    case 'Assign':
      template = `<span class="title">Phân công ngày:</span>
              <span class="propety"> ${dateFormat(order.assign_time)}</span>`
      break;
    case 'Deliver':
      template = `<span class="title">Vận chuyển ngày:</span>
            <span class="propety"> ${dateFormat(order.deliver_time)}</span>`
      break;
    case 'Complete':
      template = `<span class="title">Ngày nhận:</span>
            <span class="propety"> ${dateFormat(order.complete_time)}</span>`
      break;
    case 'Cancel':
      template = `<span class="title">Hủy ngày:</span>
            <span class="propety"> ${dateFormat(order.cancel_time)}</span>`;
      break;
    default:
      break;
  }
  return template;
}

function renderReviewButton(item, status) {
  if (status === 'Complete') {
    return item.user_review ?
      `<a class="review item-propety col-1" href="./product-detail.html?id=${item.product_id}&review=${item.user_review.user_id}"> Xem đánh giá</a>` :
      `<i class="review fa-solid fa-star col-1" onclick="renderReviewModal('${item.product_id}', '${item.image_url}', '${item.name}')"></i>`
  } else {
    return ' ';
  }
}

function renderOrderItem(order_detail, status) {
  return order_detail.map(item => {
    return `<!-- item 1 -->
            <div class="cart-item row">
              <div class="item-propety col">
                <img class="image"
                  src="${item.image_url}"
                  alt="">
                <div class="product-name px-4" style="align-self: center; width: 100%;">
                  <a href="./product-detail.html?id=${item.product_id}">
                    ${item.name}
                  </a>
                </div>
              </div>
              <div class="size item-propety col-1" style="align-self: center; font-weight: 500;">${item.size_name}</div>
              <span id="price" class="item-propety col-2">${priceFormat(item.price)} VND</span>
              <span id="amount" class="item-propety col-2">x${item.amount}</span>
              <span class="item-total item-propety col-2">${priceFormat(item.total)} VND</span>
              ${renderReviewButton(item, status)}
            </div>`
  }).join('');
}

function renderDiscountPrice(order_detail, discount_value) {
  var total = 0;
  order_detail.forEach(item => {
    total = total + Number(item.total);
  });
  return priceFormat(total * discount_value) || 0;
}

function renderCancelButton(order) {
  if (order.status == 'Placed') {
    return `<div class="delete-item">
      <i id="delete-all" data-bs-toggle="tooltip" data-bs-placement="bottom" class="icon-trash"
        title="Hủy đơn hàng" onclick="cancelOrderAction(this.parentElement.parentElement.parentElement.parentElement)"></i>
    </div>`
  } else {
    return ' '
  }
}

function renderOrder(_orders) {
  return _orders.map((order) => {
    return ` <!-- An order -->
        <div order-id="${order.order_id}" class="order">
          <!-- Id header -->
          <div class="row">
            <div class="order-id col">
              <i class="fa-solid fa-angle-down"></i>
              <span>Mã đơn hàng: ${order.order_id}</span>
            </div>
          </div>
          <!-- Order detail collapse content -->
          <div class="order-detail" style="border: 1px solid #949494;">
            <!-- Column header -->
            <div id="table-column" class="row">
              <div id="product" class="item-propety col">
                Sản phẩm
              </div>
              <div id="size" class="item-propety col-1">
                Size
              </div>
              <div id="price" class="item-propety col-2">
                Đơn giá
              </div>
              <div id="amount" class="item-propety col-2">
                Số lượng
              </div>
              <div id="total" class="item-propety col-2">
                Thành tiền
              </div>
              ${order.status === 'Complete' ?
        `<div class="item-propety review col-1">
                Đánh giá
              </div>`: ''}
              ${renderCancelButton(order)}
            </div>
            <!-- All order's items container -->
            <div id="cart-all-items">
              ${renderOrderItem(order.order_detail, order.status)}
            </div>
            <!-- Coupon used, discount -->
            <div class="coupon row py-2">
              <div class="col-8 px-3">
                <span class="title">Mã giảm giá:</span>
                <span class="propety"> ${order.discount_code ? order.discount_code : 'Không'}</span>
              </div>
              <h6 class="col-2 item-propety">Giảm</h6>
              <span id="cal-total" class="col-2 item-total item-propety">-${renderDiscountPrice(order.order_detail, order.discount_value)} VND
              </span>
            </div>
            <!-- User, Address, Total -->
            <div id="detail" class="row py-2">
              <div class="col-4 px-3">
                <div class="py-1">
                  ${renderDateStatus(order)};
                </div>
                <div class="py-1">
                <span class="title">Hình thức thanh toán: </span>
                <span class="propety"> 
                  ${order.payment_method === 'CRYPTO' ?
        'Tiền mã hóa ETH' : 'Trả tiền mặt khi nhận hàng'}
                </span>
              </div>
             </div>
              <div class="col-4 px-3">
                <div class="py-1">
                  <span class="title">Giao tới: </span>
                  <span class="propety">${order.address}</span>
                </div>
              </div>
              <div class="col-4 px-3">
                <div class="py-1 d-flex flex-row">
                  <h6 class="col-6 item-propety">Tổng</h6>
                  <span id="cal-total" class="col-6 item-total item-propety">${priceFormat(order.total)} VND</span>
                </div>
                ${order.eth_pay ?
        `<div class="py-1 d-flex flex-row">
                  <h6 class="col-6 item-propety">Đã trả</h6>
                  <span id="eth-pay" class="col-6 item-total item-propety">
                    ${order.eth_pay}
                    <i class="fa-brands fa-ethereum px-2"></i> 
                  </span>
                </div>`: ''}
              </div>
            </div>
          </div>
        </div>`
  }).join('')
}