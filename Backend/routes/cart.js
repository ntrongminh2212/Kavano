import express from 'express';
import { db, jwt, key } from '../index.js';
import { userAuthenticate } from '../controllers/users.js';
import { deleteCartItem, getCart, insertCartItem, updateCartItem } from '../controllers/cart.js';

const router = express.Router();

router.get('/my-cart', userAuthenticate, getCart);

router.post('/', userAuthenticate, insertCartItem);

router.delete('/', userAuthenticate, deleteCartItem);

router.put('/', userAuthenticate, updateCartItem);

export default router;