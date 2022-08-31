import { db } from "../index.js";

function queryCouponById(code) {
    const sql = `SELECT * FROM discount WHERE discount_code = '${code}'`
    return new Promise((resolve, reject) => {
        db.query(sql, (err, coupon) => {
            if (!err) {
                if (coupon.length > 0) {
                    resolve(coupon);
                } else {
                    resolve(false);
                }
            }
        })
    })
}

export async function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var isExist = true;

    return new Promise(async (resolve, reject) => {
        while (isExist) {
            for (var i = 0; i < 6; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            console.log('loop');
            isExist = await queryCouponById(text);
        }
        resolve(text);
    })
}


export const getValidCoupons = (req, res) => {
    const sql = `SELECT * FROM discount 
    WHERE NOW() > valid_from 
    AND NOW()< valid_until`;
    db.query(sql, (err, coupons) => {
        if (!err) {
            res.json({
                success: "202",
                coupons
            });
        }
    })
}

export const getAllCoupons = (req, res) => {
    const sql = `SELECT *,IF(NOW()< valid_until&&NOW()> valid_from,TRUE,FALSE) AS isvalid FROM discount
    ORDER BY valid_until desc`;
    db.query(sql, (err, coupons) => {
        if (!err) {
            res.json({
                success: "202",
                coupons
            });
        }
    })
}

export const createCoupon = async (req, res) => {
    var coupon = req.body;
    const sql = `INSERT INTO discount(discount_code,description, value, valid_from, valid_until, condition_by) VALUES (?)`

    const isExist = await queryCouponById(coupon.discount_code);

    if (!isExist) {
        db.query(sql, [[coupon.discount_code, coupon.description, coupon.value, coupon.valid_from, coupon.valid_until + ' 23:59:59', coupon.condition_by]], (err, rs) => {
            if (!err) {
                res.json({
                    success: 202,
                    message: "Tạo phiếu giảm giá thành công, mã phiếu: " + coupon.discount_code
                })
            } else {
                console.log(err);
            }
        })
    } else {
        res.json({
            error: 202,
            message: "Không thể tạo, mã phiếu: " + coupon.discount_code + " đã tồn tại, vui lòng sinh mã khác"
        })
    }
}

export const updateCoupon = (req, res) => {
    var coupon = req.body;
    if (coupon.value < 1 && coupon.value > 0) {
        const sql = `UPDATE discount SET description='${coupon.description}',discount.value=${coupon.value}, 
    valid_from='${coupon.valid_from} 00:00:00',valid_until='${coupon.valid_until} 23:59:59',condition_by=${coupon.condition_by} 
    WHERE discount_code = '${coupon.discount_code}'`

        db.query(sql, coupon, (err, rs) => {
            if (!err) {
                res.json({
                    success: 202,
                    message: "Đã cập nhật phiếu giảm giá, mã phiếu: " + coupon.discount_code
                })
            } else {
                console.log(err);
            }
        })
    }
}

export const deleteCoupon = (req, res) => {
    var coupon = req.body;
    const sql = `DELETE FROM discount 
    WHERE discount_code = '${coupon.discount_code}'`

    db.query(sql, coupon, (err, rs) => {
        if (!err) {
            res.json({
                success: 202,
                message: "Đã xoá phiếu giảm giá mã: " + coupon.discount_code
            })
        } else {
            res.json({
                error: 400,
                message: `Phiếu giảm giá ${coupon.discount_code} đã qua sử dụng không thể xóa`
            })
        }
    })

}