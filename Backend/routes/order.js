import express from 'express';
import { adminAuthenticate, userAuthenticate } from '../controllers/users.js';
import { cancelOrder, createOrder, getOrders, queryUpdateOrderStatus, statisticRevenueByDay, updateOrderStatus } from '../controllers/order.js';


const router = express.Router();

router.post('/create-order', userAuthenticate, createOrder);

router.put('/update-status', userAuthenticate, updateOrderStatus);

router.get('/my-orders', userAuthenticate, getOrders);

router.put('/cancel', userAuthenticate, cancelOrder)

router.get('/admin/statistic', adminAuthenticate, statisticRevenueByDay);


export default router;