import { createUserWithEmailAndPassword, sendEmailVerification } from '../firebase/firebase.js';
import { auth } from '../firebase/firebase.js';
import { db, jwt, key } from '../index.js';
import cloudinary from '../ultils/cloudinary.js';

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
            // delete user['password'];
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
            createUserWithEmailAndPassword(auth, user.email, user.password)
                .then((userCredencial) => {
                    const user = userCredencial.user
                    sendEmailVerification(user).then(() => {
                        console.log('Email verification send!');
                    })
                }).catch((err) => {
                    console.log(err.message);
                });
            res.json({
                "success": 201,
                message: 'Đã gửi thư xác nhận email'
            })
        }
    })
}

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
            addresses = addresses.map((address) => {
                return {
                    ...address,
                    coordinate: JSON.parse(address.coordinate)
                }
            })
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
    const sql = "INSERT INTO `user_adress`(`user_id`, `place_id`, `display_address`, `coordinate`)"
        + " VALUES (?)";

    db.query(sql, [[user.user_id, address.place_id, address.display_address, JSON.stringify(address.coordinate)]], (err) => {
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
    AND place_id = '${address.place_id}' `;

    db.query(sql, (err) => {
        if (!err) {
            res.json({
                success: 202,
                message: `Đã xóa địa chỉ ${address.display_address}`
            })
        }
    })
}

export function queryUpdateUserInfo(uptUser, user_id) {
    const sql = `UPDATE user SET phone='${uptUser.phone}',name='${uptUser.name}',sex='${uptUser.sex}',
    dateOfBirth='${uptUser.dateOfBirth}',avatar='${uptUser.avatar}' 
    WHERE user_id='${user_id}'`

    return new Promise((resolve, reject) => {
        db.query(sql, (err, rs) => {
            if (!err) {
                resolve(true)
            } else {
                console.log(err);
                reject(false)
            }
        })
    })
}

export const updateUserInfo = async (req, res) => {
    const uptUser = req.body;
    const user_id = req.user.user_id;

    const rs = await queryUpdateUserInfo(uptUser, user_id);
    if (rs) {
        res.json({
            success: 202,
            message: "Thông tin tài khoản đã được cập nhật"
        })
    } else {
        res.json({
            error: 404,
            message: "Cập nhật thất bại"
        })
    }
}

export const changeAvatar = async (req, res) => {
    let avatar_img = req.body;
    const user_id = req.user.user_id;
    const from = String(avatar_img.image_url).lastIndexOf('/');
    const to = String(avatar_img.image_url).lastIndexOf('.');
    const imageName = String(avatar_img.image_url).substring(from + 1, to).trim();
    let image_url = (await cloudinary.uploader.upload(avatar_img.base64img, { public_id: `kavano/user/${imageName}` })).url;

    const sql = `UPDATE user SET avatar='${image_url}' 
    WHERE user_id='${user_id}'`

    db.query(sql, (err, rs) => {
        if (!err) {
            res.json({
                success: 200,
                message: 'Đổi avatar thành công',
                image_url: image_url
            })
        } else {
            console.log(err);
        }
    })
}

export const checkOldPassword = (req, res, next) => {
    const user_id = req.user.user_id;
    const oldPassword = req.body.oldPassword;
    const getPasswordUserSql = 'SELECT * FROM `user` '
        + `WHERE user_id = '${user_id}' AND password = '${oldPassword}'`;
    db.query(getPasswordUserSql, (err, rs) => {
        if (rs.length > 0) {
            next();
        } else {
            res.json({
                error: 400,
                message: 'Sai mật khẩu cũ'
            })
        }
    })
}

export const changePassword = async (req, res) => {
    const user_id = req.user.user_id;
    const newPassword = req.body.newPassword;
    const sql = `UPDATE user SET password='${newPassword}' 
    WHERE user_id = '${user_id}'`

    db.query(sql, (err, rs) => {
        if (!err) {
            res.json({
                success: 200,
                message: 'Đổi mật khẩu thành công'
            })
        } else {
            console.log(err);
        }
    })
}