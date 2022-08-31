import { db, jwt, key } from '../index.js';

export const login = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql = `SELECT * FROM user 
    WHERE (email = '${username}' OR phone = '${username}')
    AND password = '${password}'`
    db.query(sql, (err, result) => {
        if (!result.length) {
            res.json({
                "error": 400,
                "message": "Tài khoản hoặc mật khẩu sai"
            })
        } else {
            const user = result[0];
            const userToken = jwt.sign(JSON.stringify(user), key.ACCESS_TOKEN_SECRET);
            delete user['password'];
            res.json({
                "success": 201,
                userToken,
                user
            })
        }
    })
}

export const adminLogin = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql = `SELECT * FROM user 
    WHERE (email = '${username}' OR phone = '${username}')
    AND password = '${password}'
    AND authority = 'admin'`
    db.query(sql, (err, result) => {
        if (!result.length) {
            res.json({
                "error": 400,
                "message": "Tài khoản hoặc mật khẩu sai"
            })
        } else {
            const user = result[0];
            const userToken = jwt.sign(JSON.stringify(user), key.ACCESS_TOKEN_SECRET);
            delete user['password'];
            res.json({
                "success": 201,
                userToken,
                user
            })
        }
    })
}

export const registry = (req, res) => {
    const user = req.body;
    let sql = 'INSERT INTO user SET ?';

    db.query(sql, user, (err, results) => {
        if (err) {
            let message = err.sqlMessage;
            let dupCol;
            if (err.code === 'ER_DUP_ENTRY') {
                dupCol = message.substring(message.lastIndexOf("key '") + 5, message.lastIndexOf("'"))
                switch (dupCol) {
                    case 'email':
                        message = 'Email đã tồn tại';
                        break;
                    case 'phone':
                        message = 'Số điện thoại đã tồn tại';
                        break;
                }
            }
            res.json({
                "error": 400,
                message,
                dupCol
            })
        } else {
            res.json({ "success": 201 })
        }
    })
}
let i = 0;
export const userAuthenticate = (req, res, next) => {
    const userToken = req.headers['authorization'];
    jwt.verify(userToken, key.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) res.sendStatus(403);
        else {
            req.user = user;
            next();
        }
    });
}

export const adminAuthenticate = (req, res, next) => {
    const userToken = req.headers['authorization'];
    jwt.verify(userToken, key.ACCESS_TOKEN_SECRET, (err, admin) => {
        if (err) res.sendStatus(403);
        else {
            if (admin.authority !== 'admin') {
                res.sendStatus(403);
            } else {
                req.admin = admin;
                next();
            }
        }
    });
}

export const getUserReviews = (req, res) => {
    const sql = "SELECT * FROM rating WHERE user_id = " + req.user.user_id;

    db.query(sql, (err, reviews) => {
        if (!err) {
            res.json({
                success: 200,
                reviews
            })
        }
    })
}

export const getUserAddresses = (req, res) => {
    const user = req.user;
    const sql = `SELECT * FROM user_adress
     WHERE user_id = ${user.user_id}`;

    db.query(sql, (err, addresses) => {
        if (!err) {
            res.json({
                success: 202,
                addresses
            })
        }
    })
}

export const addUserAddress = (req, res) => {
    const user = req.user;
    const address = req.body;
    const sql = "INSERT INTO `user_adress`(`user_id`, `province`, `district`, `ward`, `address`)"
        + " VALUES (?)";

    db.query(sql, [[user.user_id, address.province, address.district, address.ward, address.address]], (err) => {
        if (!err) {
            res.json({
                success: 202,
                message: 'Đã thêm địa chỉ mới'
            })
        }
    })
}

export const deleteUserAddress = (req, res) => {
    const user = req.user;
    const address = req.body;
    const sql = `DELETE FROM user_adress 
    WHERE user_id = ${user.user_id} 
    AND province = '${address.province}' 
    AND district = '${address.district}' 
    AND ward = '${address.ward}' 
    AND address = '${address.address}'`;

    db.query(sql, [[user.user_id, address.province, address.district, address.ward, address.address]], (err) => {
        if (!err) {
            res.json({
                success: 202,
                message: `Đã xóa địa chỉ ${address.address}, ${address.ward}, ${address.district}, ${address.province}`
            })
        }
    })
}