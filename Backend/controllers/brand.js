import { db } from "../index.js";

export const getAllBrands = (req, res) => {
    const sql = "SELECT * FROM brand";
    db.query(sql, (err, brands) => {
        res.json({
            "success": 200,
            brands
        })
    })
}