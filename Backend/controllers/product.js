import { db } from "../index.js";
import cloudinary from '../ultils/cloudinary.js'
import { isOverStock } from "./cart.js";
import { mysqlDateFormat, updateStock } from "./order.js";

const productsSQL = `SELECT product.product_id, product.name, price,sex, img.image_url, category.name as category, brand.name as brand, description
FROM product, (SELECT * FROM product_image GROUP BY product_id) AS img, category, brand
WHERE product.product_id = img.product_id
AND product.category_id = category.category_id
AND product.brand_id = brand.brand_id`

const stockProductsSQL = productsSQL
    + ` AND EXISTS (SELECT * FROM product_detail
                WHERE product.product_id = product_detail.product_id 
                AND stock >0)`;

export const calcRating = async (product) => {
    if (product) {
        var sql = `SELECT IFNULL(AVG(score),0) AS score, COUNT(rating.product_id) AS rating_count
            FROM rating
            WHERE product_id = ${product.product_id}`;
        var promise = new Promise((resolve, reject) => {
            db.query(sql, (err, rating) => {
                product["score"] = rating[0].score;
                product["rating_count"] = rating[0].rating_count;
                resolve(product);
            });
        })
        product = await promise;
    }
    return product;
}

export const querySizesById = (id, checkStock = true) => {
    const sql = `SELECT size_name, stock FROM product_detail
    WHERE product_id = ${id} `
        + (checkStock ? `AND stock>0` : '');
    return new Promise((resolve, reject) => {
        db.query(sql, (err, sizes) => {
            if (!err) {
                resolve(sizes);
            } else {
                reject();
            }
        })
    });
}

function queryBrandIdByName(name) {
    const sql = `SELECT brand_id FROM brand
    WHERE name LIKE '${name}'`;

    return new Promise((resolve, reject) => {
        db.query(sql, (err, brand_id) => {
            if (brand_id.length > 0) {
                resolve(brand_id[0].brand_id);
            } else {
                resolve(null);
            }
        })
    })
}

export function queryLastProductId() {
    const sql = `SELECT MAX(product_id) as product_id from product`;

    return new Promise((resolve, reject) => {
        db.query(sql, (err, product_id) => {
            if (!err) {
                if (product_id.length > 0) {
                    resolve(product_id[0].product_id);
                }
            } else {
                console.log(err);
                reject(err.message);
            }
        })
    })
}

function queryInsertBrand(name) {
    const sql = `INSERT INTO brand SET name = '${name}'`;

    return new Promise((resolve, reject) => {
        db.query(sql, (err, brand_id) => {
            if (!err) {
                resolve(true);
            } else {
                console.log(err);
                reject(err);
            }
        })
    })
}

export function queryInsertProductDetail(sizes) {
    const sql = "INSERT INTO `product_detail`(`product_id`, `size_name`, `stock`) VALUES ?";

    console.log(sizes);
    return new Promise((resolve, reject) => {
        db.query(sql, [sizes], (err) => {
            if (!err) {
                resolve(true);
            } else {
                console.log(err);
                reject(err);
            }
        })
    })
}

export function queryDeleteProductImage(image_url) {
    const sql = `DELETE FROM product_image WHERE image_url = '${image_url}'`
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rs) => {
            if (!err) {
                resolve(true);
            } else {
                console.log(err);
                reject(err);
            }
        })
    })
}

export async function queryInsertProduct(product) {
    const sql = `INSERT INTO product SET ?;`
    let _brand_id = await queryBrandIdByName(product.brand);
    if (!_brand_id) {
        await queryInsertBrand(product.brand);
        _brand_id = await queryBrandIdByName(product.brand);
    }

    const newProduct = {
        name: product.name,
        price: product.price,
        sex: product.sex,
        description: product.description,
        brand_id: _brand_id,
        category_id: product.category
    }
    return new Promise((resolve, reject) => {
        db.query(sql, newProduct, (err, product_id) => {
            if (!err) {
                resolve(true)
            } else {
                console.log(err);
                reject(err.message);
            }
        })
    })
}

export async function queryUpdateProduct(product) {
    const sql = `UPDATE product SET ? 
    WHERE product_id = ${product.product_id}`
    let _brand_id = await queryBrandIdByName(product.brand);
    if (!_brand_id) {
        await queryInsertBrand(product.brand);
        _brand_id = await queryBrandIdByName(product.brand);
    }

    const updProduct = {
        name: product.name,
        price: product.price,
        sex: product.sex,
        description: product.description,
        brand_id: _brand_id,
        category_id: product.category
    }
    return new Promise((resolve, reject) => {
        db.query(sql, updProduct, (err, product_id) => {
            if (!err) {
                resolve(true)
            } else {
                console.log(err);
                reject(err.message);
            }
        })
    })
}

export function queryInsertProductImages(images) {
    const sql = 'INSERT INTO `product_image`(`image_url`, `product_id`) VALUES ?'
    return new Promise((resolve, reject) => {
        db.query(sql, [images], (err, rs) => {
            if (!err) {
                resolve('success product images');
            } else {
                reject(err);
            }
        })
    });
}

export const queryReviewsById = (id) => {
    const sql = `SELECT user.user_id, name, score, comment, avatar, ratingAt
        FROM rating, user 
        WHERE rating.user_id = user.user_id 
        AND product_id = ${id} 
        ORDER BY ratingAt DESC`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, reviews) => {
            if (!err) {
                resolve(reviews);
            } else {
                reject();
            }
        })
    });
}

// function IsProductdetailExist(product_detail) {
//     const sql = `SELECT * FROM product_detail 
//     WHERE product_id = ${product_detail.product_id}  
//     AND size_name = '${product_detail.size_name}'`

//     return new Promise((resolve, reject) => {
//         db.query(sql, (err, rs) => {
//             if (rs.length > 0) {
//                 resolve(true);
//             } else {
//                 resolve(false);
//             }
//         })
//     })
// }

export const getFeature = (req, res) => {
    const sql = stockProductsSQL +
        `ORDER BY RAND()
        LIMIT 12`;
    db.query(sql, (err, result) => {
        var products = result.map(calcRating);
        Promise.all(products).then((products) => {
            res.json({
                "success": 200,
                products
            })
        })
    })
}

export const getSearch = (req, res) => {
    var searchStr = req.params.search;
    const sql = stockProductsSQL +
        `AND (product.name LIKE '%${searchStr}%' OR category.name LIKE '%${searchStr}%' OR brand.name LIKE '%${searchStr}%')`

    db.query(sql, (err, result) => {
        if (!err) {
            var products = result.map(calcRating);
            Promise.all(products).then((products) => {
                res.json({
                    "success": 200,
                    products
                })
            })
        } else {
            res.json({
                error: 404,
                message: err.message
            })
        }
    })
}

export const getProductDetail = async (req, res) => {
    var id = req.params.id;
    const isAdmin = req.admin ? true : false;
    let sql = (isAdmin) ? productsSQL : stockProductsSQL
    sql = sql + ` AND product.product_id = ${id}`;

    var pmProduct = new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
            if (!err) {
                var product = calcRating(results[0]);
                resolve(product);
            } else {
                reject();
            }
        })
    });

    const pmReviews = queryReviewsById(id);

    const getProductImgSql = `SELECT image_url FROM product_image
    WHERE product_id = ${id}`;
    var pmImgs = new Promise((resolve, reject) => {
        db.query(getProductImgSql, (err, imgs) => {
            if (!err) {
                resolve(imgs);
            } else {
                reject();
            }
        })
    });

    const pmSizes = querySizesById(id, !isAdmin);

    Promise.all([pmProduct, pmReviews, pmImgs, pmSizes]).then((values) => {
        try {
            let product = values[0];
            delete product['image_url'];
            product.images = values[2];
            product.reviews = values[1];
            product.sizes = values[3];
            res.json({
                success: 202,
                product
            })
        } catch (err) {
            res.json({
                error: 404,
                message: "Sản phẩm không tồn tại"
            })
        }
    }).catch((reason) => {
        res.json({
            error: 404,
            message: "Sản phẩm không tồn tại"
        })
    })
}

export const getAllProducts = (req, res) => {
    const sql = productsSQL;
    db.query(sql, (err, rs) => {
        if (!err) {
            const pmProducts = rs.map((product) => {
                return new Promise(async (resolve, reject) => {
                    let sizeList = await querySizesById(product.product_id, false);
                    product['sizes'] = sizeList;
                    product = calcRating(product);
                    resolve(product);
                })
            });

            Promise.all(pmProducts).then((products) => {
                res.json({
                    success: 202,
                    products
                })
            })
        } else {
            res.json({
                error: 400,
                message: err.message
            })
        }
    })
}

export const createNewProduct = async (req, res) => {
    var newProduct = req.body;

    queryInsertProduct(newProduct)
        .then(async value => {
            const product_id = await queryLastProductId();
            let images = await Promise.all(newProduct.images.map(async base64img => {
                const uploadRes = await cloudinary.uploader.upload(base64img, { folder: 'kavano/Product' })
                return [uploadRes.url, product_id];
            }));
            let product_details = newProduct.sizes.map(size => {
                return [product_id, size.size_name, size.stock];
            })
            await queryInsertProductDetail(product_details);
            await queryInsertProductImages(images);
            return product_id;
        })
        .then(product_id => {
            res.json({
                success: 202,
                message: 'Tạo sản phẩm mới thành công',
                product_id
            })
        }).catch(resson => {
            console.log(resson);
            res.json({
                error: 202,
                message: 'Thất bại, tên sản phẩm đã tồn tại'
            })
        })
}

export const importProductStock = async (req, res) => {
    const product_detail = req.body;
    const stock = await isOverStock(product_detail, 0);
    console.log(product_detail, 'stock: ' + stock);
    if (stock === false) {
        //product_id`, `size_name`, `stock
        queryInsertProductDetail([[product_detail.product_id, product_detail.size_name, product_detail.update_stock]])
            .then(rs => {
                res.json({
                    success: 202,
                    message: 'Nhập thêm số lượng tồn thành công',
                    update_stock: product_detail.update_stock
                });
            }).catch(rs => {
                console.log(rs);
                res.json({
                    success: 202,
                    message: 'Thất bại'
                });
            })
    } else {
        product_detail.update_stock = Number(product_detail.update_stock) + Number(stock);
        updateStock(product_detail)
            .then(rs => {
                res.json({
                    success: 202,
                    message: 'Nhập thêm số lượng tồn thành công',
                    update_stock: product_detail.update_stock
                });
            }).catch(rs => {
                console.log(rs);
                res.json({
                    success: 202,
                    message: 'Thất bại'
                });
            })
    }
}

export const updateProduct = (req, res) => {
    const updProduct = req.body
    queryUpdateProduct(updProduct)
        .then(rs => {
            res.json({
                success: 202,
                message: 'Thông tin sản phẩm đã được cập nhật'
            })
        })
        .catch(reason => {
            console.log(reason);
            res.json({
                error: 400,
                message: 'Thất bại,tên sản phẩm đã tồn tại'
            })
        })
}

export const deleteProduct = (req, res) => {
    const delProduct = req.body
    const sql = `DELETE FROM product WHERE product.product_id = '${delProduct.product_id}'`
    db.query(sql, (err, rs) => {
        if (!err) {
            res.json({
                success: 200,
                message: `Đã xóa sản phẩm id ${delProduct.product_id}, tên ${delProduct.name}`
            })
        } else {
            console.log(err);
            res.json({
                errorr: 400,
                message: "Không thể xóa vì sản phẩm này đã có người đặt hàng"
            })
        }
    })
}


export const addProductImage = async (req, res) => {
    var product_image = req.body;
    let image_url = (await cloudinary.uploader.upload(product_image.base64img, { folder: 'kavano/Product' })).url;
    queryInsertProductImages([[image_url, product_image.product_id]])
        .then(value => {
            res.json({
                success: 202,
                message: 'Thêm ảnh mới thành công',
                image_url
            })
        })
        .catch(reason => {
            console.log(reason);
            res.json({
                error: 202,
                message: 'Thất bại'
            })
        })
}

export const deleteProductImage = (req, res) => {
    const image_url = req.body.image_url;
    const from = String(image_url).lastIndexOf('/');
    const to = String(image_url).lastIndexOf('.');
    const imageName = String(image_url).substring(from + 1, to).trim();
    cloudinary.uploader.destroy(`kavano/Product/${imageName}`, function (error, result) {
        console.log(result, error)
    }).then(value => {
        return queryDeleteProductImage(image_url);
    }).then(value => {
        res.json({
            success: 202,
            message: 'Đã xóa ảnh sản phẩm'
        })
    }).catch(reason => {
        res.json({
            error: 400,
            message: 'Xóa ảnh thất bại'
        })
    })
}

export const addReview = (req, res) => {
    let review = req.body;
    let user_id = req.user.user_id;
    const sql = "INSERT INTO `rating`(`product_id`, `user_id`, `comment`, `score`, `ratingat`)"
        + " VALUES (?)";
    db.query(sql, [[review.product_id, user_id, review.comment, review.rating, mysqlDateFormat()]], (err, rs) => {
        if (!err) {
            res.json({
                success: 200,
                message: 'Đã thêm đánh giá cho sản phẩm'
            })
        } else {
            console.log(err);
            res.json({
                error: 404,
                message: 'Lỗi'
            })
        }
    });
}

export const updateReview = (req, res) => {
    let review = req.body;
    let user_id = req.user.user_id;
    const sql = `UPDATE rating SET rating.comment='${review.comment}',score='${review.rating}',ratingat='${mysqlDateFormat()}' 
    WHERE user_id = ${user_id}
    AND product_id = ${review.product_id}`;
    db.query(sql, (err, rs) => {
        if (!err) {
            res.json({
                success: 200,
                message: 'Đã sửa đánh giá sản phẩm'
            })
        } else {
            console.log(err);
            res.json({
                error: 404,
                message: 'Lỗi'
            })
        }
    });
}

export const deleteReview = (req, res) => {
    let review = req.body;
    let user_id = req.user.user_id;
    const sql = `DELETE FROM rating 
    WHERE user_id = ${user_id}
    AND product_id = ${review.product_id}`;
    db.query(sql, (err, rs) => {
        if (!err) {
            res.json({
                success: 200,
                message: 'Đã xóa đánh giá của bạn'
            })
        } else {
            console.log(err);
            res.json({
                error: 404,
                message: 'Lỗi'
            })
        }
    });
}