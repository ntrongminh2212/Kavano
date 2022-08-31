import { db } from "../index.js";

export const getAllCategories = (req, res) => {
    const sql = "SELECT * FROM category";
    db.query(sql, (err, categories) => {
        res.json({
            "success": 200,
            categories
        })
    })
}