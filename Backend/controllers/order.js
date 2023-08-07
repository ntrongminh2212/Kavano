import { db } from "../index.js";
import { deleteCartItem, isOverStock, queryDeleteCartItem } from '../controllers/cart.js';
import { firebaseDb, firebaseDbRef, firebaseRemove, firebaseSet } from "../firebase/firebase.js";
import { KavanoOrders } from "../kavanoorder.js";
import { ethers } from "ethers";

export function mysqlDateFormat(date = new Date()) {
    try {
        let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        let month = date.getMonth() < 9 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);

        let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        let second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return `${date.getFullYear()}-${month}-${day} ${hour}:${minutes}:${second}`;
    } catch (error) {
        console.log(error);
    }
}

function queryGetOrders(user) {
    let sql = 'SELECT order_id,user.user_id,user.name,user.email,user.phone,user.avatar,total, address, status, place_time,`confirm_time`,`assign_time`,`deliver_time`, `complete_time`,`cancel_time`, '
        + '`order`.`discount_code`, discount.value as discount_value,payment_method,eth_pay, shipper.shipper_id, shipper.name as shipper_name, shipper.avatar as shipper_avatar '
        + 'FROM `order` LEFT JOIN discount ON `order`.discount_code = discount.discount_code , user, shipper '
        + 'WHERE `order`.user_id = user.user_id '
        + 'AND `order`.shipper_id = shipper.shipper_id '
        + ((user.authority === 'user') ? ('AND `order`.user_id = ' + `${user.user_id}`) : '')
        + ' ORDER BY cancel_time DESC, complete_time DESC, deliver_time DESC, assign_time DESC, confirm_time DESC, place_time DESC';

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

function queryReviewById(user_id, product_id) {
    const sql = `SELECT *
    FROM rating 
    WHERE user_id = '${user_id}' 
    AND product_id = '${product_id}'`

    return new Promise((resolve, reject) => {
        db.query(sql, (err, rs) => {
            if (!err) {
                if (rs.length > 0) {
                    resolve(rs[0]);
                } else {
                    resolve(false);
                }
            } else {
                console.log(err);
            }
        })
    })
}

export function queryGetOrderDetail(order, getReview = true) {
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
                // var pmOrder_details = 
                if (getReview) {
                    for (let item of results) {
                        item['user_review'] = await queryReviewById(order.user_id, item.product_id);
                    }
                    await Promise.all(results.map(item => { return item['user_review'] }))
                }
                order['order_detail'] = results;
                resolve(order);
            } else {
                console.log(err);
                reject(err);
            }
        })
    });
}

export function queryGetOrderById(order_id) {
    const sql = 'SELECT order_id,user.user_id,user.name,user.email,user.phone,user.avatar AS user_avatar, '
        + 'shipper.shipper_id,shipper.name, shipper.avatar AS shipper_avatar,total, address,coordinate, status, '
        + 'place_time,`confirm_time`,`deliver_time`, `complete_time`,`cancel_time`, `order`.`discount_code`, `payment_method` '
        + 'FROM `order`, user, shipper '
        + `WHERE order_id = '${order_id}' `
        + 'AND `order`.`user_id` = user.user_id '
        + 'AND `order`.`shipper_id` = shipper.shipper_id '

    return new Promise((resolve, reject) => {
        db.query(sql, (err, order) => {
            if (!err) {
                resolve(order[0])
            } else {
                console.log(err);
                reject(err.message);
            }
        });
    })
}

export async function queryUpdateOrderStatus(req, res, order_id, uptStatus, time = ' ', shipper_id = ' ') {
    const updateStatus = "UPDATE `order` SET `status`= '" + uptStatus + "'" + time + shipper_id
        + ` WHERE order_id = '${order_id}'`

    db.query(updateStatus, (err, rs) => {
        if (!err) {
            console.log('ok, response');
            res.json({
                success: 202,
                message: 'Đã cập nhật trạng thái đơn hàng'
            });
        } else {
            console.log(err);
            res.json({
                error: 400,
                message: err.message
            });
        }
    });
}

function isDiscountValid(discount_code, total) {
    const sql = `SELECT * FROM discount 
    WHERE discount_code = '${discount_code}' 
    AND condition_by <= ${total}`

    let lmQuery = new Promise((resolve, reject) => {
        db.query(sql, (err, rs) => {
            if (!err) {
                if (rs.length !== 0) {
                    resolve(rs[0]);
                } else {
                    resolve(false);
                }
            } else {
                console.log(err.message);
                resolve(undefined);
            }
        })
    })
    return lmQuery;
}

function queryInsertOrderDetail(orderdetails) {
    const insertOrderDetail = 'INSERT INTO `order_detail`(`order_id`, `product_id`, `size_name`, `amount`, `total`) VALUES ?'
    return new Promise((resolve, reject) => {
        db.query(insertOrderDetail, [orderdetails], (err, rs) => {
            if (!err) {
                resolve('success order details');
            } else {
                reject(err);
            }
        })
    });
}

function queryInsertOrder(order) {
    const generate_key_sql = 'SELECT CONVERT(UUID(),VARCHAR(25)) AS _KEY';
    const insertOrder = 'INSERT INTO `order` SET ?'
    const pmQuery = new Promise((resolve, reject) => {
        db.query(generate_key_sql, (err, key) => {
            if (!err) {
                resolve(String(key[0]._KEY));
            } else {
                reject('Error query key');
            }
        });
    }).then(key => {
        order['order_id'] = `MHD${key}`;
        return new Promise((resolve, reject) => {
            db.query(insertOrder, order, (err, rs) => {
                if (!err) {
                    resolve(order['order_id']);
                } else {
                    console.log(err.message);
                    resolve(err.message);
                }
            });
        })
    }).catch(reason => {
        console.log(reason);
    })
    return pmQuery;
}

function queryShipperMinOrders() {
    const sql = 'SELECT `shipper`.`shipper_id`, (SELECT COUNT(shipper_id) FROM `order` '
        + "WHERE (`status` = 'Deliver' OR `status` = 'Assign') "
        + "AND shipper.shipper_id = shipper_id) AS orders_count "
        + 'FROM shipper '
        + 'ORDER BY orders_count ASC '
        + 'LIMIT 1'

    return new Promise((resolve, reject) => {
        db.query(sql, (err, rs) => {
            if (!err) {
                if (rs.length !== 0) {
                    resolve(rs[0].shipper_id);
                } else {
                    resolve(false);
                }
            } else {
                reject(err);
            }
        })
    });
}

export function updateStock(product_detail) {
    const sql = `UPDATE product_detail SET stock = ${product_detail.update_stock} 
    WHERE product_id = ${product_detail.product_id} 
    AND size_name = '${product_detail.size_name}'`

    return new Promise((resolve, reject) => {
        db.query(sql, (err, rs) => {
            if (!err) {
                resolve(true);
            } else {
                console.log(err);
                reject(err.message);
            }
        })
    });
}

export const getOrders = async (req, res) => {
    const user = req.user;
    let orders = await queryGetOrders(user);

    let pmOrders = orders.map(order => {
        return queryGetOrderDetail(order);
    })

    Promise.all(pmOrders).then(orders => {
        res.json({
            success: 200,
            orders
        })
    })
}

export const createOrder = async (req, res) => {
    const user_id = req.user.user_id;
    const orderitems = req.body.orderitems;
    let discount = req.body.discount;
    const address = req.body.address;
    const coordinate = req.body.coordinate;
    if (orderitems && orderitems.length > 0) {
        let Total = 0;
        let upt_product_detail = [];
        let order_details = [];
        let pmProductStocks = orderitems.map((orderitem) => {
            return new Promise(async (resolve, reject) => {
                resolve({
                    product_id: orderitem.product_id,
                    size_name: orderitem.size_name,
                    stock: await isOverStock(orderitem, 0)
                })
            })
        });
        let pmCreateOrder = new Promise(async (resolve, reject) => {
            // check product stock and return future decrease stock
            // calc no-discount total
            let pmUpt_product_detail = orderitems.map(async (orderitem) => {
                let stock = await isOverStock(orderitem, orderitem.amount);
                return new Promise((resolve, reject) => {
                    if (stock) {
                        order_details.push({
                            product_id: orderitem.product_id,
                            size_name: orderitem.size_name,
                            amount: orderitem.amount,
                            total: Number(orderitem.amount) * Number(orderitem.price)
                        })
                        Total += Number(orderitem.amount) * Number(orderitem.price);
                    } else {
                        console.log('Khong du so luong ton');
                        reject('Số lượng tồn không đủ');
                    }
                    resolve({
                        product_id: orderitem.product_id,
                        size_name: orderitem.size_name,
                        update_stock: (stock - Number(orderitem.amount))
                    })
                })
            });

            upt_product_detail = await Promise.all(pmUpt_product_detail).catch(reason => reject(reason));
            resolve(upt_product_detail);
        }).then(async (values) => {
            // check discount valid
            // calc with-discount total (if valid)
            discount = discount ? await isDiscountValid(discount.discount_code, Total) : false;
            if (discount) {
                Total = Total - (Total * discount.value);
            }
            return [discount, Total];
        }).then(async (value) => {
            // insert order, order_detail
            // update decrease stock
            const shipper_id = await queryShipperMinOrders();
            let order = {
                user_id: user_id,
                total: Total,
                address: address,
                coordinate: JSON.stringify(coordinate),
                place_time: new Date(),
                discount_code: discount ? discount.discount_code : null,
                shipper_id: shipper_id
            }
            const order_id = await queryInsertOrder(order);
            //`order_id`, `product_id`, `size_name`, `amount`, `total`
            order_details = order_details.map(detail => {
                return [order_id, detail.product_id, detail.size_name, detail.amount, detail.total];
            })
            await queryInsertOrderDetail(order_details);
            var pmUpdateStock = upt_product_detail.map(detail => {
                return updateStock(detail);
            })
            await queryDeleteCartItem(orderitems, user_id);
            await Promise.all(pmUpdateStock);
            res.json({
                success: "202",
                order_id: order_id
            })
        }).catch(async reason => {
            const productStocks = await Promise.all(pmProductStocks)
            return res.json({ error: 400, reason, productStocks });
        })
        pmCreateOrder;
    } else {
        res.status(400);
    }
}

export const createCryptoOrder = (req, res) => {
    const user_id = req.user.user_id;
    const orderitems = req.body.orderitems;
    let discount = req.body.discount;
    const address = req.body.address;
    const coordinate = req.body.coordinate;
    if (orderitems && orderitems.length > 0) {
        let Total = 0;
        let upt_product_detail = [];
        let order_details = [];
        let pmProductStocks = orderitems.map((orderitem) => {
            return new Promise(async (resolve, reject) => {
                resolve({
                    product_id: orderitem.product_id,
                    size_name: orderitem.size_name,
                    stock: await isOverStock(orderitem, 0)
                })
            })
        });
        let pmCreateOrder = new Promise(async (resolve, reject) => {
            // check product stock and return future decrease stock
            // calc no-discount total
            let pmUpt_product_detail = orderitems.map(async (orderitem) => {
                let stock = await isOverStock(orderitem, orderitem.amount);
                return new Promise((resolve, reject) => {
                    if (stock) {
                        order_details.push({
                            product_id: orderitem.product_id,
                            size_name: orderitem.size_name,
                            amount: orderitem.amount,
                            total: Number(orderitem.amount) * Number(orderitem.price)
                        })
                        Total += Number(orderitem.amount) * Number(orderitem.price);
                    } else {
                        console.log('Khong du so luong ton');
                        reject('Số lượng tồn không đủ');
                    }
                    resolve({
                        product_id: orderitem.product_id,
                        size_name: orderitem.size_name,
                        update_stock: (stock - Number(orderitem.amount))
                    })
                })
            });

            upt_product_detail = await Promise.all(pmUpt_product_detail).catch(reason => reject(reason));
            resolve(upt_product_detail);
        }).then(async (values) => {
            // check discount valid
            // calc with-discount total (if valid)
            discount = discount ? await isDiscountValid(discount.discount_code, Total) : false;
            if (discount) {
                Total = Total - (Total * discount.value);
            }
            return [discount, Total];
        }).then(async (value) => {
            // insert order, order_detail
            // update decrease stock
            const shipper_id = await queryShipperMinOrders();
            let order = {
                user_id: user_id,
                total: Total,
                status: 'Pending',
                address: address,
                coordinate: JSON.stringify(coordinate),
                discount_code: discount ? discount.discount_code : null,
                shipper_id: shipper_id,
                payment_method: 'CRYPTO'
            }
            const order_id = await queryInsertOrder(order);
            //`order_id`, `product_id`, `size_name`, `amount`, `total`
            const lstOrder_details = order_details.map(detail => {
                return [order_id, detail.product_id, detail.size_name, detail.amount, detail.total];
            })
            await Promise.all([queryInsertOrderDetail(lstOrder_details),
            queryDeleteCartItem(orderitems, user_id),
            KavanoOrders.createOrder(order_id, ethers.utils.parseEther((Total / 24000).toString()))]);

            const [TotalEth, EthPrice] = await Promise.all(
                [KavanoOrders.USDtoWEI(ethers.utils.parseEther((Total / 24000).toString())),
                KavanoOrders.getPriceETH()]);

            var pmUpdateStock = upt_product_detail.map(detail => {
                return updateStock(detail);
            })
            await Promise.all(pmUpdateStock);
            res.json({
                success: "202",
                order_id: order_id,
                total: Total,
                totalEth: TotalEth.toString(),
                ethPrice: EthPrice.toString(),
            })

            setTimeout(async () => {
                // console.log(0, order_details);
                const order = await queryGetOrderById(order_id)
                if (order.status === 'Pending') {
                    await Promise.all([returnProductStock(order_details),
                    queryDeletePendingOrder(order_id),
                    KavanoOrders.deleteOrder(order_id)]);
                    console.log('deleted pending order in db and contract');
                }
            }, 30000);
        }).catch(async reason => {
            const productStocks = await Promise.all(pmProductStocks)
            return res.json({ error: 400, reason, productStocks });
        })
        pmCreateOrder;
    } else {
        res.status(400);
    }
}

export const updateOrderStatus = async (req, res) => {
    const authority = req.user.authority;
    const req_order = req.body;
    const db_order = await queryGetOrderById(req_order.order_id);
    let checkPermit = false;
    if (req_order.status === db_order.status) {
        let time, uptStatus, shipper_id;
        shipper_id = `, shipper_id='${db_order.shipper_id}'`;
        switch (db_order.status) {
            case 'Pending':
                time = `,place_time = '${mysqlDateFormat()}'`;
                uptStatus = 'Placed';
                checkPermit = true;
                break;
            case 'Placed':
                if (authority === 'admin') {
                    time = `,confirm_time = '${mysqlDateFormat()}'`;
                    uptStatus = 'Confirm';
                    checkPermit = true;
                }
                break;
            case 'Confirm':
                if (authority === 'admin') {
                    firebaseSet(firebaseDbRef(
                        firebaseDb,
                        `orders/${req_order.order_id}`
                    ), {
                        user_id: req_order.user_id,
                        shipper_id: req_order.shipper_id,
                        status: 'Confirm'
                    })
                    time = `,assign_time = '${mysqlDateFormat()}'`;
                    uptStatus = 'Assign';
                    shipper_id = `, shipper_id='${req_order.shipper_id}'`;
                    checkPermit = true;
                }
                break;
            case 'Deliver':
                time = `,complete_time = '${mysqlDateFormat()}'`;
                uptStatus = 'Complete';
                checkPermit = true;
                break;
            case 'Complete':
                res.json({
                    error: 400,
                    message: "Đơn hàng đã hoàn thành"
                })
                return;
                break;
            default:
                res.json({
                    error: 400,
                    message: "Không thể thực hiện do đơn hàng của bạn đã bị hủy"
                })
                return
                break;
        }
        if (checkPermit) {
            queryUpdateOrderStatus(req, res, db_order.order_id, uptStatus, time, shipper_id);
        } else {
            res.json({
                error: 400,
                message: "Bạn không có quyền thực hiện hành động này"
            })
        }
    } else {
        res.json({
            error: 400,
            message: "Yêu cầu tải lại trang"
        });
    }
}

export async function returnProductStock(orderitems) {
    // console.log('1', orderitems);
    let upt_product_detail = [];
    let pmUpt_product_detail = orderitems.map((orderitem) => {
        return new Promise(async (resolve, reject) => {
            let stock = await isOverStock(orderitem, 0);
            resolve({
                product_id: orderitem.product_id,
                size_name: orderitem.size_name,
                update_stock: (stock + Number(orderitem.amount))
            })
        })
    });

    upt_product_detail = await Promise.all(pmUpt_product_detail).catch(reason => reject(reason));
    // console.log('2', upt_product_detail);
    await Promise.all(upt_product_detail.map(detail => {
        return updateStock(detail);
    }))
}

export const cancelOrder = async (req, res) => {
    const order_id = req.body.order_id;
    const authority = req.user.authority;
    const pmGetOrderById = queryGetOrderById(order_id);
    const pmOrderDetail = queryGetOrderDetail(req.body, false);
    const [db_order, order_detail_temp] = await Promise.all([pmGetOrderById, pmOrderDetail]);
    const order_details = order_detail_temp.order_detail;
    switch (db_order.status) {
        case 'Placed':
            returnProductStock(order_details);
            queryUpdateOrderStatus(req, res, order_id, 'Cancel', `,cancel_time = '${mysqlDateFormat()}'`);
            db_order.payment_method === 'CRYPTO' ? await KavanoOrders.repay(order_id) : '';
            break;
        case 'Confirm':
            if (authority === 'admin') {
                returnProductStock(order_details);
                queryUpdateOrderStatus(req, res, order_id, 'Cancel', `,cancel_time = '${mysqlDateFormat()}'`);
                db_order.payment_method === 'CRYPTO' ? await KavanoOrders.repay(order_id) : '';
            }
            break;
        case 'Assign':
            if (authority === 'admin') {
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
            } else {
                res.json({
                    error: 400,
                    message: 'Đơn hàng đã xác nhận không thể hủy'
                })
            }
            break;
        case 'Deliver':
            if (authority === 'admin') {
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
            } else {
                res.json({
                    error: 400,
                    message: 'Đơn hàng đã vận chuyển không thể hủy'
                })
            }
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

export function queryDeletePendingOrder(order_id) {
    const sql = "DELETE FROM `order` "
        + `WHERE order_id = '${order_id}' `
        + "AND `status` = 'Pending'"

    return new Promise((resolve, reject) => {
        db.query(sql, (err,) => {
            if (!err) {
                resolve(true)
            } else {
                console.log(err);
                reject(err.message)
            }
        })
    })
}

export function queryAlltimeRevenue() {
    const sql = "SELECT SUM(total) AS AllTimeTotal "
        + "FROM `order` "
        + "WHERE `status` = 'Complete' "

    return new Promise((resolve, reject) => {
        db.query(sql, (err, AllTimeTotal) => {
            if (!err) {
                resolve(AllTimeTotal[0].AllTimeTotal)
            } else {
                console.log(err);
                reject(err.message)
            }
        })
    })
}

function queryRevenueDayFromTo(dateFrom, dateTo, by = 'day') {

    let select;
    let orderBy;
    switch (by) {
        case 'day':
            select = 'DAY(complete_time) AS _day, MONTH(complete_time) AS _month,  YEAR(complete_time) AS _year';
            orderBy = 'GROUP BY _day, _month, _year';
            break;
        case 'month':
            select = 'MONTH(complete_time) AS _month,  YEAR(complete_time) AS _year';
            orderBy = 'GROUP BY _month, _year';
            break;
        default:
            break;
    }

    const sql = `SELECT SUM(total) AS _total, ${select} `
        + "FROM `order` "
        + "WHERE `status` = 'Complete' "
        + `AND DATE(complete_time) >= '${dateFrom}' `
        + `AND DATE(complete_time) <= '${dateTo}' `
        + orderBy

    return new Promise((resolve, reject) => {
        db.query(sql, (err, totalByDay) => {
            if (!err) {
                resolve(totalByDay)
            } else {
                console.log(err);
                reject(err.message)
            }
        })
    })
}

function queryDayStatistic() {
    const sql = " SELECT COUNT(total) AS orderscount , SUM(TOTAL) AS revenue "
        + "FROM `order` "
        + "WHERE `order`.status = 'Complete'"
        + "AND DATE(complete_time) = CURDATE()"

    return new Promise((resolve, reject) => {
        db.query(sql, (err, today) => {
            if (!err) {
                resolve(today[0])
            } else {
                console.log(err);
                reject(err.message)
            }
        })
    })
}

function queryCountOrdersByStatus(dateFrom, dateTo) {
    const sql = "SELECT COUNT(order_id) AS orderCount, `order`.status "
        + "FROM `order` "
        + `WHERE (DATE(place_time) >= '${dateFrom}' 
        AND DATE(place_time) <= '${dateTo}')  
        OR (DATE(confirm_time) >= '${dateFrom}' 
        AND DATE(confirm_time) <= '${dateTo}')  
        OR (DATE(deliver_time) >= '${dateFrom}' 
        AND DATE(deliver_time) <= '${dateTo}') 
        OR (DATE(complete_time) >= '${dateFrom}' 
        AND DATE(complete_time) <= '${dateTo}') `
        + "GROUP BY `order`.status"

    return new Promise((resolve, reject) => {
        db.query(sql, (err, totalByDay) => {
            if (!err) {
                resolve(totalByDay)
            } else {
                console.log(err);
                reject(err.message)
            }
        })
    })
}

export const statisticRevenueByDay = async (req, res) => {
    const dayFrom = mysqlDateFormat(new Date(req.query.dayfrom));
    const dayTo = mysqlDateFormat(new Date(req.query.dayto));
    const by = req.query.by;

    const pm1 = queryRevenueDayFromTo(dayFrom, dayTo, by);
    const pm2 = queryCountOrdersByStatus(dayFrom, dayTo);
    const pm3 = queryDayStatistic();
    let [totalFromTo, ordersByStatus, today] = await Promise.all([pm1, pm2, pm3]);

    totalFromTo = totalFromTo.map(item => {
        item._month < 10 ? (item._month = '0' + item._month) : item._month;
        item._day < 10 ? (item._day = '0' + item._day) : item._day;
        return item;
    })
    // console.log(ordersByStatus);
    res.json({
        success: 202,
        totalFromTo,
        ordersByStatus,
        today
    })
}