import e from 'express';
import express from 'express';
import { cancelOrder, getAllShipper, getOrderById, getShipperOrders, login, updateOrderStatus } from '../controllers/shipper.js';
import { userAuthenticate } from '../controllers/users.js';

const router = express.Router();

router.post('/login', login);

router.get('/my-orders', userAuthenticate, getShipperOrders);

router.get('/order/:id', getOrderById);

router.put('/update-status', userAuthenticate, updateOrderStatus);

router.put('/cancel-order', userAuthenticate, cancelOrder);

router.get('/all', userAuthenticate, getAllShipper);

export default router;