const express = require("express");
const router = express.Router();
const db = require("../db");

// Trang quản lý chính
router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const userId = req.session.user.ID;

  // Query thông tin quản lý
  const sqlManager = `
    SELECT ID, HoTen, SDT, Gmail, CCCD, TaiKhoan
    FROM TaiKhoan
    WHERE ID = ? AND IDVaiTro = 'QL'
  `;

  // Query danh sách bàn cùng trạng thái
  const sqlTables = `SELECT MaBan, TrangThai FROM BanAn`;

  db.query(sqlManager, [userId], (err, managerResult) => {
    if (err) return res.status(500).send("Lỗi máy chủ!");

    if (managerResult.length === 0) {
      return res.redirect("/login");
    }

    const manager = managerResult[0];

    db.query(sqlTables, (err2, tableList) => {
      if (err2) return res.status(500).send("Lỗi máy chủ!");

      res.render("home_ql", {
        manager: manager,
        tables: tableList
      });
    });
  });
});

// Cập nhật thông tin quản lý
router.post("/update", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const userId = req.session.user.ID;
  const { HoTen, SDT, Gmail, CCCD } = req.body;

  const sql = `
    UPDATE TaiKhoan 
    SET HoTen = ?, SDT = ?, Gmail = ?, CCCD = ?
    WHERE ID = ? AND IDVaiTro = 'QL'
  `;

  db.query(sql, [HoTen, SDT, Gmail, CCCD, userId], (err) => {
    if (err) throw err;
    res.redirect("/home_ql");
  });
});

module.exports = router;
