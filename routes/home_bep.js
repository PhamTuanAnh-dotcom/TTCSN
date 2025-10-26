const express = require("express");
const router = express.Router();
const db = require("../db");

// Trang nhân viên bếp
router.get("/", (req, res) => {
  // Nếu chưa đăng nhập thì quay về login
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }

  const userId = req.session.user.ID; // ✅ đảm bảo đúng key bạn lưu trong session

  const sql = `
    SELECT ID, HoTen, SDT, Gmail, CCCD, TaiKhoan
    FROM TaiKhoan
    WHERE ID = ? AND IDVaiTro = 'BEP'
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).send("Lỗi máy chủ!");
    }

    // Nếu không tìm thấy quản lý → trả về trang login
    if (results.length === 0) {
      return res.redirect("/auth/login");
    }

    const chef = results[0];
    console.log("Dữ liệu nhân viên:", chef); // ✅ debug kiểm tra

    // Render sang home_bep.ejs và truyền biến chef
    res.render("home_bep", { chef });
  });
});
// ✅ Cập nhật thông tin nhân viên
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
    if (err) throw err;
    res.redirect("/home_bep");
  });
});

module.exports = router;
