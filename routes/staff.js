const express = require("express");
const router = express.Router();
const db = require("../db");

// Route hiển thị danh sách nhân viên
router.get("/dsnhanvien", (req, res) => {
  const sql = `
    SELECT t.ID, t.HoTen, t.SDT, t.Gmail, t.CCCD, v.TenVaiTro
    FROM TaiKhoan t
    LEFT JOIN VaiTro v ON t.IDVaiTro = v.IDVaiTro
  `;

  db.query(sql, (err, results) => {
    if (err) throw err;

    // Chuyển sang EJS, nếu không có kết quả thì truyền mảng rỗng
    res.render("ds_nhanvien", { TaiKhoan: results || [] });
  });
});

// Route xem chi tiết nhân viên theo ID
router.get("/xemchitietnhanvien/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT t.ID, t.HoTen, t.SDT, t.Gmail, t.CCCD, v.TenVaiTro FROM TaiKhoan t LEFT JOIN VaiTro v ON t.IDVaiTro = v.IDVaiTro WHERE t.ID = ?";
  
  db.query(sql, [id], (err, results) => {
    if (err) throw err;

    if (!results || results.length === 0) {
      // Không có nhân viên nào → truyền null để EJS xử lý
      return res.render("quanli_nhanvien", { TaiKhoan: null });
    }

    // Truyền đối tượng nhân viên đầu tiên
    res.render("quanli_nhanvien", { TaiKhoan: results[0] });
  });
});
// Xóa nhân viên theo ID (cả số và chuỗi)
router.get("/xoanhanvien/:id", (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).send("ID không hợp lệ");

  const sql = "DELETE FROM TaiKhoan WHERE ID = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Lỗi xóa nhân viên");
    }

    if (results.affectedRows === 0) {
      return res.status(404).send("Không tìm thấy nhân viên để xóa");
    }

    // Xóa thành công → quay về danh sách
    res.redirect("/staff/dsnhanvien");
  });
});
module.exports = router;
