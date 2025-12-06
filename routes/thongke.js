const express = require('express');
const router = express.Router();
const db = require('../db'); 

router.get("/thongke", async (req, res) => {

    const conn = db.promise();   

    let month = req.query.month;
    let selectedMonth, selectedYear;

    if (!month) {
        const now = new Date();
        selectedMonth = now.getMonth() + 1;
        selectedYear = now.getFullYear();
    } else {
        const parts = month.split("-");
        selectedMonth = parseInt(parts[0]);
        selectedYear = parseInt(parts[1]);
    }

    const [monthList] = await conn.query(`
        SELECT DISTINCT MONTH(NgayGio) AS thang, YEAR(NgayGio) AS nam
        FROM ThanhToan
        ORDER BY nam DESC, thang DESC
    `);

    const [rows] = await conn.query(`
        SELECT
            WEEK(NgayGio, 1) - WEEK(DATE_FORMAT(NgayGio, '%Y-%m-01'), 1) + 1 AS Tuan,
            SUM(TongTien)/1000000 AS DoanhThu
        FROM ThanhToan
        WHERE TrangThaiThanhToan = 'Da thanh toan'
          AND MONTH(NgayGio) = ?
          AND YEAR(NgayGio) = ?
        GROUP BY Tuan
        ORDER BY Tuan;
    `, [selectedMonth, selectedYear]);

    const [popularFoods] = await conn.query(`
        SELECT MonAn.TenMon, SUM(Oder_Monan.SoLuong) AS SoLanGoi
        FROM Oder_Monan
        JOIN MonAn ON MonAn.MaMon = Oder_Monan.MaMon
        GROUP BY Oder_Monan.MaMon
        ORDER BY SoLanGoi DESC
        LIMIT 7;
    `);

    const labels = rows.map(r => `Tuần ${r.Tuan}`);
    const values = rows.map(r => r.DoanhThu);

    const tongDoanhThu = values.reduce((a, b) => a + b, 0).toFixed(1);

    res.render("thongke", {
        monthList,
        selectedMonth,
        selectedYear,
        labels,
        values,
        popularFoods,
        tongDoanhThu
    });
});

module.exports = router;
