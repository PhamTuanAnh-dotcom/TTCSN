const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/dinhluong", (req, res) => {
  if (!req.session.user || req.session.user.IDVaiTro !== "QL") {
    return res.redirect("/auth/login");
  }

  const sql = `
    SELECT 
      c.NguyenLieu,
      ROUND(
        SUM(
          CAST(REPLACE(c.DinhLuong, 'g', '') AS DECIMAL(10,2)) 
          * om.SoLuong
        ) / 100000
      , 4) AS TongTieuThuTa
    FROM ThanhToan tt
    JOIN Oder o ON tt.MaHD = o.MaHD
    JOIN Oder_Monan om ON o.MaOder = om.MaOder
    JOIN ChiTietMonAn c ON om.MaMon = c.MaMon
    WHERE tt.TrangThaiThanhToan = 'Da thanh toan'
    GROUP BY c.NguyenLieu
    ORDER BY TongTieuThuTa DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi định lượng:", err);
      return res.status(500).send("Lỗi server!");
    }

    res.render("dinhluong", { dsNL: results });
  });
});

module.exports = router;