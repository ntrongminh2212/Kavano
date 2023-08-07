import { firebaseDb, firebaseDbRef, firebaseRemove, firebaseSet, firebaseUpdate } from '../firebase/firebase.js';
import { db, jwt, key } from '../index.js';
import { KavanoOrders } from '../kavanoorder.js';
import { mysqlDateFormat, queryGetOrderById, queryUpdateOrderStatus, returnProductStock } from './order.js';
// import { auth, onAuthStateChanged } from '../firebase/firebase.js';

const queryOrdersByShipperId = (shipper_id) => {
    const sql = 'SELECT order_id,user.user_id,user.name,user.email,user.phone,user.avatar,total, address,coordinate, status, place_time,`confirm_time`,`deliver_time`, `complete_time`,`cancel_time`, `order`.`discount_code`, discount.value as discount_value '
        + ',payment_method,eth_pay '
        + 'FROM `order` LEFT JOIN discount ON `order`.discount_code = discount.discount_code, user '
        + `WHERE shipper_id = ${shipper_id} `
        + "AND `status` != 'Placed' "
        + "AND `status` != 'Cancel' "
        + "AND `order`.user_id = user.user_id "

    return new Promise((resolve, reject) => {
        db.query(sql, (err, orders) => {
            if (!err) {
                resolve(orders);
            } else {
                console.log(err);
                reject(err);
            }
        })
    });
}

function queryGetOrderDetail(order) {
    let sql = `SELECT product.product_id,order_detail.size_name, product.name, price, amount, total,sex, img.image_url  
    FROM order_detail, product,(SELECT * FROM product_image GROUP BY product_id) AS img, product_detail 
    WHERE order_id = '${order.order_id}' 
    AND product.product_id = img.product_id 
    AND order_detail.product_id = product_detail.product_id 
    AND order_detail.size_name = product_detail.size_name 
    AND order_detail.product_id = product.product_id`

    return new Promise((resolve, reject) => {
        db.query(sql, async (err, results) => {
            if (!err) {
                order['order_detail'] = results;
                resolve(order);
            } else {
                console.log(err);
                reject(err);
            }
        })
    });
}

const queryGetAllShipper = () => {
    const sql = 'SELECT shipper.shipper_id, name, sex, dateOfBirth, email, phone, assign_count '
        + 'FROM `shipper` LEFT JOIN (SELECT shipper_id, COUNT(shipper_id) as assign_count '
        + 'FROM `order` '
        + "WHERE status = 'Deliver' OR status = 'Assign' "
        + 'GROUP BY shipper_id) AS shipper_assign ON shipper.shipper_id = shipper_assign.shipper_id '

    return new Promise((resolve, reject) => {
        db.query(sql, (err, shippers) => {
            if (!err) {
                resolve(shippers);
            } else {
                console.log(err);
                reject(err);
            }
        })
    });
}

export const getOrderById = async (req, res) => {
    var id = req.params.id;
    let order = await queryGetOrderById(id);
    res.json({
        order
    })
}


export const login = (req, res) => {
    let username, password, token;
    if (req.body.token) {
        token = req.body.token;
        jwt.verify(token, key.ACCESS_TOKEN_SECRET, (err, shipper) => {
            if (!err) {
                username = shipper.email;
                password = shipper.password;
            } else {
                res.json({
                    "error": 400,
                    "message": "Tài khoản hoặc mật khẩu sai"
                })
            }
        })
    } else {
        username = req.body.username;
        password = req.body.password;
    }

    const sql = `SELECT * FROM shipper 
    WHERE (email = '${username}' OR phone = '${username}')
    AND password = '${password}'`
    db.query(sql, (err, result) => {
        if (!result.length) {
            res.json({
                "error": 400,
                "message": "Tài khoản hoặc mật khẩu sai"
            })
        } else {
            const info = result[0];
            const token = jwt.sign(JSON.stringify(info), key.ACCESS_TOKEN_SECRET);
            // delete info['password'];
            res.json({
                "success": 201,
                shipper: {
                    info,
                    token
                }
            })
        }
    })
}

export const getShipperOrders = async (req, res) => {
    console.log('Shipper request orders!');
    const shipper = req.user;
    console.log('queryOrdersByShipperId...');
    let orders = await queryOrdersByShipperId(shipper.shipper_id);
    console.log('done! ');
    console.log('queryGetOrderDetail... ');
    let pmOrders = orders.map(order => {
        return queryGetOrderDetail(order);
    })
    console.log('done! ');
    console.log('Response!');
    Promise.all(pmOrders).then(orders => {
        res.json({
            success: 200,
            orders
        })
    })
}

export const getAllShipper = async (req, res) => {
    const admin = req.user;
    if (admin.authority == 'admin') {
        let shippers = await queryGetAllShipper();
        res.json({
            success: 200,
            shippers
        })
    }
}

export const updateOrderStatus = async (req, res) => {
    const shipper_id = req.user.shipper_id;
    const req_order = req.body;
    const db_order = await queryGetOrderById(req_order.order_id);

    console.log(req_order, db_order);
    let checkPermit = false;
    if (req_order.status === db_order.status) {
        let time, uptStatus;
        if (shipper_id) {
            switch (db_order.status) {
                case 'Assign':
                    time = `,deliver_time = '${mysqlDateFormat()}'`;
                    uptStatus = 'Deliver';

                    firebaseSet(firebaseDbRef(
                        firebaseDb,
                        `messenger/${req_order.order_id}`
                    ), "")

                    firebaseSet(firebaseDbRef(
                        firebaseDb,
                        `orders/${req_order.order_id}`
                    ), {
                        user_id: req_order.user_id,
                        shipper_id: shipper_id,
                        status: uptStatus
                    })
                    checkPermit = true;
                    break;
                case 'Deliver':
                    time = `,complete_time = '${mysqlDateFormat()}'`;
                    uptStatus = 'Complete';

                    firebaseRemove(firebaseDbRef(
                        firebaseDb,
                        `messenger/${req_order.order_id}`))
                        .then(() => {
                            console.log("Data deleted successfully");
                        })
                        .catch((error) => {
                            console.log(error);
                        });

                    firebaseSet(firebaseDbRef(
                        firebaseDb,
                        `orders/${req_order.order_id}`
                    ), {
                        user_id: req_order.user_id,
                        shipper_id: shipper_id,
                        status: uptStatus
                    })
                    checkPermit = true;
                    db_order.payment_method === 'CRYPTO' ? await KavanoOrders.withdraw(req_order.order_id) : '';
                    console.log('firebase updated');
                    break;
                case 'Complete':
                    res.json({
                        error: 400,
                        message: "Đơn hàng đã hoàn thành"
                    })
                    return;
                    break;
                case 'Cancel':
                    res.json({
                        error: 400,
                        message: "Đơn hàng đã bị hủy"
                    })
                    return;
                    break;
            }
        }
        if (checkPermit) {
            console.log('update databse...');
            queryUpdateOrderStatus(req, res, db_order.order_id, uptStatus, time);
        } else {
            if (db_order.status === 'Cancel') {
                res.json({
                    error: 400,
                    message: "Không thể thực hiện do đơn hàng của bạn đã bị hủy"
                })
            } else
                res.json({
                    error: 400,
                    message: "Bạn không có quyền thực hiện hành động này"
                })
        }
    } else {
        res.json({
            error: 400,
            message: "Đơn này có thể đã bị hủy"
        });
    }
}

export const cancelOrder = async (req, res) => {
    const order_id = req.body.order_id;
    const pmGetOrderById = queryGetOrderById(order_id);
    const pmOrderDetail = queryGetOrderDetail(req.body)
    const [db_order, order_detail_temp] = await Promise.all([pmGetOrderById, pmOrderDetail]);
    const order_details = order_detail_temp.order_detail;
    switch (db_order.status) {
        case 'Deliver':
            returnProductStock(order_details);
            firebaseRemove(firebaseDbRef(
                firebaseDb,
                `messenger/${order_id}`))
                .then(() => {
                    console.log("Data deleted successfully");
                })
                .catch((error) => {
                    console.log(error);
                });
            firebaseRemove(firebaseDbRef(
                firebaseDb,
                `orders/${order_id}`))
                .then(() => {
                    console.log("Data deleted successfully");
                })
                .catch((error) => {
                    console.log(error);
                });

            queryUpdateOrderStatus(req, res, order_id, 'Cancel', `,cancel_time = '${mysqlDateFormat()}'`);
            db_order.payment_method === 'CRYPTO' ? await KavanoOrders.repay(order_id) : '';
            break;
        case 'Complete':
            res.json({
                error: 400,
                message: "Đơn hàng đã hoàn thành"
            })
            break;
        default:
            res.json({
                error: 400,
                message: "Không thể thực hiện do đơn hàng của bạn đã bị hủy"
            })
            break;
    }
}
