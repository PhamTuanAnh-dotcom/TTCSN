const express = require('express');
const router = express.Router();
const db = require('../db'); 

const conn = db.promise();

router.get("/thongke", async (req, res) => {
    const { from, to } = req.query;

    // Mặc định hôm nay
    const fromDate = from || new Date().toISOString().slice(0, 10);
    const toDate   = to   || fromDate;

    // 1️⃣ Doanh thu theo ngày
    const sqlRevenue = `
        SELECT DATE(NgayGio) AS Ngay, 
               SUM(TongTien) / 1000000 AS DoanhThu
        FROM ThanhToan
        WHERE TrangThaiThanhToan = 'Da thanh toan'
        AND DATE(NgayGio) BETWEEN ? AND ?
        GROUP BY DATE(NgayGio)
        ORDER BY DATE(NgayGio)
    `;

    // 2️⃣ Món thịnh hành theo thời gian chọn
    const sqlPopular = `
        SELECT m.TenMon, SUM(om.SoLuong) AS SoLanGoi
        FROM Oder_Monan om
        JOIN MonAn m ON om.MaMon = m.MaMon
        JOIN Oder o ON om.MaOder = o.MaOder
        JOIN ThanhToan tt ON o.MaHD = tt.MaHD
        WHERE tt.TrangThaiThanhToan = 'Da thanh toan'
        AND DATE(tt.NgayGio) BETWEEN ? AND ?
        GROUP BY m.MaMon, m.TenMon
        ORDER BY SoLanGoi DESC
        LIMIT 5
    `;

    const [revenue] = await db.query(sqlRevenue, [fromDate, toDate]);
    const [popularFoods] = await db.query(sqlPopular, [fromDate, toDate]);

    const labels = revenue.map(r => r.Ngay);
    const values = revenue.map(r => r.DoanhThu);
    const tongDoanhThu = values.reduce((a, b) => a + b, 0).toFixed(2);

    res.render("thongke", {
        labels,
        values,
        popularFoods,
        tongDoanhThu,
        from: fromDate,
        to: toDate
    });
});


module.exports = router;
