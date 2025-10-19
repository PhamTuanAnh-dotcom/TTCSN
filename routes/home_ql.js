const express = require("express");
const router = express.Router();
const db = require("../db");

// Trang quản lý chính
router.get("/", (req, res) => {
  // Nếu chưa đăng nhập thì quay về login
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const userId = req.session.user.ID; // ✅ đảm bảo đúng key bạn lưu trong session

  const sql = `
    SELECT ID, HoTen, SDT, Gmail, CCCD, TaiKhoan
    FROM TaiKhoan
    WHERE ID = ? AND IDVaiTro = 'QL'
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).send("Lỗi máy chủ!");
    }

    // Nếu không tìm thấy quản lý → trả về trang login
    if (results.length === 0) {
      return res.redirect("/login");
    }

    const manager = results[0];
    console.log("Dữ liệu quản lý:", manager); // ✅ debug kiểm tra

    // Render sang home_ql.ejs và truyền biến manager
    res.render("home_ql", { manager });
  });
});
// ✅ Cập nhật thông tin quản lý
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
