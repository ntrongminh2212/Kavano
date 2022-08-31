import express from "express";
import { getFeature, getProductDetail, getSearch, getAllProducts, createNewProduct, importProductStock, addProductImage, updateProduct, deleteProductImage, addReview, updateReview, deleteReview, deleteProduct } from "../controllers/product.js";
import { adminAuthenticate, userAuthenticate } from "../controllers/users.js";
import { db } from "../index.js";

const router = express.Router();

router.get("/feature", getFeature);

router.get("/filter/:search", getSearch);

router.get("/all-products", adminAuthenticate, getAllProducts);

router.get("/sizes", adminAuthenticate, (req, res) => {
    db.query("SELECT * FROM size", (err, sizes) => {
        if (!err) {
            res.json({
                success: 202,
                sizes
            })
        } else {
            console.log(err);
            res.status(404);
        }
    })
})

router.post('/create', adminAuthenticate, createNewProduct);

router.post('/review', userAuthenticate, addReview);
router.put('/review', userAuthenticate, updateReview);
router.delete('/review', userAuthenticate, deleteReview);

router.put('/admin/import-stock', adminAuthenticate, importProductStock);

router.put('/admin/update-product', adminAuthenticate, updateProduct);

router.delete('/admin/update-product', adminAuthenticate, deleteProduct);

router.post('/admin/add-product-img', adminAuthenticate, addProductImage);

router.delete('/admin/delete-product-img', adminAuthenticate, deleteProductImage);

router.get("/:id", getProductDetail);

router.get("/admin/:id", adminAuthenticate, getProductDetail);

export default router;