import { db } from "../index.js";
import { isOverStock, queryDeleteCartItem } from '../controllers/cart.js';

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
    let sql = 'SELECT order_id,user.user_id,user.name,user.email,user.phone,total, address, status, place_time,`confirm_time`,`deliver_time`, `complete_time`,`cancel_time`, `order`.`discount_code`, discount.value as discount_value '
        + 'FROM `order` LEFT JOIN discount ON `order`.discount_code = discount.discount_code , user '
        + 'WHERE `order`.user_id = user.user_id '
        + ((user.authority === 'user') ? ('AND `order`.user_id = ' + `${user.user_id}`) : '')
        + ' ORDER BY cancel_time DESC, complete_time DESC, deliver_time DESC, confirm_time DESC, place_time DESC';

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
                var pmOrder_details = results.map(async item => {
                    item['user_review'] = await queryReviewById(order.user_id, item.product_id);
                    return item
                })
                order['order_detail'] = await Promise.all(pmOrder_details);
                resolve(order);
            } else {
                console.log(err);
                reject(err);
            }
        })
    });
}

export function queryGetOrderById(order_id) {
    const sql = "SELECT * FROM `order` WHERE order_id = '" + order_id + "'";
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

export async function queryUpdateOrderStatus(req, res, order_id, uptStatus, time = ' ') {
    const updateStatus = "UPDATE `order` SET `status`= '" + uptStatus + "'" + time
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
                success: 400,
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
    const generate_key_sql = 'SELECT CONVERT(UUID_SHORT(),VARCHAR(17)) AS _KEY';
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
                    resolve(err.message);
                }
            });
        })
    }).catch(reason => {
        console.log(reason);
    })
    return pmQuery;
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
            let order = {
                user_id: user_id,
                total: Total,
                address: address,
                place_time: new Date(),
                discount_code: discount ? discount.discount_code : null
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

export const updateOrderStatus = async (req, res) => {
    const authority = req.user.authority;
    const req_order = req.body;
    const db_order = await queryGetOrderById(req_order.order_id);
    let checkPermit = false;
    if (req_order.status === db_order.status) {
        let time, uptStatus;
        switch (db_order.status) {
            case 'Placed':
                if (authority === 'admin') {
                    time = `,confirm_time = '${mysqlDateFormat()}'`;
                    uptStatus = 'Confirm';
                    checkPermit = true;
                }
                break;
            case 'Confirm':
                if (authority === 'admin') {
                    time = `,deliver_time = '${mysqlDateFormat()}'`;
                    uptStatus = 'Deliver';
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
            queryUpdateOrderStatus(req, res, db_order.order_id, uptStatus, time);
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

async function returnProductStock(orderitems) {
    let upt_product_detail = [];
    let pmUpt_product_detail = orderitems.map(async (orderitem) => {
        let stock = await isOverStock(orderitem, 0);
        return new Promise((resolve, reject) => {
            resolve({
                product_id: orderitem.product_id,
                size_name: orderitem.size_name,
                update_stock: (stock + Number(orderitem.amount))
            })
        })
    });

    upt_product_detail = await Promise.all(pmUpt_product_detail).catch(reason => reject(reason));
    upt_product_detail.forEach(async detail => {
        await updateStock(detail);
    })
}

export const cancelOrder = async (req, res) => {
    const order_id = req.body.order_id;
    const authority = req.user.authority;
    const db_order = await queryGetOrderById(order_id);
    const order_details = (await queryGetOrderDetail(req.body)).order_detail;
    switch (db_order.status) {
        case 'Placed':
            returnProductStock(order_details);
            queryUpdateOrderStatus(req, res, order_id, 'Cancel', `,cancel_time = '${mysqlDateFormat()}'`);
            break;
        case 'Confirm':
            if (authority === 'admin') {
                returnProductStock(order_details);
                queryUpdateOrderStatus(req, res, order_id, 'Cancel', `,cancel_time = '${mysqlDateFormat()}'`);
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
                queryUpdateOrderStatus(req, res, order_id, 'Cancel', `,cancel_time = '${mysqlDateFormat()}'`);
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
        + `WHERE DATE(place_time) >= '${dateFrom}' 
        AND DATE(place_time) <= '${dateTo}' `
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

    let totalFromTo = await queryRevenueDayFromTo(dayFrom, dayTo, by);
    let ordersByStatus = await queryCountOrdersByStatus(dayFrom, dayTo);
    totalFromTo = totalFromTo.map(item => {
        item._month < 10 ? (item._month = '0' + item._month) : item._month;
        item._day < 10 ? (item._day = '0' + item._day) : item._day;
        return item;
    })
    const today = await queryDayStatistic();
    res.json({
        success: 202,
        totalFromTo,
        ordersByStatus,
        today
    })
}