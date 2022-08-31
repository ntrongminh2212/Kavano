import { db } from "../index.js";

function isCartItemExist(cartItem) {
    let sql = `SELECT * FROM cart WHERE user_id = '${cartItem.user_id}' 
               AND product_id = '${cartItem.product_id}' 
               AND size_name = '${cartItem.size_name}'`;

    let pmQuery = new Promise((resolve, reject) => {
        db.query(sql, async (err, item) => {
            if (!err) {
                if (item.length !== 0) {
                    const amount = item[0].amount;
                    resolve(amount);
                } else {
                    resolve(undefined);
                }
            } else {
                console.log(err.message);
                resolve(undefined);
            }
        });
    });
    return pmQuery;
}

export function isOverStock(cartItem, updateAmount) {
    let sql = `SELECT stock FROM product_detail 
    WHERE product_id = '${cartItem.product_id}' 
    AND size_name = '${cartItem.size_name}'
    AND stock>= ${updateAmount}`;

    let pmQuery = new Promise((resolve, reject) => {
        db.query(sql, async (err, rs) => {
            if (!err) {
                if (rs.length !== 0) {
                    resolve(rs[0].stock);
                } else {
                    resolve(false);
                }
            } else {
                console.log(err.message);
                resolve(undefined);
            }
        });
    });
    return pmQuery;
}

export function queryDeleteCartItem(cartItems, user_id) {
    return cartItems.map(cartItem => {
        const delCartItem = `DELETE FROM cart 
        WHERE user_id = '${user_id}' 
        AND product_id = '${cartItem.product_id}' 
        AND size_name = '${cartItem.size_name}'`;

        return new Promise((resolve, reject) => {
            db.query(delCartItem, (err, rs) => {
                if (!err) {
                    console.log(rs);
                    resolve(true);
                }
                else {
                    console.log(err.message);
                    resolve(false);
                }
            })
        });
    });
}

async function updateCartQuery(req, res, cartItem) {
    const updateCart = `UPDATE cart SET amount ='${Number(cartItem.amount)}' 
        WHERE user_id = '${cartItem.user_id}' 
        AND product_id = '${cartItem.product_id}' 
        AND size_name = '${cartItem.size_name}'`
    db.query(updateCart, (err, rs) => {
        res.json({
            success: 202,
            message: 'Đã cập nhật số lượng'
        });
    });
}

export const getCart = (req, res) => {
    const user = req.user;
    let sql = `SELECT product.product_id, product.name, price,sex, img.image_url, amount, cart.size_name,stock
    FROM cart, product,(SELECT * FROM product_image GROUP BY product_id) AS img, product_detail
    WHERE user_id = ${user.user_id}
    AND product.product_id = img.product_id
    AND cart.product_id = product_detail.product_id
    AND cart.size_name = product_detail.size_name
    AND product_detail.product_id = product.product_id`;
    db.query(sql, (err, cart) => {
        res.json({
            success: "202",
            cart
        })
    })
}

export const insertCartItem = async (req, res) => {
    const cartItem = req.body.cartItem;
    if (cartItem) {
        cartItem['user_id'] = req.user.user_id;
        const existAmount = await isCartItemExist(cartItem);
        if (existAmount) {
            const updateAmount = existAmount + Number(cartItem.amount);
            cartItem['amount'] = updateAmount;
            updateCartQuery(req, res, cartItem);
        } else {
            const insertCart = `INSERT INTO cart SET ?`
            db.query(insertCart, cartItem, (err, rs) => {
                res.json({
                    success: 202,
                    message: 'Đã thêm vào giỏ hàng'
                });
            })
        }
    } else {
        res.status(400);
    }
}

export const updateCartItem = async (req, res) => {
    const cartItem = req.body.cartItem;
    if (cartItem) {
        cartItem['user_id'] = req.user.user_id;
        updateCartQuery(req, res, cartItem);
    } else {
        res.status(400);
    }
}

export const deleteCartItem = (req, res) => {
    const cartItems = req.body.cartItems;
    const user_id = req.user.user_id;

    if (cartItems && cartItems.length) {
        let pmDeleteCartItems = queryDeleteCartItem(cartItems, user_id)

        Promise.all(pmDeleteCartItems).then((values) => {
            res.json({
                success: "202",
                message: "Đã xóa sản phẩm khỏi giỏ hàng của bạn"
            })
        });
    } else {
        res.status(400);
    }
}