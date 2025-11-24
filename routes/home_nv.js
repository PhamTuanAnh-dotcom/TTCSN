const express = require("express");
const router = express.Router();
const db = require("../db");

// Trang nhân viên
router.get("/", (req, res) => {
  // Nếu chưa đăng nhập thì quay về login
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const userId = req.session.user.ID; // ✅ đảm bảo đúng key bạn lưu trong session

  const sql = `
    SELECT ID, HoTen, SDT, Gmail, CCCD, TaiKhoan
    FROM TaiKhoan
    WHERE ID = ? AND IDVaiTro = 'NV'
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

    const staff = results[0];
    console.log("Dữ liệu nhân viên:", staff); // ✅ debug kiểm tra

    // Render sang home_nv.ejs và truyền biến staff
    res.render("home_nv", { staff });
  });
});
// Cập nhật thông tin nhân viên
router.post("/update", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const userId = req.session.user.ID;
  const { HoTen, SDT, Gmail, CCCD } = req.body;

  const sql = `
    UPDATE TaiKhoan 
    SET HoTen = ?, SDT = ?, Gmail = ?, CCCD = ?
    WHERE ID = ? AND IDVaiTro = 'NV'
  `;

  db.query(sql, [HoTen, SDT, Gmail, CCCD, userId], (err) => {
    if (err) throw err;
    res.redirect("/home_nv");
  });
});

module.exports = router;
