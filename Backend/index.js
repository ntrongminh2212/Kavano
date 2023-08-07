import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql'
import userRouter from './routes/users.js';
import productRouter from './routes/product.js';
import categoryRouter from './routes/category.js';
import cartRouter from './routes/cart.js';
import discountRouter from './routes/discount.js';
import orderRouter from './routes/order.js'
import brandRouter from './routes/brand.js';
import shipperRouter from './routes/shipper.js';
import cors from 'cors'
import Jwt from 'jsonwebtoken';
import { } from 'dotenv/config'
import { listenToEvent } from './kavanoorder.js';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const PORT = 5000;
export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "kavano"
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use('/users', userRouter);
app.use('/shipper', shipperRouter);
app.use('/product', productRouter);
app.use('/category', categoryRouter);
app.use('/brand', brandRouter);
app.use('/cart', cartRouter);
app.use('/discount', discountRouter);
app.use('/order', orderRouter);

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));

db.connect((err) => {
    if (err) {
        console.log(err.message);
    }
})

app.get('/', (req, res) => {
    res.json("success")
})

listenToEvent();

export const jwt = Jwt;
export const key = {
    ACCESS_TOKEN_SECRET: "" + process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: "" + process.env.REFRESH_TOKEN_SECRET
}