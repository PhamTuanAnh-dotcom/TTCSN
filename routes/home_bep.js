const express = require("express");
const router = express.Router();
const db = require("../db");

//  Trang chính của nhân viên bếp
router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }

  const userId = req.session.user.ID;

  // Lấy thông tin nhân viên bếp
  const sqlChef = `
    SELECT ID, HoTen, SDT, Gmail, CCCD, TaiKhoan
    FROM TaiKhoan
    WHERE ID = ? AND IDVaiTro = 'BEP'
  `;

  db.query(sqlChef, [userId], (err, chefResults) => {
    if (err) {
      console.error("Lỗi truy vấn nhân viên:", err);
      return res.status(500).send("Lỗi máy chủ!");
    }

    if (chefResults.length === 0) {
      return res.redirect("/auth/login");
    }

    const chef = chefResults[0];

    //  Lấy danh sách order + món ăn
    const sqlOrders = `
      SELECT 
        o.MaOder, 
        o.ThoiGian, 
        o.MaBan, 
        b.ViTri AS TenBan,
        om.MaMon,
        m.TenMon,
        om.SoLuong,
        om.GiChu
      FROM Oder o
      JOIN Oder_Monan om ON o.MaOder = om.MaOder
      JOIN MonAn m ON om.MaMon = m.MaMon
      JOIN BanAn b ON o.MaBan = b.MaBan
      WHERE o.TrangThai = 'Chua hoan thanh'
      ORDER BY o.ThoiGian DESC
    `;

    db.query(sqlOrders, (err, orderResults) => {
      if (err) {
        console.error("Lỗi truy vấn đơn hàng:", err);
        return res.status(500).send("Lỗi máy chủ!");
      }

      //  Gom các món lại theo mã Order
      const groupedOrders = {};
      orderResults.forEach(row => {
        if (!groupedOrders[row.MaOder]) {
          groupedOrders[row.MaOder] = {
            MaOder: row.MaOder,
            ThoiGian: row.ThoiGian,
            MaBan: row.MaBan,
            TenBan: row.TenBan,
            monAnList: []
          };
        }
        groupedOrders[row.MaOder].monAnList.push({
          MaMon: row.MaMon,
          TenMon: row.TenMon,
          SoLuong: row.SoLuong,
          GiChu: row.GiChu
        });
      });

      const orders = Object.values(groupedOrders);

      // Render ra trang EJS
      res.render("home_bep", { chef, orders });
    });
  });
});

// Hoàn thành order
router.post("/hoan-thanh/:maOder", (req, res) => {
    const maOder = req.params.maOder;

    const sql = `UPDATE Oder SET TrangThai = 'Da hoan thanh' WHERE MaOder = ?`;

    db.query(sql, [maOder], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Lỗi server");
        }

        return res.send(`Đã hoàn thành order ${maOder}`);
    });
});
// ❌ HỦY ORDER
router.post("/cancel-order/:maOder", (req, res) => {
  const { maOder } = req.params;

  if (!maOder) {
    return res.status(400).send("Thiếu mã order!");
  }

  const sql = `
    UPDATE Oder
    SET TrangThai = 'Da huy'
    WHERE MaOder = ?
      AND TrangThai = 'Chua hoan thanh'
  `;

  db.query(sql, [maOder], (err, result) => {
    if (err) return res.status(500).send("Lỗi hủy order!");

    if (result.affectedRows === 0) {
      return res.send("❌ Order không thể hủy (đã hoàn thành hoặc đã thanh toán)");
    }

    res.send("✅ Đã hủy order thành công!");
  });
});
// ❌ HỦY MÓN trong order
router.post("/cancel-item", (req, res) => {
  const { MaOder, MaMon } = req.body;

  const sql = `
    UPDATE Oder_Monan
    SET TrangThai = 'Da huy'
    WHERE MaOder = ? AND MaMon = ?
  `;

  db.query(sql, [MaOder, MaMon], err => {
    if (err) return res.status(500).send("Lỗi hủy món!");

    res.send("✅ Đã hủy món!");
  });
});


// Cập nhật thông tin nhân viên bếp
router.post("/update", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const userId = req.session.user.ID;
  const { HoTen, SDT, Gmail, CCCD } = req.body;

  const sql = `
    UPDATE TaiKhoan 
    SET HoTen = ?, SDT = ?, Gmail = ?, CCCD = ?
    WHERE ID = ? AND IDVaiTro = 'BEP'
  `;

  db.query(sql, [HoTen, SDT, Gmail, CCCD, userId], (err) => {
    if (err) {
      console.error("Lỗi cập nhật thông tin:", err);
      return res.status(500).send("Lỗi máy chủ!");
    }
    res.redirect("/home_bep");
  });
});

module.exports = router;
