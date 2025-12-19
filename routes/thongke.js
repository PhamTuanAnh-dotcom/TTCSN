const express = require('express');
const router = express.Router();
const db = require('../db'); 

const conn = db.promise();

router.get("/thongke", async (req, res) => {
  try {
    let { from, to } = req.query;

    // 🔹 Nếu chưa chọn ngày → mặc định 7 ngày gần nhất
    if (!from || !to) {
      const today = new Date();
      const prior = new Date();
      prior.setDate(today.getDate() - 6);

      from = prior.toISOString().split("T")[0];
      to   = today.toISOString().split("T")[0];
    }

    // 🔹 Doanh thu theo NGÀY
    const [rows] = await conn.query(`
      SELECT 
        DATE(NgayGio) AS Ngay,
        SUM(TongTien) / 1000000 AS DoanhThu
      FROM ThanhToan
      WHERE TrangThaiThanhToan = 'Da thanh toan'
        AND DATE(NgayGio) BETWEEN ? AND ?
      GROUP BY DATE(NgayGio)
      ORDER BY Ngay
    `, [from, to]);

    // 🔹 Món bán chạy (không đổi)
    const [popularFoods] = await conn.query(`
      SELECT MonAn.TenMon, SUM(Oder_Monan.SoLuong) AS SoLanGoi
      FROM Oder_Monan
      JOIN MonAn ON MonAn.MaMon = Oder_Monan.MaMon
      GROUP BY Oder_Monan.MaMon
      ORDER BY SoLanGoi DESC
      LIMIT 7;
    `);

    // 🔹 Dữ liệu cho chart
    const labels = rows.map(r => {
      const d = new Date(r.Ngay);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    const values = rows.map(r => Number(r.DoanhThu) || 0);

    // 🔹 Tổng doanh thu
    const tongDoanhThu = values
      .reduce((a, b) => a + b, 0)
      .toFixed(3);

    res.render("thongke", {
      from,
      to,
      labels,
      values,
      popularFoods,
      tongDoanhThu
    });

  } catch (err) {
    console.error("Lỗi thống kê:", err);
    res.status(500).send("Lỗi server thống kê");
  }
});

module.exports = router;
