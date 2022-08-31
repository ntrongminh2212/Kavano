import express from "express";
import { createCoupon, deleteCoupon, getAllCoupons, getValidCoupons, makeid, updateCoupon } from "../controllers/discount.js";
import { adminAuthenticate } from "../controllers/users.js";
import { db } from "../index.js";

const router = express.Router();

router.get('/', getValidCoupons);

router.get('/admin', adminAuthenticate, getAllCoupons);

router.post('/admin', adminAuthenticate, createCoupon);

router.delete('/admin', adminAuthenticate, deleteCoupon);

router.put('/admin', adminAuthenticate, updateCoupon);

router.get('/getid', adminAuthenticate, async (req, res) => {

    const discount_code = await makeid();
    res.json({
        success: 202,
        discount_code: discount_code
    })
});

export default router;