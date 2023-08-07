let orders = [];
let shippers = [];
var pauseRt = false;

let modalAssignShipper = document.querySelector('#assign-shipper-modal');
let ulShipperIds = modalAssignShipper.querySelector('#ulShipperIds');
let ulShipperNames = modalAssignShipper.querySelector('#ulShipperNames');
let inputShipperId = modalAssignShipper.querySelector('#shipper-id');
let inputShippperName = modalAssignShipper.querySelector('#shipper-name');
let txtShippperEmail = modalAssignShipper.querySelector('#shipper-email');
let txtShippperPhone = modalAssignShipper.querySelector('#shipper-phone');
let txtShippperBirth = modalAssignShipper.querySelector('#shipper-birth');
let txtAssignCount = modalAssignShipper.querySelector('#assign-count');
let txtAssignOrderId = modalAssignShipper.querySelector('.order .id .value');
let txtAssignOrderLocation = modalAssignShipper.querySelector('.order .location .value');


let rtOrders = setInterval(async () => {
  if (!pauseRt) {
    pauseRt = true;
    const uptOrders = await getOrders();
    if (JSON.stringify(uptOrders) !== JSON.stringify(orders)) {
      console.log('up to date');
      orders = uptOrders;
      setUp()
    }
    pauseRt = false;
  }
}, 1500);

function setUp() {
  renderContainer('.tab-content #placed', filterOrderByStatus('Placed', orders), renderOrder)
  renderContainer('.tab-content #confirm', filterOrderByStatus('Confirm', orders), renderOrder)
  renderContainer('.tab-content #assign', filterOrderByStatus('Assign', orders), renderOrder)
  renderContainer('.tab-content #deliver', filterOrderByStatus('Deliver', orders), renderOrder)
  renderContainer('.tab-content #complete', filterOrderByStatus('Complete', orders), renderOrder)
  renderContainer('.tab-content #cancel', filterOrderByStatus('Cancel', orders), renderOrder)

  modalAssignShipper.querySelector('#close-modal').onclick = () => {
    modalAssignShipper.style.display = 'none'
  }
}

function filterOrderByStatus(_status, _orders) {
  return _orders.filter(order => {
    return order.status === _status;
  });
}

//Event funcs
async function selectShipper(shipper_id) {
  let inputShipperId = document.querySelector("input[id='shipper-id']");
  var shipper = shippers.find(shipper => {
    return shipper.shipper_id === Number(shipper_id);
  })

  inputShipperId.value = shipper.shipper_id;
  inputShippperName.value = shipper.name;
  txtShippperBirth.innerHTML = dateFormat(shipper.dateOfBirth, true);
  txtShippperPhone.innerHTML = shipper.phone;
  txtShippperEmail.innerHTML = shipper.email;
  txtAssignCount.innerHTML = shipper.assign_count > 0 ?
    shipper.assign_count + ' Đơn hàng' :
    'Không có đơn hàng nào'
}

async function assignShipper(elOrder) {
  const _order_id = elOrder.getAttribute('order-id');
  var clickOrder = orders.find(order => {
    return order.order_id === _order_id;
  })
  shippers = await getAllShipper();

  ulShipperIds.innerHTML = renderLstShipperIds(shippers)
  ulShipperNames.innerHTML = renderLstShipperNames(shippers)
  inputShipperId.value = clickOrder.shipper_id;
  selectShipper(clickOrder.shipper_id);
  txtAssignOrderId.innerHTML = _order_id;
  txtAssignOrderLocation.innerHTML = clickOrder.address;
  modalAssignShipper.style.display = 'block';

  const bttConfirmAssignShipper = modalAssignShipper.querySelector('#send-assign-shipper');
  bttConfirmAssignShipper.onclick = async () => {
    clickOrder.shipper_id = inputShipperId.value;
    updateStatusAction(elOrder, clickOrder);
    modalAssignShipper.style.display = 'none';
  }
}

async function updateStatusAction(elOrder, order = '') {
  var clickOrder;
  if (!order) {
    let _order_id = elOrder.getAttribute('order-id');
    clickOrder = orders.find(order => {
      return order.order_id === _order_id;
    })
  } else {
    clickOrder = order;
  }

  pauseRt = true;
  const rs = await updateOrderStatus(JSON.stringify(clickOrder));
  if (rs.success) {
    notificationDialog('success', 'Trạng thái đơn hàng đã được cập nhật')
    elOrder ? elOrder.remove() : '';
    pauseRt = false;
  } else {
    notificationDialog('failure', rs.message);
    pauseRt = false;
    setTimeout(function () { location.reload() }, 3000);
  }
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
      document.querySelector('.tab-content #cancel').insertAdjacentHTML('beforeend', renderOrder([clickOrder]));
      pauseRt = false
    } else {
      notificationDialog('failure', res.message);
      pauseRt = false
      setTimeout(function () { location.reload() }, 3000);
    }
  }
}

function filterOrders(searchStr) {
  var filterOrders = orders.filter(order => {
    let searchobject = order.order_id + order.name + order.phone + order.address + order.email;
    return searchobject.toUpperCase().includes(searchStr.toUpperCase());
  })
  new Promise((resolve, reject) => {
    resolve([renderContainer('.tab-content #placed', filterOrderByStatus('Placed', filterOrders), renderOrder),
    renderContainer('.tab-content #confirm', filterOrderByStatus('Confirm', filterOrders), renderOrder),
    renderContainer('.tab-content #deliver', filterOrderByStatus('Deliver', filterOrders), renderOrder),
    renderContainer('.tab-content #complete', filterOrderByStatus('Complete', filterOrders), renderOrder),
    renderContainer('.tab-content #cancel', filterOrderByStatus('Cancel', filterOrders), renderOrder)]);
  }).then((value) => {
    collapseExpanseOrder(document.getElementsByClassName("order-id"));
  })
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

// Render funcs
function renderBttUpdateStatus(status) {
  let button;
  switch (status) {
    case 'Placed':
      button = `<a class="bttUptStatus col-1" onclick="updateStatusAction(this.parentElement.parentElement)">Xác nhận</a>`
      break;
    case 'Confirm':
      button = `<a class="bttUptStatus col-1"  onclick="assignShipper(this.parentElement.parentElement)">Phân công</a>`
      // button = " ";
      break;
    case 'Assign':
      // button = `<a class="bttUptStatus col-1"  onclick="assignShipper(this.parentElement.parentElement)">Phân công</a>`
      button = " ";
      break;
    case 'Deliver':
      // button = `<a class="bttUptStatus col" style="line-height: 22px; font-size: 13px;" onclick="updateStatusAction(this.parentElement.parentElement)">Khách nhận hàng</a>`
      button = " ";
      break;
    case 'Complete':
      button = `<a class="complete col-1"><i class="fa-solid fa-check"></i></a>`
      break;
    case 'Cancel':
      button = `<a class="disable col-1">Đã huỷ</a>`
      break;
    default:
      break;
  }
  return button;
}

function renderDateStatus(order) {
  let template;
  switch (order.status) {
    case 'Placed':
      template = `<span class="title">Đặt ngày:</span>
                        <span class="propety"> ${dateFormat(order.place_time)}</span>`
      break;
    case 'Confirm':
      template = `<span class="title">Xác nhận ngày:</span>
            <span class="propety"> ${dateFormat(order.confirm_time)}</span>`
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
      template = `<span class="title">Ngày hủy:</span>
            <span class="propety"> ${dateFormat(order.cancel_time)}</span>`
      break;
    default:
      break;
  }
  return template;
}

function renderAssignment(order) {
  let template = '';
  if (order.status !== 'Placed' && order.status !== 'Confirm' && order.status !== 'Cancel') {
    template = `<div class="py-1">
                  <span class="title">Người giao hàng: </span>
                  <span class="propety">${order.shipper_name}</span>
                </div>`
  }
  return template;
}

function renderLstShipperIds(shippers) {
  return shippers.map((shipper) =>
    `<li class="row px-2 py-1 cursor-pointer bg-white hover:bg-blue-100" shipper-id="${shipper.shipper_id}" onclick="selectShipper(this.getAttribute('shipper-id'))"
  style="align-items: center;">${shipper.shipper_id}</li>`
  ).join('')
}

function renderLstShipperNames(shippers) {
  return shippers.map((shipper) =>
    `<li class="row px-2 py-1 cursor-pointer bg-white hover:bg-blue-100" shipper-id="${shipper.shipper_id}" onclick="selectShipper(this.getAttribute('shipper-id'))"
  style="align-items: center;">${shipper.name}</li>`
  ).join('')
}

function renderOrderItem(order_detail) {
  return order_detail.map(item => {
    return `<!-- item 1 -->
            <div class="cart-item row">
              <div class="item-propety col-5">
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
  if (order.status !== 'Cancel' && order.status !== 'Complete') {
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
            <div class="order-id col row">
              <div class="col-8">
                <i class="fa-solid fa-angle-down"></i>
                <span>Mã đơn hàng: ${order.order_id}</span>
              </div>
              <div class="col-4">
              ${renderDateStatus(order)};
              </div>
            </div>
            <!-- Button update order -->
            ${renderBttUpdateStatus(String(order.status))}
          </div>
          <!-- Order detail collapse content -->
          <div class="order-detail" style="border: 1px solid #949494;">
            <!-- Column header -->
            <div id="table-column" class="row">
              <div id="product" class="item-propety col-5">
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
              ${renderCancelButton(order)}
            </div>
            <!-- All order's items container -->
            <div id="cart-all-items">
              ${renderOrderItem(order.order_detail)}
            </div>
            <!-- Coupon used, discount -->
            <div class="coupon row py-1">
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
                  <span class="title">Khách đặt:</span>
                  <span class="propety">${order.name}</span>
                </div>
                <div class="py-1">
                  <span class="title">Email: </span>
                  <span class="propety"> ${order.email}</span>
                </div>
                <div class="py-1">
                  <span class="title">Phone: </span>
                  <span class="propety"> ${order.phone}</span>
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
                ${renderAssignment(order)}
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