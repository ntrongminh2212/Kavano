import e from 'express';
import express from 'express';
import { addUserAddress, adminAuthenticate, adminLogin, deleteUserAddress, getUserAddresses, getUserReviews, login, registry, userAuthenticate } from '../controllers/users.js';
import { db, jwt, key } from '../index.js';

const router = express.Router();

router.post('/login', login);

router.post('/registry', registry);

router.get('/my-reviews', userAuthenticate, getUserReviews);

router.get('/address', userAuthenticate, getUserAddresses);
router.post('/address', userAuthenticate, addUserAddress);
router.delete('/address', userAuthenticate, deleteUserAddress);

router.post('/admin/login', adminLogin);

router.post('/admin/', adminAuthenticate, (req, res) => {
    if (req.admin) {
        res.json({
            success: 200
        })
    } else {
        res.status(403);
    }
})
export default router;